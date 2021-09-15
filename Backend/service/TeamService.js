const { Team, User } = require("../model/DependentModels");
const { Op } = require("sequelize");

const service = {
  getAllActive: async () => {
    return await Team.findAll({
      where: {
        participantInSeasons: {
          [Op.contains]: [new Date().getFullYear()],
          active: true,
        },
      },
      include: createMemberInclude(),
    });
  },
  getAll: async () => {
    return await Team.findAll({
      include: createMemberInclude(),
    });
  },
  getById: async (id) => {
    return await Team.findOne({
      where: {
        id,
      },
      include: createMemberInclude(),
    });
  },
  getAllMemberOfTeam: async (name) => {
    return await User.findAll({
      attributes: ["name", "id"],
      include: {
        model: Team,
        attributes: ["name", "id"],
        as: "Team",
        where: {
          name,
        },
      },
    });
  },

  create: async (team) => {
    return await Team.create(team);
  },

  update: async (team) => {
    return await team.save();
  },

  addMember: async (teamId, userId) => {
    const numberOfMembers = User.count({
      where: {
        teamId,
      },
    });
    if (numberOfMembers < 5) {
      const user = await User.findByPk(userId);
      user.teamId = teamId;
      user.save();
      if (numberOfMembers == 3) {
        const team = await Team.findByPk(teamId);
        team.active = true;
      }
      return true;
    }
    return false;
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await Team.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

function createMemberInclude() {
  return {
    model: User,
    as: "members",
  };
}

module.exports = service;
