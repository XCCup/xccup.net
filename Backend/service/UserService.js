const User = require("../config/postgres")["User"];
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
    return await User.findAll({ attributes: ["name"] });
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
      ],
    });
  },
  getName: async (id) => {
    return await User.findByPk(id, { attributes: ["name"] });
  },
  getByName: async (name) => {
    return await User.findOne({
      where: { name },
      attributes: ["name", "firstName", "lastName", "gender", "state"],
      include: [
        {
          model: ProfilePicture,
          attributes: ["id"],
        },
      ],
    });
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

module.exports = userService;
