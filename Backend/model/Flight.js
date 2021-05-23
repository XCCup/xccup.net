// const { Sequelize, DataTypes } = require("sequelize");
// const db = require("../config/postgres.js");
// const FlightComment = require("./FlightComment.js");
// const FlightFixes = require("./FlightFixes.js");

// const Flight = db.sequelize.define("Flight", {
//   id: {
//     type: Sequelize.UUID,
//     defaultValue: Sequelize.UUIDV4,
//     allowNull: false,
//     primaryKey: true,
//   },
//   externalId: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     unique: true,
//   },
//   takeoff: {
//     type: DataTypes.STRING(),
//   },
//   landing: {
//     type: DataTypes.STRING(),
//   },
//   report: {
//     type: DataTypes.STRING(5000), //Default is VARCHAR(255)
//   },
//   flightPoints: {
//     type: DataTypes.INTEGER,
//   },
//   flightDistance: {
//     type: DataTypes.DOUBLE,
//   },
//   flightType: {
//     type: DataTypes.STRING,
//     // values: ["JOJO", "FLAT", "FAI"],
//   },
//   flightStatus: {
//     type: DataTypes.STRING,
//     // values: ["Nicht in Wertung", "In Wertung", "Flugbuch", "In Bearbeitung"],
//   },
//   flightTurnpoints: {
//     type: DataTypes.JSON,
//   },
//   igcUrl: {
//     type: DataTypes.STRING,
//   },
//   imagesUrls: {
//     type: DataTypes.ARRAY(DataTypes.STRING),
//   },
//   glider: {
//     type: DataTypes.STRING,
//   },
//   airspaceViolation: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//     allowNull: false,
//   },
// });

// Flight.hasMany(FlightComment, {
//   as: "comments",
//   foreignKey: {
//     name: "flightId",
//     allowNull: false,
//   },
//   onDelete: "CASCADE",
//   hooks: true,
// });

// Flight.hasOne(FlightFixes, {
//   as: "fixes",
//   foreignKey: {
//     name: "flightId",
//     allowNull: false,
//   },
//   onDelete: "CASCADE",
//   hooks: true,
// });

// module.exports = Flight;
