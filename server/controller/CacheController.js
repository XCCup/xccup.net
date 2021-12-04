const express = require("express");
const router = express.Router();

const { deleteCache, listCache, getCacheStats } = require("./CacheManager");

router.get("/clear/:key", (req, res) => {
  res.json(deleteCache([req.params.key]));
});

router.get("/list", (req, res) => {
  res.json(listCache());
});

router.get("/stats", (req, res) => {
  res.json(getCacheStats());
});

module.exports = router;
