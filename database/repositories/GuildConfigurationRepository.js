var model = require('../models/GuildConfiguration');

class GuildConfigurationRepository {

    static async createOrUpdate(data)
    {
        return model.updateOne({ guild: data.guild }, data, { upsert: true }).exec();
    }

    static async updateHelpChannelMessage(configuration, id)
    {
        return model.updateOne({ guild: configuration.guild }, { $set: { helpChannelMessage: id }}).exec();        
    }

    static async getAll()
    {
        return model.find().exec();
    }
}

module.exports = GuildConfigurationRepository;
