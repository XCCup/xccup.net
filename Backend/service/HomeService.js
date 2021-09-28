const resultService = require("./ResultService");
const teamService = require("./TeamService");
const userService = require("./UserService");
const clubService = require("./ClubService");
const flightService = require("./FlightService");
const seasonService = require("./SeasonService");
const cacheManager = require("./CacheManager");

const BEST_FLIGHTS_HOUR_SWITCHOVER = 16;
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
  const bestTeams = resultService.getTeam(null, null, NUMBER_OF_TEAMS);
  const bestClubs = resultService.getClub(null, NUMBER_OF_CLUBS);
  const today = new Date();
  let fromDay = today.getDate() - 1;
  let tillDay = today.getDate();
  if (today.getHours() > BEST_FLIGHTS_HOUR_SWITCHOVER) {
    fromDay++;
    tillDay++;
  }
  const bestFlightsOverallCurrentYear = flightService.getAll(
    today.getFullYear(),
    null,
    null,
    null,
    NUMBER_OF_FLIGHTS_OVERALL,
    true
  );
  const todaysFlights = flightService.getAll(
    null,
    null,
    null,
    null,
    null,
    true,
    new Date(today.getFullYear(), today.getMonth(), fromDay),
    new Date(today.getFullYear(), today.getMonth(), tillDay)
  );

  const dbRequests = {
    numberOfClubs,
    numberOfTeams,
    numberOfUsers,
    bestTeams,
    bestClubs,
    bestFlightsOverallCurrentYear,
    todaysFlights,
  };

  addRequestsForRatingClasses(currentSeason, dbRequests);

  return Promise.all(Object.values(dbRequests)).then((values) => {
    const entries = Object.entries(dbRequests);
    const res = {};
    for (let index = 0; index < values.length; index++) {
      res[entries[index][0]] = values[index];
    }
    res.seasonDetails = currentSeason;
    return res;
  });
}

function addRequestsForRatingClasses(currentSeason, dbRequests) {
  // eslint-disable-next-line no-unused-vars
  for (const [key, value] of Object.entries(currentSeason.ratingClasses)) {
    dbRequests[key] = resultService.getOverall(null, key);
  }
}

module.exports = service;
