const express = require("express");
const router = express.Router();
const service = require("../service/MediaService");
const { NOT_FOUND, OK } = require("./Constants");
const { authToken, requesterIsNotOwner } = require("./Auth");
const {
  checkIsUuidObject,
  validationHasErrors,
  checkStringObject,
  checkOptionalIsISO8601,
  checkOptionalIsBoolean,
} = require("./Validation");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MEDIA_STORE = "data/images";

const imageUpload = multer({
  dest: MEDIA_STORE,
});

// @desc Uploads a media file to the server and stores the meta-data to the db
// @route POST /medias/
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

// @desc Edits the description of a media
// @route PUT /medias/:id
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
// @route GET /medias/:id

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const media = await service.getById(id);

    if (!media) return res.sendStatus(NOT_FOUND);

    const fullfilepath = path.join(path.resolve(), media.path);
    return res.type(media.mimetype).sendFile(fullfilepath);
  } catch (error) {
    next(error);
  }
});

// @desc Gets the meta-data to a media file
// @route GET /medias/meta/:id

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
// @route GET /medias/like/:id

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
// @route DELETE /medias/:id
// @access Only owner

router.delete("/:id", authToken, async (req, res, next) => {
  const id = req.params.id;
  try {
    const media = await service.getById(id);

    if (!media) return res.sendStatus(NOT_FOUND);

    if (await requesterIsNotOwner(req, res, media.userId)) return;

    const fullfilepath = path.join(path.resolve(), media.path);
    const fileDeleteOperation = fs.unlink(fullfilepath, (err) => {
      if (err) {
        console.error(err);
      }
    });

    await Promise.all([service.delete(id), fileDeleteOperation]);
    res.sendStatus(OK);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
