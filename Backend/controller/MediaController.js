const express = require("express");
const router = express.Router();
const service = require("../service/FlightImageService");
const { authToken, requesterIsNotOwner } = require("./Auth");
const { NOT_FOUND, OK } = require("./Constants");
const { query } = require("express-validator");
const {
  checkIsUuidObject,
  validationHasErrors,
  checkStringObject,
  checkOptionalIsISO8601,
} = require("./Validation");
const multer = require("multer");
const path = require("path");

const { createThumbnail, deleteImages } = require("../helper/ImageUtils");

const IMAGE_STORE = "data/images/flights";
const THUMBNAIL_IMAGE_HEIGHT = 200;

const imageUpload = multer({
  dest: IMAGE_STORE,
});

// @desc Uploads a media file to the server and stores the meta-data to the db
// @route POST /media/
// @access All logged-in users

router.post(
  "/",
  authToken,
  imageUpload.single("image"),
  checkIsUuidObject("flightId"),
  checkIsUuidObject("userId"),
  checkOptionalIsISO8601("timestamp"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const originalname = req.file.originalname;
      const mimetype = req.file.mimetype;
      const size = req.file.size;
      const path = req.file.path;
      const flightId = req.body.flightId;
      const userId = req.body.userId;
      const timestamp = req.body.timestamp; //TODO Will be done in backend or frontend???

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

// @desc Edits the description of a media
// @route PUT /media/:id
// @access Only owner

router.put(
  "/:id",
  authToken,
  checkStringObject("description"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const id = req.params.id;
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

// @desc Gets the media file
// @route GET /media/:id

router.get(
  "/:id",
  query("thumb").optional().isBoolean(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      const id = req.params.id;
      const thumb = req.query.thumb;

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

// @desc Gets the meta-data to a media file
// @route GET /media/meta/:id

router.get("/meta/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const media = await service.getById(id);

    if (!media) return res.sendStatus(NOT_FOUND);

    return res.json(media);
  } catch (error) {
    next(error);
  }
});

// @desc Toggles (assigns or removes) the "like" to a media file from the requester
// @route GET /media/like/:id
// @access All logged-in users

router.get("/like/:id", authToken, async (req, res, next) => {
  try {
    const id = req.params.id;
    const media = await service.getById(id);

    if (!media) return res.sendStatus(NOT_FOUND);

    const requesterId = req.user.id;
    await service.toggleLike(media, requesterId);

    return res.sendStatus(OK);
  } catch (error) {
    next(error);
  }
});

// @desc Deletes a media by id
// @route DELETE /media/:id
// @access Only owner

router.delete("/:id", authToken, async (req, res, next) => {
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
});

module.exports = router;
