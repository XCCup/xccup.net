const FlightComment = require("../model/FlightComment.js");

const commentService = {
  addComment: async (flightId, userId, message) => {
    return await FlightComment.create({ flightId, userId, message });
  },

  editComment: async (id, newMessage) => {
    const comment = await FlightComment.findByPk(id);
    comment.message = newMessage;
    return comment.save();
  },

  deleteComment: async (id) => {
    const numberOfDestroyedRows = await FlightComment.destroy({
      where: { id: id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = commentService;
