var model = require("../models/Ticket");

class TicketRepository {
  static async create(data) {
    return model.create(data);
  }

  static async getAll() {
    return model.find().exec();
  }

  static async getAllOpen() {
    return model.find({ status: true }).exec();
  }

  static async countAll(guild) {
    return model.countDocuments({ guild: guild }).exec();
  }

  static async close(guild, channel) {
    return model
      .updateOne(
        { guild: guild, channel: channel },
        { $set: { status: false } }
      )
      .exec();
  }

  static async getByChannel(guild, channel) {
    return model.findOne({ guild: guild, channel: channel }).exec();
  }

  static async insertLog(message) {
    return model
      .updateOne(
        { guild: message.guild.id, channel: message.channel.id },
        {
          $push: {
            logs: {
              author: message.author.id,
              authorName: message.author.username,
              content: message.content,
            },
          },
        }
      )
      .exec();
  }
}

module.exports = TicketRepository;
