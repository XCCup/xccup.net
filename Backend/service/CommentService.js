const FlightComment = require("../config/postgres")["FlightComment"];

const service = {
  getById: async (id) => {
    return await FlightComment.findByPk(id);
  },

  getByFlightId: async (flightId) => {
    return await FlightComment.findAll({
      where: { flightId },
    });
  },

  create: async (comment) => {
    return await FlightComment.create(comment);
  },

  update: async (comment) => {
    return await comment.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await FlightComment.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
