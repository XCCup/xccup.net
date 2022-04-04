import config from "../config/env-config";
import express from "express";
const router = express.Router();

// Router Middleware
import UserController from "../controller/UserController";
import FlightController from "../controller/FlightController";
import CommentController from "../controller/CommentController";
import SeasonController from "../controller/SeasonController";
import ClubController from "../controller/ClubController";
import TeamController from "../controller/TeamController";
import AirspaceController from "../controller/AirspaceController";
import ResultController from "../controller/ResultController";
import HomeController from "../controller/HomeController";
import NewsController from "../controller/NewsController";
import SponsorController from "../controller/SponsorController";
import MediaController from "../controller/MediaController";
import GeneralController from "../controller/GeneralController";
import MailController from "../controller/MailController";
import SiteController from "../controller/SiteController";
import CacheController from "../controller/CacheController";

import TestDataController from "../controller/TestDataController";
import ImportDataController from "../controller/ImportDataController";

router.use("/users", UserController);
router.use("/flights", FlightController);
router.use("/comments", CommentController);
router.use("/seasons", SeasonController);
router.use("/clubs", ClubController);
router.use("/teams", TeamController);
router.use("/airspaces", AirspaceController);
router.use("/results", ResultController);
router.use("/home", HomeController);
router.use("/news", NewsController);
router.use("/sponsors", SponsorController);
router.use("/media", MediaController);
router.use("/general", GeneralController);
router.use("/mail", MailController);
router.use("/sites", SiteController);
router.use("/cache", CacheController);

if (config.get("env") !== "production" || config.get("overruleActive")) {
  router.use("/testdata", TestDataController);
  router.use("/importdata", ImportDataController);
}

export default router;
