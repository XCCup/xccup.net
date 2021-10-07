const MediaFlight = require("../config/postgres")["MediaFlight"];

const service = {
  getById: (id) => {
    return MediaFlight.findByPk(id);
  },

  create: async (media) => {
    return MediaFlight.create(media);
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
    const numberOfDestroyedRows = await MediaFlight.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
