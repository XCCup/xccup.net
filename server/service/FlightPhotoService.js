const FlightPhoto = require("../config/postgres")["FlightPhoto"];
const { Sequelize } = require("../config/postgres");

const service = {
  getById: (id) => {
    return FlightPhoto.findByPk(id);
  },

  getRandom: (count) => {
    return FlightPhoto.findAll({
      order: Sequelize.literal("random()"),
      limit: count,
      // TODO: Is there a way to include user name and external flight id?
      attributes: ["id", "description"],
    });
  },

  create: async (media) => {
    return FlightPhoto.create(media);
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
