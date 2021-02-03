const Discord = require("discord.js");
var TicketChannelManager = require("./TicketChannelManager");
const GuildConfigurationRepository = require("../database/repositories/GuildConfigurationRepository");
const TicketRepository = require("../database/repositories/TicketRepository");

class HelpChannelReactionManager {
  constructor() { }

  async fetchHelpChannelMessage(client, c) {
    var message = null;

    var guild = client.guilds.resolve(c.guild);

    if (guild) {
      var channel = guild.channels.resolve(c.helpChannel);

      if (channel) {
        try {
          message = await channel.messages.fetch(c.helpChannelMessage, true);
        }
        catch (ex) {
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
      if (message != null) {
        this.waitForReactions(c, message);
      }
    });
  }

  async waitForReactions(configuration, helpChannelReactionMessage) {
    const filter = (reaction, user) => true;

    const reactionCollector = helpChannelReactionMessage.createReactionCollector(
      filter
    );
    reactionCollector.on("collect", (r) => {
      this.manageReaction(r);
    });
  }

  async manageReaction(reaction) {

    var users = (await reaction.users.fetch()).array().filter(m => m.id != reaction.client.user.id);

    for (var i = 0; i < users.length; i++) {
      var user = users[i];

      await reaction.users.remove(user);

      // reload current guild configuration
      var configuration = await GuildConfigurationRepository.get(
        reaction.message.guild.id
      );

      // check if user has already a ticket open in this guild
      const ticketOpenBySameUser = await TicketRepository.getOpenTicketByUser(reaction.message.guild.id, user.id);

      if (ticketOpenBySameUser == null) {
        //await this.resetReactions(configuration, helpChannelReactionMessage);

        var selectedTopic = configuration.topics.find(
          (m) => m.reactionEmoji == reaction.emoji.name
        );

        if (selectedTopic) {
          var ticketChannelManager = new TicketChannelManager();
          ticketChannelManager.openTicket(user, reaction.message.guild, selectedTopic);
        }
      }
    }
  }

  async createHelpChannelMessage(configuration, message) {
    var helpChannel = message.guild.channels.cache.find(
      (m) => m.id == configuration.helpChannel
    );

    var m = null;

    if (configuration.helpChannelMessage) {
      try {
        m = await helpChannel.messages.fetch(configuration.helpChannelMessage);
      }
      catch (ex) {
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
