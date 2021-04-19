const { request, json } = require("express");
const express = require("express");
const router = express.Router();

// @desc Retrieves all users
// @route GET /user/

router.get("/", (req, res) => {
  res.json({ message: "JSON Test" });
});

module.exports = router;
