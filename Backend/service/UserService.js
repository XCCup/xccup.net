const { User } = require("../model/DependentModels");

const userService = {
  ROLE: {
    ADMIN: "Administrator",
    MODERATOR: "Moderator",
    CLUB_DELEGATE: "Clubdeligierter",
    NONE: "Keine",
  },

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
