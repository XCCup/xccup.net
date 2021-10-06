const express = require("express");
const router = express.Router();
const service = require("../service/MediaFlightService");
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
const fs = require("fs");

const { createThumbnail, THUMBNAIL_POSTFIX } = require("../helper/Thumbnail");

const MEDIA_STORE = "data/images/flights";

const imageUpload = multer({
  dest: MEDIA_STORE,
});

// @desc Uploads a media file to the server and stores the meta-data to the db
// @route POST /media/
// @access All logged-in users

router.post(
  "/",
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

      createThumbnail(path);

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
        ? path.join(path.resolve(), media.path + THUMBNAIL_POSTFIX)
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

    await Promise.all([service.delete(id), deleteFile(media.path)]);
    res.sendStatus(OK);
  } catch (error) {
    next(error);
  }
});

/**
 * Deletes the image file given by the filePath as also the corresponding thumbnail file of that image
 * @param {*} filePath The path to the image file
 * @returns A promise of the delete operation
 */
async function deleteFile(filePath) {
  const fullfilepath = path.join(path.resolve(), filePath);
  const fileDeleteOperation = fs.unlink(fullfilepath, (err) => {
    if (err) {
      console.error(err);
    }
  });

  const fullfilepathThumb = path.join(
    path.resolve(),
    filePath + THUMBNAIL_POSTFIX
  );
  const fileDeleteOperationThumb = fs.unlink(fullfilepathThumb, (err) => {
    if (err) {
      console.error(err);
    }
  });

  return await Promise.all([fileDeleteOperation, fileDeleteOperationThumb]);
}

module.exports = router;
