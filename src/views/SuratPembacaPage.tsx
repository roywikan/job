import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, MessageSquare, MapPin, Briefcase, Calendar, Phone, ShieldCheck } from 'lucide-react';
import { SuratPembaca, SiteConfig } from '../types';
import TurnstileWidget from '../components/TurnstileWidget';
import SEOHelper from '../components/SEOHelper';

interface SuratPembacaPageProps {
  siteConfig?: SiteConfig;
  onNavigate?: (view: string, param?: string) => void;
}

export default function SuratPembacaPage({ siteConfig, onNavigate }: SuratPembacaPageProps) {
  const siteName = siteConfig?.site_name || 'Parenting';
  
  // Data & Pagination State
  const [letters, setLetters] = useState<SuratPembaca[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState('');
  const [kota, setKota] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [tahunLahir, setTahunLahir] = useState<number | ''>('');
  const [phone, setPhone] = useState('');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileLoadFailed, setTurnstileLoadFailed] = useState(false);
  const [websiteUrlHp, setWebsiteUrlHp] = useState(''); // Honeypot trap field for bot prevention

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const fetchLetters = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/surat-pembaca?page=${page}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setLetters(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch surat pembaca:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters(currentPage);
  }, [currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    if (!nama.trim() || !kota.trim() || !pekerjaan.trim() || !tahunLahir || !phone.trim() || !judul.trim() || !isi.trim()) {
      setSubmitError('Seluruh kolom isian wajib diisi.');
      return;
    }

    // Turnstile validation if enabled and not failed
    if (siteConfig?.enable_comment_turnstile !== false && !turnstileLoadFailed && !turnstileToken) {
      setSubmitError('Harap selesaikan verifikasi keamanan Turnstile (anti-bot) terlebih dahulu.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/surat-pembaca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          kota: kota.trim(),
          pekerjaan: pekerjaan.trim(),
          tahunLahir: Number(tahunLahir),
          phone: phone.trim(),
          judul: judul.trim(),
          isi: isi.trim(),
          turnstileToken,
          website_url_hp: websiteUrlHp,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(data.message || 'Surat pembaca Anda telah berhasil dikirim! Surat akan diperiksa dan diedit oleh tim Editor sebelum ditayangkan.');
        // Reset Form
        setNama('');
        setKota('');
        setPekerjaan('');
        setTahunLahir('');
        setPhone('');
        setJudul('');
        setIsi('');
        setShowForm(false);
        window.scrollTo({ top: 300, behavior: 'smooth' });
      } else {
        setSubmitError(data.error || 'Gagal mengirim surat pembaca. Silakan coba lagi.');
      }
    } catch (err: any) {
      setSubmitError('Terjadi kesalahan koneksi server: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (birthYear?: number) => {
    if (!birthYear) return '';
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    return age > 0 ? `${age} thn` : '';
  };

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": siteConfig?.surat_pembaca_title || `Kanal Surat Pembaca ${siteName}`,
    "description": siteConfig?.surat_pembaca_subtitle || 'Wadah aspirasi, kritik membangun, saran, dan pengalaman pembaca.',
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": letters.map((item, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "DiscussionForumPosting",
          "headline": item.judul,
          "text": item.isi,
          "author": {
            "@type": "Person",
            "name": item.nama
          },
          "datePublished": item.createdAt
        }
      }))
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : (siteConfig?.site_url || '');
  const seoTitle = siteConfig?.surat_pembaca_title
    ? `${siteConfig.surat_pembaca_title} | ${siteName}`
    : `Kanal Surat Pembaca | ${siteName}`;
  const seoDesc = siteConfig?.surat_pembaca_subtitle
    || `Wadah aspirasi, kritik membangun, saran, dan pengalaman orang tua di ${siteName}. Setiap surat ditinjau redaksi sebelum tayang.`;
  const seoCanonical = currentPage > 1 ? `${origin}/surat-pembaca?page=${currentPage}` : `${origin}/surat-pembaca`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10">
      <SEOHelper
        title={seoTitle}
        description={seoDesc}
        canonicalUrl={seoCanonical}
        type="website"
        siteName={siteName}
        category="Surat Pembaca"
        keywords={['surat pembaca', 'opini orang tua', 'kanal parenting', siteName]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* HEADER HERO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm mb-8 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Mail className="w-4 h-4" /> {siteConfig?.surat_pembaca_channel_label || 'Kanal Surat Pembaca'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {siteConfig?.surat_pembaca_title || `Kanal Surat Pembaca ${siteName}`}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
            {siteConfig?.surat_pembaca_subtitle || 'Wadah aspirasi, kritik membangun, saran, dan pengalaman warga masyarakat. Setiap surat yang dikirimkan oleh pembaca akan ditinjau dan diedit oleh tim Editor sebelum dipublikasikan secara terbuka.'}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-6">
            {siteConfig?.surat_pembaca_guidelines || 'Pastikan isi surat sopan, tidak mengandung unsur SARA, dan menyertakan identitas yang valid.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setShowForm(!showForm);
                setSubmitSuccess('');
                setSubmitError('');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4" />
              {showForm ? 'Sembunyikan Form Kirim' : 'Tulis & Kirim Surat Pembaca'}
            </button>
          </div>
        </div>

        {/* NOTIFICATION BANNERS */}
        {submitSuccess && (
          <div className="mb-8 p-5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-start gap-3.5 text-emerald-900 dark:text-emerald-200 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-base mb-1">Terima Kasih!</h4>
              <p className="text-sm leading-relaxed">{submitSuccess}</p>
            </div>
          </div>
        )}

        {/* FORM GUEST SUBMISSION */}
        {showForm && (
          <div className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 sm:p-8 shadow-lg mb-10 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-rose-500" /> Form Kiriman Surat Pembaca
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tanpa perlu login. Seluruh data identitas akan diverifikasi & dirahasiakan kontak pribadinya.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* NAMA */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Bambang Wijaya"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* KOTA */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Kota / Kabupaten Asal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Contoh: Bandung"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* PEKERJAAN */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Pekerjaan Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    placeholder="Contoh: Karyawan Swasta / Ibu Rumah Tangga"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* TAHUN LAHIR */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Tahun Lahir <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1930}
                    max={2020}
                    value={tahunLahir}
                    onChange={(e) => setTahunLahir(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Contoh: 1988"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* NOMOR HP */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor HP / WhatsApp <span className="text-rose-500">*</span>
                  <span className="text-[11px] font-normal text-slate-500 ml-1.5">(Untuk verifikasi tim editor, tidak ditampilkan ke umum)</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* JUDUL SURAT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Surat Pembaca <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Apresiasi untuk Taman Kota yang Bersih & Ramah Anak"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* ISI SURAT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Isi Surat Pembaca Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Tuliskan isi pesan, aspirasi, atau masukan Anda secara santun dan jelas..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm leading-relaxed focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {siteConfig?.surat_pembaca_notice || '* Catatan Keamanan: Tautan URL di dalam pesan akan secara otomatis dikonversi menjadi teks biasa tanpa tautan aktif.'}
                </p>
              </div>

              {/* Anti-Spam Honeypot (Trap for Automated Bots) */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_url_hp"
                  value={websiteUrlHp}
                  onChange={(e) => setWebsiteUrlHp(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Cloudflare Turnstile Anti-Bot Verification */}
              {siteConfig?.enable_comment_turnstile !== false && (
                <div className="pt-2">
                  <TurnstileWidget
                    siteKey={siteConfig?.turnstile_site_key}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                    onError={(err) => {
                      console.warn('Turnstile load notice:', err);
                      setTurnstileLoadFailed(true);
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirimkan Surat Pembaca</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIST SURAT PEMBACA TERBIT */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-rose-500" /> Surat Pembaca Pilihan ({totalCount})
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Halaman {currentPage} dari {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Memuat daftar surat pembaca...</p>
            </div>
          ) : letters.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
              <Mail className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">Belum Ada Surat Pembaca</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Jadilah pengirim pertama yang menyampaikan aspirasi di kanal Surat Pembaca {siteName}.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Tulis Surat Pembaca Sekarang
              </button>
            </div>
          ) : (
            letters.map((item) => {
              const age = calculateAge(item.tahunLahir);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                      {item.judul}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex-shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Terverifikasi
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-5">
                    {item.isi}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1">
                        👤 {item.nama} {age ? `(${age})` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {item.kota}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {item.pekerjaan}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>

              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Halaman {currentPage} dari {totalPages}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
