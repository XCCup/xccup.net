const { request, json } = require("express");
const express = require("express");
const router = express.Router();
const service = require("../service/FlightService");

// @desc Retrieves all flights
// @route GET /flight/

router.get("/", async (req, res) => {
  console.log("Call controller");
  const flights = await service.getAll();
  console.log("Controller:", flights);
  res.json(flights);
});

// @desc Retrieve a flight by id
// @route GET /flight/:id

router.get("/:id", async (req, res) => {
  console.log("Call controller");
  const flights = await service.getById(req.params.id);
  if (!flights) {
    res.sendStatus(404);
    return;
  }
  console.log("Controller:", flights);
  res.json(flights);
});

// @desc Add the result of a igc analysis to a flight
// @route PUT /flight/result

router.post("/result", async (req, res) => {
  console.log("IGC Result controller");
  console.log(req.body);
  // const flights = await service.getById(req.params.id);
  // if (!flights) {
  //   res.sendStatus(404);
  //   return;
  // }
  // console.log("Controller:", flights);
  // res.json(flights);
  res.sendStatus(200);
});

module.exports = router;
