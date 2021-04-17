const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
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

const Club = db.sequelize.define("Club", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  test1: {
    type: DataTypes.STRING,
  },
  test2: {
    type: DataTypes.STRING,
  },
  representiveId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
      comment: "This is a column links to the Users table",
    },
  },
});
// // Delete table
// (async () => {
//   // Club.drop();
//   User.drop();
// })();

// // Create tables in db
// (async () => {
//   await User.sync({ alter: true });
//   // await Club.sync({ alter: true });
// })();

// //Build instance
// const jane = User.build({ name: "jane", email: "jane@mail.com" });
// console.log(jane);
// console.log(jane instanceof User);

// //Store instance
// (async () => {
//   jane.save();
// })();

//Create instance (build+save) and update it later
// (async () => {
//   return (jane = User.create({ name: "Jane", email: "jane@mail.com" }));
// })().then((result) =>
//   (async () => {
//     result.email = "other@mail.com";
//     result.save();
//   })()
// );

//Reloading

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.use("/user", require("./controller/user.js"));

const PORT = process.env.PORT || 3000;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
