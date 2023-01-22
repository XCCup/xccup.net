const User = require("../db")["User"];
const Club = require("../db")["Club"];
const Team = require("../db")["Team"];
const Flight = require("../db")["Flight"];
const FlightPhoto = require("../db")["FlightPhoto"];
const FlightComment = require("../db")["FlightComment"];
const flightService = require("./FlightService");
const mailService = require("./MailService");
const ProfilePicture = require("../db")["ProfilePicture"];
const { ROLE } = require("../constants/user-constants");
const { FLIGHT_TYPE, FLIGHT_STATE } = require("../constants/flight-constants");
const { XccupRestrictionError } = require("../helper/ErrorHandler");
const { getCurrentActive } = require("./SeasonService");
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { arrayRemove, generateRandomString } = require("../helper/Utils");
const logger = require("../config/logger");

const userService = {
  getAll: async ({ records, limit, offset, userIds, clubId, teamId } = {}) => {
    const users = await User.findAndCountAll({
      where: createUserWhereStatement(userIds),
      attributes: [
        "id",
        "firstName",
        "lastName",
        "fullName",
        "gender",
        "gliders",
      ],
      include: [
        {
          model: ProfilePicture,
          as: "picture",
          attributes: ["id"],
        },
        createBasicInclude(Team, "team", teamId),
        createBasicInclude(Club, "club", clubId),
      ],
      limit,
      offset,
      order: [["firstName", "ASC"]],
    });

    if (records) {
      const usersWithRecords = await Promise.all(
        users.rows.map(async (user) => {
          const userJson = user.toJSON();
          const bestFreeFlight = findFlightRecordOfType(
            userJson.id,
            FLIGHT_TYPE.FREE
          );
          const bestFlatFlight = findFlightRecordOfType(
            userJson.id,
            FLIGHT_TYPE.FLAT
          );
          const bestFaiFlight = findFlightRecordOfType(
            userJson.id,
            FLIGHT_TYPE.FAI
          );
          const sumDistance = flightService.sumFlightColumnByUser(
            "flightDistance",
            userJson.id
          );
          const sumPoints = flightService.sumFlightColumnByUser(
            "flightPoints",
            userJson.id
          );
          const sumFlights = flightService.countFlightsByUser(userJson.id);
          const results = await Promise.all([
            bestFreeFlight,
            bestFlatFlight,
            bestFaiFlight,
            sumDistance,
            sumPoints,
            sumFlights,
          ]);
          userJson.records = {
            free: results[0],
            flat: results[1],
            fai: results[2],
          };
          userJson.stats = {
            distance: results[3],
            points: results[4],
            flights: results[5],
          };
          return userJson;
        })
      );

      return { count: users.count, rows: usersWithRecords };
    }

    /**
     * Without mapping "FATAL ERROR: v8::Object::SetInternalField() Internal field out of bounds" occurs.
     * This is due to the fact that node-cache can't clone sequelize objects with active tcp handles.
     * See also: https://github.com/pvorb/clone/issues/106
     */
    return users.rows.map((v) => v.toJSON());
  },
  getAllNames: async () => {
    const users = await User.findAll({
      where: {
        role: {
          [Op.not]: ROLE.INACTIVE,
        },
      },
      order: [["firstName", "asc"]],
      attributes: ["id", "firstName", "lastName", "fullName"],
    });

    return users;
    // return users.map((user) => user.fullName);
  },
  getById: async (id) => {
    return await User.findByPk(id, {
      attributes: {
        exclude: ["password", "defaultGlider", "gliders", "updatedAt"],
      },
      include: [
        {
          model: ProfilePicture,
          as: "picture",
          attributes: ["id", "path"],
        },
        createBasicInclude(Club, "club"),
      ],
    });
  },
  getGlidersById: async (id) => {
    return await User.findByPk(id, {
      attributes: ["gliders", "defaultGlider"],
    });
  },
  getTShirtList: async (year) => {
    const flightsOfYear = await Flight.findAll({
      where: {
        flightStatus: FLIGHT_STATE.IN_RANKING,
        andOp: sequelize.where(
          sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
          year
        ),
      },
      attributes: ["userId"],
    });

    const userIds = filterUsersWithEnoughFlightsForTshirtForIds(flightsOfYear);

    const usersWithEnoughFlights = await User.findAll({
      where: {
        id: {
          [Op.in]: userIds,
        },
        noTshirtRequested: false,
      },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "fullName",
        "tshirtSize",
        "address",
        "email",
        "gender",
      ],
      include: [createBasicInclude(Club, "club")],
    });
    const usersWithEnoughFlightsJSON = usersWithEnoughFlights.map((u) =>
      u.toJSON()
    );

    usersWithEnoughFlightsJSON.sort((a, b) => {
      return a.club?.name?.localeCompare(b.club?.name);
    });

    return usersWithEnoughFlightsJSON;
  },
  /**
   * Retrieves e-mail-addresses of active users. Does not return e-mail-addresses of developer accounts.
   * @param {boolean} includeAll If set to true all e-mail addresses will be retrieved. Otherwise only the e-mail-addresses of users which subscribed to the newsletter will be retrieved.
   * @returns An array of e-mail-addresses
   */
  getEmails: async (includeAll) => {
    const where = {
      role: {
        [Op.notIn]: [ROLE.INACTIVE, ROLE.DEVELOPER],
      },
    };

    if (!includeAll) {
      where.emailNewsletter = true;
    }

    const result = await User.findAll({
      where,
      attributes: ["email"],
    });
    return result.map((e) => e.email);
  },
  getByIdPublic: async (id) => {
    const userQuery = User.findOne({
      where: { id },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "fullName",
        "gender",
        "gliders",
      ],
      include: [
        {
          model: ProfilePicture,
          as: "picture",
          attributes: ["id"],
        },
        createBasicInclude(Club, "club"),
        createBasicInclude(Team, "team"),
      ],
    });
    const bestFreeFlight = findFlightRecordOfType(id, FLIGHT_TYPE.FREE);
    const bestFlatFlight = findFlightRecordOfType(id, FLIGHT_TYPE.FLAT);
    const bestFaiFlight = findFlightRecordOfType(id, FLIGHT_TYPE.FAI);
    const results = await Promise.all([
      userQuery,
      bestFreeFlight,
      bestFlatFlight,
      bestFaiFlight,
    ]);
    const userJson = results[0].toJSON();
    userJson.records = [results[1], results[2], results[3]];
    return userJson;
  },
  activateUser: async (id, token) => {
    const user = await User.findOne({
      where: { id, token },
    });

    if (!user) return;

    user.role = ROLE.NONE;
    user.token = "";
    await user.save();
    return user;
  },
  confirmMailChange: async (id, token, email) => {
    const user = await User.findOne({
      where: { id, token },
    });

    if (!user) return;

    user.email = email;
    user.token = "";
    return await user.save();
  },
  renewPassword: async (id, token) => {
    const user = await User.findOne({
      where: { id, token },
    });

    // Return empty object, otherwise destructuring doesn't work
    if (!user) return {};

    logger.info("US: Will create a new password for " + user.email);

    if (user.role == ROLE.INACTIVE) {
      logger.info(
        "US: The user was inactive. The user will now be considered as active"
      );
      user.role = ROLE.NONE;
    }
    const newPassword = generateRandomString();
    user.password = newPassword;
    user.token = "";
    const updatedUser = await user.save();

    return { updatedUser, newPassword };
  },
  requestNewPassword: async (email) => {
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email,
        },
      },
    });

    // Return empty object, otherwise destructuring doesn't work
    if (!user) return {};

    logger.debug("US: Will create a resetPassword for " + email);
    const token = generateRandomString();
    user.token = token;
    const updatedUser = await user.save();

    return { updatedUser, token };
  },
  count: async () => {
    return User.count({
      where: {
        role: {
          [Op.not]: ROLE.INACTIVE,
        },
      },
    });
  },
  isAdmin: async (id) => {
    const user = await userService.getById(id);
    return user?.role == ROLE.ADMIN;
  },
  isModerator: async (id) => {
    const user = await userService.getById(id);
    const result = user?.role == ROLE.ADMIN || user?.role == ROLE.MODERATOR;
    return result;
  },
  delete: async (id) => {
    // Delete personal user data and set role to deleted
    await User.update(
      {
        role: ROLE.DELETED,
        firstName: "Gelöschter",
        lastName: "Benutzer",
        email: "",
        address: {},
        gliders: [],
        tshirtSize: "",
        gender: "",
        birthday: new Date(),
      },
      {
        where: { id },
      }
    );
    // If season is ongoing delete all flights from current season

    // Remove all content from comments but keep entry to show other users that there was a dialogue
    FlightComment.update(
      { message: "Gelöschter Inhalt" },
      { where: { userId: id } }
    );

    // Remove all pictures from user
    const userPhotos = await FlightPhoto.findAll({
      where: { userId: id },
    });
    const photoPaths = userPhotos.map((p) => p.path);
    await FlightPhoto.destroy({
      where: { userId: id },
    });

    const userPictures = await ProfilePicture.findAll({
      where: { userId: id },
    });
    const picturePaths = userPictures.map((f) => f.igcPath);
    await ProfilePicture.destroy({
      where: { userId: id },
    });

    // Remove all flight reports
    const userFlights = await Flight.findAll({ where: { userId: id } });
    const igcPaths = userFlights.map((f) => f.igcPath);
    await Flight.update({ report: "", igcPath: "" }, { where: { userId: id } });

    //Delete IGC and picture files from disk
    deleteFiles([...photoPaths, ...picturePaths, ...igcPaths]);
  },
  save: async (user) => {
    user.token = generateRandomString();
    user.hashPassword = true;
    return User.create(user);
  },
  update: async (user) => {
    await checkForClubChange(user);
    checkForMailChange(user);
    if (user.password) user.hashPassword = true;

    return user.save();
  },
  validate: async (email, password) => {
    const user = await User.findOne({
      where: {
        email: {
          [Op.iLike]: email,
        },
      },
    });
    if (!user) {
      logger.warn(`US: No user found for ${email}`);
      return null;
    }
    if (user.validPassword(password)) {
      logger.debug(`US: The password is valid`);
      return user;
    }
    logger.warn(`US: The password for ${user.id} is not valid`);
    return null;
  },
  addGlider: async (userId, glider) => {
    glider.id = uuidv4();

    const user = await User.findByPk(userId, {
      attributes: ["id", "gliders", "defaultGlider"],
    });

    if (user.gliders.length == 0) user.defaultGlider = glider.id;

    user.gliders.push(glider);
    user.changed("gliders", true);

    const updatedUser = await user.save();

    return {
      defaultGlider: updatedUser.defaultGlider,
      gliders: updatedUser.gliders,
    };
  },
  removeGlider: async (userId, gliderId) => {
    const user = await User.findByPk(userId, {
      attributes: ["id", "gliders", "defaultGlider"],
    });

    const gliderToRemove = user.gliders.find((glider) => glider.id == gliderId);

    arrayRemove(user.gliders, gliderToRemove);
    user.changed("gliders", true);

    if (gliderId == user.defaultGlider) {
      user.defaultGlider = user.gliders.length > 0 ? user.gliders[0].id : null;
    }

    const updatedUser = await user.save();

    return {
      defaultGlider: updatedUser.defaultGlider,
      gliders: updatedUser.gliders,
    };
  },
  setDefaultGlider: async (userId, gliderId) => {
    const user = await User.findByPk(userId, {
      attributes: ["id", "gliders", "defaultGlider"],
    });

    const glider = user.gliders.find((glider) => glider.id == gliderId);

    if (!glider)
      throw new XccupRestrictionError("The glider is not in the glider array");

    user.defaultGlider = glider.id;

    const updatedUser = await user.save();

    return {
      defaultGlider: updatedUser.defaultGlider,
      gliders: updatedUser.gliders,
    };
  },
};

function filterUsersWithEnoughFlightsForTshirtForIds(flightsOfYear) {
  const flightsPerUser = new Map();
  flightsOfYear.forEach((flight) => {
    if (flightsPerUser.get(flight.userId)) {
      flightsPerUser.set(flight.userId, flightsPerUser.get(flight.userId) + 1);
    } else {
      flightsPerUser.set(flight.userId, 1);
    }
  });
  const usersWithEnoughFlights = [...flightsPerUser]
    .filter(([, v]) => v >= 2)
    .map(([k]) => k);
  return usersWithEnoughFlights;
}

function createBasicInclude(model, as, id) {
  const include = {
    model,
    as,
    attributes: ["id", "name"],
  };
  if (id)
    include.where = {
      id,
    };
  return include;
}

function createUserWhereStatement(userIds) {
  const where = {
    role: {
      [Op.not]: ROLE.INACTIVE,
    },
  };

  if (userIds)
    where.id = {
      [Op.in]: userIds,
    };

  return where;
}

/**
 * A user is allowed to change a club in the off-season as often as he wishes.
 * In an ongoing season he is only allowed to change a club if he has no flights in the current season.
 * This function will throw an XccupRestrictionError if the above mentioned rule was violated.
 *
 * @param {*} user
 */
async function checkForClubChange(user) {
  if (Array.isArray(user.changed()) && user.changed().includes("clubId")) {
    const seasonDetails = await getCurrentActive();
    const seasonStart = moment(seasonDetails.startDate);
    const seasonEnd = moment(seasonDetails.endDate);

    if (
      moment().isBetween(seasonStart, seasonEnd) &&
      (await hasUserFlightsWithinCurrentSeason(user))
    ) {
      throw new XccupRestrictionError(
        "It is not possible to change more then once a club within a season"
      );
    }
  }
}
function checkForMailChange(user) {
  if (Array.isArray(user.changed()) && user.changed().includes("email")) {
    const token = generateRandomString();
    user.token = token;
    const newEmail = user.email;
    const oldEmail = user._previousDataValues.email;

    user.email = oldEmail;
    // Sends a link to the new email
    mailService.sendConfirmChangeEmailAddressMail(user, newEmail);
    // Sends a notification to the old email about the requested change
    mailService.sendNewEmailAddressMailNotification(user, newEmail);
  }
}

async function hasUserFlightsWithinCurrentSeason(user) {
  const seasonDetails = await getCurrentActive();
  const flights = await flightService.getAll({
    limit: 1,
    startDate: seasonDetails.startDate,
    endDate: seasonDetails.endDate,
    userId: user.id,
  });
  return flights.count;
}

async function findFlightRecordOfType(id, flightType) {
  return (
    await flightService.getAll({
      flightType,
      limit: 1,
      sort: ["flightPoints", "DESC"],
      userId: id,
      minimumData: true,
    })
  ).rows;
}

function deleteFiles(paths) {
  const fs = require("fs");

  paths.forEach((path) => {
    if (fs.existsSync(path)) {
      fs.unlink(path, (err) => {
        if (err) {
          logger.error(err);
        }
      });
    }
  });
}

module.exports = userService;
