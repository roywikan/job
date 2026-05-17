/**
 * engine.js — AdmissionEngine untuk SPMB SMPN Kota Yogyakarta
 * Pure logic: config + NG → Ranked Schools with Probabilities
 * Zero DOM interaction. Compatible with APP_CONFIG structure.
 */

const KotaEngine = (function() {
  'use strict';
  
  // Label fallback
  function label(prob) {
    const p = typeof prob === 'number' && !isNaN(prob) ? prob : 0;
    if (p > 0.90) return "💚 Sangat Aman";
    if (p > 0.80) return "🔵 Aman";
    if (p > 0.70) return "🟡 Agak Aman";
    if (p > 0.60) return "🟠 Rawan";
    if (p > 0.50) return "🔴 Sulit";
    return "🔥 Sangat Sulit";
  }
  
  // Logistic probability
  function probability(margin, sigma) {
    if (typeof sigma !== 'number' || sigma <= 0) sigma = 10;
    if (typeof margin !== 'number' || isNaN(margin)) return 0;
    return 1 / (1 + Math.exp(-margin / sigma));
  }
  
  // Predict function
  function predict(ngDomisili, ngPrestasi, optimism, options = {}) {
    const cfg = window.APP_CONFIG;
    if (!cfg?.schools) return { domisili: [], prestasi: [], metadata: { error: 'No config' } };
    
    const rules = cfg.rules || {};
    const minPrestasi = cfg.CONFIG?.MIN_NG_PRESTASI ?? 200;
    const perfectMargin = typeof optimism === 'number' ? optimism : 10;
    const cap = 25;
    
    // Sort schools by passing grade (domisili) descending
    const pg = cfg.passingGrade2025?.domisiliDaerah || {};
    const sorted = [...cfg.schools].sort((a, b) => (pg[b.code] || 0) - (pg[a.code] || 0));
    const total = sorted.length;
    
    const results = sorted.map((school, i) => {
      const rankRatio = total > 1 ? i / (total - 1) : 0;
      const sigma = 10 + (15 * rankRatio);
      
      // Adjust passing grade based on rank
      const factor = 1.014 - (0.14 * Math.pow(rankRatio, 1.5));
      const boost = 1 + (0.03 * (1 - rankRatio));
      const offset = 20 + (10 * rankRatio);
      
      const convert = (val) => {
        if (val == null) return null;
        const num = typeof val === 'number' ? val : parseFloat(val);
        if (isNaN(num)) return null;
        return (num * factor * boost) - offset;
      };
      
      const adjD = convert(pg[school.code]);
      const pgP = cfg.passingGrade2025?.prestasiUmum?.[school.code];
      const adjP = convert(pgP);
      
      const marginD = adjD !== null ? ngDomisili - adjD : null;
      const eligibleP = ngPrestasi >= minPrestasi;
      const marginP = (adjP !== null && eligibleP) ? ngPrestasi - adjP : null;
      
      let probD = 0, probP = 0;
      if (marginD !== null) {
        const capped = Math.min(marginD, cap);
        probD = marginD >= perfectMargin ? 1 : probability(capped, sigma);
      }
      if (marginP !== null) {
        const capped = Math.min(marginP, cap);
        probP = marginP >= perfectMargin ? 1 : probability(capped, sigma);
      }
      
      // Filter by radius if options provided
      if (options.jalur === 'domisiliRadius' && options.userLat && options.userLng && options.radiusMeter) {
        const coords = window.SMPN_KOTA_COORDS?.[school.code];
        if (coords) {
          const dist = window.hitungJarak?.(options.userLat, options.userLng, coords[0], coords[1]);
          if (dist === undefined || dist > options.radiusMeter) {
            return null; // Exclude school outside radius
          }
        }
      }
      
      return {
        school: school.name,
        code: school.code,
        marginD, marginP,
        probD: Math.max(0, Math.min(1, probD)),
        probP: Math.max(0, Math.min(1, probP)),
        labelD: label(probD),
        labelP: label(probP),
        distance: options.userLat ? window.hitungJarak?.(options.userLat, options.userLng, school.lat, school.lng) : null
      };
    }).filter(r => r !== null);
    
    return {
      domisili: results
        .filter(r => r.marginD !== null)
        .sort((a, b) => (b.probD || 0) - (a.probD || 0)),
      prestasi: results
        .filter(r => r.marginP !== null && r.probP > 0)
        .sort((a, b) => (b.probP || 0) - (a.probP || 0)),
      metadata: {
        region: 'Kota Yogyakarta',
        minPrestasi,
        formula: cfg.formulas?.ng2026?.desc
      }
    };
  }
  
  // Filter schools by radius (standalone)
  function filterByRadius(predictions, userLat, userLng, maxMeter) {
    if (!userLat || !userLng || !maxMeter) return predictions;
    return predictions.filter(pred => {
      const school = window.APP_CONFIG?.schools?.find(s => s.name === pred.school);
      if (!school?.lat) return false;
      const dist = window.hitungJarak?.(userLat, userLng, school.lat, school.lng);
      return dist !== undefined && dist <= maxMeter;
    });
  }
  
  return {
    predict,
    filterByRadius,
    label
  };
})();