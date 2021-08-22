const { FlightComment } = require("../model/DependentModels");

const commentService = {
  getById: async (id) => {
    return await FlightComment.findByPk(id);
  },

  getByFlightId: async (flightId) => {
    return await FlightComment.findAll({
      where: { flightId: flightId },
    });
  },

  create: async (comment) => {
    return await FlightComment.create(comment);
  },

  update: async (comment) => {
    return await FlightComment.save(comment);
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await FlightComment.destroy({
      where: { id: id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = commentService;
