const express = require("express");
const router = express.Router();
const service = require("../service/FlyingSiteService");
const mailService = require("../service/MailService");
const { requesterMustBeLoggedIn, requesterMustBeModerator } = require("./Auth");
const { getCache, setCache, deleteCache } = require("./CacheManager");
const { createRateLimiter } = require("./api-protection");
const { OK, NOT_FOUND } = require("../constants/http-status-constants");
const {
  checkStringObjectNotEmptyNoEscaping,
  checkStringObjectNoEscaping,
  checkIsInt,
  checkIsFloat,
  checkIsUuidObjectOrEmpty,
  checkStringObject,
  checkParamIsUuid,
  validationHasErrors,
} = require("./Validation");

const postLimiter = createRateLimiter(60, 5);

// @desc Gets all site names
// @route GET /sites/names

router.get("/names", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const sites = await service.getAllNames();

    setCache(req, sites);

    res.json(sites);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all sites
// @route GET /sites

router.get("/", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const sites = await service.getAll();

    setCache(req, sites);

    res.json(sites);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all proposed sites
// @route GET /sites/proposed

router.get("/proposed", requesterMustBeModerator, async (req, res, next) => {
  try {
    const sites = await service.getAll({ state: "proposal" });
    res.json(sites);
  } catch (error) {
    next(error);
  }
});

// @desc Submit a proposal for a new flying site
// @route POST /sites
// @access All logged-in user

router.post(
  "/",
  postLimiter,
  requesterMustBeLoggedIn,
  checkStringObjectNotEmptyNoEscaping("name"),
  checkStringObjectNotEmptyNoEscaping("direction"),
  checkIsFloat("lat"),
  checkIsFloat("long"),
  checkIsUuidObjectOrEmpty("clubId"),
  checkStringObjectNoEscaping("website"),
  checkStringObject("region"),
  checkIsInt("heightDifference"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      await service.create({
        ...req.body,
        submitter: req.user,
      });
      mailService.sendNewAdminTask();

      deleteCache(["sites"]);
      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Accepts a proposed flying site
// @route PUT /sites/accept/:id
// @access Only moderator

router.put(
  "/accept/:id",
  checkParamIsUuid("id"),
  requesterMustBeModerator,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const siteId = req.params.id;

    try {
      const site = await service.getById(siteId);
      if (!site) return res.sendStatus(NOT_FOUND);

      await service.changeStateToActive(site);
      deleteCache(["sites"]);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a flying site
// @route PUT /sites/:id
// @access Only moderator

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  requesterMustBeModerator,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const siteId = req.params.id;

    try {
      const site = await service.getById(siteId);
      if (!site) return res.sendStatus(NOT_FOUND);

      await service.delete(siteId);
      deleteCache(["sites"]);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
