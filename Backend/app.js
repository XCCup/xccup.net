const express = require("express");
const app = express();

//Setup DB
const db = require("./config/postgres.js");

//Development Tools
if (process.env.NODE_ENV === "development") {
  // https://expressjs.com/en/resources/middleware/cors.html
  // https://medium.com/swlh/simple-steps-to-fix-cors-error-a2029f9b257a
  var cors = require("cors");
  app.use(cors());
  //Logging
  const morgan = require("morgan");
  app.use(morgan("dev"));
  //SwaggerUI
  const swaggerUi = require("swagger-ui-express");
  const swaggerDocument = require("./swagger.json");
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

app.use(express.urlencoded({ extended: false }));
//The default size limit for a request body is 100kb
//IGC-Files can easily exceed this limit
app.use(express.json({ limit: "5mb" }));

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});
app.use("/users", require("./controller/UserController.js"));
app.use("/flights", require("./controller/FlightController.js"));
app.use("/comments", require("./controller/CommentController.js"));

const PORT = process.env.SERVER_PORT || 3000;
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
