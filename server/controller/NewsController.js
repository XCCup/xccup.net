const express = require("express");
const router = express.Router();
const service = require("../service/NewsService");
const mailService = require("../service/MailService");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { authToken, requesterIsNotModerator } = require("./Auth");
const { getCache, setCache, deleteCache } = require("./CacheManager");

const {
  checkStringObjectNotEmpty,
  checkIsISO8601,
  checkOptionalIsBoolean,
  checkParamIsUuid,
  validationHasErrors,
} = require("./Validation");

const CACHE_RELEVANT_KEYS = ["home", "news"];

// @desc Gets all news (incl. also news which will become active in the future)
// @route GET /news
// @access Only moderator

router.get("/", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotModerator(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const news = await service.getAll(true);

    setCache(req, news);
    res.json(news);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all news (excl. news which will become active in the future)
// @route GET /news/public

router.get("/public", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const news = await service.getAll(false);

    setCache(req, news);
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
  checkStringObjectNotEmpty("icon"),
  checkIsISO8601("from"),
  checkIsISO8601("till"),
  checkOptionalIsBoolean("sendByMail"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      if (await requesterIsNotModerator(req, res)) return;

      const { title, icon, message, from, till, sendByMail, meta } = req.body;

      const news = await service.create({
        title,
        message,
        icon,
        from,
        till,
        sendByMail,
        meta,
      });

      if (news.sendByMail) {
        mailService.sendMailAll(req.user.id, true, {
          title: news.title,
          text: news.message,
        });
      }
      deleteCache(CACHE_RELEVANT_KEYS);

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
  checkStringObjectNotEmpty("icon"),
  checkStringObjectNotEmpty("message"),
  checkIsISO8601("from"),
  checkIsISO8601("till"),
  checkOptionalIsBoolean("sendByMail"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const { title, icon, message, from, till, sendByMail, meta } = req.body;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const news = await service.getById(id);

      news.title = title;
      news.icon = icon;
      news.message = message;
      news.from = from;
      news.till = till;
      news.sendByMail = sendByMail;
      news.meta = meta;

      const result = await service.update(news);

      deleteCache(CACHE_RELEVANT_KEYS);
      res.json(result);
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
      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
