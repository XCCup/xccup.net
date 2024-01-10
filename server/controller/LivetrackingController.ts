import express, { Request, Response } from "express";
import liveTrackingService from "../service/LivetrackingService";

import { NextFunction } from "express-serve-static-core";

const router = express.Router();

// @desc Gets the live tracking data
// @route GET /live
router.get("/", async (_: Request, res: Response, next: NextFunction) => {
  try {
    res.json(liveTrackingService.getActive());
  } catch (error) {
    next(error);
  }
});

export default router;
