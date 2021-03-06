const express = require("express");
const router = express.Router();

const FlightPhotoService = require("../service/FlightPhotoService");
const LogoService = require("../service/LogoService");
const ProfilePictureService = require("../service/ProfilePictureService");

const _ = require("lodash");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { query } = require("express-validator");
const { checkParamIsUuid, validationHasErrors } = require("./Validation");
const { getCache, setCache } = require("./CacheManager");
const { retrieveFilePath, IMAGE_SIZES } = require("../helper/ImageUtils");

// @desc Gets the flight photo
// @route GET /media/:id

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
      const value = getCache(req);
      res.set("Cache-control", "public, max-age=172800, immutable");
      if (value) return res.type(value.mimetype).sendFile(value.fullfilepath);

      const results = await Promise.all([
        FlightPhotoService.getById(id),
        LogoService.getById(id),
        ProfilePictureService.getById(id),
      ]);
      const media = results.find((e) => e);

      if (!media) return res.sendStatus(NOT_FOUND);

      const fullfilepath = retrieveFilePath(media.path, size);

      setCache(req, { mimetype: media.mimetype, fullfilepath });
      return res.type(media.mimetype).sendFile(fullfilepath);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets the meta-data to a flight photo
// @route GET /media/meta/:id

router.get("/meta/:id", checkParamIsUuid("id"), async (req, res, next) => {
  if (validationHasErrors(req, res)) return;
  const id = req.params.id;

  try {
    const results = await Promise.all([
      FlightPhotoService.getById(id),
      LogoService.getById(id),
      ProfilePictureService.getById(id),
    ]);
    const mediaDbObject = results.find((e) => e);

    if (!mediaDbObject) return res.sendStatus(NOT_FOUND);

    const media = mediaDbObject.toJSON();
    media.description = _.unescape(mediaDbObject.description);

    return res.json(mediaDbObject);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
