type Values<T> = T[keyof T];

export const FLIGHT_STATE = {
  IN_RANKING: "In Wertung",
  NOT_IN_RANKING: "Nicht in Wertung",
  FLIGHTBOOK: "Flugbuch",
  IN_PROCESS: "In Bearbeitung",
  IN_REVIEW: "In Prüfung",
} as const;

export type FlightStateType = Values<typeof FLIGHT_STATE>[];

export const enum FLIGHT_TYPE {
  FREE = "FREE",
  FLAT = "FLAT",
  FAI = "FAI",
}

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
export const IGC_MAX_SIZE = 3000000; // 3MB
export const MINIMUM_PB_FLIGHT_DISTANCE = 10;
