const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const faker = require("faker");
const app = express();

const { Sequelize, DataTypes } = require("sequelize");

//Load config
dotenv.config({ path: "./config/config.env" });

//Setup DB
const db = require("./config/postgres.js");

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//SwaggerUI
if (process.env.NODE_ENV === "development") {
  const swaggerUi = require("swagger-ui-express");
  const swaggerDocument = require("./swagger.json");
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// //Set global var
// app.use(function (req, res, next) {
//   res.locals.user = req.user || null;
//   next();
// });

// //Static folder
// app.use(express.static(path.join(__dirname, "public")));

// //Routes
// app.use("/", require("./routes/index"));
// app.use("/auth", require("./routes/auth"));
// app.use("/stories", require("./routes/stories"));

const User = require("./model/User");
const FlightComment = require("./model/FlightComment");
const Flight = require("./model/Flight");

// // Delete table
// (async () => {
//   await User.drop();
//   await User.sync({ alter: true });
// })();

// Create tables in db
// (async () => {
//   await FlightComment.sync({ force: true });
//   await Flight.sync({ force: true });
// Flight.create({ points: 789 });
// FlightComment.create({
//   pilot: "Stephan",
//   message: "Eine erste Nachricht",
//   flightId: 1,
// });
// FlightComment.create({
//   pilot: "Kai",
//   message: "Eine zweite Nachricht",
//   flightId: 1,
// });
// const flight = await Flight.findOne({
//   where: {
//     points: 123,
//   },
// });
// console.log("Found id:", flight.id);
// console.log("Comment:", JSON.stringify(await flight.getComments(), null, 4));
// flight.destroy(flight);
// await User.sync({ alter: true });
// await Club.sync({ alter: true });
// })();

// //Build instance
// const jane = User.build({ name: "jane", email: "jane@mail.com" });
// console.log(jane);
// console.log(jane instanceof User);

// //Store instance
// (async () => {
//   jane.save();
// })();

// //Create instance (build+save) and update it later
// (async function test() {
//   const pw = faker.vehicle.manufacturer();
//   const user = await User.create({
//     // name: "Kai",
//     name: faker.name.findName(),
//     email: faker.internet.email(),
//     password: pw,
//   });
// })();

// console.log("other");
// return (jane = User.create({
//   // name: "Kai",
//   name: faker.name.findName(),
//   email: faker.internet.email(),
//   password: hashedPw,
// }));
// })();
//( .then((result) =>
//   (async () => {
//     result.email = "other@mail.com";
//     result.save();
//   })()
// );

// //Create instance and select it later
// (async () => {
//   return (jane = User.create({ name: "Jane", email: "jane@mail.com" }));
// })().then((result) =>
//   (async () => {
//     const user = await User.findAll();
//     console.log("User: ", user);
//     console.log("User as json: ", JSON.stringify(user, null, 4));
//   })()
// );

// // Select only one attribute from model
// (async () => {
//   const result = await User.getNames();
//   console.log(JSON.stringify(result, null, 4));
// })();

// // Select with where
// (async () => {
//   const result = await User.findAll({
//     where: {
//       name: "Kai",
//     },
//   });
//   console.log(JSON.stringify(result, null, 4));
// })();

(async () => {
  const IgcAnalyzer = require("./igc/IgcAnalyzer");
  const result = IgcAnalyzer.parse("fai");
})();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.use("/user", require("./controller/UserController.js"));
app.use("/flight", require("./controller/FlightController.js"));

const PORT = process.env.PORT || 3000;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
