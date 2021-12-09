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

const service = {
  get: async () => {
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
    const bestFlightsOverallCurrentYear = flightService.getAll({
      year: getCurrentYear(),
      limit: NUMBER_OF_FLIGHTS_OVERALL,
      sort: ["flightPoints", "DESC"],
    });
    const todaysFlights = flightService.getTodays();
    const randomPhotos = flightPhotoService.getRandomCurrentYear(20);

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

    const dbRequestsOther = {
      resultRankingClasses: await retrieveRankingClassResults(currentSeason),
      sponsors,
      activeNews,
      bestTeams,
      bestClubs,
      bestFlightsOverallCurrentYear,
      todaysFlights,
      randomPhotos,
    };
    const values = await Promise.all(Object.values(dbRequestsOther));

    const res = {
      seasonStats,
      seasonDetails: currentSeason,
      rankingClasses: values[0],
      /**
       * Without mapping "FATAL ERROR: v8::Object::SetInternalField() Internal field out of bounds" occurs.
       * This is due to the fact that node-cache can't clone sequelize objects with active tcp handles.
       * See also: https://github.com/pvorb/clone/issues/106
       */
      sponsors: values[1].map((v) => v.toJSON()),
      activeNews: values[2],
      bestTeams: values[3].values,
      bestClubs: values[4].values,
      bestFlightsOverallCurrentYear: values[5].rows,
      todaysFlights: values[6],
      randomPhotos: values[7],
    };

    return res;
  },
};

async function retrieveRankingClassResults(currentSeason) {
  if (!currentSeason) return;

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
