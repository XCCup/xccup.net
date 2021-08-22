const SeasonDetail = require("../model/SeasonDetail");
const { Op } = require("sequelize");

const commentService = {
  getById: async (id) => {
    return await SeasonDetail.findByPk(id);
  },

  getAll: async () => {
    return await SeasonDetail.findAll({
      where: {
        active: true,
      },
    });
  },

  getCurrentActive: async () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    return await SeasonDetail.findOne({
      where: {
        active: true,
        year: {
          [Op.lte]: currentYear,
        },
      },
    });
  },

  create: async (season) => {
    return await SeasonDetail.create(season);
  },

  update: async (season) => {
    return await SeasonDetail.save(season);
  },

  delete: async (id) => {
    return await SeasonDetail.destroy({
      where: { id: id },
    });
  },
};

module.exports = commentService;
