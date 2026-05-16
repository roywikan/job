/**
 *  AdmissionEngine v1.2
 * Pure logic: JSON Config + NG Values → Ranked Schools with Probabilities
 * Zero DOM interaction. Zero side effects.
 * 
 * Compatible with juknis-sleman-2026.json structure:
 * - schools: [{ id, prestasi, domisili }, ...]
 * - probabilityThresholds: { "0.90": "💚 ...", ... }
 */
const AdmissionEngine = (function() {
  'use strict';
  
  let config = null;

  // ✅ Standalone label function (fallback, no config dependency)
  function label(prob) {
    const p = typeof prob === 'number' && !isNaN(prob) ? prob : 0;
    if (p > 0.90) return "💚 Sangat Aman";
    if (p > 0.80) return "🔵 Aman";
    if (p > 0.70) return "🟡 Agak Aman";
    if (p > 0.60) return "🟠 Rawan";
    if (p > 0.50) return "🔴 Sulit";
    return "🔥 Sangat Sulit";
  }

  function loadConfig(jsonData) {
    if (!jsonData || !jsonData.schools || !Array.isArray(jsonData.schools)) {
      console.warn('⚠️ Invalid config, using minimal defaults');
      config = {
        schools: [],
        rules: { minPrestasiNG: 245, perfectMarginDefault: 10, maxMarginCap: 25 },
        predictionModel: {
          sigmaBase: 10, sigmaRankMultiplier: 15,
          adjustment: {
            factorBase: 1.014, factorRankCoeff: 0.14, factorRankPower: 1.5,
            competitionBoostBase: 0.03, offsetBase: 20, offsetRankMultiplier: 10
          }
        },
        probabilityThresholds: {
          "0.90": "💚 Sangat Aman", "0.80": "🔵 Aman", "0.70": "🟡 Agak Aman",
          "0.60": "🟠 Rawan", "0.50": "🔴 Sulit", "default": "🔥 Sangat Sulit"
        }
      };
    } else {
      config = jsonData;
    }
    return config;
  }

  function probability(margin, sigma) {
    if (typeof sigma !== 'number' || sigma <= 0) sigma = 10;
    if (typeof margin !== 'number' || isNaN(margin)) return 0;
    return 1 / (1 + Math.exp(-margin / sigma));
  }

  function getLabel(prob) {
    const p = typeof prob === 'number' && !isNaN(prob) ? prob : 0;
    
    // Fallback jika config tidak lengkap
    if (!config || !config.probabilityThresholds) {
      return label(p);
    }
    
    const thresholds = Object.keys(config.probabilityThresholds)
      .filter(k => k !== 'default' && !isNaN(Number(k)))
      .map(Number)
      .sort((a, b) => b - a);

    for (const t of thresholds) {
      if (p > t) {
        const lbl = config.probabilityThresholds[t.toString()];
        return lbl && lbl.trim() ? lbl : label(p);
      }
    }
    
    const defaultLbl = config.probabilityThresholds['default'];
    return defaultLbl && defaultLbl.trim() ? defaultLbl : label(p);
  }

  function predict(ngDomisili, ngPrestasi, optimismThreshold) {
    if (!config) loadConfig(null);
    
    const { schools, predictionModel, rules } = config;
    if (!schools || !Array.isArray(schools) || schools.length === 0) {
      return { domisili: [], prestasi: [], metadata: { error: 'No schools data' } };
    }
    
    // Safe defaults
    const safeRules = {
      minPrestasiNG: rules?.minPrestasiNG ?? 245,
      perfectMarginDefault: rules?.perfectMarginDefault ?? 10,
      maxMarginCap: rules?.maxMarginCap ?? 25
    };
    
    const safeModel = {
      sigmaBase: predictionModel?.sigmaBase ?? 10,
      sigmaRankMultiplier: predictionModel?.sigmaRankMultiplier ?? 15,
      adjustment: {
        factorBase: predictionModel?.adjustment?.factorBase ?? 1.014,
        factorRankCoeff: predictionModel?.adjustment?.factorRankCoeff ?? 0.14,
        factorRankPower: predictionModel?.adjustment?.factorRankPower ?? 1.5,
        competitionBoostBase: predictionModel?.adjustment?.competitionBoostBase ?? 0.03,
        offsetBase: predictionModel?.adjustment?.offsetBase ?? 20,
        offsetRankMultiplier: predictionModel?.adjustment?.offsetRankMultiplier ?? 10
      }
    };

    // Sort by domisili descending (higher passing grade = more competitive)
    const sorted = [...schools].sort((a, b) => (b.domisili ?? 0) - (a.domisili ?? 0));
    const total = sorted.length;
    const perfect = typeof optimismThreshold === 'number' ? optimismThreshold : safeRules.perfectMarginDefault;
    const cap = safeRules.maxMarginCap;

    const results = sorted.map((school, i) => {
      const rankRatio = total > 1 ? i / (total - 1) : 0;
      const { adjustment, sigmaBase, sigmaRankMultiplier } = safeModel;

      // Transformasi passing grade sesuai model prediksi
      const factor = adjustment.factorBase - (adjustment.factorRankCoeff * Math.pow(rankRatio, adjustment.factorRankPower));
      const competitionBoost = 1 + (adjustment.competitionBoostBase * (1 - rankRatio));
      const offset = adjustment.offsetBase + (adjustment.offsetRankMultiplier * rankRatio);

      const convertVal = (val) => {
        if (val === null || val === undefined) return null;
        const num = typeof val === 'number' ? val : parseFloat(val);
        if (isNaN(num)) return null;
        return (num * factor * competitionBoost) - offset;
      };
      
      const sigma = sigmaBase + (sigmaRankMultiplier * rankRatio);

      // Convert passing grades
      const adjD = convertVal(school.domisili);
      const adjP = convertVal(school.prestasi);

      // Calculate margins
      const ngD = typeof ngDomisili === 'number' ? ngDomisili : 0;
      const ngP = typeof ngPrestasi === 'number' ? ngPrestasi : 0;
      
      const marginD = adjD !== null ? ngD - adjD : null;
      const eligibleP = ngP >= safeRules.minPrestasiNG;
      const marginP = (adjP !== null && eligibleP) ? ngP - adjP : null;

      // Calculate probabilities
      let probD = 0, probP = 0;
      
      if (marginD !== null && typeof marginD === 'number') {
        const cappedMargin = Math.min(marginD, cap);
        probD = marginD >= perfect ? 1 : probability(cappedMargin, sigma);
      }
      
      if (marginP !== null && typeof marginP === 'number') {
        const cappedMargin = Math.min(marginP, cap);
        probP = marginP >= perfect ? 1 : probability(cappedMargin, sigma);
      }
      
      // Ensure valid 0-1 range
      probD = typeof probD === 'number' && !isNaN(probD) ? Math.max(0, Math.min(1, probD)) : 0;
      probP = typeof probP === 'number' && !isNaN(probP) ? Math.max(0, Math.min(1, probP)) : 0;

      return {
        // ✅ Property name MUST be 'school' for filtering to work
        school: (school.id || school.nama || school.s || 'Unknown').trim(),
        adjDomisili: adjD,
        adjPrestasi: adjP,
        marginD, marginP,
        probD, probP,
        // ✅ Generate labels with fallback
        labelD: getLabel(probD),
        labelP: getLabel(probP),
        rankRatio, sigma,
        eligiblePrestasi: eligibleP
      };
    });

    return {
      domisili: results
        .filter(r => r.marginD !== null && r.marginD !== undefined)
        .sort((a, b) => (b.probD ?? 0) - (a.probD ?? 0)),
      prestasi: results
        .filter(r => r.marginP !== null && r.marginP !== undefined && r.eligiblePrestasi)
        .sort((a, b) => ((b.probP ?? 0) - (a.probP ?? 0)) || ((b.adjDomisili ?? 0) - (a.adjDomisili ?? 0))),
      metadata: { 
        region: config?.region || 'Kab. Sleman', 
        regulation: config?.regulationDesc || 'TKA dan TKAD 80%, Rapor 20%', 
        minPrestasi: safeRules.minPrestasiNG 
      }
    };
  }

  // Export functions
  return { 
    loadConfig, 
    predict, 
    label,      // Export for fallback use in UI
    getLabel    // Export for testing
  };
})();
