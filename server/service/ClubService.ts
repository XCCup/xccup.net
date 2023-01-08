import db from "../db";
import { Op } from "sequelize";
import { getCurrentYear } from "../helper/Utils";
import { ClubCreationAttributes, ClubInstance } from "../db/models/Club";
import { range } from "lodash";

const clubService = {
  getAllActive: async () => {
    return db.Club.findAll({
      where: {
        participantInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
      include: createLogoInclude(),
      attributes: { exclude: ["contacts"] },
    });
  },
  getAllNames: async ({ includeAllClubsWhichEverCompeted = false } = {}) => {
    const whereStatement = includeAllClubsWhichEverCompeted
      ? {
          participantInSeasons: {
            [Op.overlap]: range(2004, getCurrentYear()),
          },
        }
      : {
          participantInSeasons: {
            [Op.contains]: [getCurrentYear()],
          },
        };

    return db.Club.findAll({
      where: whereStatement,
      attributes: ["id", "name"],
      order: [["name", "asc"]],
    });
  },
  getAll: async () => {
    return db.Club.findAll();
  },

  getById: async (id: string) => {
    return db.Club.findByPk(id, {
      include: createLogoInclude(),
    });
  },

  getByShortName: async (shortName: string) => {
    return db.Club.findOne({
      where: { shortName },
    });
  },

  getAllMemberOfClub: async (shortName: string) => {
    return db.User.findAll({
      attributes: [
        "name",
        "firstName",
        "lastName",
        "fullName",
        "urlProfilPicture",
        "gender",
        "gliders",
        "emailTeamSearch",
        "state",
      ],
      include: {
        model: db.Club,
        attributes: ["name", "shortName"],
        as: "db.Club",
        where: {
          shortName,
        },
      },
    });
  },

  countActive: async () => {
    return db.Club.count({
      where: {
        participantInSeasons: {
          [Op.contains]: [getCurrentYear()],
        },
      },
    });
  },

  create: async (club: ClubCreationAttributes) => {
    return db.Club.create(club);
  },

  update: async (club: ClubInstance) => {
    return club.save();
  },

  delete: async (id: string) => {
    const numberOfDestroyedRows = await db.Club.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

function createLogoInclude() {
  return {
    model: db.Logo,
    as: "logo",
    attributes: ["id", "path"],
  };
}

module.exports = clubService;
