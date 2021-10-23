const FlightComment = require("../config/postgres")["FlightComment"];
const User = require("../config/postgres")["User"];

const service = {
  getById: async (id) => {
    return FlightComment.findByPk(id);
  },

  getByFlightId: async (flightId) => {
    return FlightComment.findAll({
      where: { flightId },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
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
