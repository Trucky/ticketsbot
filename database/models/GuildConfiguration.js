var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var modelSchema = new Schema({
  guild: String,
  helpChannel: String,
  helpChannelEmbedText: String,
  reactionEmoticon: String,
  ticketsChannelCategory: String,
  helpChannelMessage: String,
  helpChannelEmbedTitle: String,
  supportLogChannel: String,
  rolesPermissions: [
    {
      role: String,
      id: String,
      topicEmojii: String
    },
  ],
  usersPermissions: [
    {
      role: String,
      id: String,
      topicEmojii: String
    },
  ],
  topics: [
    {
      reactionEmoji: String,
      topicName: String
    },
  ],
});

module.exports = mongoose.model("GuildConfiguration", modelSchema);
