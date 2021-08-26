const express = require("express");
const service = require("../service/UserService");
const {
  OK,
  NOT_FOUND,
  FORBIDDEN,
  UNAUTHORIZED,
  INTERNAL_SERVER_ERROR,
} = require("./Constants");
const router = express.Router();
const {
  authToken,
  createToken,
  requesterIsNotOwner,
  createRefreshToken,
  logoutToken,
  refreshToken,
} = require("./Auth");
const {
  checkIsDateObject,
  checkIsEmail,
  checkOptionalIsBoolean,
  checkOptionalIsOnlyOfValue,
  checkStringObjectNotEmpty,
  checkIsUuidObject,
  validationHasErrors,
} = require("./Validation");

// @desc Retrieves all usernames
// @route GET /users/

router.get("/", async (req, res) => {
  const users = await service.getAll();

  res.json(users);
});

// @desc Logs a user in by his credentials
// @route GET /users/login

router.post(
  "/login",
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("password"),
  async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    const userId = await service.validate(name, password);
    if (!userId) return res.sendStatus(UNAUTHORIZED);

    const accessToken = createToken(userId, name);
    const refreshToken = createRefreshToken(userId, name);

    res.json({
      accessToken,
      refreshToken,
    });
  }
);

// @desc Refreshes an user access token if it has expired
// @route GET /users/token

router.post("/token", async (req, res) => {
  const token = req.body.token;

  const accessToken = await refreshToken(token);
  console.log(accessToken);
  if (!accessToken) return res.sendStatus(FORBIDDEN);

  res.json({
    accessToken,
  });
});

// @desc Logs a user out
// @route GET /users/logout

router.post("/logout", async (req, res) => {
  const token = req.body.token;

  logoutToken(token)
    .then(() => res.sendStatus(OK))
    .catch((error) => res.status(500).send(error));
});

// @desc Retrieve public user data by username
// @route GET /users/name/:username
// @access All logged-in user

router.get("/name/:username", authToken, async (req, res) => {
  const user = await service.getByName(req.params.username);
  if (!user) return res.sendStatus(NOT_FOUND);

  res.json(user);
});

// @desc Retrieve user by id
// @route GET /users/:id
// @access Only owner

router.get("/:id", authToken, async (req, res) => {
  const requestId = req.params.id;

  if (await requesterIsNotOwner(req, res, requestId)) return;

  const retrievedUser = await service.getById(requestId);
  if (!retrievedUser) return res.sendStatus(NOT_FOUND);

  res.json(retrievedUser);
});

// @desc Deletes user by id
// @route DELETE /users/:id
// @access Only owner

router.delete("/:id", authToken, async (req, res) => {
  const requestId = req.params.id;

  if (await requesterIsNotOwner(req, res, requestId)) return;

  const user = await service.delete(req.params.id);
  if (!user) return res.sendStatus(NOT_FOUND);

  res.json(user);
});

// @desc Saves a new user to the database
// @route POST /users/

router.post(
  "/",
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("lastName"),
  checkStringObjectNotEmpty("firstName"),
  checkIsDateObject("birthday"),
  checkIsEmail("email"),
  checkIsUuidObject("clubId"),
  checkOptionalIsOnlyOfValue("gender", service.GENDERS),
  checkOptionalIsOnlyOfValue("tshirtSize", service.SHIRT_SIZES),
  checkOptionalIsOnlyOfValue("role", [service.ROLE.NONE]), //TODO Rollen werden vorerst nur über direkten DB Zugriff vergeben
  checkOptionalIsBoolean("emailInformIfComment"),
  checkOptionalIsBoolean("emailNewsletter"),
  checkOptionalIsBoolean("emailTeamSearch"),
  async (req, res) => {
    if (validationHasErrors(req, res)) return;
    service
      .save(req.body)
      .then((user) => {
        res.json(user);
      })
      .catch((error) => {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).send(error);
      });
  }
);

module.exports = router;
