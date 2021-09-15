const User = require("../config/postgres")["User"];

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
    return await User.findByPk(id, { attributes: { exclude: ["password"] } });
  },
  getName: async (id) => {
    return await User.findByPk(id, { attributes: ["name"] });
  },
  getByName: async (userName) => {
    return await User.findOne({
      where: { name: userName },
      attributes: ["name", "firstName", "lastName", "gender", "state"],
    });
  },
  isAdmin: async (id) => {
    const user = await userService.getById(id);
    return user.role == userService.ROLE.ADMIN;
  },
  isModerator: async (id) => {
    const user = await userService.getById(id);
    const result =
      user.role == userService.ROLE.ADMIN ||
      user.role == userService.ROLE.MODERATOR;
    console.log("isMod: " + result);
    return result;
  },
  delete: async (id) => {
    return await User.destroy({
      where: { id: id },
    });
  },
  save: async (user) => {
    return await User.create(user);
  },
  validate: async (name, password) => {
    const user = await User.findOne({
      where: { name: name },
    });
    if (!user) {
      console.log(`No user of name ${name} found`);
      return null;
    }
    if (user.validPassword(password)) {
      console.log(`The password is valid`);
      return user.id;
    }
    console.log(`The password is not valid`);
    return null;
  },
};

module.exports = userService;
