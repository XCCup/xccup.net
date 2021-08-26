const { Club, User } = require("../model/DependentModels");

const clubService = {
  getAll: async () => {
    return await Club.findAll({ attributes: { exclude: ["contacts"] } });
  },

  getById: async (id) => {
    return await Club.findByPk(id);
  },

  getByShortName: async (shortName) => {
    console.log("getShort");
    return await Club.findOne({
      where: { shortName },
    });
  },

  getAllMemberOfClub: async (shortName) => {
    return await User.findAll({
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
      include: {
        model: Club,
        attributes: ["name", "shortName"],
        as: "Club",
        where: {
          shortName,
        },
      },
      exclude: ["Club"],
    });
  },

  create: async (club) => {
    return await Club.create(club);
  },

  update: async (club) => {
    return await club.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await Club.destroy({
      where: { id: id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = clubService;
