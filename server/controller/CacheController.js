const express = require("express");
const { requesterMustBeAdmin } = require("./Auth");
const router = express.Router();

const { deleteCache, listCache, getCacheStats } = require("./CacheManager");

router.get("/clear/:key", requesterMustBeAdmin, async (req, res, next) => {
  try {
    res.json(deleteCache([req.params.key]));
  } catch (error) {
    next(error);
  }
});

router.get("/stats", requesterMustBeAdmin, async (req, res, next) => {
  try {
    res.json({ stats: getCacheStats(), keys: listCache() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
