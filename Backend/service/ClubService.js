const { Club, User } = require("../model/DependentModels");

const clubService = {
  getAll: async () => {
    return await Club.findAll({ attributes: { exclude: ["contact"] } });
  },

  getById: async (id) => {
    return await Club.findByPk(id);
  },

  getAllMemberOfClub: async (clubId) => {
    return await User.findAll({
      where: { clubId: clubId },
      attributes: [
        "name",
        "firstName",
        "lastName",
        "urlProfilPicture",
        "gender",
        "gliders",
        "emailTeamSearch",
        "state",
      ],
    });
  },

  create: async (club) => {
    return await Club.create(club);
  },

  update: async (club) => {
    return await Club.save(club);
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await Club.destroy({
      where: { id: id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = clubService;
