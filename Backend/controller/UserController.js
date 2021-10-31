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
  checkStringObject,
  validationHasErrors,
  checkOptionalStringObjectNotEmpty,
} = require("./Validation");

// All requests to /users/picture will be rerouted
router.use("/picture", require("./UserPictureController"));

// @desc Retrieves all usernames
// @route GET /users/list

router.get("/list", async (req, res, next) => {
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
    await logoutToken(token);
    res.sendStatus(OK);
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

// @desc Retrieve all user information
// @route GET /users
// @access Only owner

router.get("/", authToken, async (req, res, next) => {
  const id = req.user.id;

  try {
    const retrievedUser = await service.getById(id);
    if (!retrievedUser) return res.sendStatus(NOT_FOUND);

    res.json(retrievedUser);
  } catch (error) {
    next(error);
  }
});

// @desc Deletes user by id
// @route DELETE /users/
// @access Only owner

router.delete("/", authToken, async (req, res, next) => {
  const id = req.user.id;

  try {
    const user = await service.delete(id);

    if (!user) return res.sendStatus(NOT_FOUND);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

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
  checkOptionalStringObjectNotEmpty("address.state"),
  checkOptionalStringObjectNotEmpty("address.country"),
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
// @route PUT /users/
// @access Only owner

router.put(
  "/",
  authToken,
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
  checkStringObject("address.state"),
  checkStringObjectNotEmpty("address.country"),
  checkIsUuidObject("defaultGlider"),
  checkOptionalStrongPassword("password"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const id = req.user.id;

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
    const defaultGlider = req.body.defaultGlider;
    const password = req.body.password;

    try {
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
      user.defaultGlider = defaultGlider;
      user.password = password;

      const result = await service.update(user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Add a glider to the users glider array.
// @route POST /users/gliders/add
// @access Only owner

router.post(
  "/gliders/add",
  authToken,
  checkStringObjectNotEmpty("brand"),
  checkStringObjectNotEmpty("model"),
  checkStringObjectNotEmpty("gliderClass"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const userId = req.user.id;
    const { brand, model, gliderClass } = req.body;
    const glider = {
      brand,
      model,
      gliderClass,
    };

    try {
      await checkGliderClass(glider);

      const result = await service.addGlider(userId, glider);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Removes a glider from the users glider array.
// @route DELETE /users/gliders/remove/:id
// @access Only owner

router.delete(
  "/gliders/remove/:id",
  authToken,
  checkParamIsUuid("id"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const userId = req.user.id;
    const gliderId = req.params.id;

    try {
      const result = await service.removeGlider(userId, gliderId);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Sets the default gliders of user.
// @route PUT /users/gliders/default/:id
// Only owner

router.put("/gliders/default/:id", authToken, async (req, res, next) => {
  const userId = req.user.id;
  const gliderId = req.params.id;

  try {
    const result = await service.setDefaultGlider(userId, gliderId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// @desc Retrieves the gliders of an user.
// @route GET /users/gliders/
// Only owner

router.get("/gliders/get", authToken, async (req, res, next) => {
  const userId = req.user.id;

  try {
    const result = await service.getGlidersById(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// async function addGliderClassDescription(gliders) {
//   const gliderClasses = (await getCurrentActive()).gliderClasses;

//   gliders.forEach((glider) => {
//     glider.gliderClassShortDescription =
//       gliderClasses[glider.gliderClass].shortDescription;
//   });
// }

async function checkGliderClass(glider) {
  const { XccupRestrictionError } = require("../helper/ErrorHandler");
  const gliderClasses = (await getCurrentActive()).gliderClasses;

  if (!gliderClasses[glider.gliderClass])
    throw new XccupRestrictionError(
      `The gliderClass: "${glider.gliderClass}" is not valid for the current season`
    );
}

module.exports = router;
