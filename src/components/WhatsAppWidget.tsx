import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronRight, User, Phone, MessageSquare, BadgeAlert } from 'lucide-react';

interface Operator {
  id: string;
  name: string;
  department: string;
  phone: string;
  status: 'online' | 'offline';
  description: string;
}

interface WhatsAppWidgetProps {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left' | 'bottom-center';
  headerTitle: string;
  subtitle: string;
  accentColor: string;
  operators: Operator[];
  formFields: string[];
  enableRotation?: boolean;
}

export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  enabled,
  position,
  headerTitle = 'Hubungi Kami',
  subtitle = 'Ada yang bisa kami bantu?',
  accentColor = '#25D366',
  operators = [],
  formFields = ['name', 'phone', 'message'],
  enableRotation = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [assignedOperator, setAssignedOperator] = useState<Operator | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if widget is globally disabled or if there are no operators
  if (!enabled || !operators || operators.length === 0) return null;

  // Get unique departments
  const uniqueDepartments = Array.from(new Set(operators.map((op) => op.department).filter(Boolean)));

  const getPositionClass = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6 md:bottom-8 md:left-8';
      case 'bottom-center':
        return 'bottom-6 left-1/2 -translate-x-1/2 md:bottom-8';
      default:
        return 'bottom-6 right-6 md:bottom-8 md:right-8';
    }
  };

  // Safe WhatsApp number format helper (must start with country code, e.g. 62)
  const formatPhoneForWa = (phone: string) => {
    let cleaned = phone.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('+')) {
      cleaned = cleaned.slice(1);
    }
    return cleaned;
  };

  // Rotation / Load balancing helper for operators in a department
  const getAssignedOperatorForDepartment = (deptName: string): Operator | null => {
    const matching = operators.filter((op) => op.department === deptName);
    if (matching.length === 0) return null;

    // Filter online ones first
    const onlineOperators = matching.filter((op) => op.status === 'online');
    const targetList = onlineOperators.length > 0 ? onlineOperators : matching;

    if (targetList.length === 1) return targetList[0];

    if (enableRotation) {
      // Round-robin selection using localStorage
      const key = `wa_rotate_${deptName.replace(/\s+/g, '_').toLowerCase()}`;
      const lastIndexStr = localStorage.getItem(key);
      let nextIndex = 0;
      if (lastIndexStr !== null) {
        const lastIdx = parseInt(lastIndexStr, 10);
        nextIndex = (lastIdx + 1) % targetList.length;
      }
      localStorage.setItem(key, nextIndex.toString());
      return targetList[nextIndex];
    }

    // Default to first operator in list
    return targetList[0];
  };

  const handleSelectDepartment = (dept: string) => {
    setSelectedDepartment(dept);
    const op = getAssignedOperatorForDepartment(dept);
    setAssignedOperator(op);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedOperator) return;

    setIsSubmitting(true);

    try {
      const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
      const formattedWaPhone = formatPhoneForWa(assignedOperator.phone);

      // 1. Build template message
      const customerName = formValues.name || '-';
      const customerPhone = formValues.phone || '-';
      const customerEmail = formValues.email || '-';
      const userMsg = formValues.message || '';

      const waText = `Halo *${assignedOperator.name}* dari *${assignedOperator.department}*,\n\n` +
        `Saya ingin berkonsultasi mengenai layanan Anda.\n\n` +
        `*Data Pengirim:*\n` +
        `- Nama: ${customerName}\n` +
        `- No. HP/WA: ${customerPhone}\n` +
        (formFields.includes('email') ? `- Email: ${customerEmail}\n` : '') +
        `- Halaman: ${pageUrl}\n\n` +
        `*Pesan:*\n"${userMsg}"`;

      const encodedText = encodeURIComponent(waText);
      const waUrl = `https://wa.me/${formattedWaPhone}?text=${encodedText}`;

      // 2. Log Click-to-Chat Log (leads tracking)
      await fetch('/api/whatsapp/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          department: assignedOperator.department,
          assigned_operator_phone: formattedWaPhone,
          initial_message: userMsg,
          page_url: pageUrl,
        }),
      }).catch((err) => console.error('Failed to log lead:', err));

      // 3. Open WhatsApp link
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setIsOpen(false);
      // Reset form
      setFormValues({});
      setSelectedDepartment(null);
      setAssignedOperator(null);
    } catch (err) {
      console.error('Error in chat submit:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed ${getPositionClass()} z-50 font-sans`}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: accentColor }}
          className="flex items-center justify-center p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 text-white relative group"
          id="wa-floating-trigger"
          aria-label="Hubungi kami di WhatsApp"
        >
          <MessageCircle size={28} className="animate-pulse" />
          <span className="absolute right-full mr-3 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md pointer-events-none hidden md:block">
            {headerTitle}
          </span>
          {/* Status Indicator (if any operator is online, show glowing green badge) */}
          {operators.some(op => op.status === 'online') && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
          )}
        </button>
      )}

      {/* Chat Window Box */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-950 shadow-2xl rounded-2xl w-[340px] max-w-[calc(100vw-32px)] overflow-hidden border border-slate-100 dark:border-slate-800/80 animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col">
          {/* Header */}
          <div 
            className="p-5 text-white flex justify-between items-center relative" 
            style={{ backgroundColor: accentColor }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <MessageCircle size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide leading-tight">{headerTitle}</h4>
                <p className="text-[11px] opacity-90 font-medium mt-0.5">{subtitle}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/90 hover:text-white"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 max-h-[380px] overflow-y-auto">
            {!selectedDepartment ? (
              // Step 1: Select Department
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Silakan Pilih Tujuan / Departemen:
                </p>
                <div className="space-y-2">
                  {uniqueDepartments.map((dept) => {
                    const matchedOps = operators.filter(o => o.department === dept);
                    const isOnline = matchedOps.some(o => o.status === 'online');
                    const onlineCount = matchedOps.filter(o => o.status === 'online').length;

                    return (
                      <button
                        key={dept}
                        onClick={() => handleSelectDepartment(dept)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group text-left"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                            {dept}
                          </h5>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                            {matchedOps.length > 1 
                              ? `${matchedOps.length} Operator (${onlineCount} Aktif)` 
                              : matchedOps[0]?.description || 'Hubungi tim bantuan kami'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Step 2: Fill out Form
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5 mb-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setSelectedDepartment(null);
                      setAssignedOperator(null);
                    }} 
                    className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    ← Pilih Departemen Lain
                  </button>
                  {assignedOperator && (
                    <span className="flex items-center gap-1.5 text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full font-bold">
                      <span className={`w-1.5 h-1.5 rounded-full ${assignedOperator.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {assignedOperator.name}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {formFields.includes('name') && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                          <User size={14} />
                        </span>
                        <input 
                          type="text" 
                          required 
                          placeholder="Masukkan nama Anda..." 
                          value={formValues.name || ''}
                          onChange={(e) => setFormValues({...formValues, name: e.target.value})}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 transition-all font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {formFields.includes('phone') && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        No. HP / WhatsApp
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                          <Phone size={14} />
                        </span>
                        <input 
                          type="tel" 
                          required 
                          placeholder="Contoh: 08123456789..." 
                          value={formValues.phone || ''}
                          onChange={(e) => setFormValues({...formValues, phone: e.target.value})}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 transition-all font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {formFields.includes('email') && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Alamat Email
                      </label>
                      <input 
                        type="email" 
                        required 
                        placeholder="Contoh: nama@domain.com" 
                        value={formValues.email || ''}
                        onChange={(e) => setFormValues({...formValues, email: e.target.value})}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 transition-all font-semibold"
                      />
                    </div>
                  )}

                  {formFields.includes('message') && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Pesan Anda
                      </label>
                      <div className="relative">
                        <span className="absolute top-2.5 left-3 text-slate-400 pointer-events-none">
                          <MessageSquare size={14} />
                        </span>
                        <textarea 
                          required 
                          rows={3}
                          placeholder="Ketik rincian pertanyaan Anda..." 
                          value={formValues.message || ''}
                          onChange={(e) => setFormValues({...formValues, message: e.target.value})}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-200 transition-all resize-none font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: accentColor }}
                  className="w-full text-white text-xs font-black uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50"
                >
                  <Send size={14} /> {isSubmitting ? 'Mengirim...' : 'Kirim ke WhatsApp'}
                </button>
              </form>
            )}
          </div>
          {/* Footer Branding */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500">
            <span className="font-semibold">Niche-Agnostic Support</span>
            <span className="flex items-center gap-1 text-[9px] bg-slate-200/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-full font-bold">
              Secure Chat
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
