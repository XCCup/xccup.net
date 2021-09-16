let homeCache;
let currentYearFlightCache;

const manager = {
  invalidateCaches: () => {
    console.log("Clear all caches");
    homeCache = null;
    currentYearFlightCache = null;
  },
  getHomeCache: () => {
    console.log("Access data from homeCache");
    return homeCache;
  },
  getCurrentYearFlightCache: () => {
    console.log("Access data from currentYearFlightCache");
    return currentYearFlightCache;
  },
  setHomeCache: (data) => {
    console.log("Write data to homeCache");
    homeCache = data;
  },
  setCurrentYearFlightCache: (data) => {
    console.log("Write data tocurrentYearFlightCache");
    currentYearFlightCache = data;
  },
};

module.exports = manager;
