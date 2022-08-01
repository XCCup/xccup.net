const express = require("express");
const router = express.Router();
const service = require("../service/FlightPhotoService");
const pathLib = require("path");
const fs = require("fs");
const exifr = require("exifr");
const {
  NOT_FOUND,
  OK,
  TOO_MANY_REQUESTS,
} = require("../constants/http-status-constants");
const {
  authToken,
  requesterIsNotOwner,
  requesterIsNotModerator,
} = require("./Auth");
const { createRateLimiter } = require("./api-protection");
const { query } = require("express-validator");
const {
  checkIsUuidObject,
  checkParamIsUuid,
  validationHasErrors,
  checkStringObjectNoEscaping,
  checkParamIsInt,
} = require("./Validation");
const multer = require("multer");

const {
  createImageVersions,
  deleteImages,
  retrieveFilePath,
  IMAGE_SIZES,
} = require("../helper/ImageUtils");
const logger = require("../config/logger");
const { default: config } = require("../config/env-config");

const IMAGE_STORE = config.get("dataPath") + "/images/flights";
const MAX_PHOTOS = 8;

const imageUpload = multer({
  dest: IMAGE_STORE + "/" + new Date().getFullYear(),
});

const uploadLimiter = createRateLimiter(60, 30);

// @desc Uploads a flight photo to the server and stores the meta-data to the db
// @route POST /flights/photos/
// @access All logged-in users

router.post(
  "/",
  authToken,
  uploadLimiter,
  imageUpload.single("image"),
  checkIsUuidObject("flightId"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const { originalname, mimetype, size, path } = req.file;
      const { flightId } = req.body;

      const exif = await exifr.parse(path);
      const timestamp = exif?.DateTimeOriginal ?? undefined;

      const numberOfPhotos = await service.countPhotosOfFlight(flightId);
      logger.debug(
        `FPC: Flight ${flightId} has currently ${numberOfPhotos} photos attached to id`
      );
      if (numberOfPhotos >= MAX_PHOTOS) {
        logger.info("FPC: Flight photos limit reached");
        logger.debug("FPC: Will delete images for path " + path);
        const fullfilepath = pathLib.join(pathLib.resolve(), path);
        fs.unlink(fullfilepath, (err) => {
          if (err) {
            logger.error(err);
          }
        });
        // TODO: is this really the best http code for photo limit reached?
        return res.sendStatus(TOO_MANY_REQUESTS);
      }

      const userId = req.user.id;

      await createImageVersions(path, { forceJpeg: true });

      const media = await service.create({
        originalname,
        mimetype,
        size,
        path,
        flightId,
        userId,
        timestamp,
      });

      res.json(media);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the flight photo
// @route GET /flights/photos/:id

router.get(
  "/:id",
  checkParamIsUuid("id"),
  query("size")
    .optional()
    .isIn(Object.values(IMAGE_SIZES).map((f) => f.name)),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const size = req.query.size;

    try {
      const media = await service.getById(id);

      if (!media) return res.sendStatus(NOT_FOUND);

      const fullfilepath = retrieveFilePath(media.path, size);

      return res.type(media.mimetype).sendFile(fullfilepath);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Toggles (assigns or removes) the "like" to a flight photo from the requester
// @route GET /photos/like/:id
// @access All logged-in users

router.get(
  "/like/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      const media = await service.getById(id);

      if (!media) return res.sendStatus(NOT_FOUND);

      const requesterId = req.user.id;
      await service.toggleLike(media, requesterId);

      return res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Downloads all photos of a specific season
// @route GET /photos/download/:year
// @access Only moderator

router.get(
  "/download",
  checkParamIsInt("year"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const year = req.params.year;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const media = await service.getById(id);

      if (!media) return res.sendStatus(NOT_FOUND);

      const requesterId = req.user.id;
      await service.toggleLike(media, requesterId);

      return res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits the description of a flight photo
// @route PUT /flights/photos/:id
// @access Only owner

router.put(
  "/:id",
  authToken,
  checkParamIsUuid("id"),
  checkStringObjectNoEscaping("description"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    try {
      const media = await service.getById(id);

      if (await requesterIsNotOwner(req, res, media.userId)) return;

      media.description = req.body.description;
      await service.update(media);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a flight image by id
// @route DELETE /photos/:id
// @access Only owner

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      const media = await service.getById(id);

      if (!media) return res.sendStatus(NOT_FOUND);

      if (await requesterIsNotOwner(req, res, media.userId)) return;

      await Promise.all([service.delete(id), deleteImages(media)]);
      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
