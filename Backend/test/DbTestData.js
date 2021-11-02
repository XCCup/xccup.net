const User = require("../config/postgres")["User"];
const Flight = require("../config/postgres")["Flight"];
const FlightComment = require("../config/postgres")["FlightComment"];
const Club = require("../config/postgres")["Club"];
const Team = require("../config/postgres")["Team"];
const FlyingSite = require("../config/postgres")["FlyingSite"];
const FlightFixes = require("../config/postgres")["FlightFixes"];
const FlightPhoto = require("../config/postgres")["FlightPhoto"];
const SeasonDetail = require("../config/postgres")["SeasonDetail"];
const Airspace = require("../config/postgres")["Airspace"];
const News = require("../config/postgres")["News"];
const Sponsor = require("../config/postgres")["Sponsor"];
const Logo = require("../config/postgres")["Logo"];
const logger = require("../config/logger");

const dbTestData = {
  checkForTestDataAndAddIfMissing: async () => {
    logger.debug("Check if required data is found in DB");
    const userNames = await User.findAll();
    const users = require("./testdatasets/users.json");
    if (userNames != users.length) {
      logger.debug("Required data was not found. Will now add data to db.");

      logger.debug("Start adding clubs");
      const clubs = require("./testdatasets/clubs.json");
      await Promise.all(
        clubs.map(async (entry) => {
          await Club.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding clubs");

      logger.debug("Start adding teams");
      const teams = require("./testdatasets/teams.json");
      await Promise.all(
        teams.map(async (entry) => {
          await Team.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding teams");

      logger.debug("Start adding sites");
      const sites = require("./testdatasets/flyingSites.json");
      await Promise.all(
        sites.map(async (entry) => {
          await FlyingSite.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding sites");

      logger.debug("Start adding users");
      await Promise.all(
        users.map(async (user) => {
          await User.create(user).catch((err) => {
            logger.debug(err);
          });
        })
      );
      logger.debug("Finished adding users");

      logger.debug("Start adding flights");
      const flights = require("./testdatasets/flights.json");
      adjustYearOfEveryFlight(flights);
      adjustTimesToToday(flights, 5);
      await Promise.all(
        flights.map(async (flight) => {
          Flight.create(flight).catch((err) => {
            logger.debug(err);
          });
        })
      );
      logger.debug("Finished adding flights");

      logger.debug("Start adding flightPhotos");
      const flightPhotos = require("./testdatasets/flightPhotos.json");
      await Promise.all(
        flightPhotos.map(async (photo) => {
          FlightPhoto.create(photo).catch((err) => {
            logger.debug(err);
          });
        })
      );
      logger.debug("Finished adding flightPhotos");

      logger.debug("Start adding comments");
      const comments = require("./testdatasets/comments.json");
      await Promise.all(
        comments.map(async (comment) => {
          FlightComment.create(comment).catch((err) => {
            logger.debug(err);
          });
        })
      );
      logger.debug("Finished adding comments");

      logger.debug("Start adding seasonDetails");
      const seasonDetails = require("./testdatasets/seasonDetails.json");
      await Promise.all(
        seasonDetails.map(async (entry) => {
          await SeasonDetail.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding seasonDetails");

      logger.debug("Start adding airspaces");
      const airspaces = require("./testdatasets/airspaces.json");
      await Promise.all(
        airspaces.map(async (entry) => {
          await Airspace.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding airspaces");

      logger.debug("Start adding fixes");
      const fixes = require("./testdatasets/fixes.json");
      await Promise.all(
        fixes.map(async (entry) => {
          await FlightFixes.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding fixes");

      logger.debug("Start adding news");
      const news = require("./testdatasets/news.json");
      await Promise.all(
        news.map(async (entry) => {
          await News.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding news");

      logger.debug("Start adding sponsors");
      const sponsorsArray = require("./testdatasets/sponsors.json");
      await Promise.all(
        sponsorsArray.map(async (entry) => {
          await Sponsor.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding sponsors");

      logger.debug("Start adding sponsor logos");
      const logos = require("./testdatasets/logos.json");
      await Promise.all(
        logos.map(async (entry) => {
          await Logo.create(entry).catch((err) => {
            logger.error(err);
          });
        })
      );
      logger.debug("Finished adding sponsor logos");
    }
  },
};

function adjustTimesToToday(flights, numberOfEntriesToAdjust) {
  for (let index = 0; index < numberOfEntriesToAdjust; index++) {
    const today = new Date();
    const takeoffDate = new Date(flights[index].takeoffTime);
    takeoffDate.setFullYear(today.getFullYear());
    takeoffDate.setMonth(today.getMonth());
    takeoffDate.setDate(today.getDate());
    flights[index].takeoffTime = takeoffDate.toISOString();
    const landingDate = new Date(flights[index].takeoffTime);
    landingDate.setFullYear(today.getFullYear());
    landingDate.setMonth(today.getMonth());
    landingDate.setDate(today.getDate());
    flights[index].landingTime = landingDate.toISOString();
  }
  for (
    let index = numberOfEntriesToAdjust;
    index < numberOfEntriesToAdjust * 2;
    index++
  ) {
    const takeoffDate = new Date(flights[index].takeoffTime);
    const today = new Date();
    takeoffDate.setFullYear(today.getFullYear());
    takeoffDate.setMonth(today.getMonth());
    takeoffDate.setDate(today.getDate() - 1);
    flights[index].takeoffTime = takeoffDate.toISOString();
    const landingDate = new Date(flights[index].landingTime);
    landingDate.setFullYear(today.getFullYear());
    landingDate.setMonth(today.getMonth());
    landingDate.setDate(today.getDate() - 1);
    flights[index].landingTime = landingDate.toISOString();
  }
}

function adjustYearOfEveryFlight(flights) {
  const today = new Date();
  for (let index = 0; index < flights.length - 1; index++) {
    const takeoffDate = new Date(flights[index].takeoffTime);
    takeoffDate.setFullYear(today.getFullYear());
    flights[index].takeoffTime = takeoffDate.toISOString();
    const landingDate = new Date(flights[index].landingTime);
    landingDate.setFullYear(today.getFullYear());
    flights[index].landingTime = landingDate.toISOString();
  }
  //Ensure that one entry will always be from last year
  const lastEntryIndex = flights.length - 1;
  const takeoffDate = new Date(flights[lastEntryIndex].takeoffTime);
  takeoffDate.setFullYear(today.getFullYear() - 1);
  flights[lastEntryIndex].takeoffTime = takeoffDate.toISOString();
  const landingDate = new Date(flights[lastEntryIndex].landingTime);
  landingDate.setFullYear(today.getFullYear() - 1);
  flights[lastEntryIndex].landingDate = landingDate.toISOString();
}

module.exports = dbTestData;
