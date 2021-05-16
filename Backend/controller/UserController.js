const express = require("express");
const service = require("../service/UserService");
const { NOT_FOUND, INTERNAL_SERVER_ERROR } = require("./Constants");
const router = express.Router();

// @desc Retrieves all users
// @route GET /user/

router.get("/", async (req, res) => {
  const users = await service.getAll();
  res.json(users);
});

// @desc Retrieve user by his username
// @route GET /user/name/:username

router.get("/name/:username", async (req, res) => {
  const user = await service.getByName(req.params.username);
  if (!user) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(user);
});

// @desc Retrieve user by id
// @route GET /user/:id

router.get("/:id", async (req, res) => {
  const user = await service.getById(req.params.id);
  if (!user) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(user);
});

// @desc Deletes user by id
// @route DELETE /user/:id

router.delete("/:id", async (req, res) => {
  const user = await service.delete(req.params.id);
  if (!user) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(user);
});

// @desc Saves a new user to the database
// @route POST /user/

router.post("/", async (req, res) => {
  service
    .save(req.body)
    .then((user) => {
      res.json(user);
    })
    .catch((error) => {
      console.error(error);
      res.status(INTERNAL_SERVER_ERROR).send(error.message);
    });
});

module.exports = router;
