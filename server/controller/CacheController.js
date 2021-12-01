const express = require("express");
const router = express.Router();

const { apicache, cache } = require("./CacheManager");

// add route to display cache index
router.get("/index", (req, res) => {
  res.json(apicache.getIndex());
});

// add route to manually clear target/group
router.get("/clear/:target?", (req, res) => {
  res.json(apicache.clear(req.params.target));
});

router.get("/collection/:id?", cache("1 hour"), function (req, res) {
  req.apicacheGroup = "abc";
  // do some work
  res.send({ foo: "bar" });
});

// POST collection/id
router.post("/collection/:id?", function (req, res) {
  // update model
  apicache.clear("abc");
  res.send("added a new item, so the cache has been cleared");
});

module.exports = router;
