import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  CheckCircle2, 
  ExternalLink, 
  Download, 
  Share2, 
  Sparkles, 
  AlertCircle, 
  Phone, 
  Tag, 
  Award, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { InteractiveEventListingData, EventSpeaker, EventScheduleItem } from '../types';
import { getOptimizedAvatarUrl } from '../lib/imageUtils';

interface InteractiveEventListingProps {
  config: InteractiveEventListingData;
  eventDatePublished?: string;
}

export default function InteractiveEventListing({ config }: InteractiveEventListingProps) {
  const {
    eventTitle,
    eventType = 'webinar',
    eventFormat = 'online',
    startDate,
    endDate,
    timezone = 'WIB',
    locationName,
    locationAddress,
    mapUrl,
    onlineJoinUrl,
    quotaStatus = 'open',
    quotaCapacity,
    quotaRegistered,
    price = 'Gratis',
    originalPrice,
    registrationUrl,
    registrationCtaText,
    registrationDeadline,
    speakers = [],
    agenda = [],
    benefits = [],
    contactPersonPhone,
    contactPersonName
  } = config;

  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isPassed: boolean }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false
  });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!startDate) return;

    const calculateTime = () => {
      const target = new Date(startDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPassed: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  // Format Display Dates (Bahasa Indonesia)
  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatEventTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date).replace('.', ':');
    } catch {
      return '';
    }
  };

  const startTimeStr = formatEventTime(startDate);
  const endTimeStr = formatEventTime(endDate);
  const fullDateStr = formatEventDate(startDate);

  // Format Helper for Google Calendar
  const toGoogleCalendarDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toISOString().replace(/-|:|\.\d+/g, '');
    } catch {
      return '';
    }
  };

  const googleCalendarUrl = (() => {
    if (!startDate) return '#';
    const gStart = toGoogleCalendarDate(startDate);
    const gEnd = endDate ? toGoogleCalendarDate(endDate) : gStart;
    const details = encodeURIComponent(
      `Acara: ${eventTitle}\nFormat: ${eventFormat.toUpperCase()}\nLokasi: ${locationName || 'Online'}\n${registrationUrl ? `Info Pendaftaran: ${registrationUrl}` : ''}`
    );
    const location = encodeURIComponent(locationAddress || locationName || 'Online');
    const title = encodeURIComponent(eventTitle);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${gStart}/${gEnd}&details=${details}&location=${location}`;
  })();

  // Download iCal (.ics) handler
  const handleDownloadIcs = () => {
    if (!startDate) return;
    const startIso = toGoogleCalendarDate(startDate);
    const endIso = endDate ? toGoogleCalendarDate(endDate) : startIso;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Event Agenda//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@agenda.local`,
      `DTSTAMP:${toGoogleCalendarDate(new Date().toISOString())}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventTitle} - Format: ${eventFormat}`,
      `LOCATION:${locationAddress || locationName || 'Online'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: eventTitle,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Quota Badge Styling
  const getQuotaBadge = () => {
    switch (quotaStatus) {
      case 'early_bird':
        return {
          label: '⚡ Early Bird Aktif',
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
        };
      case 'limited':
        return {
          label: '🔥 Kuota Terbatas',
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
        };
      case 'sold_out':
        return {
          label: '⛔ Kuota Penuh (Sold Out)',
          bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
        };
      case 'closed':
        return {
          label: '🔒 Pendaftaran Ditutup',
          bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
        };
      default:
        return {
          label: '🟢 Pendaftaran Dibuka',
          bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
        };
    }
  };

  const quotaBadge = getQuotaBadge();
  const isRegistrationClosed = quotaStatus === 'sold_out' || quotaStatus === 'closed' || timeLeft.isPassed;

  const quotaPercent = (quotaCapacity && quotaRegistered && quotaCapacity > 0)
    ? Math.min(100, Math.round((quotaRegistered / quotaCapacity) * 100))
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto my-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden" id="event-listing-widget">
      {/* Header Banner & Meta */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle Decorative Pattern */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {eventType === 'webinar' ? 'Webinar Online' : eventType === 'workshop' ? 'Workshop Interaktif' : eventType === 'seminar' ? 'Seminar Nasional' : 'Agenda Resmi'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {eventFormat === 'online' ? '🌐 Virtual / Daring' : eventFormat === 'offline' ? '🏢 Tatap Muka' : '🔄 Hybrid'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all backdrop-blur-md"
                title="Bagikan Agenda Acara"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Tersalin!' : 'Bagikan'}</span>
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-serif leading-tight tracking-tight text-white">
            {eventTitle}
          </h2>

          {/* Date & Time Highlights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tanggal Pelaksanaan</div>
                <div className="text-xs sm:text-sm font-bold text-white truncate">{fullDateStr || 'Jadwal Ditentukan'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Waktu ({timezone})</div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {startTimeStr ? `${startTimeStr} - ${endTimeStr || 'Selesai'} ${timezone}` : 'Segera Diumumkan'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                {eventFormat === 'online' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tempat / Saluran</div>
                <div className="text-xs sm:text-sm font-bold text-white truncate">{locationName || 'Platform Virtual'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer & Quota Status Section */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Countdown Blocks */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                {timeLeft.isPassed ? 'Status Acara' : 'Hitung Mundur Pelaksanaan'}
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${quotaBadge.bg}`}>
                {quotaBadge.label}
              </span>
            </div>

            {timeLeft.isPassed ? (
              <div className="p-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold text-center">
                Acara ini telah berlangsung atau sedang berjalan.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{timeLeft.days}</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Hari</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Jam</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Menit</div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Detik</div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Calendar Action Tools */}
          <div className="lg:col-span-5 space-y-3 lg:border-l lg:border-slate-200 lg:dark:border-slate-700/60 lg:pl-6">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Investasi / Biaya</span>
              <div className="text-right">
                {originalPrice && (
                  <span className="text-xs text-slate-400 line-through mr-2 font-medium">
                    {originalPrice}
                  </span>
                )}
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {price}
                </span>
              </div>
            </div>

            {/* Quota Progress Bar (if provided) */}
            {quotaCapacity && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  <span>Kapasitas Kursi</span>
                  <span>{quotaRegistered || 0} / {quotaCapacity} Peserta ({quotaPercent}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      (quotaPercent || 0) > 85 ? 'bg-rose-500' : (quotaPercent || 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${quotaPercent || 0}%` }}
                  />
                </div>
              </div>
            )}

            {/* Calendar Buttons Strip */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>+ Google Cal</span>
              </a>

              <button
                type="button"
                onClick={handleDownloadIcs}
                className="py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                title="Download file kalender iCal (.ics) untuk Apple Calendar / Outlook"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>iCal (.ics)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-6 sm:p-8 space-y-8">
        {/* Location & Access Info Box */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Akses Lokasi & Tautan Ruang Acara
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{locationName}</div>
              {locationAddress && (
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{locationAddress}</p>
              )}
            </div>

            <div className="flex flex-col justify-center gap-2">
              {onlineJoinUrl && (
                <a
                  href={onlineJoinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Buka Ruang Zoom / Meet Langsung
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    Petunjuk Arah Google Maps
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Speakers / Narasumber Section */}
        {speakers && speakers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Narasumber & Pembicara Ahli ({speakers.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {speakers.map((speaker, idx) => (
                <div 
                  key={idx} 
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={speaker.avatar ? getOptimizedAvatarUrl(speaker.avatar, 96) : `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=f43f5e&color=fff`}
                      alt={speaker.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {speaker.name}
                    </h4>
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-0.5">
                      {speaker.role}
                    </p>
                    {speaker.bio && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {speaker.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rundown / Agenda Section */}
        {agenda && agenda.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Rundown Acara ({agenda.length} Sesi)
              </h3>
            </div>

            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4">
              {agenda.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Circle Pin */}
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-rose-500 shadow-xs" />
                  
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/60">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40">
                        {item.time}
                      </span>
                      {item.speaker && (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Oleh: {item.speaker}
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {item.topic}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits / Fasilitas Peserta */}
        {benefits && benefits.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Fasilitas & Benefit Peserta
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registration CTA & Contact Panitia */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/30 dark:to-amber-950/30 border border-rose-200 dark:border-rose-900/40">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Pendaftaran Resmi
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isRegistrationClosed ? 'Pendaftaran Tidak Tersedia' : 'Amankan Tiket & Tempat Anda Sekarang'}
              </div>
              {registrationDeadline && (
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Batas waktu pendaftaran: {registrationDeadline}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {registrationUrl && !isRegistrationClosed ? (
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{registrationCtaText || 'Daftar Sekarang'}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              ) : isRegistrationClosed ? (
                <div className="px-5 py-3 rounded-xl bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs cursor-not-allowed">
                  {quotaStatus === 'sold_out' ? 'Tiket Terjual Habis' : 'Pendaftaran Ditutup'}
                </div>
              ) : null}

              {contactPersonPhone && (
                <a
                  href={`https://wa.me/${contactPersonPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Panitia, saya ingin menanyakan perihal acara: ${eventTitle}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>WA Panitia ({contactPersonName || 'Admin'})</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
