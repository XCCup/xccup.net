const resultService = require("./ResultService");
const teamService = require("./TeamService");
const userService = require("./UserService");
const clubService = require("./ClubService");
const flightService = require("./FlightService");
const seasonService = require("./SeasonService");
const sponsorService = require("./SponsorService");
const newsService = require("./NewsService");

const cacheManager = require("./CacheManager");

const { getCurrentYear } = require("../helper/Utils");

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

  const numberOfTeams = teamService.countActive();
  const numberOfClubs = clubService.count();
  const numberOfUsers = userService.count();
  const totalFlightDistance = flightService.sumDistance(getCurrentYear());
  const dbRequestsStats = {
    numberOfClubs,
    numberOfTeams,
    numberOfUsers,
    totalFlightDistance,
  };

  const sponsors = sponsorService.getAllActive();
  const activeNews = newsService.getActive();
  const bestTeams = resultService.getTeam(null, null, NUMBER_OF_TEAMS);
  const bestClubs = resultService.getClub(null, NUMBER_OF_CLUBS);
  const bestFlightsOverallCurrentYear = flightService.getAll(
    getCurrentYear(),
    null,
    null,
    null,
    NUMBER_OF_FLIGHTS_OVERALL,
    true
  );
  const todaysFlights = flightService.getTodays();
  const dbRequestsOther = {
    sponsors,
    activeNews,
    bestTeams,
    bestClubs,
    bestFlightsOverallCurrentYear,
    todaysFlights,
  };

  const seasonStats = await Promise.all(Object.values(dbRequestsStats)).then(
    (values) => {
      const keys = Object.keys(dbRequestsStats);
      const res = {};
      for (let index = 0; index < values.length; index++) {
        res[keys[index]] = values[index];
      }
      return res;
    }
  );

  const resultRatingClasses = await retrieveRatingClassResults(currentSeason);

  return Promise.all(Object.values(dbRequestsOther)).then((values) => {
    const keys = Object.keys(dbRequestsOther);
    const res = {};
    res.seasonStats = seasonStats;
    for (let index = 0; index < values.length; index++) {
      res[keys[index]] = values[index];
    }
    res.rankingClasses = resultRatingClasses;
    res.seasonDetails = currentSeason;
    return res;
  });
}

function retrieveRatingClassResults(currentSeason) {
  const ratingRequests = {};
  for (const [key] of Object.entries(currentSeason.rankingClasses)) {
    ratingRequests[key] = resultService.getOverall(null, key);
  }
  return Promise.all(Object.values(ratingRequests)).then((values) => {
    const keys = Object.keys(ratingRequests);
    const res = [];
    for (let index = 0; index < values.length; index++) {
      res.push({
        name: keys[index],
        values: values[index],
        readableName: currentSeason.rankingClasses[keys[index]].description,
      });
    }
    return res;
  });
}

module.exports = service;
