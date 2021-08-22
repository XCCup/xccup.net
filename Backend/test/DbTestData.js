const {
  User,
  Flight,
  FlightComment,
  Club,
  FlyingSite,
} = require("../model/DependentModels");
const FlightFixes = require("../model/FlightFixes");
const SeasonDetail = require("../model/SeasonDetail");
const Airspace = require("../model/Airspace");

const dbTestData = {
  checkForTestDataAndAddIfMissing: async () => {
    console.log("Check if required data is found in DB");
    const userNames = await User.findAll();
    const users = require("./testdatasets/users.json");
    if (userNames != users.length) {
      console.log("Required data was not found. Will now add data to db.");

      console.log("Start adding clubs");
      const clubs = require("./testdatasets/clubs.json");
      await Promise.all(
        clubs.map(async (entry) => {
          await Club.create(entry).catch((err) => {
            console.log(err.message);
          });
        })
      );
      console.log("Finished adding clubs");

      console.log("Start adding sites");
      const sites = require("./testdatasets/flyingSites.json");
      await Promise.all(
        sites.map(async (entry) => {
          await FlyingSite.create(entry).catch((err) => {
            console.log(err.message);
          });
        })
      );
      console.log("Finished adding sites");

      console.log("Start adding users");
      await Promise.all(
        users.map(async (user) => {
          await User.create(user).catch((err) => {
            console.log(err);
          });
        })
      );
      console.log("Finished adding users");

      console.log("Start adding flights");
      const flights = require("./testdatasets/flights.json");
      await Promise.all(
        flights.map(async (flight) => {
          Flight.create(flight).catch((err) => {
            console.log(err);
          });
        })
      );
      console.log("Finished adding flights");

      console.log("Start adding comments");
      const comments = require("./testdatasets/comments.json");
      await Promise.all(
        comments.map(async (comment) => {
          FlightComment.create(comment).catch((err) => {
            console.log(err);
          });
        })
      );
      console.log("Finished adding comments");

      console.log("Start adding fixes");
      const fixes = require("./testdatasets/fixes.json");
      await Promise.all(
        fixes.map(async (entry) => {
          await FlightFixes.create(entry).catch((err) => {
            console.log(err.message);
          });
        })
      );
      console.log("Finished adding fixes");

      console.log("Start adding seasonDetails");
      const seasonDetails = require("./testdatasets/seasonDetails.json");
      await Promise.all(
        seasonDetails.map(async (entry) => {
          await SeasonDetail.create(entry).catch((err) => {
            console.log(err.message);
          });
        })
      );
      console.log("Finished adding seasonDetails");

      console.log("Start adding airspaces");
      const airspaces = require("./testdatasets/airspaces.json");
      await Promise.all(
        airspaces.map(async (entry) => {
          await Airspace.create(entry).catch((err) => {
            console.log(err.message);
          });
        })
      );
      console.log("Finished adding airspaces");
    }
  },
};

module.exports = dbTestData;
