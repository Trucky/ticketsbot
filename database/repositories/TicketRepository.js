var model = require("../models/Ticket");

class TicketRepository {
  static async create(data) {
    return model.create(data);
  }

  static async getAll() {
    return model.find().exec();
  }

  static async getByTicketNumber(guild, number) {
    return model.findOne({ guild: guild, number: number }).exec();
  }

  static async getAllOpen() {
    return model.find({ status: true }).exec();
  }

  static async countAll(guild) {
    return model.countDocuments({ guild: guild }).exec();
  }

  static async close(guild, channel, user) {
    await model
      .updateOne(
        { guild: guild, channel: channel },
        { $set: { status: false, closedBy: user } }
      )
      .exec();

    return await model.findOne({ guild: guild, channel: channel }).exec();
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
              timestamp: new Date()
            },
          },
        }
      )
      .exec();
  }

  static async getOpenTicketByUser(guild, user) {
    return model.findOne({ guild: guild, author: user, status: true });
  }
}

module.exports = TicketRepository;
