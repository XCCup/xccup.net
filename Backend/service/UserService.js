const User = require("../model/User.js");

const userService = {
  getAll: async () => {
    const users = await User.findAll();
    console.log("Service: ", users);
    return users;
  },
  getByUsername: async (userName) => {
    const user = await User.findOne({
      where: { name: userName },
    });
    console.log("Service: ", user);
    return user;
  },

  save: async (user) => {
    return await User.create(user);
  },
};

module.exports = userService;
