var model = require("../models/GuildConfiguration");

class GuildConfigurationRepository {
  static async createOrUpdate(data) {
    return model
      .updateOne({ guild: data.guild }, data, { upsert: true })
      .exec();
  }

  static async updateHelpChannelMessage(configuration, id) {
    return model
      .updateOne(
        { guild: configuration.guild },
        { $set: { helpChannelMessage: id } }
      )
      .exec();
  }

  static async getAll() {
    return model.find().exec();
  }

  static async get(guild) {
    return model.findOne({ guild: guild }).exec();
  }

  static async addRolePermission(guild, type, id) {
    return model
      .updateOne(
        { guild: guild },
        { $push: { rolesPermissions: { role: type, id: id } } }
      )
      .exec();
  }

  static async addUserPemission(guild, type, id) {
    return model
      .updateOne(
        { guild: guild },
        { $push: { usersPermissions: { role: type, id: id } } }
      )
      .exec();
  }

  static async isAdmin(message) {
    return await this.hasRole("admin", message);
  }

  static async isSupport(message) {
    return await this.hasRole("support", message);
  }

  static async hasRole(role, message) {
    var configuration = await this.get(message.guild.id);

    var hasRole = false;

    if (configuration) {
      if (
        configuration.usersPermissions.find(
          (m) => m.id == message.author.id && m.role == role
        )
      )
        hasRole = true;

      if (!hasRole) {
        configuration.rolesPermissions.forEach(m => {
            if (m.role == role && message.member.roles.cache.has(m.id))
                hasRole = true;
        });
      }
    }

    return hasRole;
  }
}

module.exports = GuildConfigurationRepository;
