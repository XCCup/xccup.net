const FlightImage = require("../config/postgres")["FlightImage"];

const service = {
  getById: (id) => {
    return FlightImage.findByPk(id);
  },

  create: async (media) => {
    return FlightImage.create(media);
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
    const numberOfDestroyedRows = await FlightImage.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
