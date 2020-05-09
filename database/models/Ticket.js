var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var modelSchema = new Schema({
  guild: String,
  channel: String,
  author: String,
  authorName: String,
  guildName: String,
  status: { type: Boolean, default: function() { return true }},
  number: Number,
  bannerMessage: String,
  logs: [{
      author: String,
      authorName: String,
      content: String
  }]
});

module.exports = mongoose.model("Ticket", modelSchema);
