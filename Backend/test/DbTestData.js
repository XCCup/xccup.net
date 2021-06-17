const { User, Flight, FlightComment } = require("../model/DependentModels");
const FlightFixes = require("../model/FlightFixes");

const dbTestData = {
  checkForTestDataAndAddIfMissing: async () => {
    console.log("Check if required data is found in DB");
    const userNames = await User.findAll();
    const users = require("./testdatasets/users.json");
    if (userNames != users.length) {
      console.log("Required data was not found. Will now add data to db.");

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
    }
  },
};

module.exports = dbTestData;
