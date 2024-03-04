const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumSchema = new Schema({
    _id:{type:String, unique:true, required:true},
    title:String,
    cat:String,
    content:String,
    comments:Array,
    author:String,
  });
  
  
  const Game = mongoose.model('Forum', forumSchema);
  module.exports = Game;