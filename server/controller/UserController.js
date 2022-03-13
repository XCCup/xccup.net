const express = require("express");
const service = require("../service/UserService");
const flightService = require("../service/FlightService");
const siteService = require("../service/FlyingSiteService");
const mailService = require("../service/MailService");
const { getCurrentActive } = require("../service/SeasonService");
const {
  OK,
  CREATED,
  NOT_FOUND,
  FORBIDDEN,
  UNAUTHORIZED,
  CONFLICT,
} = require("../constants/http-status-constants");
const {
  TSHIRT_SIZES,
  GENDER,
  COUNTRY,
  STATE,
} = require("../constants/user-constants");
const router = express.Router();
const {
  authToken,
  createToken,
  createRefreshToken,
  logoutToken,
  refreshToken,
  requesterIsNotModerator,
} = require("./Auth");
const { query } = require("express-validator");
const { createRateLimiter } = require("./api-protection");
const {
  checkIsISO8601,
  checkIsEmail,
  checkIsBoolean,
  checkIsOnlyOfValue,
  checkStringObjectNotEmpty,
  checkIsUuidObject,
  checkParamIsUuid,
  checkParamIsInt,
  checkParamIsBoolean,
  checkStrongPassword,
  checkOptionalStrongPassword,
  validationHasErrors,
} = require("./Validation");
const { getCache, setCache, deleteCache } = require("./CacheManager");
const CACHE_RELEVANT_KEYS = [
  "users",
  "clubs",
  "filterOptions",
  "flights",
  "result",
  "home",
];

const userCreateLimiter = createRateLimiter(60, 2);
const loginLimiter = createRateLimiter(60, 5);

// All requests to /users/picture will be rerouted
router.use("/picture", require("./UserPictureController"));

// @desc Retrieves all user
// @route GET /users/public

router.get(
  "/public",
  query("records").optional().isBoolean(),
  query("limit").optional().isInt(),
  query("offset").optional().isInt(),
  query("userIds").optional().isArray(),
  query("clubId").optional().isUUID(),
  query("teamId").optional().isUUID(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const value = getCache(req);
    if (value) return res.json(value);

    const { records, limit, offset, userIds, clubId, teamId } = req.query;

    try {
      const users = await service.getAll({
        records,
        limit,
        offset,
        userIds,
        clubId,
        teamId,
      });

      setCache(req, users);

      res.json(users);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Retrieves all user names
// @route GET /users/names

router.get("/names", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const users = await service.getAllNames();

    setCache(req, users);

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// @desc Logs a user in by his credentials
// @route GET /users/login

router.post(
  "/login",
  loginLimiter,
  checkIsEmail("email"),
  checkStrongPassword("password"),
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

// @desc Activates a previously created user
// @route GET /users/activate/

router.get(
  "/activate/",
  query("userId").isUUID(),
  query("token").trim(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const { userId, token } = req.query;

    try {
      const user = await service.activateUser(userId, token);

      if (!user) return res.sendStatus(NOT_FOUND);

      const accessToken = createToken(user);
      const refreshToken = createRefreshToken(user);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json({
        firstName: user.firstName,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc Confirms a change of a email address
// @route GET /users/confirm-mail-change/

router.get(
  "/confirm-mail-change/",
  query("userId").isUUID(),
  query("token").trim(),
  query("email").trim(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const { userId, token, email } = req.query;

    try {
      const user = await service.confirmMailChange(userId, token, email);

      if (!user) return res.sendStatus(NOT_FOUND);

      res.json({
        firstName: user.firstName,
        email,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @desc Generates a new password for an user
// @route GET /users/renew-password/

router.get(
  "/renew-password",
  query("userId").isUUID(),
  query("token").trim(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const { userId, token } = req.query;

    try {
      const { updatedUser, newPassword } = await service.renewPassword(
        userId,
        token
      );

      if (newPassword) {
        await mailService.sendNewPasswordMail(updatedUser, newPassword);
        return res.sendStatus(OK);
      }
      res.sendStatus(NOT_FOUND);
    } catch (error) {
      next(error);
    }
  }
);
// @desc Sends a confirmation mail for a passwort reset
// @route POST /users/request-new-password/

router.post(
  "/request-new-password",
  checkIsEmail("email"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const { email } = req.body;

    try {
      const { updatedUser, token } = await service.requestNewPassword(email);

      if (token) {
        await mailService.sendRequestNewPasswordMail(updatedUser, token);
        return res.sendStatus(OK);
      }
      res.sendStatus(NOT_FOUND);
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

    deleteCache(CACHE_RELEVANT_KEYS);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// @desc Saves a new user to the database
// @route POST /users/

router.post(
  "/",
  userCreateLimiter,
  checkStringObjectNotEmpty("lastName"),
  checkStringObjectNotEmpty("firstName"),
  checkIsISO8601("birthday"),
  checkIsEmail("email"),
  checkIsUuidObject("clubId"),
  checkIsOnlyOfValue("gender", Object.values(GENDER)),
  checkIsOnlyOfValue("tshirtSize", TSHIRT_SIZES),
  checkIsBoolean("emailInformIfComment"),
  checkIsBoolean("emailNewsletter"),
  checkIsBoolean("emailTeamSearch"),
  checkIsOnlyOfValue("address.state", Object.values(STATE)),
  checkIsOnlyOfValue("address.country", Object.values(COUNTRY)),
  checkStrongPassword("password"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const {
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
    } = req.body;

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
      mailService.sendActivationMail(user);

      res.status(CREATED).json(user);
    } catch (error) {
      if (
        error.name?.includes("SequelizeUniqueConstraintError") &&
        error.original?.constraint === "Users_email_key"
      ) {
        res.status(CONFLICT).json({ conflict: "emailExists" });
      } else {
        next(error);
      }
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
  checkIsISO8601("birthday"),
  checkIsUuidObject("clubId"),
  checkIsOnlyOfValue("gender", Object.values(GENDER)),
  checkIsOnlyOfValue("tshirtSize", TSHIRT_SIZES),
  checkIsBoolean("emailInformIfComment"),
  checkIsBoolean("emailNewsletter"),
  checkIsBoolean("emailTeamSearch"),
  checkIsOnlyOfValue("address.state", Object.values(STATE)),
  checkIsOnlyOfValue("address.country", Object.values(COUNTRY)),
  checkOptionalStrongPassword("password"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const id = req.user.id;

    const {
      lastName,
      firstName,
      birthday,
      clubId,
      gender,
      tshirtSize,
      emailInformIfComment,
      emailNewsletter,
      emailTeamSearch,
      state,
      address,
      password,
    } = req.body;

    try {
      const user = await service.getById(id);

      if (!user) return res.sendStatus(NOT_FOUND);

      user.lastName = lastName;
      user.firstName = firstName;
      user.birthday = birthday;
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

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits a users email
// @route PUT /users/change-email
// @access Only owner
router.put(
  "/change-email",
  authToken,
  checkIsEmail("email"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const id = req.user.id;

    const { email } = req.body;

    try {
      const user = await service.getById(id);
      if (!user) return res.sendStatus(NOT_FOUND);

      user.email = email;
      const result = await service.update(user);
      deleteCache(["users"]);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits a users password
// @route PUT /users/change-password/
// @access Only owner

router.put(
  "/change-password",
  authToken,
  checkStrongPassword("password"),

  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const id = req.user.id;
    const { password } = req.body;

    try {
      const user = await service.getById(id);
      if (!user) return res.sendStatus(NOT_FOUND);
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
      await checkGliderClassAndAddGliderDescription(glider);

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
// @route GET /users/gliders/:userId
// Only moderator

router.get(
  "/gliders/get/:userId",
  authToken,
  checkParamIsUuid("userId"),
  async (req, res, next) => {
    try {
      if (await requesterIsNotModerator(req, res)) return;

      if (validationHasErrors(req, res)) return;
      const userId = req.params.userId;

      const result = await service.getGlidersById(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);
// @desc Retrieves all users which have qualified for a tshirt in the current season
// @route GET /users/tshirts/:year
// Only moderator

router.get(
  "/tshirts/:year",
  authToken,
  checkParamIsInt("year"),
  async (req, res, next) => {
    try {
      if (await requesterIsNotModerator(req, res)) return;

      if (validationHasErrors(req, res)) return;
      const year = req.params.year;

      const result = await service.getTShirtList(year);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);
// @desc Retrieves all user e-mails
// @route GET /users/emails/:includeAll
// Only moderator

router.get(
  "/emails/:includeAll",
  authToken,
  checkParamIsBoolean("includeAll"),
  async (req, res, next) => {
    try {
      if (await requesterIsNotModerator(req, res)) return;

      if (validationHasErrors(req, res)) return;

      const includeAll = req.params.includeAll.toLowerCase() === "true";
      const result = await service.getEmails(includeAll);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

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

// @desc Gets the admin panel notifications
// @route GET /users/adminNotifications

router.get("/adminNotifications", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotModerator(req, res)) return;
    const flights = await flightService.getAll({
      onlyUnchecked: true,
    });
    const sites = await siteService.getAll({ state: "proposal" });
    res.json(sites.length + flights.count);
  } catch (error) {
    next(error);
  }
});

async function checkGliderClassAndAddGliderDescription(glider) {
  const { XccupRestrictionError } = require("../helper/ErrorHandler");
  const gliderClasses = (await getCurrentActive()).gliderClasses;

  const gliderClass = gliderClasses[glider.gliderClass];

  if (!gliderClass)
    throw new XccupRestrictionError(
      `The gliderClass "${glider.gliderClass}" is not valid for the current season`
    );

  glider.gliderClass = {
    key: glider.gliderClass,
    shortDescription: gliderClass.shortDescription,
  };
}

module.exports = router;
