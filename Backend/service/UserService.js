const { User } = require("../model/DependentModels");

const userService = {
  getAll: async () => {
    const users = await User.findAll();
    console.log("Service: ", users);
    return users;
  },
  getById: async (id) => {
    return await User.findByPk(id);
  },
  getName: async (id) => {
    return await User.findByPk(id, { attributes: ["name"] });
  },
  getByName: async (userName) => {
    return await User.findOne({
      where: { name: userName },
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
};

module.exports = userService;
