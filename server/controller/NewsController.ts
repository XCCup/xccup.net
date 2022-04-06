import express, { Request, Response } from "express";
import service from "../service/NewsService";
import { NOT_FOUND } from "../constants/http-status-constants";
import { authToken, requesterIsNotModerator } from "./Auth";
import { getCache, setCache, deleteCache } from "./CacheManager";

import {
  checkStringObjectNotEmpty,
  checkStringObjectNotEmptyNoEscaping,
  checkIsISO8601,
  checkParamIsUuid,
  validationHasErrors,
} from "./Validation";

const router = express.Router();

const CACHE_RELEVANT_KEYS = ["home", "news"];

// @desc Gets all news (incl. also news which will become active in the future)
// @route GET /news
// @access Only moderator

router.get("/", authToken, async (req: Request, res: Response, next) => {
  try {
    if (await requesterIsNotModerator(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const news = await service.getAll({ includeFutureNews: true });

    setCache(req, news);
    res.json(news);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all news (excl. news which will become active in the future)
// @route GET /news/public

router.get("/public", async (req: Request, res: Response, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const news = await service.getAll({ includeFutureNews: false });

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
  checkStringObjectNotEmptyNoEscaping("message"),
  checkStringObjectNotEmpty("icon"),
  checkIsISO8601("from"),
  checkIsISO8601("till"),
  async (req: Request, res: Response, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      if (await requesterIsNotModerator(req, res)) return;

      const { title, icon, message, from, till, meta } = req.body;

      const news = await service.create({
        title,
        message,
        icon,
        from,
        till,
        meta,
      });

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
  checkStringObjectNotEmptyNoEscaping("message"),
  checkIsISO8601("from"),
  checkIsISO8601("till"),
  async (req: Request, res: Response, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;
    const { title, icon, message, from, till, meta } = req.body;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const news = await service.getById(id);

      // TODO: Is this the best way?
      if (!news) throw Error;

      news.title = title;
      news.icon = icon;
      news.message = message;
      news.from = from;
      news.till = till;
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
  async (req: Request, res: Response, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      if (await requesterIsNotModerator(req, res)) return;
      const news = await service.delete(id);
      if (!news) return res.sendStatus(NOT_FOUND);
      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(news);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
