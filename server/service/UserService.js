const User = require("../config/postgres")["User"];
const Club = require("../config/postgres")["Club"];
const Team = require("../config/postgres")["Team"];
const flightService = require("../service/FlightService");
const mailService = require("../service/MailService");
const ProfilePicture = require("../config/postgres")["ProfilePicture"];
const { ROLE } = require("../constants/user-constants");
const { TYPE } = require("../constants/flight-constants");
const { XccupRestrictionError } = require("../helper/ErrorHandler");
const { getCurrentActive } = require("./SeasonService");
const { Op } = require("sequelize");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { arrayRemove, generateRandomString } = require("../helper/Utils");
const logger = require("../config/logger");

const userService = {
  getAll: async ({ records, limit, offset } = {}) => {
    const users = await User.findAll({
      where: {
        role: {
          [Op.not]: ROLE.INACTIVE,
        },
      },
      attributes: ["id", "firstName", "lastName", "gender", "gliders"],
      include: [
        {
          model: ProfilePicture,
          as: "picture",
          attributes: ["id"],
        },
        {
          model: Club,
          as: "club",
          attributes: ["id", "name"],
        },
        {
          model: Team,
          as: "team",
          attributes: ["id", "name"],
        },
      ],
      limit,
      offset,
      order: [["firstName", "ASC"]],
    });

    if (records) {
      return await Promise.all(
        users.map(async (user) => {
          const userJson = user.toJSON();
          const bestFreeFlight = findFlightRecordOfType(userJson.id, TYPE.FREE);
          const bestFlatFlight = findFlightRecordOfType(userJson.id, TYPE.FLAT);
          const bestFaiFlight = findFlightRecordOfType(userJson.id, TYPE.FAI);
          const results = await Promise.all([
            bestFreeFlight,
            bestFlatFlight,
            bestFaiFlight,
          ]);
          userJson.records = [results[0], results[1], results[2]];
          return userJson;
        })
      );
    }

    return users;
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
        {
          model: Club,
          as: "club",
          attributes: ["name"],
        },
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
        {
          model: Club,
          as: "club",
          attributes: ["name"],
        },
        {
          model: Team,
          as: "team",
          attributes: ["name"],
        },
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

    logger.info("Will create a new password for " + user.email);
    const newPassword = generateRandomString();
    user.password = newPassword;
    user.token = "";
    const updatedUser = await user.save();

    return { updatedUser, newPassword };
  },
  requestNewPassword: async (email) => {
    const user = await User.findOne({
      where: { email },
    });

    // Return empty object, otherwise destructering doesn't work
    if (!user) return {};

    logger.debug("Will create a resetPassword for " + email);
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
    return User.create(user);
  },
  update: async (user) => {
    await checkForClubChange(user);
    checkForMailChange(user);

    return user.save();
  },
  validate: async (email, password) => {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      logger.warn(`No user found for ${email}`);
      return null;
    }
    if (user.validPassword(password)) {
      logger.debug(`The password is valid`);
      return user;
    }
    logger.warn(`The password is not valid`);
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

    mailService.sendConfirmNewMailAddressMail(user, newEmail);
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
  return flights.length > 0;
}

async function findFlightRecordOfType(id, type) {
  return await flightService.getAll({
    type,
    limit: 1,
    sort: ["flightPoints", "DESC"],
    userId: id,
  });
}

module.exports = userService;
