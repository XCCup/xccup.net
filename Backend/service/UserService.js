const User = require("../model/User.js");

const userService = {
  getAll: async () => {
    const users = await User.findAll();
    console.log("Service: ", users);
    return users;
  },
  getById: async (id) => {
    return await User.findByPk(id);
  },
  getName: (id) => {
    return User.findByPk(id, { attributes: ["name"] });
  },
  getByName: async (userName) => {
    const user = await User.findOne({
      where: { name: userName },
    });
    return user;
  },
  delete: async (id) => {
    return await User.destroy({
      where: { id: id },
    });
  },
  save: async (user) => {
    return await User.create(user);
  },
};

module.exports = userService;
