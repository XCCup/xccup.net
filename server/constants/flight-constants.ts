export const enum STATE {
  IN_RANKING = "In Wertung",
  NOT_IN_RANKING = "Nicht in Wertung",
  FLIGHTBOOK = "Flugbuch",
  IN_PROCESS = "In Bearbeitung",
  IN_REVIEW = "In Prüfung",
}

export const enum TYPE {
  FREE = "FREE",
  FLAT = "FLAT",
  FAI = "FAI",
}

// TODO: Remove this hack when IgcAnalyzer is refactored to TS
module.exports.TYPE = {
  FREE: TYPE.FREE,
  FLAT: TYPE.FLAT,
  FAI: TYPE.FAI,
};

export const enum UPLOAD_ENDPOINT {
  WEB = "WEB",
  LEONARDO = "LEONARDO",
  ADMIN = "ADMIN",
}

export const REGIONS = [
  "Luxemburg",
  "Mosel",
  "Nahe",
  "Pfalz",
  "Rhön",
  "Sauerland",
];

export const IGC_STORE = "/igc";
