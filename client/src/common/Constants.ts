export const ADMIN_EMAIL = "info@xccup.net";
export const TRACK_COLORS = [
  "DarkSlateBlue",
  "DarkRed",
  "DarkCyan",
  "darkslategrey",
  "darkolivegreen",
  "olive",
  "royalblue",
  "teal",
  "steelblue",
  "sienna",
  "mediumvioletred",
  "Salmon",
  "DarkMagenta",
  "SpringGreen",
  "Chocolate",
];
export const MAX_PHOTOS = 8;
export const DAYS_FLIGHT_CHANGEABLE = 14;
export const MAX_NEWS_CHARACTERS = 250;
export const GENERIC_ERROR = "Hoppla, da ist leider was schief gelaufen…";

// TODO: Should this come from the API?
const calculateSeasons = () => {
  const seasons = [];
  for (let i = 2004; i <= new Date().getFullYear(); i++) {
    seasons.push(i);
  }
  return seasons.reverse();
};

export const SEASONS = calculateSeasons();
export const FLIGHT_TYPES = {
  FREE: "Freie Strecke",
  FLAT: "Flaches Dreieck",
  FAI: "FAI Dreieck",
};
