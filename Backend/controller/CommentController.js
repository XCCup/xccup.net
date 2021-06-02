const express = require("express");
const router = express.Router();
const service = require("../service/CommentService");
const { NOT_FOUND, INTERNAL_SERVER_ERROR, OK } = require("./Constants");
const { authToken, belongsNotToId } = require("./Auth");

// @desc Gets all comments of a flight
// @route GET /comments/:flightId

router.get("/flight/:flightId", async (req, res) => {
  const comments = await service.getByFlightId(req.params.flightId);

  if (!comments) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(comments);
});

// @desc Adds a comment
// @route POST /comments/
// @access All logged-in user

router.post("/", authToken, async (req, res) => {
  try {
    const comment = await service.create(req.body);
    res.json(comment);
  } catch (error) {
    console.log(error);
    res.status(INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// @desc Edits a comment
// @route GET /comments/
// @access Only owner

router.put("/:id", authToken, async (req, res) => {
  const commentId = req.params.id;
  const comment = await service.getById(commentId);

  if (belongsNotToId(req, res, comment.userId)) {
    return;
  }

  comment.message = req.body.message;
  const result = await service.update(comment);

  //TODO Do we really want to return the comment? A HTTP 200 would be normally enough. Client should store the comment directly in the GUI.
  res.json(result);
});

// @desc Deletes a comment by id
// @route DELETE /comments/:id
// @access Only owner

router.delete("/:id", authToken, async (req, res) => {
  const commentId = req.params.id;
  const comment = await service.getById(commentId);

  if (!comment) {
    res.sendStatus(NOT_FOUND);
    return;
  }

  if (belongsNotToId(req, res, comment.userId)) {
    return;
  }

  const numberOfDestroyedRows = await service.delete(commentId);
  res.json(numberOfDestroyedRows);
});

module.exports = router;
