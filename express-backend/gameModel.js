const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  _id:{type:String, unique:true, required:true},
  white_id:String,
  black_id:String,
  minutes:Number,
  seconds:Number,
  increment:Number
});


const Game = mongoose.model('Game', gameSchema);
module.exports = Game;