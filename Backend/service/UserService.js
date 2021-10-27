const User = require("../config/postgres")["User"];
const Club = require("../config/postgres")["Club"];
const flightService = require("../service/FlightService");
const ProfilePicture = require("../config/postgres")["ProfilePicture"];
const { ROLE } = require("../constants/user-constants");
const { XccupRestrictionError } = require("../helper/ErrorHandler");
const { getCurrentActive } = require("./SeasonService");
const moment = require("moment");

const userService = {
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
    return User.create(user);
  },
  update: async (user) => {
    await checkForClubChange(user);

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

async function hasUserFlightsWithinCurrentSeason(user) {
  const seasonDetails = await getCurrentActive();
  const flights = await flightService.getAll(
    null,
    null,
    null,
    null,
    1,
    undefined,
    seasonDetails.startDate,
    seasonDetails.endDate,
    user.id
  );
  return flights.length > 0;
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
