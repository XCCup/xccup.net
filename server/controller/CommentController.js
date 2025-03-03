const express = require("express");
const router = express.Router();
const service = require("../service/CommentService");
const mailService = require("../service/MailService");
const { NOT_FOUND } = require("../constants/http-status-constants");

const { requesterMustBeLoggedIn, requesterIsNotOwner } = require("./Auth");
const {
  checkIsUuidObject,
  checkOptionalUuidObject,
  validationHasErrors,
  checkParamIsUuid,
  checkStringObjectNotEmptyNoEscaping,
} = require("./Validation");

// @desc Gets all comments of a flight
// @route GET /comments/:flightId

router.get(
  "/flight/:flightId",
  checkParamIsUuid("flightId"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const comments = await service.getByFlightId(req.params.flightId);

      if (!comments) {
        res.sendStatus(NOT_FOUND);
        return;
      }
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Adds a comment
// @route POST /comments/
// @access All logged-in users

router.post(
  "/",
  requesterMustBeLoggedIn,
  checkStringObjectNotEmptyNoEscaping("message"),
  checkIsUuidObject("flightId"),
  checkOptionalUuidObject("relatedTo"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const { message, flightId, relatedTo } = req.body;
      const userId = req.user.id;

      const comment = await service.create({
        message,
        flightId,
        userId,
        relatedTo,
      });

      mailService.sendNewFlightCommentMail(comment);

      res.json(comment);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits a comment
// @route PUT /comments/:id
// @access Only owner

router.put(
  "/:id",
  requesterMustBeLoggedIn,
  checkStringObjectNotEmptyNoEscaping("message"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const commentId = req.params.id;
      const comment = await service.getById(commentId);

      if (requesterIsNotOwner(req, res, comment.userId)) return;

      comment.message = req.body.message;
      const result = await service.update(comment);

      // Return comment directly because of escaping
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a comment by id
// @route DELETE /comments/:id
// @access Only owner

router.delete("/:id", requesterMustBeLoggedIn, async (req, res, next) => {
  const commentId = req.params.id;
  try {
    const comment = await service.getById(commentId);

    if (!comment) return res.sendStatus(NOT_FOUND);

    if (requesterIsNotOwner(req, res, comment.userId)) return;

    const numberOfDestroyedRows = await service.delete(commentId);
    res.json(numberOfDestroyedRows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
