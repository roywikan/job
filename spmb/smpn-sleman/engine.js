/**
 *  AdmissionEngine v1.1
 * Pure logic: JSON Config + NG Values → Ranked Schools with Probabilities
 * Zero DOM interaction. Zero side effects.
 * 
 * Changelog v1.1:
 * - Added fallback label() function if config.thresholds missing
 * - Added NaN/undefined protection for probD/probP
 * - Added safe property access for config values
 */
const AdmissionEngine = (function() {
  'use strict';
  
  let config = null;

  // ✅ Fallback label function (standalone, no config dependency)
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
    if (!jsonData || !jsonData.schools) {
      console.warn('⚠️ Invalid config structure, using defaults');
      // Fallback minimal config agar tidak crash
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
    // ✅ Safe prob handling
    const p = typeof prob === 'number' && !isNaN(prob) ? prob : 0;
    
    // ✅ Fallback jika config tidak ada atau thresholds tidak lengkap
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
        return lbl || label(p); // Fallback jika label undefined
      }
    }
    
    const defaultLbl = config.probabilityThresholds['default'];
    return defaultLbl || label(p);
  }

  function predict(ngDomisili, ngPrestasi, optimismThreshold) {
    if (!config) {
      console.warn('⚠️ Config not loaded, using defaults');
      loadConfig(null);
    }
    
    const { schools, predictionModel, rules } = config;
    if (!schools || !Array.isArray(schools)) {
      return { domisili: [], prestasi: [], metadata: { error: 'No schools data' } };
    }
    
    // ✅ Safe defaults untuk rules & model
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

    const sorted = [...schools].sort((a, b) => (b.domisili ?? 0) - (a.domisili ?? 0));
    const total = sorted.length;
    const perfect = typeof optimismThreshold === 'number' ? optimismThreshold : safeRules.perfectMarginDefault;
    const cap = safeRules.maxMarginCap;

    const results = sorted.map((school, i) => {
      const rankRatio = total > 1 ? i / (total - 1) : 0;
      const { adjustment, sigmaBase, sigmaRankMultiplier } = safeModel;

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

      const adjD = convertVal(school.domisili);
      const adjP = convertVal(school.prestasi);

      const marginD = adjD !== null ? (typeof ngDomisili === 'number' ? ngDomisili : 0) - adjD : null;
      const eligibleP = (typeof ngPrestasi === 'number' ? ngPrestasi : 0) >= safeRules.minPrestasiNG;
      const marginP = (adjP !== null && eligibleP) ? (typeof ngPrestasi === 'number' ? ngPrestasi : 0) - adjP : null;

      let probD = 0, probP = 0;
      
      if (marginD !== null && typeof marginD === 'number') {
        const cappedMargin = Math.min(marginD, cap);
        probD = marginD >= perfect ? 1 : probability(cappedMargin, sigma);
      }
      
      if (marginP !== null && typeof marginP === 'number') {
        const cappedMargin = Math.min(marginP, cap);
        probP = marginP >= perfect ? 1 : probability(cappedMargin, sigma);
      }
      
      // ✅ Ensure prob are valid numbers 0-1
      probD = typeof probD === 'number' && !isNaN(probD) ? Math.max(0, Math.min(1, probD)) : 0;
      probP = typeof probP === 'number' && !isNaN(probP) ? Math.max(0, Math.min(1, probP)) : 0;

      return {
        school: school.id || school.nama || school.s || 'Unknown',
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
      domisili: results.filter(r => r.marginD !== null && r.marginD !== undefined).sort((a, b) => (b.probD ?? 0) - (a.probD ?? 0)),
      prestasi: results.filter(r => r.marginP !== null && r.marginP !== undefined && r.eligiblePrestasi).sort((a, b) => ((b.probP ?? 0) - (a.probP ?? 0)) || ((b.adjDomisili ?? 0) - (a.adjDomisili ?? 0))),
      metadata: { 
        region: config?.region || 'Kab. Sleman', 
        regulation: config?.regulationDesc || 'TKA dan TKAD 80%, Rapor 20%', 
        minPrestasi: safeRules.minPrestasiNG 
      }
    };
  }

  return { loadConfig, predict, label, getLabel };
})();
