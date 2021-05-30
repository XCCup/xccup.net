const express = require("express");
const service = require("../service/UserService");
const {
  NOT_FOUND,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN,
} = require("./Constants");
const router = express.Router();
const jwt = require("jsonwebtoken");

// @desc Retrieves all users
// @route GET /users/

router.get("/", async (req, res) => {
  const users = await service.getAll();
  res.json(users);
});

// @desc Retrieves all users
// @route GET /users/login

router.post("/login", async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;

  const userId = await service.validate(name, password);

  if (!userId) {
    res.sendStatus(UNAUTHORIZED);
    return;
  }

  const accessToken = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_LOGIN_TOKEN
  );

  res.json(accessToken);
});

// @desc Retrieves all users
// @route GET /users/logout

router.get("/logout", async (req, res) => {
  const users = await service.getAll();
  res.json(users);
});

// @desc Retrieve user by his username
// @route GET /users/name/:username

router.get("/name/:username", async (req, res) => {
  const user = await service.getByName(req.params.username);
  if (!user) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(user);
});

// @desc Retrieve user by id
// @route GET /users/:id

router.get("/:id", authToken, async (req, res) => {
  const requestedId = req.params.id;
  const idOfRequester = req.user.id;

  console.log("rId: ", requestedId);
  console.log("idOR: ", idOfRequester);
  if (requestedId !== idOfRequester) {
    res.sendStatus(FORBIDDEN);
    return;
  }

  const retrievedUser = await service.getById(requestedId);
  if (!retrievedUser) {
    res.sendStatus(NOT_FOUND);
    return;
  }

  res.json(retrievedUser);
});

// @desc Deletes user by id
// @route DELETE /users/:id

router.delete("/:id", authToken, async (req, res) => {
  const user = await service.delete(req.params.id);
  if (!user) {
    res.sendStatus(NOT_FOUND);
    return;
  }
  res.json(user);
});

// @desc Saves a new user to the database
// @route POST /users/

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

function authToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log("Token: ", token);

  if (!token) return res.sendStatus(UNAUTHORIZED);

  jwt.verify(token, process.env.JWT_LOGIN_TOKEN, (error, user) => {
    console.log("Verify err: ", error);
    if (error) return res.sendStatus(FORBIDDEN);
    req.user = user;
    next();
  });
}

module.exports = router;
