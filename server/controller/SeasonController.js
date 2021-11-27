const express = require("express");
const router = express.Router();
const service = require("../service/SeasonService");
// const { NOT_FOUND, INTERNAL_SERVER_ERROR } = require("./Constants");
// const { authToken, belongsNotToId } = require("./Auth");

// @desc Gets all seasons
// @route GET /seasons

router.get("/", async (req, res, next) => {
  try {
    const seasons = await service.getAll();
    res.json(seasons);
  } catch (error) {
    next(error);
  }
});

// @desc Gets the year of all seasons
// @route GET /seasons/years

router.get("/years", async (req, res, next) => {
  try {
    const years = await service.getAll(true);
    res.json(years);
  } catch (error) {
    next(error);
  }
});

// @desc Get current season detail
// @route GET /seasons/current

router.get("/current", async (req, res, next) => {
  try {
    const seasons = await service.getCurrentActive();
    res.json(seasons);
  } catch (error) {
    next(error);
  }
});

// @desc Adds a season
// @route POST /season/
// @access Only admin

// router.post("/", authToken, async (req, res,next) => {
//   try {
//     const comment = await service.create(req.body);
//     res.json(comment);
//   } catch (error) {
//     logger.(error);
//     res.status(INTERNAL_SERVER_ERROR).send(error.message);
//   }
// });

// @desc Edits a season
// @route GET /season/
// @access Only admin

// router.put("/:id", authToken, async (req, res,next) => {
//   const commentId = req.params.id;
//   const comment = await service.getById(commentId);

//   if (belongsNotToId(req, res, comment.userId)) {
//     return;
//   }

//   comment.message = req.body.message;
//   const result = await service.update(comment);

//   res.json(result);
// });

// @desc Deletes a season by id
// @route DELETE /comments/:id
// @access Only admin

// router.delete("/:id", authToken, async (req, res,next) => {
//   const id = req.params.id;
//   const comment = await service.getById(id);

//   if (!comment) {
//     res.sendStatus(NOT_FOUND);
//     return;
//   }

//   if (belongsNotToId(req, res, comment.userId)) {
//     return;
//   }

//   const numberOfDestroyedRows = await service.delete(commentId);
//   res.json(numberOfDestroyedRows);
// });

module.exports = router;
