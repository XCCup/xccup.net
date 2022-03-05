const express = require("express");
const { requesterIsNotAdmin, authToken } = require("./Auth");
const router = express.Router();

const { deleteCache, listCache, getCacheStats } = require("./CacheManager");

router.get("/clear/:key", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotAdmin(req, res)) return;

    res.json(deleteCache([req.params.key]));
  } catch (error) {
    next(error);
  }
});

router.get("/stats", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotAdmin(req, res)) return;

    res.json({ stats: getCacheStats(), keys: listCache() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
