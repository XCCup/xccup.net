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
const { authToken, requesterIsNotOwner } = require("./Auth");
const { createRateLimiter } = require("./api-protection");
const { query } = require("express-validator");
const {
  checkIsUuidObject,
  checkParamIsUuid,
  checkStringObject,
  validationHasErrors,
} = require("./Validation");
const multer = require("multer");

const {
  createThumbnail,
  deleteImages,
  resizeImage,
} = require("../helper/ImageUtils");
const logger = require("../config/logger");

const IMAGE_STORE = process.env.SERVER_DATA_PATH + "/images/flights";
const THUMBNAIL_IMAGE_HEIGHT = 310;
const MAX_PHOTOS = 8;
// Das ist eigentlich ein bisschen unlogisch: Wenn ein Bild 2MB hat nehmen wir es so,
// aber wenn ein Bild 2,1MB hat zerquetschen wir es auf 300kb😂
const IMAGE_BYTES_LIMIT = 2_000_000;
const IMAGE_HEIGHT_LIMIT = 4_000;

const imageUpload = multer({
  dest: IMAGE_STORE,
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
        return res.sendStatus(TOO_MANY_REQUESTS);
      }

      const userId = req.user.id;

      const pathThumb = await createThumbnail(path, THUMBNAIL_IMAGE_HEIGHT);
      if (size > IMAGE_BYTES_LIMIT) {
        logger.info("FPC: Image exceeds size limit");
        await resizeImage(path, IMAGE_HEIGHT_LIMIT);
      }

      const media = await service.create({
        originalname,
        mimetype,
        size,
        path,
        pathThumb,
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
  query("thumb").optional().isBoolean(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const thumb = req.query.thumb;

    try {
      const media = await service.getById(id);

      if (!media) return res.sendStatus(NOT_FOUND);

      const fullfilepath = thumb
        ? pathLib.join(pathLib.resolve(), media.pathThumb)
        : pathLib.join(pathLib.resolve(), media.path);

      return res.type(media.mimetype).sendFile(fullfilepath);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the meta-data to a flight photo
// @route GET /flights/photos/meta/:id
// TODO Is this endpoint of any interest?

router.get("/meta/:id", checkParamIsUuid("id"), async (req, res, next) => {
  if (validationHasErrors(req, res)) return;
  const id = req.params.id;

  try {
    const media = await service.getById(id);

    if (!media) return res.sendStatus(NOT_FOUND);

    return res.json(media);
  } catch (error) {
    next(error);
  }
});

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

// @desc Edits the description of a flight photo
// @route PUT /flights/photos/:id
// @access Only owner

router.put(
  "/:id",
  authToken,
  checkParamIsUuid("id"),
  checkStringObject("description"),
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
