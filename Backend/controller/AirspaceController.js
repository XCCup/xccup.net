const express = require("express");
const router = express.Router();
const airspace = require("../model/Airspace");

// @desc Gets all airspaces
// @route GET /airspaces

router.get("/", async (req, res) => {
  const airspaces = await airspace.findAll();
  res.json(airspaces);
});

module.exports = router;
