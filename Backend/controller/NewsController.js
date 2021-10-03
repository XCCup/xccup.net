const express = require("express");
const router = express.Router();
const service = require("../service/NewsService");
const { NOT_FOUND } = require("./Constants");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkIsDateObject,
  checkOptionalIsBoolean,
  validationHasErrors,
} = require("./Validation");

// @desc Gets all news
// @route GET /news
// @access Only moderator

router.get("/", authToken, async (req, res, next) => {
  try {
    if (requesterIsNotModerator(res, req)) return;

    const airspaces = await service.getAll();
    res.json(airspaces);
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
  checkStringObjectNotEmpty("message"),
  checkIsDateObject("from"),
  checkIsDateObject("till"),
  checkOptionalIsBoolean("sendByMail"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      if (requesterIsNotModerator(res, req)) return;

      const news = await service.create({
        message: req.body.message,
        from: req.body.from,
        till: req.body.till,
        sendByMail: req.body.sendByMail,
      });
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
  checkStringObjectNotEmpty("message"),
  checkIsDateObject("from"),
  checkIsDateObject("till"),
  checkOptionalIsBoolean("sendByMail"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      if (requesterIsNotModerator(res, req)) return;
      const id = req.params.id;
      const message = req.body.message;
      const from = req.body.from;
      const till = req.body.till;
      const sendByMail = req.body.sendByMail;

      const news = await service.getById(id);

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

router.delete("/:id", authToken, async (req, res, next) => {
  try {
    if (requesterIsNotModerator(res, req)) return;
    const user = await service.delete(req.params.id);
    if (!user) return res.sendStatus(NOT_FOUND);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all news
// @route GET /news/active

router.get("/active", async (req, res, next) => {
  try {
    const airspaces = await service.getActive();
    res.json(airspaces);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
