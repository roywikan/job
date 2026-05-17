/**
 * helpers.js — Utility functions untuk SPMB Kota Yogyakarta
 * Tidak ada dependency DOM, pure JS
 */

window.KotaHelpers = {
  // Format angka dengan 2 desimal
  fmt: (n) => typeof n === 'number' ? n.toFixed(2) : '0.00',
  
  // Format jarak
  fmtJarak: (m) => window.formatJarak?.(m) || `${Math.round(m||0)} m`,
  
  // Get school by code
  getSchool: (code) => window.APP_CONFIG?.schools?.find(s => s.code === code),
  
  // Calculate NG based on config formula
  hitungNG: (input) => {
    const cfg = window.APP_CONFIG?.CONFIG || {};
    const formula = input.lulusan === '2025' 
      ? window.APP_CONFIG?.formulas?.ng2025 
      : window.APP_CONFIG?.formulas?.ng2026;
    
    if (!formula?.calc) return 0;
    
    if (input.lulusan === '2025') {
      return formula.calc(input.aspd || 0, input.raporAvg || 0, input.prestasi || 0);
    }
    return formula.calc(input.tka || 0, input.tkad || 0, input.raporAvg || 0, input.prestasi || 0);
  },
  
  // Get prestige value from config table
  getPrestasi: (level, type, group, rank) => {
    return window.APP_CONFIG?.utils?.getPrestasiValue?.(level, type, group, rank) || 0;
  },
  
  // Build timeline HTML from schedule items
  buildTimeline: (items) => {
    if (!Array.isArray(items) || items.length === 0) return '<p class="small">Jadwal belum tersedia.</p>';
    return `<div class="timeline">${items.map(item => {
      const kegiatan = item.kegiatan || item[0];
      const waktu = item.waktu || item[1];
      const lokasi = item.lokasi || item[2];
      const url = item.url || item[3];
      const lokasiHTML = url ? `<a href="${url}" target="_blank" rel="noopener">${lokasi}</a>` : lokasi;
      return `<div class="timeline-item"><b>${kegiatan}</b><br>Waktu: ${waktu}<br>Lokasi: ${lokasiHTML}</div>`;
    }).join('')}</div>`;
  },
  
  // Simple probability label
  labelProb: (p) => {
    const prob = typeof p === 'number' ? p : 0;
    if (prob > 0.90) return "💚 Sangat Aman";
    if (prob > 0.80) return "🔵 Aman";
    if (prob > 0.70) return "🟡 Agak Aman";
    if (prob > 0.60) return "🟠 Rawan";
    if (prob > 0.50) return "🔴 Sulit";
    return "🔥 Sangat Sulit";
  },
  
  // Simple logistic probability
  probLogistic: (margin, sigma = 10) => {
    if (typeof margin !== 'number' || isNaN(margin)) return 0;
    return 1 / (1 + Math.exp(-margin / sigma));
  }
};

// Export shortcut
window._fmt = window.KotaHelpers.fmt;
window._hitungNG = window.KotaHelpers.hitungNG;