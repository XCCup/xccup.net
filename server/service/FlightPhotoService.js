const FlightPhoto = require("../config/postgres")["FlightPhoto"];
const Flight = require("../config/postgres")["Flight"];
const User = require("../config/postgres")["User"];
const { Sequelize, sequelize } = require("../config/postgres");

const service = {
  getById: async (id) => {
    return FlightPhoto.findByPk(id);
  },

  getRandomCurrentYear: async (count) => {
    const randomPhotos = await FlightPhoto.findAll({
      where: {
        andOp: sequelize.where(
          sequelize.fn(
            "date_part",
            "year",
            sequelize.col("FlightPhoto.createdAt")
          ),
          new Date().getFullYear()
        ),
      },
      order: Sequelize.literal("random()"),
      limit: count,
      include: [
        {
          model: Flight,
          as: "flight",
          attributes: ["externalId"],
          include: {
            model: User,
            as: "user",
            attributes: ["firstName", "lastName"],
          },
        },
        // FIXME: Direct include fails with "EagerLoadingError [SequelizeEagerLoadingError]: User is not associated to FlightPhoto!"
        // {
        //   model: User,
        //   as: "user",
        //   attributes: ["firstName", "lastName"],
        // },
      ],
      attributes: ["id", "description", "createdAt"],
      raw: true,
      // Nest: true is necessary. See https://github.com/sequelize/sequelize/issues/4291. Can be removed if FIXME was solved.
      nest: true,
    });
    return randomPhotos.map((p) => {
      p.user = p.flight.user;
      delete p.flight.user;
      return p;
    });
  },

  create: async (media) => {
    return FlightPhoto.create(media);
  },

  countPhotosOfFlight: async (flightId) => {
    return FlightPhoto.count({
      where: {
        flightId,
      },
    });
  },

  update: async (media) => {
    return await media.save();
  },

  toggleLike: async (media, requesterId) => {
    if (media.likers.includes(requesterId)) {
      media.likers.splice(media.likers.indexOf(requesterId));
    } else {
      media.likers.push(requesterId);
    }
    media.changed("likers", true);
    return await media.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await FlightPhoto.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
