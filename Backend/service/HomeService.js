const resultService = require("./ResultService");
const teamService = require("./TeamService");
const userService = require("./UserService");
const clubService = require("./ClubService");
const flightService = require("./FlightService");
const seasonService = require("./SeasonService");
const cacheManager = require("./CacheManager");

const NUMBER_OF_TEAMS = 3;
const NUMBER_OF_CLUBS = 3;
const NUMBER_OF_FLIGHTS_OVERALL = 5;

const service = {
  get: async () => {
    const cache = cacheManager.getHomeCache();
    if (cache) return cache;

    const homeData = await prepareHomeData();
    cacheManager.setHomeCache(homeData);
    return homeData;
  },
};

async function prepareHomeData() {
  const currentSeason = await seasonService.getCurrentActive();
  const currentYear = currentSeason.year;

  const numberOfTeams = teamService.countActive();
  const numberOfClubs = clubService.count();
  const numberOfUsers = userService.count();
  const totalFlightDistance = flightService.sumDistance(currentYear);
  const bestTeams = resultService.getTeam(null, null, NUMBER_OF_TEAMS);
  const bestClubs = resultService.getClub(null, NUMBER_OF_CLUBS);

  const bestFlightsOverallCurrentYear = flightService.getAll(
    currentYear,
    null,
    null,
    null,
    NUMBER_OF_FLIGHTS_OVERALL,
    true
  );
  const todaysFlights = flightService.getTodays();

  const dbRequests = {
    numberOfClubs,
    numberOfTeams,
    numberOfUsers,
    totalFlightDistance,
    bestTeams,
    bestClubs,
    bestFlightsOverallCurrentYear,
    todaysFlights,
  };

  const resultRatingClasses = await retrieveRatingClassResults(currentSeason);

  return Promise.all(Object.values(dbRequests)).then((values) => {
    const keys = Object.keys(dbRequests);
    const res = {};
    for (let index = 0; index < values.length; index++) {
      res[keys[index]] = values[index];
    }
    res.ratingClasses = resultRatingClasses;
    res.seasonDetails = currentSeason;
    return res;
  });
}

function retrieveRatingClassResults(currentSeason) {
  const ratingRequests = {};
  for (const [key] of Object.entries(currentSeason.ratingClasses)) {
    ratingRequests[key] = resultService.getOverall(null, key);
  }
  return Promise.all(Object.values(ratingRequests)).then((values) => {
    const keys = Object.keys(ratingRequests);
    const res = [];
    for (let index = 0; index < values.length; index++) {
      res.push({
        name: keys[index],
        values: values[index],
        readableName: currentSeason.ratingClasses[keys[index]].description,
      });
    }
    return res;
  });
}

module.exports = service;
