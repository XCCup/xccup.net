const resultService = require("../service/ResultService");
const teamService = require("../service/TeamService");
const userService = require("../service/UserService");
const clubService = require("../service/ClubService");
const flightService = require("../service/FlightService");
const seasonService = require("../service/SeasonService");

const service = {
  get: async () => {
    const currentSeason = await seasonService.getCurrentActive();

    const numberOfTeams = teamService.countActive();
    const numberOfClubs = clubService.count();
    const numberOfUsers = userService.count();
    const bestTeams = resultService.getTeam(null, null, 3);
    const bestClubs = resultService.getClub(null, 3);
    const bestFlightsOverall = flightService.getAll(null, null, null, 5, true);

    const dbRequests = {
      numberOfClubs,
      numberOfTeams,
      numberOfUsers,
      bestTeams,
      bestClubs,
      bestFlightsOverall,
    };

    addRequestsForRatingClasses(currentSeason, dbRequests);

    // 5 Beste Flüge des Tages

    return Promise.all(Object.values(dbRequests)).then((values) => {
      const entries = Object.entries(dbRequests);
      const res = {};
      for (let index = 0; index < values.length; index++) {
        res[entries[index][0]] = values[index];
      }
      return res;
    });
  },
};

function addRequestsForRatingClasses(currentSeason, dbRequests) {
  // eslint-disable-next-line no-unused-vars
  for (const [key, value] of Object.entries(currentSeason.ratingClasses)) {
    dbRequests[key] = resultService.getOverall(null, key);
  }
}

module.exports = service;
