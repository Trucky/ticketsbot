const Discord = require("discord.js");
var TicketChannelManager = require("./TicketChannelManager");
const GuildConfigurationRepository = require("../database/repositories/GuildConfigurationRepository");

class HelpChannelReactionManager {
  constructor() {}

  async fetchHelpChannelMessage(client, c) {
    var message = null;

    var guild = client.guilds.resolve(c.guild);

    if (guild) {
      var channel = guild.channels.resolve(c.helpChannel);

      if (channel) {

        try
        {
          message = await channel.messages.fetch(c.helpChannelMessage, true);
        }
        catch (ex)
        {
          console.error(ex);
        }
      }
    }

    return message;
  }

  async recoverWaitForReactions(client) {
    var guildConfigurations = await GuildConfigurationRepository.getAll();

    guildConfigurations.forEach(async (c) => {
      var message = await this.fetchHelpChannelMessage(client, c);
      if (message != null) 
      {
        this.waitForReactions(c, message);
      }
    });
  }

  async waitForReactions(configuration, helpChannelReactionMessage) {
    const filter = (reaction, user) => true;

    const reactionCollector = helpChannelReactionMessage.createReactionCollector(
      filter
    );
    reactionCollector.on("collect", async (r) => {
      r.users.cache.array().forEach(async (u) => {
        if (!u.bot && u.id != r.client.user.id) {
          
          console.log(r.emoji.name);

          // reload current guild configuration
          configuration = await GuildConfigurationRepository.get(
            r.message.guild.id
          );

          await this.resetReactions(configuration, helpChannelReactionMessage);

          var selectedTopic = configuration.topics.find(
            (m) => m.reactionEmoji == r.emoji.name
          );

          if (selectedTopic) {
            var ticketChannelManager = new TicketChannelManager();
            ticketChannelManager.openTicket(u, r.message.guild, selectedTopic);
          }
        }
      });
    });
  }

  async createHelpChannelMessage(configuration, message) {
    var helpChannel = message.guild.channels.cache.find(
      (m) => m.id == configuration.helpChannel
    );

    var m = null;

    if (configuration.helpChannelMessage) {
      try
      {
        m = await helpChannel.messages.fetch(configuration.helpChannelMessage);
      }
      catch (ex)
      {
        console.error(ex);
      }
    }

    var embed = new Discord.MessageEmbed({
      title: configuration.helpChannelEmbedTitle,
      description: configuration.helpChannelEmbedText,
    });

    if (m) await m.edit(embed);
    else {
      m = await helpChannel.send(embed);

      await GuildConfigurationRepository.updateHelpChannelMessage(
        configuration,
        m.id
      );

      this.waitForReactions(configuration, m);
    }

    await this.resetReactions(configuration, m);

    //await m.react(configuration.reactionEmoticon);
  }

  async resetReactions(configuration, helpChannelReactionMessage) {
    await helpChannelReactionMessage.reactions.removeAll();

    for (var i = 0; i < configuration.topics.length; i++) {
      var topic = configuration.topics[i];

      await helpChannelReactionMessage.react(topic.reactionEmoji);
    }
  }
}

module.exports = HelpChannelReactionManager;
