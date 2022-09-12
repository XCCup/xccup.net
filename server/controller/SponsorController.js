const express = require("express");
const router = express.Router();
const service = require("../service/SponsorService");
const logoService = require("../service/LogoService");
const { NOT_FOUND, OK } = require("../constants/http-status-constants");
const { query } = require("express-validator");
const { requesterMustBeModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkOptionalStringObjectNotEmpty,
  checkOptionalIsBoolean,
  checkIsUuidObject,
  checkParamIsUuid,
  validationHasErrors,
  checkIsArray,
  checkStringObject,
  checkStringObjectNoEscaping,
} = require("./Validation");
const {
  defineFileDestination,
  defineImageFileNameWithCurrentDateAsPrefix,
  IMAGE_SIZES,
  retrieveFilePath,
} = require("../helper/ImageUtils");
const { default: config } = require("../config/env-config");
const multer = require("multer");

const IMAGE_STORE = config.get("dataPath") + "/images/sponsors";

const storage = multer.diskStorage({
  destination: defineFileDestination(IMAGE_STORE),
  filename: defineImageFileNameWithCurrentDateAsPrefix(),
});
const imageUpload = multer({ storage });

// @desc Gets all sponsors
// @route GET /sponsors/
// @access Only moderator

router.get("/", async (req, res, next) => {
  try {
    const sponsors = await service.getAll();
    res.json(sponsors);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all sponsors for the current season
// @route GET /sponsors/public

router.get("/public", async (req, res, next) => {
  try {
    const sponsors = await service.getAllActive();
    res.json(sponsors);
  } catch (error) {
    next(error);
  }
});

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

      res.set("Cache-control", "public, max-age=172800, immutable");
      return res.type(logo.mimetype).sendFile(fullfilepath);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Uploads a new logo for a sponsor
// @route POST /sponsors/logo
// @access Only moderator

router.post(
  "/logo",
  requesterMustBeModerator,
  imageUpload.single("image"),
  checkIsUuidObject("sponsorId"),
  async (req, res, next) => {
    try {
      const { originalname, mimetype, size, path } = req.file;
      const sponsorId = req.body.sponsorId;

      const sponsor = await service.getById(sponsorId);
      if (!sponsor) return res.sendStatus(NOT_FOUND);

      if (sponsor.Logo) {
        logoService.deleteOldLogo(sponsor);
      }

      const logo = await logoService.create({
        originalname,
        mimetype,
        size,
        path,
        sponsorId,
      });

      res.json(logo);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Adds a sponsor to the db
// @route POST /sponsors/
// @access Only moderator

router.post(
  "/",
  requesterMustBeModerator,
  checkStringObjectNotEmpty("name"),
  // checkStringObjectNotEmpty("type"),
  checkOptionalStringObjectNotEmpty("website"),
  checkStringObjectNoEscaping("contacts.address"),
  checkStringObjectNoEscaping("contacts.email"),
  checkStringObject("contacts.phone"),
  checkStringObject("contacts.phone2"),
  checkIsArray("sponsorInSeasons"),
  checkOptionalIsBoolean("isGoldSponsor"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const result = await service.create(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits a sponsor
// @route PUT /sponsors/:id
// @access Only moderator

router.put(
  "/:id",
  requesterMustBeModerator,
  checkParamIsUuid("id"),
  checkOptionalStringObjectNotEmpty("name"),
  checkStringObjectNoEscaping("website"),
  checkStringObject("contacts.address"),
  checkStringObject("contacts.email"),
  checkStringObject("contacts.phone"),
  checkStringObject("contacts.phone2"),
  checkIsArray("sponsorInSeasons"),
  checkOptionalIsBoolean("isGoldSponsor"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      await service.update(req.body);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a sponsor by id
// @route DELETE /sponsors/:id
// @access Only owner

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  requesterMustBeModerator,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      const sponsor = await service.getById(id);

      if (!sponsor) return res.sendStatus(NOT_FOUND);

      const numberOfDestroyedRows = await service.delete(id);
      res.json(numberOfDestroyedRows);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
