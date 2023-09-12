const mongoose = require("mongoose");

const CommentScheme = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  blogid : {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const Comment = mongoose.model("Comment", CommentScheme);

module.exports = Comment; 