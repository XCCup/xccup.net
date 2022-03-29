// const NewsModel = require("../config/postgres")["News"];

import DB from "../config/postgres";
const NewsModel = DB["News"];
import moment from "moment";
import { Op } from "sequelize";
import type News from "../types/News";

// TODO: Is this the best way?
interface Options {
  includeFutureNews?: boolean;
}
const service = {
  getById: async (id: string) => {
    return NewsModel.findByPk(id);
  },

  getAll: async (options: Options) => {
    const whereStatement = options.includeFutureNews
      ? {}
      : {
          from: {
            [Op.lte]: moment(),
          },
        };

    return NewsModel.findAll({
      where: whereStatement,
      order: [
        ["from", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
  },

  getActive: async () => {
    return NewsModel.findAll({
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

  create: async (news: News) => {
    return NewsModel.create(news);
  },

  update: async (news: News) => {
    return NewsModel.save();
  },

  delete: async (id: String) => {
    const numberOfDestroyedRows = NewsModel.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

export default service;
