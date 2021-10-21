const User = require("../config/postgres")["User"];
const Club = require("../config/postgres")["Club"];
const flightService = require("../service/FlightService");
const ProfilePicture = require("../config/postgres")["ProfilePicture"];
const cacheManager = require("./CacheManager");
const { XccupRestrictionError } = require("../helper/ErrorHandler");
const { getCurrentActive } = require("./SeasonService");
const moment = require("moment");

const userService = {
  ROLE: {
    ADMIN: "Administrator",
    MODERATOR: "Moderator",
    CLUB_DELEGATE: "Clubdeligierter",
    NONE: "Keine",
  },
  SHIRT_SIZES: ["XS", "S", "M", "L", "XL"],
  GENDERS: ["M", "W", "D"],
  getAll: async () => {
    return await User.findAll({ attributes: ["id", "firstName", "lastName"] });
  },
  getById: async (id) => {
    return await User.findByPk(id, {
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: ProfilePicture,
          attributes: ["id", "path", "pathThumb"],
        },
        {
          model: Club,
          attributes: ["name"],
        },
      ],
    });
  },
  getByIdPublic: async (id) => {
    const user = User.findOne({
      where: { id },
      attributes: ["id", "firstName", "lastName", "gender", "state", "gliders"],
      include: [
        {
          model: ProfilePicture,
          attributes: ["id"],
        },
      ],
    });
    const bestFreeFlight = findFlightRecordOfType(id, "FREE");
    const bestFlatFlight = findFlightRecordOfType(id, "FLAT");
    const bestFaiFlight = findFlightRecordOfType(id, "FAI");
    const results = await Promise.all([
      user,
      bestFreeFlight,
      bestFlatFlight,
      bestFaiFlight,
    ]);
    const userJson = results[0].toJSON();
    userJson.records = [results[1], results[2], results[3]];
    return userJson;
  },
  count: async () => {
    return User.count();
  },
  isAdmin: async (id) => {
    const user = await userService.getById(id);
    return user.role == userService.ROLE.ADMIN;
  },
  isModerator: async (id) => {
    const user = await userService.getById(id);
    const result =
      user?.role == userService.ROLE.ADMIN ||
      user?.role == userService.ROLE.MODERATOR;
    return result;
  },
  delete: async (id) => {
    cacheManager.invalidateCaches();
    return User.destroy({
      where: { id },
    });
  },
  save: async (user) => {
    cacheManager.invalidateCaches();
    return User.create(user);
  },
  update: async (user) => {
    await checkIfUserHasChangedClub(user);

    cacheManager.invalidateCaches();
    return user.save();
  },
  validate: async (email, password) => {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      console.log(`No user found for ${email}`);
      return null;
    }
    if (user.validPassword(password)) {
      console.log(`The password is valid`);
      return user;
    }
    console.log(`The password is not valid`);
    return null;
  },
};

/**
 * A user is allowed to change a club in the off season as often as he wishes. In an ongoing season he is only allowed to change a club once.
 * This function will throw an XccupRestrictionError if the above mentioned rule was violated.
 *
 * @param {*} user
 */
async function checkIfUserHasChangedClub(user) {
  if (Array.isArray(user.changed()) && user.changed().includes("clubId")) {
    const seasonDetails = await getCurrentActive();
    const seasonStart = moment(seasonDetails.startDate);
    const seasonEnd = moment(seasonDetails.endDate);
    if (
      user.hasAlreadyChangedClub &&
      moment().isBetween(seasonStart, seasonEnd)
    ) {
      throw new XccupRestrictionError(
        "It is not possible to change more then once a club within a season"
      );
    } else user.hasAlreadyChangedClub = true;
  }
}

async function findFlightRecordOfType(id, type) {
  return await flightService.getAll(
    null,
    null,
    type,
    null,
    1,
    true,
    null,
    null,
    id
  );
}

module.exports = userService;
