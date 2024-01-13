import express, { Request, Response } from "express";
import liveTrackingService from "../service/LivetrackingService";
import { NextFunction } from "express-serve-static-core";
import { requesterMustBeLoggedIn } from "./Auth";

const router = express.Router();

// @desc Gets the live tracking data
// @route GET /live
router.get(
  "/",
  requesterMustBeLoggedIn,
  async (_: Request, res: Response, next: NextFunction) => {
    try {
      res.json(liveTrackingService.getActive());
    } catch (error) {
      next(error);
    }
  }
);

export default router;
