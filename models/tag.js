var mongoose = require('mongoose');
var random = require('mongoose-random');

var tagSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true
  }
});

tagSchema.plugin(random);

module.exports = mongoose.model('tag', tagSchema);
