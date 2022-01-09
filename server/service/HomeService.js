const resultService = require("./ResultService");
const teamService = require("./TeamService");
const userService = require("./UserService");
const clubService = require("./ClubService");
const flightService = require("./FlightService");
const seasonService = require("./SeasonService");
const sponsorService = require("./SponsorService");
const newsService = require("./NewsService");
const flightPhotoService = require("./FlightPhotoService");

const { getCurrentYear } = require("../helper/Utils");

const NUMBER_OF_TEAMS = 3;
const NUMBER_OF_CLUBS = 3;
const NUMBER_OF_FLIGHTS_OVERALL = 5;

async function promiseAllObject(promises) {
  const results = await Promise.all(Object.values(promises));
  return Object.keys(promises).reduce((acc, key, index) => {
    acc[key] = results[index];
    return acc;
  }, {});
}

const service = {
  get: async () => {
    const currentSeason = await seasonService.getCurrentActive();

    const seasonStats = await promiseAllObject({
      numberOfClubs: clubService.countActive(),
      numberOfTeams: teamService.countActive(),
      numberOfUsers: userService.count(),
      totalFlightDistance: flightService.sumDistance(getCurrentYear()),
    });

    const stats = await promiseAllObject({
      resultRankingClasses: retrieveRankingClassResults(currentSeason),
      sponsors: sponsorService.getAllActive(),
      activeNews: newsService.getActive(),
      bestTeams: resultService.getTeam(getCurrentYear(), null, NUMBER_OF_TEAMS),
      bestClubs: resultService.getClub(getCurrentYear(), NUMBER_OF_CLUBS),
      bestFlightsOverallCurrentYear: flightService.getAll({
        year: getCurrentYear(),
        limit: NUMBER_OF_FLIGHTS_OVERALL,
        sort: ["flightPoints", "DESC"],
      }),
      todaysFlights: flightService.getTodays(),
      randomPhotos: flightPhotoService.getRandomCurrentYear(20),
    });

    const res = {
      seasonStats,
      seasonDetails: currentSeason,
      rankingClasses: stats.resultRankingClasses,
      /**
       * Without mapping "FATAL ERROR: v8::Object::SetInternalField() Internal field out of bounds" occurs.
       * This is due to the fact that node-cache can't clone sequelize objects with active tcp handles.
       * See also: https://github.com/pvorb/clone/issues/106
       */
      sponsors: stats.sponsors.map((v) => v.toJSON()),
      activeNews: stats.activeNews,
      bestTeams: stats.bestTeams.values,
      bestClubs: stats.bestClubs.values,
      bestFlightsOverallCurrentYear: stats.bestFlightsOverallCurrentYear.rows,
      todaysFlights: stats.todaysFlights,
      randomPhotos: stats.randomPhotos,
    };

    return res;
  },
};

async function retrieveRankingClassResults(currentSeason) {
  if (!currentSeason) return;

  //TODO: Check, this "for const of" will run sequentially, not parallel! The rankingRequests are NOT promises.
  const rankingRequests = {};
  for (const [key] of Object.entries(currentSeason.rankingClasses)) {
    rankingRequests[key] = (
      await resultService.getOverall({ rankingClass: key })
    ).values;
  }
  return Promise.all(Object.values(rankingRequests)).then((values) => {
    const keys = Object.keys(rankingRequests);
    const res = [];
    for (let index = 0; index < values.length; index++) {
      res.push({
        name: keys[index],
        values: values[index],
        readableName: currentSeason.rankingClasses[keys[index]].description,
        shortReadableName:
          currentSeason.rankingClasses[keys[index]].shortDescription,
      });
    }
    return res;
  });
}

module.exports = service;
