/**
 *  AdmissionEngine v1.0
 * Pure logic: JSON Config + NG Values → Ranked Schools with Probabilities
 * Zero DOM interaction. Zero side effects.
 */
const AdmissionEngine = (function() {
  let config = null;

  function loadConfig(jsonData) {
    if (!jsonData || !jsonData.schools) throw new Error("Invalid config structure");
    config = jsonData;
    return config;
  }

  function probability(margin, sigma) {
    return 1 / (1 + Math.exp(-margin / sigma));
  }

  function getLabel(prob) {
    if (!config) throw new Error("Config not loaded");
    const thresholds = Object.keys(config.probabilityThresholds)
      .filter(k => k !== 'default')
      .map(Number)
      .sort((a, b) => b - a);

    for (const t of thresholds) {
      if (prob > t) return config.probabilityThresholds[t.toString()];
    }
    return config.probabilityThresholds['default'];
  }

  function predict(ngDomisili, ngPrestasi, optimismThreshold) {
    if (!config) throw new Error("Engine config not loaded. Call loadConfig() first.");
    
    const { schools, predictionModel, rules } = config;
    const sorted = [...schools].sort((a, b) => (b.domisili || 0) - (a.domisili || 0));
    const total = sorted.length;
    const perfect = optimismThreshold ?? rules.perfectMarginDefault;
    const cap = rules.maxMarginCap || 25;

    const results = sorted.map((school, i) => {
      const rankRatio = total > 1 ? i / (total - 1) : 0;
      const { adjustment, sigmaBase, sigmaRankMultiplier } = predictionModel;

      const factor = adjustment.factorBase - (adjustment.factorRankCoeff * Math.pow(rankRatio, adjustment.factorRankPower));
      const competitionBoost = 1 + (adjustment.competitionBoostBase * (1 - rankRatio));
      const offset = adjustment.offsetBase + (adjustment.offsetRankMultiplier * rankRatio);

      const convertVal = (val) => val === null ? null : (val * factor * competitionBoost) - offset;
      const sigma = sigmaBase + (sigmaRankMultiplier * rankRatio);

      const adjD = convertVal(school.domisili);
      const adjP = convertVal(school.prestasi);

      const marginD = adjD !== null ? ngDomisili - adjD : null;
      const eligibleP = ngPrestasi >= rules.minPrestasiNG;
      const marginP = (adjP !== null && eligibleP) ? ngPrestasi - adjP : null;

      let probD = 0, probP = 0;
      if (marginD !== null) probD = marginD >= perfect ? 1 : probability(Math.min(marginD, cap), sigma);
      if (marginP !== null) probP = marginP >= perfect ? 1 : probability(Math.min(marginP, cap), sigma);

      return {
        school: school.id,
        adjDomisili: adjD,
        adjPrestasi: adjP,
        marginD, marginP,
        probD, probP,
        labelD: getLabel(probD),
        labelP: getLabel(probP),
        rankRatio, sigma,
        eligiblePrestasi: eligibleP
      };
    });

    return {
      domisili: results.filter(r => r.marginD !== null).sort((a, b) => b.probD - a.probD),
      prestasi: results.filter(r => r.marginP !== null && r.eligiblePrestasi).sort((a, b) => (b.probP - a.probP) || (b.adjDomisili - a.adjDomisili)),
      metadata: { region: config.region, regulation: config.regulationDesc, minPrestasi: rules.minPrestasiNG }
    };
  }

  return { loadConfig, predict };
})();