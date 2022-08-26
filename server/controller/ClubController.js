const express = require("express");
const router = express.Router();
const service = require("../service/ClubService");
const logoService = require("../service/LogoService");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { query } = require("express-validator");
const { requesterMustBeModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkParamIsUuid,
  checkIsBoolean,
  checkIsUuidObject,
  validationHasErrors,
} = require("./Validation");
const multer = require("multer");
const {
  defineFileDestination,
  defineImageFileNameWithCurrentDateAsPrefix,
  retrieveFilePath,
  IMAGE_SIZES,
} = require("../helper/ImageUtils");
const { getCache, setCache, deleteCache } = require("./CacheManager");
const CACHE_RELEVANT_KEYS = ["home", "clubs", "filterOptions"];

const IMAGE_STORE = "test/testdatasets/images/clubs";

const storage = multer.diskStorage({
  destination: defineFileDestination(IMAGE_STORE),
  filename: defineImageFileNameWithCurrentDateAsPrefix(),
});
const imageUpload = multer({ storage });

// @desc Gets all open information of all active clubs
// @route GET /clubs/public

router.get("/public", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const clubs = await service.getAllActive();

    setCache(
      req,
      clubs.map((c) => c.toJSON())
    );

    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all club names
// @route GET /clubs/names

router.get("/names", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const clubs = await service.getAllNames();

    setCache(
      req,
      clubs.map((c) => c.toJSON())
    );

    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all active and non-active clubs
// @route GET /clubs/
// @access Only moderator

router.get("/", requesterMustBeModerator, async (req, res, next) => {
  try {
    const clubs = await service.getAll();
    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all members of clubs
// @route GET /clubs/:shortName/member/
// @access All logged-in user

router.get("/:shortName/member", async (req, res, next) => {
  const shortName = req.params.shortName;
  try {
    const members = await service.getAllMemberOfClub(shortName);
    res.json(members);
  } catch (error) {
    next(error);
  }
});

// @desc Get all club information
// @route GET /clubs/:id
// @access Only moderator

router.get(
  "/:id",
  checkParamIsUuid("id"),
  requesterMustBeModerator,
  async (req, res, next) => {
    try {
      const clubId = req.params.id;

      const retrievedClub = await service.getById(clubId);
      if (!retrievedClub) return res.sendStatus(NOT_FOUND);

      res.json(retrievedClub);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Saves a new club to the database
// @route POST /clubs/
// @access Only moderator

router.post(
  "/",
  requesterMustBeModerator,
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("shortName"),
  checkStringObjectNotEmpty("website"),
  checkStringObjectNotEmpty("contacts"),
  checkIsBoolean("isActiveParticipant"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const { name, shortName, website, contacts, isActiveParticipant } =
      req.body;

    try {
      const club = {
        name,
        shortName,
        website,
        contacts,
        participantInSeasons: isActiveParticipant
          ? [new Date().getFullYear()]
          : [],
      };

      const newClub = await service.create(club);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(newClub);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits a club
// @route PUT /clubs/:id
// @access Only moderator

router.put(
  "/:id",
  requesterMustBeModerator,
  checkParamIsUuid("id"),
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("shortName"),
  checkStringObjectNotEmpty("website"),
  checkStringObjectNotEmpty("contacts"),
  checkIsBoolean("isActiveParticipant"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const clubId = req.params.id;
    const { name, shortName, website, contacts, isActiveParticipant } =
      req.body;

    try {
      const club = await service.getById(clubId);
      if (!club) return res.sendStatus(NOT_FOUND);

      club.name = name;
      club.shortName = shortName;
      club.homepage = website;
      club.contacts = contacts;
      if (
        isActiveParticipant &&
        !club.participantInSeasons.includes(new Date().getFullYear())
      ) {
        isActiveParticipant.push(new Date().getFullYear());
      }

      const updatedClub = await service.update(club);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(updatedClub);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the logo of an sponsor
// @route GET /sponsors/logo/:id

router.get(
  "/logo/:id",
  checkParamIsUuid("id"),
  query("size")
    .optional()
    .isIn(Object.values(IMAGE_SIZES).map((f) => f.name)),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const size = req.query.size;

    try {
      const logo = await logoService.getById(id);

      if (!logo) return res.sendStatus(NOT_FOUND);

      const fullfilepath = retrieveFilePath(logo.path, size);

      return res.type(logo.mimetype).sendFile(fullfilepath);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Uploads a new logo
// @route POST /clubs/logo
// @access Only moderator

router.post(
  "/logo",
  requesterMustBeModerator,
  imageUpload.single("image"),
  checkIsUuidObject("clubId"),
  async (req, res, next) => {
    try {
      const { originalname, mimetype, size, path } = req.file;

      const clubId = req.body.clubId;

      const club = await service.getById(clubId);
      if (!club) return res.sendStatus(NOT_FOUND);

      if (club.Logo) {
        logoService.deleteOldLogo(club);
      }

      const logo = await logoService.create({
        originalname,
        mimetype,
        size,
        path,
        clubId,
      });

      res.json(logo);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a club by id
// @route DELETE /clubs/:id
// @access Only moderator

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  requesterMustBeModerator,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const clubId = req.params.id;

    try {
      const club = await service.getById(clubId);
      if (!club) return res.sendStatus(NOT_FOUND);

      const numberOfDestroyedRows = await service.delete(clubId);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(numberOfDestroyedRows);
    } catch (error) {
      next();
    }
  }
);

module.exports = router;
