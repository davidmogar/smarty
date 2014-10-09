var mongoose = require('mongoose');
var random = require('mongoose-random');

var examSchema = mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'question'
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  score: {
    type: Number
  }
});

module.exports = mongoose.model('exam', examSchema);
