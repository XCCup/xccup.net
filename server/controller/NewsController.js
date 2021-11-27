const express = require("express");
const router = express.Router();
const service = require("../service/NewsService");
const mailService = require("../service/MailService");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkIsDateObject,
  checkOptionalIsBoolean,
  checkParamIsUuid,
  validationHasErrors,
} = require("./Validation");

// @desc Gets all news
// @route GET /news
// @access Only moderator

router.get("/", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotModerator(req, res)) return;

    const news = await service.getAll();
    res.json(news);
  } catch (error) {
    next(error);
  }
});

// @desc Saves a new news to the database
// @route POST /news
// @access Only moderator

router.post(
  "/",
  authToken,
  checkStringObjectNotEmpty("title"),
  checkStringObjectNotEmpty("message"),
  checkIsDateObject("from"),
  checkIsDateObject("till"),
  checkOptionalIsBoolean("sendByMail"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      if (await requesterIsNotModerator(req, res)) return;

      const news = await service.create({
        title: req.body.title,
        message: req.body.message,
        from: req.body.from,
        till: req.body.till,
        sendByMail: req.body.sendByMail,
      });

      if (news.sendByMail) {
        mailService.sendMailAll(req.user.id, true, {
          title: news.title,
          text: news.message,
        });
      }

      res.json(news);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Changes a news entry in the database
// @route PUT /news/:id
// @access Only moderator

router.put(
  "/:id",
  authToken,
  checkParamIsUuid("id"),
  checkStringObjectNotEmpty("title"),
  checkStringObjectNotEmpty("message"),
  checkIsDateObject("from"),
  checkIsDateObject("till"),
  checkOptionalIsBoolean("sendByMail"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const title = req.body.title;
    const message = req.body.message;
    const from = req.body.from;
    const till = req.body.till;
    const sendByMail = req.body.sendByMail;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const news = await service.getById(id);

      news.title = title;
      news.message = message;
      news.from = from;
      news.till = till;
      news.sendByMail = sendByMail;

      service.update(news).then((result) => res.json(result));
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a news entry in the database
// @route DELETE /news/:id
// @access Only moderator

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      if (await requesterIsNotModerator(req, res)) return;
      const user = await service.delete(id);
      if (!user) return res.sendStatus(NOT_FOUND);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets all news
// @route GET /news/public

router.get("/public", async (req, res, next) => {
  try {
    const airspaces = await service.getActive();
    res.json(airspaces);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
