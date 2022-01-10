const Team = require("../config/postgres")["Team"];
const User = require("../config/postgres")["User"];
const flightService = require("./FlightService");
const { Op } = require("sequelize");

const { getCurrentYear } = require("../helper/Utils");
const { TEAM_SIZE } = require("../config/result-determination-config");
const { ROLE } = require("../constants/user-constants");
const { XccupRestrictionError } = require("../helper/ErrorHandler");

const service = {
  getAllNames: async (year = getCurrentYear()) => {
    const teams = await Team.findAll({
      where: {
        season: year,
      },
      attributes: ["id", "name"],
      order: [["name", "asc"]],
    });
    return teams;
  },

  getAll: async ({
    year = getCurrentYear(),
    includeMembers = true,
    includeStats = false,
  } = {}) => {
    const teams = await Team.findAll({
      where: {
        season: year,
      },
      raw: true,
    });

    const members = includeMembers
      ? await Promise.all(teams.map((team) => retrieveMembers(team)))
      : undefined;
    const stats = includeStats
      ? await Promise.all(teams.map((team) => retrieveStats(team, year)))
      : undefined;
    for (let i = 0; i < teams.length; i++) {
      if (includeMembers) teams[i].members = members[i];
      if (includeStats) teams[i].stats = stats[i];
    }

    return teams;
  },

  getById: async (id) => {
    const team = await Team.findOne({
      where: {
        id,
      },
    });
    const members = await retrieveMembers(team);
    team.members = members;
    return team;
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
        season: getCurrentYear(),
      },
    });
  },

  create: async (teamName, memberIds) => {
    const team = {
      name: teamName,
      season: getCurrentYear(),
      members: memberIds,
    };
    const newTeam = await Team.create(team);
    const members = await User.findAll({
      where: {
        id: {
          [Op.in]: memberIds,
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
        [Op.not]: {
          role: ROLE.INACTIVE,
        },
      },
      attributes: ["firstName", "lastName", "id"],
    });
    return users;
  },

  checkMembersAlreadyAssigned: async (memberIds) => {
    const availableUsers = await service.findAvailableUsers();
    const availableUserIds = availableUsers.map((user) => user.id);
    let result = memberIds.filter((id) => !availableUserIds.includes(id));
    if (result.length)
      throw new XccupRestrictionError(
        "Users are not allowed to be associated with multiple teams"
      );
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await Team.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

async function retrieveMembers(team) {
  if (!team.members?.length) return;

  const members = await User.findAll({
    where: {
      id: {
        [Op.in]: team.members,
      },
    },
    attributes: ["firstName", "lastName", "id"],
  });
  return members.map((m) => m.toJSON());
}

async function retrieveStats(team, year) {
  const flightsOfTeam = (await flightService.getAll({ year, teamId: team.id }))
    .rows;

  const stats = {
    flights: flightsOfTeam.length,
    distance: flightsOfTeam.reduce(
      (acc, cur) => (acc += cur.flightDistance),
      0
    ),
    points: flightsOfTeam.reduce((acc, cur) => (acc += cur.flightPoints), 0),
  };

  return stats;
}
// function createMemberInclude() {
//   return {
//     model: User,
//     as: "members",
//     attributes: ["firstName", "lastName", "id"],
//   };
// }

module.exports = service;
