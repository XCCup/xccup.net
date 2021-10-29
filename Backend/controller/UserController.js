const express = require("express");
const service = require("../service/UserService");
const { getCurrentActive } = require("../service/SeasonService");
const {
  OK,
  NOT_FOUND,
  FORBIDDEN,
  UNAUTHORIZED,
} = require("../constants/http-status-constants");
const { TSHIRT_SIZES, GENDER } = require("../constants/user-constants");
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
  checkIsBoolean,
  checkIsOnlyOfValue,
  checkStringObjectNotEmpty,
  checkIsUuidObject,
  checkParamIsUuid,
  checkStrongPassword,
  checkOptionalStrongPassword,
  validationHasErrors,
  checkIsArray,
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

// @desc Retrieve public user data
// @route GET /users/public/:id
// @access All logged-in user

router.get(
  "/public/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const id = req.params.id;

    try {
      const user = await service.getByIdPublic(id);

      if (!user) return res.sendStatus(NOT_FOUND);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

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
  checkStringObjectNotEmpty("lastName"),
  checkStringObjectNotEmpty("firstName"),
  checkIsDateObject("birthday"),
  checkIsEmail("email"),
  checkIsUuidObject("clubId"),
  checkIsOnlyOfValue("gender", Object.values(GENDER)),
  checkIsOnlyOfValue("tshirtSize", TSHIRT_SIZES),
  checkIsBoolean("emailInformIfComment"),
  checkIsBoolean("emailNewsletter"),
  checkIsBoolean("emailTeamSearch"),
  checkStringObjectNotEmpty("address.state"),
  checkStringObjectNotEmpty("address.country"),
  checkStrongPassword("password"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const lastName = req.body.lastName;
    const firstName = req.body.firstName;
    const birthday = req.body.birthday;
    const email = req.body.email;
    const clubId = req.body.clubId;
    const gender = req.body.gender;
    const tshirtSize = req.body.tshirtSize;
    const emailInformIfComment = req.body.emailInformIfComment;
    const emailNewsletter = req.body.emailNewsletter;
    const emailTeamSearch = req.body.emailTeamSearch;
    const state = req.body.state;
    const address = req.body.address;
    const password = req.body.password;

    const newUser = {
      lastName,
      firstName,
      birthday,
      email,
      clubId,
      gender,
      tshirtSize,
      emailInformIfComment,
      emailNewsletter,
      emailTeamSearch,
      state,
      address,
      password,
    };

    try {
      const user = await service.save(newUser);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits a user
// @route PUT /users/:id
// @access Only owner

router.put(
  "/:id",
  authToken,
  checkParamIsUuid("id"),
  checkStringObjectNotEmpty("lastName"),
  checkStringObjectNotEmpty("firstName"),
  checkIsDateObject("birthday"),
  checkIsEmail("email"),
  checkIsUuidObject("clubId"),
  checkIsOnlyOfValue("gender", Object.values(GENDER)),
  checkIsOnlyOfValue("tshirtSize", TSHIRT_SIZES),
  checkIsBoolean("emailInformIfComment"),
  checkIsBoolean("emailNewsletter"),
  checkIsBoolean("emailTeamSearch"),
  checkStringObjectNotEmpty("address.state"),
  checkStringObjectNotEmpty("address.country"),
  checkOptionalStrongPassword("password"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const id = req.params.id;

    const lastName = req.body.lastName;
    const firstName = req.body.firstName;
    const birthday = req.body.birthday;
    const email = req.body.email;
    const clubId = req.body.clubId;
    const gender = req.body.gender;
    const tshirtSize = req.body.tshirtSize;
    const emailInformIfComment = req.body.emailInformIfComment;
    const emailNewsletter = req.body.emailNewsletter;
    const emailTeamSearch = req.body.emailTeamSearch;
    const state = req.body.state;
    const address = req.body.address;
    const password = req.body.password;

    try {
      if (await requesterIsNotOwner(req, res, id)) return;

      const user = await service.getById(id);
      user.lastName = lastName;
      user.firstName = firstName;
      user.birthday = birthday;
      user.email = email;
      user.clubId = clubId;
      user.gender = gender;
      user.tshirtSize = tshirtSize;
      user.emailInformIfComment = emailInformIfComment;
      user.emailNewsletter = emailNewsletter;
      user.emailTeamSearch = emailTeamSearch;
      user.state = state;
      user.address = address;
      user.password = password;

      const result = await service.update(user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits the gliders of an user. Expects an array of glider objects with the props "brand", "model" and "key" (e.g. AB_low).
// @route PUT /users/gliders/:id
// @access Only owner

router.put(
  "/gliders/:id",
  // authToken,
  checkIsArray("gliders"), //TODO Create schema validation for gliders
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const id = req.params.id;
    const currentGliders = req.body.gliders;

    try {
      const gliders = await sanitizeGliders(currentGliders);
      await addGliderClassDescription(gliders);

      if (await requesterIsNotOwner(req, res, id)) return;

      const user = await service.getById(id);
      user.gliders = gliders;

      const result = await service.update(user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

async function addGliderClassDescription(gliders) {
  const gliderClasses = (await getCurrentActive()).gliderClasses;

  gliders.forEach((glider) => {
    glider.gliderClassShortDescription =
      gliderClasses[glider.gliderClass].shortDescription;
  });
}

async function sanitizeGliders(gliders) {
  const { XccupRestrictionError } = require("../helper/ErrorHandler");
  const gliderClasses = (await getCurrentActive()).gliderClasses;

  return gliders.map((glider) => {
    if (
      glider.brand &&
      glider.model &&
      glider.gliderClass &&
      gliderClasses[glider.gliderClass]
    ) {
      return {
        brand: glider.brand,
        model: glider.model,
        gliderClass: glider.gliderClass,
      };
    }
    throw new XccupRestrictionError(
      `The gliderClass: "${glider.gliderClass}" is not valid for the current season`
    );
  });
}

module.exports = router;
