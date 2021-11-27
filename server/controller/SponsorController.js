const express = require("express");
const router = express.Router();
const service = require("../service/SponsorService");
const logoService = require("../service/LogoService");
const { NOT_FOUND, OK } = require("../constants/http-status-constants");
const { query } = require("express-validator");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkOptionalStringObjectNotEmpty,
  checkOptionalIsBoolean,
  checkIsUuidObject,
  checkParamIsUuid,
  validationHasErrors,
} = require("./Validation");
const { getCurrentYear } = require("../helper/Utils");
const { defineFileDestination, defineImageFileNameWithCurrentDateAsPrefix } = require("../helper/ImageUtils");

const multer = require("multer");
const path = require("path");

const IMAGE_STORE = "data/images/sponsors";

const storage = multer.diskStorage({
  destination: defineFileDestination(IMAGE_STORE),
  filename: defineImageFileNameWithCurrentDateAsPrefix(),
});
const imageUpload = multer({ storage });

// @desc Gets all sponsors
// @route GET /sponsors/
// @access Only moderator

router.get("/", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotModerator(req, res)) return;

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
  query("thumb").optional().isBoolean(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const thumb = req.query.thumb;

    try {
      const logo = await logoService.getById(id);

      if (!logo) return res.sendStatus(NOT_FOUND);

      const fullfilepath = thumb
        ? path.join(path.resolve(), logo.pathThumb)
        : path.join(path.resolve(), logo.path);

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
  authToken,
  imageUpload.single("image"),
  checkIsUuidObject("sponsorId"),
  async (req, res, next) => {
    try {
      if (await requesterIsNotModerator(req, res)) return;

      const originalname = req.file.originalname;
      const mimetype = req.file.mimetype;
      const size = req.file.size;
      const path = req.file.path;
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
  authToken,
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("type"),
  checkOptionalStringObjectNotEmpty("website"),
  checkOptionalStringObjectNotEmpty("contacts"),
  checkOptionalIsBoolean("isCurrentSponsor"),
  checkOptionalIsBoolean("isGoldSponsor"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const name = req.body.name;
      const type = req.body.type;
      const website = req.body.website;
      const contacts = req.body.contacts;
      const isGoldSponsor = req.body.isGoldSponsor;
      const sponsorInSeasons = req.body.isCurrentSponsor
        ? [getCurrentYear()]
        : [];

      if (await requesterIsNotModerator(req, res)) return;

      const result = await service.create({
        name,
        type,
        website,
        contacts,
        isGoldSponsor,
        sponsorInSeasons,
      });
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
  authToken,
  checkParamIsUuid("id"),
  checkOptionalStringObjectNotEmpty("name"),
  checkOptionalStringObjectNotEmpty("type"),
  checkOptionalStringObjectNotEmpty("website"),
  checkOptionalStringObjectNotEmpty("contacts"),
  checkOptionalIsBoolean("isCurrentSponsor"),
  checkOptionalIsBoolean("isGoldSponsor"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const sponsor = await service.getById(id);

      sponsor.name = req.body.name ?? sponsor.name;
      sponsor.type = req.body.type ?? sponsor.type;
      sponsor.website = req.body.website ?? sponsor.website;
      sponsor.contacts = req.body.contacts ?? sponsor.contacts;
      const isCurrentSponsor = req.body.isCurrentSponsor;
      const currentYear = getCurrentYear();
      if (isCurrentSponsor != undefined) {
        if (
          isCurrentSponsor &&
          !sponsor.sponsorInSeasons.includes(currentYear)
        ) {
          sponsor.sponsorInSeasons.push(currentYear);
        }
        if (
          !isCurrentSponsor &&
          sponsor.sponsorInSeasons.includes(currentYear)
        ) {
          sponsor.sponsorInSeasons.splice(
            sponsor.sponsorInSeasons.indexOf(currentYear)
          );
        }
      }
      const isGoldSponsor = req.body.isGoldSponsor;
      if (isCurrentSponsor != undefined) {
        sponsor.isGoldSponsor = isGoldSponsor;
      }

      await service.update(sponsor);

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
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      if (await requesterIsNotModerator(req, res)) return;

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
