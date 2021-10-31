const express = require("express");
const router = express.Router();
const FlightPhoto = require("../config/postgres")["FlightPhoto"];
const Logo = require("../config/postgres")["Logo"];
const ProfilePicture = require("../config/postgres")["ProfilePicture"];
const path = require("path");
const _ = require("lodash");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { query } = require("express-validator");
const { checkParamIsUuid, validationHasErrors } = require("./Validation");

// @desc Gets the flight photo
// @route GET /media/:id

router.get(
  "/:id",
  checkParamIsUuid("id"),
  query("thumb").optional().isBoolean(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const thumb = req.query.thumb;

    try {
      const results = await Promise.all([
        FlightPhoto.findByPk(id),
        Logo.findByPk(id),
        ProfilePicture.findByPk(id),
      ]);
      const media = results.find((e) => e);

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
// @route GET /media/meta/:id

router.get("/meta/:id", checkParamIsUuid("id"), async (req, res, next) => {
  if (validationHasErrors(req, res)) return;
  const id = req.params.id;

  try {
    const results = await Promise.all([
      FlightPhoto.findByPk(id),
      Logo.findByPk(id),
      ProfilePicture.findByPk(id),
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
