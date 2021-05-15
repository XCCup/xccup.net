const userService = require("../service/UserService");
const flightService = require("../service/FlightService");

const dbTestData = {
  checkForTestDataAndAddIfMissing: async () => {
    console.log("Check if required data is found in DB");
    const user = {
      id: "1332b2d1-2f47-4c09-c1d8-1a8f3d5e9a8e",
      name: "SchnellsteMausVonMexiko",
      firstName: "Speedy",
      lastName: "Gonzales",
      birthday: "31.03.1953",
      glider: "Ozone Alpina 2",
      password: "$up€r$€cr€t",
      email: "super@dsecret.com",
    };
    const returnUser = await userService.getByName(user.name);
    if (!returnUser) {
      console.log("Required data was not found. Will now add data to db.");
      userService.save(user);
    }
  },
};

module.exports = dbTestData;
