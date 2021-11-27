const express = require("express");
const router = express.Router();
const service = require("../service/HomeService");

// @desc Gets all information needed for the homepage
// @route GET /

router.get("/", async (req, res, next) => {
  try {
    const result = await service.get();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
