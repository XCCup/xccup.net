const express = require("express");
const router = express.Router();
const pictureService = require("../service/FlightPictureService");
const path = require("path");
const { NOT_FOUND, OK } = require("./Constants");
const { authToken, requesterIsNotOwner } = require("./Auth");
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

// @desc Uploads a flight picture to the server and stores the meta-data to the db
// @route POST /flights/picture/
// @access All logged-in users

router.post(
  "/",
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

      const media = await pictureService.create({
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

// @desc Gets the flight picture
// @route GET /flights/picture/:id

router.get(
  "/:id",
  checkParamIsUuid("id"),
  query("thumb").optional().isBoolean(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const thumb = req.query.thumb;

    try {
      const media = await pictureService.getById(id);

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

// @desc Gets the meta-data to a flight picture
// @route GET /flights/picture/meta/:id
// TODO Is this endpoint of any interest?

router.get("/meta/:id", checkParamIsUuid("id"), async (req, res, next) => {
  if (validationHasErrors(req, res)) return;
  const id = req.params.id;

  try {
    const media = await pictureService.getById(id);

    if (!media) return res.sendStatus(NOT_FOUND);

    return res.json(media);
  } catch (error) {
    next(error);
  }
});

// @desc Toggles (assigns or removes) the "like" to a flight picture from the requester
// @route GET /picture/like/:id
// @access All logged-in users

router.get(
  "/like/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      const media = await pictureService.getById(id);

      if (!media) return res.sendStatus(NOT_FOUND);

      const requesterId = req.user.id;
      await pictureService.toggleLike(media, requesterId);

      return res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits the description of a flight picture
// @route PUT /flights/picture/:id
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
      const media = await pictureService.getById(id);

      if (await requesterIsNotOwner(req, res, media.userId)) return;

      media.description = req.body.description;
      await pictureService.update(media);

      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a flight image by id
// @route DELETE /picture/:id
// @access Only owner

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      const media = await pictureService.getById(id);

      if (!media) return res.sendStatus(NOT_FOUND);

      if (await requesterIsNotOwner(req, res, media.userId)) return;

      await Promise.all([pictureService.delete(id), deleteImages(media)]);
      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
