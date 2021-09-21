const express = require("express");
const router = express.Router();
const service = require("../service/NewsService");
const { authToken, requesterIsNotModerator } = require("./Auth");

// @desc Gets all news
// @route GET /news
// @access Only moderator

router.get("/", authToken, async (req, res, next) => {
  try {
    if (requesterIsNotModerator(res, req)) return;

    const airspaces = await service.getAll();
    res.json(airspaces);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all news
// @route GET /news/active

router.get("/active", async (req, res, next) => {
  try {
    const airspaces = await service.getActive();
    res.json(airspaces);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
