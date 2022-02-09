/**
 * Remark text for RLP and LUX State rankings
 */
module.exports.REMARKS_STATE =
  "Es zählt die Heimataddresse eines Piloten die zum Zeitpunkt des Fluges in seinem Profil hinterlegt war";
/**
 * Remark text for newcomer rankings
 */
module.exports.REMARKS_NEWCOMER = (maxRankingClass) => {
  let text =
    "Als Newcomer zählen alle Piloten, die in dieser Saison ihren allerersten Wertungsflug eingereicht haben.";
  if (maxRankingClass)
    text += ` Es werden nur Flüge mit Geräten bis zur ${maxRankingClass} berücksichtigt`;
  return text;
};

/**
 * Remark text for senior rankings
 */
module.exports.REMARKS_SENIOR = (startAge, bonusPerAge) =>
  `Die Wertung beginnt ab einem Alter von ${startAge} mit einem Bonus von ${bonusPerAge}% pro Jahr`;
/**
 * Remark text for team rankings
 */
module.exports.REMARKS_TEAM = (dismisses) =>
  `Die schlechtesten ${dismisses} Ergebnisse eines Teams werden gestrichen`;
/**
 * Remark text for early bird ranking
 */
module.exports.REMARKS_EARLYBIRD = `Es werden die ersten 20 Flüge einer Saison gewertet. Sortiert nach Startzeit. In der Early Bird Wertung wird nur der erste Flug eines Piloten gewertet.`;
/**
 * Remark text for late bird ranking
 */
module.exports.REMARKS_LATEBIRD = `Es werden die letzten 20 Flüge einer Saison gewertet. Sortiert nach Landezeit. In der Late Bird Wertung wird nur der letzte Flug eines Piloten gewertet.`;
