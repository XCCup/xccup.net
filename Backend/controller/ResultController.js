const express = require("express");
const router = express.Router();
const service = require("../service/ResultService");
// const { NOT_FOUND, INTERNAL_SERVER_ERROR } = require("./Constants");
// const { authToken, requesterIsNotModerator } = require("./Auth");
// const {
//   checkOptionalIsBoolean,
//   checkOptionalStringObjectNotEmpty,
//   checkStringObjectNotEmpty,
//   validationHasErrors,
// } = require("./Validation");

// @desc Gets the overall result
// @route GET /

router.get("/", async (req, res) => {
  const result = await service.overall();
  res.json(result);
});

// @desc Gets the result for a class
// @route GET /class/:class

router.get("/class/:class", async (req, res) => {
  const result = await service.overall();
  res.json(result);
});

// @desc Gets the result for a region
// @route GET /region/:region

router.get("/region/:region", async (req, res) => {
  const result = await service.overall();
  res.json(result);
});

// @desc Gets the result for a club
// @route GET /club/:club

router.get("/club/:club", async (req, res) => {
  const result = await service.overall();
  res.json(result);
});

module.exports = router;
