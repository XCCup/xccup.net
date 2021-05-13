const FlightComment = require("../model/FlightComment.js");

const commentService = {
  getByFlightId: async (flightId) => {
    const comments = await FlightComment.findAll({
      where: { flightId: flightId },
    });
    console.log("Service: ", comments);

    return comments;
  },

  add: async (comment) => {
    return await FlightComment.create(comment);
  },

  edit: async (id, body) => {
    const comment = await FlightComment.findByPk(id);
    comment.message = body.message;
    return comment.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await FlightComment.destroy({
      where: { id: id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = commentService;
