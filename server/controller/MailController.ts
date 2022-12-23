import express, { Request, Response } from "express";
import service from "../service/MailService";
import { requesterMustBeLoggedIn, requesterMustBeModerator } from "./Auth";
import {
  checkIsUuidObject,
  validationHasErrors,
  checkStringObjectNotEmptyNoEscaping,
} from "./Validation";

const router = express.Router();

// @desc Send a mail to a single user
// @route POST /mail/single
// @access All logged-in users

router.post(
  "/single",
  requesterMustBeLoggedIn,
  checkStringObjectNotEmptyNoEscaping("content.title"),
  checkStringObjectNotEmptyNoEscaping("content.text"),
  checkIsUuidObject("toUserId"),
  async (req: Request, res: Response, next) => {
    if (validationHasErrors(req, res)) return;
    const { toUserId, content } = req.body;

    try {
      const result = await service.sendMailSingle(
        req.user?.id ?? "",
        toUserId,
        content
      );

      result ? res.sendStatus(200) : res.sendStatus(500);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
export default router;
