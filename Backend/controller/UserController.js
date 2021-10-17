const express = require("express");
const service = require("../service/UserService");
const { OK, NOT_FOUND, FORBIDDEN, UNAUTHORIZED } = require("./Constants");
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
  checkParamIsUuid,
  validationHasErrors,
} = require("./Validation");

// All requests to /users/picture will be rerouted
router.use("/picture", require("./UserPictureController"));

// @desc Retrieves all usernames
// @route GET /users/

router.get("/", async (req, res, next) => {
  try {
    const users = await service.getAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// @desc Logs a user in by his credentials
// @route GET /users/login

router.post(
  "/login",
  checkIsEmail("email"),
  checkStringObjectNotEmpty("password"),
  async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
      const user = await service.validate(email, password);
      if (!user) return res.sendStatus(UNAUTHORIZED);

      const accessToken = createToken(user);
      const refreshToken = createRefreshToken(user);

      res.json({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc Refreshes an user access token if it has expired
// @route GET /users/token

router.post("/token", async (req, res, next) => {
  const token = req.body.token;
  try {
    const accessToken = await refreshToken(token);
    if (!accessToken) return res.sendStatus(FORBIDDEN);

    res.json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
});

// @desc Logs a user out
// @route GET /users/logout

router.post("/logout", async (req, res, next) => {
  const token = req.body.token;
  try {
    logoutToken(token).then(() => res.sendStatus(OK));
  } catch (error) {
    next(error);
  }
});

// @desc Retrieve public user data by username
// @route GET /users/name/:username
// @access All logged-in user

router.get("/name/:username", authToken, async (req, res, next) => {
  try {
    const user = await service.getByName(req.params.username);

    if (!user) return res.sendStatus(NOT_FOUND);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc Retrieve user by id
// @route GET /users/:id
// @access Only owner

router.get(
  "/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      if (await requesterIsNotOwner(req, res, id)) return;

      const retrievedUser = await service.getById(id);
      if (!retrievedUser) return res.sendStatus(NOT_FOUND);

      res.json(retrievedUser);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes user by id
// @route DELETE /users/:id
// @access Only owner

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      if (await requesterIsNotOwner(req, res, id)) return;

      const user = await service.delete(req.params.id);
      if (!user) return res.sendStatus(NOT_FOUND);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

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
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      service.save(req.body).then((user) => {
        res.json(user);
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
