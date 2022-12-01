const User = require("../db")["User"];
const Flight = require("../db")["Flight"];
const FlightComment = require("../db")["FlightComment"];
const Club = require("../db")["Club"];
const Team = require("../db")["Team"];
const FlyingSite = require("../db")["FlyingSite"];
const FlightFixes = require("../db")["FlightFixes"];
const FlightPhoto = require("../db")["FlightPhoto"];
const SeasonDetail = require("../db")["SeasonDetail"];
const Airspace = require("../db")["Airspace"];
const News = require("../db")["News"];
const Sponsor = require("../db")["Sponsor"];
const Brand = require("../db")["Brand"];
const Logo = require("../db")["Logo"];
const AirspaceService = require("../service/AirspaceService");
const logger = require("../config/logger");
const config = require("../config/env-config").default;

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

    // Real data without personal data
    const relations = [
      [Club, require("./testdatasets/clubs.json")],
      [FlyingSite, require("./testdatasets/flyingSites.json")],
      [SeasonDetail, require("./testdatasets/seasonDetails.json")],
      [Airspace, require("./testdatasets/airspaces_lux.json")],
      [Airspace, require("./testdatasets/airspaces_deu.json")],
      [News, require("./testdatasets/news.json")],
      [Sponsor, require("./testdatasets/sponsors.json")],
      [Brand, require("./testdatasets/brands.json")],
      [Logo, require("./testdatasets/logos.json")],
    ];
    // Test data with personal data
    if (config.get("serverImportTestData")) {
      relations.push([Team, require("./testdatasets/teams.json")]);
      relations.push([User, require("./testdatasets/users.json")]);
      relations.push([Flight, flights]);
      relations.push([
        FlightPhoto,
        require("./testdatasets/flightPhotos.json"),
      ]);
      relations.push([FlightComment, require("./testdatasets/comments.json")]);
      relations.push([FlightFixes, require("./testdatasets/fixes.json")]);
    }

    await addToDb(relations);

    logger.debug("DTDL: Will fix invalid GeoJSON data of airspaces");
    await AirspaceService.fixInvalidGeoData();
    logger.debug("DTDL: Finished repair of GeoJSON");
  },
};

async function addToDb(relations) {
  for (let index = 0; index < relations.length; index++) {
    const model = relations[index][0];
    const dataset = relations[index][1];
    logger.debug("DTDL: Start adding " + model.name);
    await addDataset(model, dataset);
    logger.debug("DTDL: Finished adding " + model.name);
  }
}

async function addDataset(model, dataset) {
  await Promise.all(
    dataset.map(async (entry) => {
      await model.create(entry).catch((err) => {
        if (err.errors)
          logger.error(
            "DTDL: " + err.errors[0].message + " Value: " + err.errors[0].value
          );
        else logger.error("DTDL: " + err);
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
    const landingDate = new Date(flights[index].landingDate);
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
  flights[lastEntryIndex].landingTime = landingDate.toISOString();
}

module.exports = dbTestData;
