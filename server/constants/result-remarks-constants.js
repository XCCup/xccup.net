/**
 * Remark text for RLP and LUX State rankings
 */
module.exports.REMARKS_STATE =
  "Es zählt die Heimataddresse eines Piloten die zum Zeitpunkt des Fluges in seinem Profil hinterlegt war";
/**
 * Remark text for newcomer rankings
 */
module.exports.REMARKS_NEWCOMER = (maxRankingClass) =>
  `Es werden nur Flüge mit Geräten bis zur ${maxRankingClass} berücksichtigt`;
/**
 * Remark text for senior rankings
 */
module.exports.REMARKS_SENIOR = (startAge, bonusPerAge) =>
  `Die Wertung beginnt ab einem Alter von  mit einem Bonus von ${bonusPerAge}% pro Jahr`;
/**
 * Remark text for team rankings
 */
module.exports.REMARKS_TEAM = (dismisses) =>
  `Die schlechtesten ${dismisses} Ergebnisse eines Teams werden gelöscht`;
