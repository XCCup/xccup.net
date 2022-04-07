import db from "../db";
import { Op } from "sequelize";
import type { NewsInstance, NewsCreationAttributes } from "../db/models/News";

interface Options {
  includeFutureNews?: boolean;
}

const service = {
  getById: async (id: string) => {
    return db.News.findByPk(id);
  },

  getAll: async (options: Options) => {
    const whereStatement = options.includeFutureNews
      ? {}
      : {
          from: {
            [Op.lte]: new Date(), // TODO: Why is moment() not failing here in TS?
          },
        };

    return db.News.findAll({
      where: whereStatement,
      order: [
        ["from", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
  },

  getActive: async () => {
    return db.News.findAll({
      where: {
        from: {
          [Op.lte]: new Date(),
        },
        till: {
          [Op.gte]: Date(), // TODO: Which way?
        },
      },
      order: [
        ["from", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
  },

  create: async (news: NewsCreationAttributes) => {
    return db.News.create(news);
  },

  update: async (news: NewsInstance) => {
    return news.save();
  },

  delete: async (id: string) => {
    const numberOfDestroyedRows = db.News.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

export default service;
