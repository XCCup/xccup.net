const express = require("express");
const router = express.Router();
const service = require("../service/FlightPhotoService");
const path = require("path");
const { NOT_FOUND, OK } = require("../constants/http-status-constants");
const { authToken, requesterIsNotOwner } = require("./Auth");
const { createRateLimiter } = require("./api-protection");
const { query } = require("express-validator");
const {
  checkIsUuidObject,
  checkParamIsUuid,
  checkOptionalIsISO8601,
  checkStringObject,
  validationHasErrors,
} = require("./Validation");
const multer = require("multer");

const { createThumbnail, deleteImages } = require("../helper/ImageUtils");

const IMAGE_STORE = "data/images/flights";
const THUMBNAIL_IMAGE_HEIGHT = 200;

const imageUpload = multer({
  dest: IMAGE_STORE,
});

const uploadLimiter = createRateLimiter(60, 10);

// @desc Uploads a flight photo to the server and stores the meta-data to the db
// @route POST /flights/photos/
// @access All logged-in users

router.post(
  "/",
  uploadLimiter,
  authToken,
  imageUpload.single("image"),
  checkIsUuidObject("flightId"),
  checkOptionalIsISO8601("timestamp"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const originalname = req.file.originalname;
      const mimetype = req.file.mimetype;
      const size = req.file.size;
      const path = req.file.path;
      const flightId = req.body.flightId;
      const timestamp = req.body.timestamp; //TODO Will be done in backend or frontend???

      const userId = req.user.id;

      const pathThumb = createThumbnail(path, THUMBNAIL_IMAGE_HEIGHT);

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
        ? path.join(path.resolve(), media.pathThumb)
        : path.join(path.resolve(), media.path);

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
