// const { User } = require("../../model/DependentModels");
const faker = require("faker");
const fs = require("fs");
const path = require("path");
const IgcAnalyzer = require("../../igc/IgcAnalyzer");
const ElevationAttacher = require("../../igc/ElevationAttacher");
const LocationFinder = require("../../igc/LocationFinder");

function writeAsJson(name, object) {
  fs.writeFileSync(name + ".json", JSON.stringify(object, null, 2));
}

function selectRandomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function trueOrFalse() {
  const values = [true, false];
  return selectRandomFromArray(values);
}

// //Create Users

// const users = new Array(20);

// for (let i = 0; i < users.length; i++) {
//   let user = {};
//   user.id = faker.datatype.uuid();
//   user.names = faker.name.findName().split(" ");
//   user.firstName = user.names[0];
//   user.lastName = user.names[1];
//   user.name = user.firstName + user.lastName;
//   user.birthday = faker.date
//     .past(30, new Date(2001, 0, 1))
//     .toLocaleDateString("de-DE");
//   const genders = ["D", "M", "W"];
//   user.gender = selectRandomFromArray(genders);
//   const sizes = ["S", "M", "L", "XL", "XXL"];
//   user.tshirtSize = selectRandomFromArray(sizes);
//   const gliders = [
//     "Ozone Alpina 2",
//     "Ozone Enzo 3",
//     "Flow XC Racer",
//     "Sky Apollo",
//     "U-Turn Bodyguard",
//     "Litte Cloud Spiruline",
//     "Air-G Emilie",
//   ];
//   user.gliders = new Array(
//     selectRandomFromArray(gliders),
//     selectRandomFromArray(gliders)
//   );
//   user.emailInformIfComment = trueOrFalse();
//   user.emailNewsletter = trueOrFalse();
//   user.emailTeamSearch = trueOrFalse();
//   const states = ["RP", "NW", "SR", "LUX", "BEL", "HE", "BW"];
//   user.state = selectRandomFromArray(states);
//   user.email =
//     user.firstName + "@" + user.lastName + "." + faker.internet.domainSuffix();
//   user.password = "PW_" + user.name;

//   users[i] = user;
// }

// console.log(users);
// fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

// //Parsing IGC Files and initial creation of flights

// const igcPath = path.join(__dirname, "igcs");
// console.log("path: ", igcPath);
// const flights = [];
// const fixes = [];
// fs.readdir(igcPath, function (err, files) {
//   if (err) {
//     return console.log("Unable to scan directory: " + err);
//   }
//   console.log(files);
//   calcFile(files, flights, fixes);
//   //Attach Locations
//   //Attach Elevation
// });
//
// function calcFile(files, flights, fixes) {
//   console.log("SF: ", flights);
//   if (files.length == 0) {
//     console.log("END: ", flights);
//     fs.writeFileSync("flights.json", JSON.stringify(flights, null, 2));
//     fs.writeFileSync("fixes.json", JSON.stringify(fixes, null, 2));
//     return;
//   }
//   let flight = {};
//   flight.id = faker.datatype.uuid();
//   process.env.FLIGHT_STORE = path.join(__dirname, "igcs");
//   const location = path.join(igcPath, files.pop()).toString();
//   IgcAnalyzer.startCalculation(
//     flight,
//     (result) => {
//       console.log("res: ", result);
//       flights.push(result);
//       calcFile(files, flights, fixes);
//     },
//     location
//   );

//   let fix = {
//     id: faker.datatype.uuid(),
//     fixes: IgcAnalyzer.extractFixes(flight, location),
//     flightId: flight.id,
//   };
//   fixes.push(fix);
// }

// //Attaching userId and further data to flights
// const flights = require("./flights.json");
// const users = require("./users.json");
// let ui = 0;
// for (let fi = 0; fi < flights.length; fi++) {
//   if (ui == users.length) ui = 0;
//   flights[fi].userId = users[ui].id;
//   flights[fi].externalId = fi;
//   flights[fi].report = faker.lorem.words(Math.random() * 200);
//   flights[fi].glider = users[ui].gliders[0];
//   (flights[fi].flightStatus =
//     flights[fi].flightPoints >= 60 ? "In Wertung" : "Nicht in Wertung"),
//     (flights[fi].airspaceViolation = false),
//     (flights[fi].uncheckedGRecord = false),
//     (flights[fi].isHike = trueOrFalse()),
//     ui++;
// }
// writeAsJson("flights", flights);

// //Attaching elevation to fixes
// const fixes = require("./fixes.json");
// const fixesWithElevation = [];
// process.env.ELEVATION_HOST = "https://elevation.lurb.org/v1/";
// process.env.ELEVATION_DATASET = "eudem25m";
// attachElevation();

// function attachElevation() {
//   if (fixes.length == 0) {
//     writeAsJson("fixes", fixesWithElevation);
//     return;
//   }
//   const poped = fixes.pop();
//   ElevationAttacher.execute(
//     poped.fixes,
//     (fWE) => {
//       fixesWithElevation.push(fWE);
//       attachElevation();
//     },
//     poped
//   );
// }

// // Create comments
// const flights = require("./flights.json");
// const users = require("./users.json");

// const comments = [];

// flights.forEach((flight) => {
//   for (let index = 0; index < Math.floor(Math.random() * 4); index++) {
//     const comment = {
//       id: faker.datatype.uuid(),
//       flightId: flight.id,
//       userId: selectRandomFromArray(users).id,
//       message: faker.lorem.words(Math.random() * 50),
//     };
//     comments.push(comment);
//   }
// });

// writeAsJson("comments", comments);

// Attach takeoff and landing
const fixes = require("./fixes.json");

const fixesWithLocation = [];
(async () => {
  await attachLocation(fixes);
  console.log(fixesWithLocation);
  writeAsJson("fixesWithLocation", fixesWithLocation);
})();

function attachLocation(fixes) {
  Promise.all(
    fixes.map(async (element) => {
      const result = await LocationFinder.findTakeoffAndLanding(
        element.fixes[0],
        element.fixes[element.fixes.length - 1]
      );
      const ttt = {
        flightId: element.flightId,
        takeoff: result.nameOfTakeoff,
        landing: result.nameOfLanding,
      };
      fixesWithLocation.push(ttt);
    })
  );
}
