const express = require("express");
const service = require("../service/ProfilePictureService");
const userService = require("../service/UserService");
const { query } = require("express-validator");
const { NOT_FOUND, OK } = require("../constants/http-status-constants");
const router = express.Router();
const { authToken, requesterIsNotOwner } = require("./Auth");
const { checkParamIsUuid, validationHasErrors } = require("./Validation");
const multer = require("multer");
const path = require("path");

const IMAGE_STORE = "data/images/users";

const imageUpload = multer({
  dest: IMAGE_STORE,
});

// @desc Gets the profile picture of an user
// @route GET /users/picture/:id

router.get(
  "/:id",
  checkParamIsUuid("id"),
  query("thumb").optional().isBoolean(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const thumb = req.query.thumb;

    try {
      const logo = await service.getById(id);

      if (!logo) return res.sendStatus(NOT_FOUND);

      const fullfilepath = thumb
        ? path.join(path.resolve(), logo.pathThumb)
        : path.join(path.resolve(), logo.path);

      return res.type(logo.mimetype).sendFile(fullfilepath);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes the profile picture of an user
// @route DELETE /users/picture/:id
// @access Only owner

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      const picture = await service.getById(id);

      if (!picture) return res.sendStatus(NOT_FOUND);

      if (await requesterIsNotOwner(req, res, picture.userId)) return;

      await service.delete(picture);
      res.sendStatus(OK);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Saves a profile picture to an existing user
// @route POST /users/picture
// @access Only owner

router.post(
  "/",
  authToken,
  imageUpload.single("image"),
  async (req, res, next) => {
    try {
      const originalname = req.file.originalname;
      const mimetype = req.file.mimetype;
      const size = req.file.size;
      const path = req.file.path;

      const userId = req.user.id;

      const user = await userService.getById(userId);
      if (!user) return res.sendStatus(NOT_FOUND);

      if (user.ProfilePicture) {
        service.delete(user);
      }

      const picture = await service.create({
        originalname,
        mimetype,
        size,
        path,
        userId,
      });

      res.json(picture);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
