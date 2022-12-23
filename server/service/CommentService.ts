import db from "../db";
import _ from "lodash";
import { FlightCommentInstance } from "../db/models/FlightComment";

const service = {
  getById: async (id: string) => {
    return db.FlightComment.findByPk(id);
  },

  getByFlightId: async (flightId: string) => {
    const comments = await db.FlightComment.findAll({
      // @ts-ignore I know it's there... but why?
      where: { flightId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "fullName"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    comments.forEach((comment) => {
      comment.message = _.unescape(comment.message);
    });
    return comments;
  },

  create: async (comment: FlightCommentInstance) => {
    return db.FlightComment.create(comment);
  },

  update: async (comment: FlightCommentInstance) => {
    return comment.save();
  },

  delete: async (id: string) => {
    const numberOfDestroyedRows = await db.FlightComment.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
