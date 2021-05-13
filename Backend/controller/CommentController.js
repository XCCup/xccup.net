const express = require("express");
const router = express.Router();
const path = require("path");
const service = require("../service/CommentService");
const {
  NOT_FOUND,
  BAD_REQUEST,
  OK,
  INTERNAL_SERVER_ERROR,
} = require("./Constants");

// @desc Adds a comment
// @route POST /comments/

router.post("/", async (req, res) => {
  try {
    const comment = await service.add(req.body);
    res.json(comment);
  } catch (error) {
    console.log(error);
    res.status(INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// @desc Edits a comment
// @route GET /comments/

router.put("/:id", async (req, res) => {
  const comment = await service.edit(req.params.id, req.body);
  res.json(comment);
});

// @desc Deletes a comment by id
// @route DELETE /comments/:id

router.delete("/:id", async (req, res) => {
  console.log("Call controller");
  const numberOfDestroyedRows = await service.delete(req.params.id);
  if (!numberOfDestroyedRows) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(numberOfDestroyedRows);
});

module.exports = router;
