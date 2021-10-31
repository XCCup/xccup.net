const Team = require("../config/postgres")["Team"];
const User = require("../config/postgres")["User"];
const { Op } = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");
const { TEAM_SIZE } = require("../config/result-determination-config");

const service = {
  getAllActive: async () => {
    return await Team.findAll({
      where: {
        participantInSeasons: {
          [Op.contains]: [getCurrentYear()],
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
        attributes: [],
        as: "Team",
        where: {
          name,
        },
      },
    });
  },

  countActive: async () => {
    return Team.count({
      where: {
        participantInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
    });
  },

  create: async (teamName, memberIds) => {
    const team = {
      name: teamName,
      participantInSeasons: [getCurrentYear()],
    };
    const newTeam = await Team.create(team);
    const members = await User.findAll({
      where: {
        id: {
          [Op.or]: memberIds,
        },
      },
    });
    members.forEach((member) => {
      member.teamId = newTeam.id;
      member.save();
    });
  },

  addMember: async (teamId, userId) => {
    const numberOfMembers = User.count({
      where: {
        teamId,
      },
    });
    if (numberOfMembers < TEAM_SIZE) {
      const user = await User.findByPk(userId);
      user.teamId = teamId;
      user.save();
      return true;
    }
    return false;
  },

  findAvailableUsers: async () => {
    const users = User.findAll({
      where: {
        teamId: null,
      },
      attributes: ["name", "id"],
    });
    return users;
  },

  checkMembersAlreadyAssigned: async (memberIds) => {
    const availableUsers = await service.findAvailableUsers();
    const availableUserIds = availableUsers.map((user) => user.id);
    let result = memberIds.filter((id) => !availableUserIds.includes(id));
    result.forEach((element) =>
      console.log(`The user ${element} is already asigned to a team`)
    );
    return result.length;
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
    attributes: ["firstName", "lastName", "id"],
  };
}

module.exports = service;
