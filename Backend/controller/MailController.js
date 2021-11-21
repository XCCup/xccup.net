const express = require("express");
const router = express.Router();
const service = require("../service/MailService");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkIsUuidObject,
  validationHasErrors,
} = require("./Validation");

// @desc Send a mail to a single user
// @route POST /mail/single
// @access All logged-in users

router.post(
  "/single",
  authToken,
  checkStringObjectNotEmpty("content.title"),
  checkStringObjectNotEmpty("content.text"),
  checkIsUuidObject("toUserId"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const { toUserId, content } = req.body;

    try {
      const news = await service.sendMailSingle(req.user.id, toUserId, content);
      res.json(news);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Send a mail to all users
// @route POST /mail/all
// @access Only moderator

router.post(
  "/all",
  authToken,
  checkStringObjectNotEmpty("content.title"),
  checkStringObjectNotEmpty("content.text"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const { content } = req.body;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const news = await service.sendMailAll(req.user.id, content);
      res.json(news);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
