const News = require("../config/postgres")["News"];
const moment = require("moment");
const { Op } = require("sequelize");

const service = {
  getById: async (id) => {
    return News.findByPk(id);
  },

  getAll: async () => {
    return News.findAll({
      order: [
        ["from", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
  },

  getActive: async () => {
    return News.findAll({
      where: {
        from: {
          [Op.lte]: moment(),
        },
        till: {
          [Op.gte]: moment(),
        },
      },
      order: [
        ["from", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
  },

  create: async (news) => {
    return News.create(news);
  },

  update: async (news) => {
    return news.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = News.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
