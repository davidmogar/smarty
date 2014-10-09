var mongoose = require('mongoose');
var random = require('mongoose-random');

var questionSchema = mongoose.Schema({
  text: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['multichoice', 'numerical', 'truefalse'],
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'es'],
    required: true
  },
  answers: [{
    text: String,
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  meta: {
    favs: {
      type: Number,
      default: 0
    },
    votes: {
      type: Number,
      default: 0
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tag'
    }]
  }
});

questionSchema.plugin(random);

module.exports = mongoose.model('question', questionSchema);
