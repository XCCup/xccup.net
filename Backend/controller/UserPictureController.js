const express = require("express");
const service = require("../service/ProfilePictureService");
const userService = require("../service/UserService");
const { query } = require("express-validator");
const { NOT_FOUND, OK } = require("../constants/http-status-constants");
const router = express.Router();
const { authToken } = require("./Auth");
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
  "/:userId",
  checkParamIsUuid("userId"),
  query("thumb").optional().isBoolean(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const userId = req.params.id;
    const thumb = req.query.thumb;

    try {
      const picture = await service.getByUserId(userId);

      if (!picture) return res.sendStatus(NOT_FOUND);

      const fullfilepath = thumb
        ? path.join(path.resolve(), picture.pathThumb)
        : path.join(path.resolve(), picture.path);

      return res.type(picture.mimetype).sendFile(fullfilepath);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes the profile picture of an user
// @route DELETE /users/picture/
// @access Only owner

router.delete("/", authToken, async (req, res, next) => {
  const id = req.user.id;

  try {
    const picture = await service.getByUserId(id);

    if (!picture) return res.sendStatus(NOT_FOUND);

    await service.delete(picture);
    res.sendStatus(OK);
  } catch (error) {
    next(error);
  }
});

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
