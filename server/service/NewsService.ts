import db from "../db";

const News = db.News;

import moment from "moment";
import { Op } from "sequelize";

// TODO: Is this the best way?
interface Options {
  includeFutureNews?: boolean;
}
const service = {
  getById: async (id: string) => {
    return News.findByPk(id);
  },

  getAll: async (options: Options) => {
    const whereStatement = options.includeFutureNews
      ? {}
      : {
          from: {
            [Op.lte]: moment(),
          },
        };

    return News.findAll({
      where: whereStatement,
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
    return News.save();
  },

  delete: async (id: String) => {
    const numberOfDestroyedRows = News.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

export default service;
