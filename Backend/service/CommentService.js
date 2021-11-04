const FlightComment = require("../config/postgres")["FlightComment"];
const User = require("../config/postgres")["User"];

const _ = require("lodash");

const service = {
  getById: async (id) => {
    return FlightComment.findByPk(id);
  },

  getByFlightId: async (flightId) => {
    const comments = await FlightComment.findAll({
      where: { flightId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    comments.forEach((comment) => {
      comment.message = _.unescape(comment.message);
    });
    return comments;
  },

  create: async (comment) => {
    return FlightComment.create(comment);
  },

  update: async (comment) => {
    return comment.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await FlightComment.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
