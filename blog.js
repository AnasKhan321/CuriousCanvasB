const mongoose = require("mongoose");

const BlogSchema = mongoose.Schema({
  AuthorName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  article:{
    type:String , 
    required: true 
  },
  userid : {
    type:String,
    required:true
  },
  date: {
    type: Date,
    default: Date.now,
  },
  views : {
    type : Number,
    default : 0 
  }
});
const Blog = mongoose.model("Blog", BlogSchema);

module.exports = Blog; 