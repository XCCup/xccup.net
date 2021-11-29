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
const Brand = require("../config/postgres")["Brand"];
const Logo = require("../config/postgres")["Logo"];
const AirspaceService = require("../service/AirspaceService");
const logger = require("../config/logger");

const dbTestData = {
  addFlights: async () => {
    const flights = require("./testdatasets/flights.json");
    adjustYearOfEveryFlight(flights);
    adjustTimesToToday(flights, 5);

    const relations = [
      [Flight, flights],
      [FlightPhoto, require("./testdatasets/flightPhotos.json")],
      [FlightComment, require("./testdatasets/comments.json")],
      [FlightFixes, require("./testdatasets/fixes.json")],
    ];

    await addToDb(relations);
  },
  addTestData: async () => {
    const flights = require("./testdatasets/flights.json");
    adjustYearOfEveryFlight(flights);
    adjustTimesToToday(flights, 5);

    const relations = [
      [Club, require("./testdatasets/clubs.json")],
      [Team, require("./testdatasets/teams.json")],
      [FlyingSite, require("./testdatasets/flyingSites.json")],
      [User, require("./testdatasets/users.json")],
      [Flight, flights],
      [FlightPhoto, require("./testdatasets/flightPhotos.json")],
      [FlightComment, require("./testdatasets/comments.json")],
      [SeasonDetail, require("./testdatasets/seasonDetails.json")],
      [Airspace, require("./testdatasets/airspaces.json")],
      [FlightFixes, require("./testdatasets/fixes.json")],
      [News, require("./testdatasets/news.json")],
      [Sponsor, require("./testdatasets/sponsors.json")],
      [Brand, require("./testdatasets/brands.json")],
      [Logo, require("./testdatasets/logos.json")],
    ];

    await addToDb(relations);

    logger.debug("Will fix invalid GeoJSON data of airspaces");
    await AirspaceService.fixInvalidGeoData();
    logger.debug("Finished repair of GeoJSON");
  },
};

async function addToDb(relations) {
  for (let index = 0; index < relations.length; index++) {
    const model = relations[index][0];
    const dataset = relations[index][1];
    logger.debug("Start adding " + model.name);
    await addDataset(model, dataset);
    logger.debug("Finished adding " + model.name);
  }
}

async function addDataset(model, dataset) {
  await Promise.all(
    dataset.map(async (entry) => {
      await model.create(entry).catch((err) => {
        logger.error(err.errors[0].message);
      });
    })
  );
}

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
