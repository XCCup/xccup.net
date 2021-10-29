const express = require("express");
const router = express.Router();
const service = require("../service/CommentService");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { authToken, requesterIsNotOwner } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkIsUuidObject,
  checkOptionalUuidObject,
  validationHasErrors,
  checkParamIsUuid,
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
// @access Only owner

router.post(
  "/",
  authToken,
  checkStringObjectNotEmpty("message"),
  checkIsUuidObject("flightId"),
  checkOptionalUuidObject("relatedTo"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const { message, flightId, relatedTo } = req.body;
      const userId = req.user.id;

      const result = await service.create({
        message,
        flightId,
        userId,
        relatedTo,
      });
      res.json(result);
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
  authToken,
  checkStringObjectNotEmpty("message"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const commentId = req.params.id;
      const comment = await service.getById(commentId);

      if (await requesterIsNotOwner(req, res, comment.userId)) return;

      comment.message = req.body.message;
      const result = await service.update(comment);

      //TODO Do we really want to return the comment? A HTTP 200 would be normally enough. Client should store the comment directly in the GUI.
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a comment by id
// @route DELETE /comments/:id
// @access Only owner

router.delete("/:id", authToken, async (req, res, next) => {
  const commentId = req.params.id;
  try {
    const comment = await service.getById(commentId);

    if (!comment) return res.sendStatus(NOT_FOUND);

    if (await requesterIsNotOwner(req, res, comment.userId)) return;

    const numberOfDestroyedRows = await service.delete(commentId);
    res.json(numberOfDestroyedRows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
