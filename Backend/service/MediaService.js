const Media = require("../config/postgres")["UserMedia"];

const service = {
  getById: (id) => {
    return Media.findByPk(id);
  },

  create: async (media) => {
    return Media.create(media);
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
    const numberOfDestroyedRows = await Media.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
