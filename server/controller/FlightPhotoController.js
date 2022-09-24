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
  requesterMustBeLoggedIn,
  requesterIsNotOwner,
  requesterMustBeModerator,
} = require("./Auth");
const { createRateLimiter } = require("./api-protection");
const { query } = require("express-validator");
const {
  checkIsUuidObject,
  checkParamIsUuid,
  validationHasErrors,
  checkStringObjectNoEscaping,
  checkParamIsInt,
  checkOptionalStringObjectNotEmpty,
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
const path = require("path");

const IMAGE_STORE = config.get("dataPath") + "/images/flights";

/**
 * Allow double the number of photos per flight as intended.
 * Otherwise it's not possible to upload a new photo if there were already
 * nine photos present but x were deleted. This is because the actual delete process
 * only takes place after the user clicked the "save" button.
 * The downside is that it's not possible to upload more than nine photos if you know
 * how to do it.
 * Frontend will only allow nine. Or refacor this and change the complete process…
 */

const MAX_PHOTOS = 9 * 2;
const imageUpload = createMulterFlightPhotoUploadHandler();

const uploadLimiter = createRateLimiter(60, 30);

// @desc Uploads a flight photo to the server and stores the meta-data to the db
// @route POST /flights/photos/
// @access All logged-in users

router.post(
  "/",
  requesterMustBeLoggedIn,
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
// @route GET /flights/photos/like/:id
// @access All logged-in users

router.get(
  "/like/:id",
  checkParamIsUuid("id"),
  requesterMustBeLoggedIn,
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

// @desc Creates a zip archive for all photos of a specific year
// @route GET /flights/photos/create-archive/:year
// @access Only moderator

router.get(
  "/create-archive/:year",
  checkParamIsInt("year"),
  requesterMustBeModerator,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const year = req.params.year;

    try {
      const archivePath = await service.createArchiveForYear(year);

      if (!archivePath) return res.sendStatus(NOT_FOUND);

      return res.json(archivePath);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Downloads the given photos archive
// @route GET /flights/photos/download/:path

router.get(
  "/download/:path",
  checkOptionalStringObjectNotEmpty("path"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const archivePath = req.params.path.replaceAll("&#x2F;", "/");
    try {
      const fullfilepath = path.join(path.resolve(), archivePath);

      return res.download(fullfilepath, (err) => {
        if (err) {
          if (!res.headersSent)
            res.status(NOT_FOUND).send("The file you requested was deleted");
          logger.error(
            "FC: An photo archive was requested but wasn't found. Path: " +
              archivePath
          );
        }
      });
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
  requesterMustBeLoggedIn,
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
// @route DELETE /flights/photos/:id
// @access Only owner

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  requesterMustBeLoggedIn,
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

function createMulterFlightPhotoUploadHandler() {
  const storage = multer.diskStorage({
    destination: IMAGE_STORE + "/" + new Date().getFullYear(),
    filename: function (req, file, cb) {
      const userName = req.user?.firstName + "_" + req.user?.lastName;
      const newFileName =
        userName + "_" + req.body.flightId + "_" + file.originalname;
      cb(null, newFileName);
    },
  });

  return multer({
    storage,
    limits: {
      files: MAX_PHOTOS,
    },
  });
}

module.exports = router;
