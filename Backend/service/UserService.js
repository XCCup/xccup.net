const User = require("../config/postgres")["User"];
const Club = require("../config/postgres")["Club"];
const flightService = require("../service/FlightService");
const ProfilePicture = require("../config/postgres")["ProfilePicture"];
const cacheManager = require("./CacheManager");

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
  getName: async (id) => {
    return await User.findByPk(id, { attributes: ["name"] });
  },
  getByIdPublic: async (id) => {
    const user = User.findOne({
      where: { id },
      attributes: ["id", "firstName", "lastName", "gender", "state"],
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
    cacheManager.invalidateCaches();
    return user.update();
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
