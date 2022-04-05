const User = require("../db")["User"];
const Club = require("../db")["Club"];
const Team = require("../db")["Team"];
const Flight = require("../db")["Flight"];
const flightService = require("../service/FlightService");
const mailService = require("../service/MailService");
const ProfilePicture = require("../db")["ProfilePicture"];
const { ROLE } = require("../constants/user-constants");
const { TYPE, STATE } = require("../constants/flight-constants");
const { XccupRestrictionError } = require("../helper/ErrorHandler");
const { getCurrentActive } = require("./SeasonService");
const { Op } = require("sequelize");
const sequelize = require("sequelize");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { arrayRemove, generateRandomString } = require("../helper/Utils");
const logger = require("../config/logger").default;

const userService = {
  getAll: async ({ records, limit, offset, userIds, clubId, teamId } = {}) => {
    const users = await User.findAndCountAll({
      where: createUserWhereStatement(userIds),
      attributes: ["id", "firstName", "lastName", "gender", "gliders"],
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
          const bestFreeFlight = findFlightRecordOfType(userJson.id, TYPE.FREE);
          const bestFlatFlight = findFlightRecordOfType(userJson.id, TYPE.FLAT);
          const bestFaiFlight = findFlightRecordOfType(userJson.id, TYPE.FAI);
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
      attributes: ["id", "firstName", "lastName"],
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
          attributes: ["id", "path", "pathThumb"],
        },
        createBasicInclude(Club, "club"),
      ],
    });
  },
  getAllEmail: async (isNewsletter) => {
    const query = {
      attributes: ["email"],
    };

    if (isNewsletter) {
      query.where = {
        emailNewsletter: true,
      };
    }

    return await User.findAll(query);
  },
  getGlidersById: async (id) => {
    return await User.findByPk(id, {
      attributes: ["gliders", "defaultGlider"],
    });
  },
  getTShirtList: async (year) => {
    const allUsers = await User.findAll({
      role: {
        [Op.not]: ROLE.INACTIVE,
      },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "tshirtSize",
        "address",
        "email",
        "gender",
      ],
      include: [
        {
          model: Flight,
          as: "flights",
          attributes: ["flightStatus", "takeoffTime"],
          limit: 2,
          where: {
            flightStatus: STATE.IN_RANKING,
            andOp: sequelize.where(
              sequelize.fn("date_part", "year", sequelize.col("takeoffTime")),
              year
            ),
          },
        },
        createBasicInclude(Club, "club"),
      ],
    });
    const onlyUsersWithEnoughFlights = allUsers
      .filter((u) => u.flights.length == 2)
      .map((u) => u.toJSON());
    onlyUsersWithEnoughFlights.sort((a, b) => {
      a.club?.name < b.club?.name;
    });
    return onlyUsersWithEnoughFlights;
  },
  /**
   * Retrieves e-mail-addresses of active users.
   * @param {boolean} includeAll If set to true all e-mail addresses will be retrieved. Otherwise only the e-mail-addresses of users which subscribed to the newsletter will be retrieved.
   * @returns An array of e-mail-addresses
   */
  getEmails: async (includeAll) => {
    const where = {
      role: {
        [Op.not]: ROLE.INACTIVE,
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
      attributes: ["id", "firstName", "lastName", "gender", "gliders"],
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
    const bestFreeFlight = findFlightRecordOfType(id, TYPE.FREE);
    const bestFlatFlight = findFlightRecordOfType(id, TYPE.FLAT);
    const bestFaiFlight = findFlightRecordOfType(id, TYPE.FAI);
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
    return await user.save();
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

    // Return empty object, otherwise destructering doesn't work
    if (!user) return {};

    logger.info("US: Will create a new password for " + user.email);

    if (user.role == ROLE.INACTIVE) {
      logger.info(
        "US: The user was inactive. The user will now be considerd as active"
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

    // Return empty object, otherwise destructering doesn't work
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
    return user.role == ROLE.ADMIN;
  },
  isModerator: async (id) => {
    const user = await userService.getById(id);
    const result = user?.role == ROLE.ADMIN || user?.role == ROLE.MODERATOR;
    return result;
  },
  delete: async (id) => {
    return User.destroy({
      where: { id },
    });
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

module.exports = userService;
