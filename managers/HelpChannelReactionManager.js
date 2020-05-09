const Discord = require("discord.js");
var TicketChannelManager = require("./TicketChannelManager");
const GuildConfigurationRepository = require("../database/repositories/GuildConfigurationRepository");

class HelpChannelReactionManager {
  constructor() {}

  async recoverWaitForReactions(client) {
    var guildConfigurations = await GuildConfigurationRepository.getAll();

    guildConfigurations.forEach(async (c) => {
      var guild = client.guilds.resolve(c.guild);

      if (guild) {
        var channel = guild.channels.resolve(c.helpChannel);

        if (channel) {
          var message = await channel.messages.fetch(c.helpChannelMessage, true);

          if (message) {
            this.waitForReactions(c, message, client);
          }
        }
      }
    });
  }

  async waitForReactions(configuration, helpChannelReactionMessage) {
    const filter = (reaction, user) => true;

    const reactionCollector = helpChannelReactionMessage.createReactionCollector(
      filter
    );
    reactionCollector.on("collect", async (r) => {
      r.users.cache.array().forEach(async u => {

        if (u.id != r.client.user.id)
        {
          console.log(r);

          var ticketChannelManager = new TicketChannelManager();
          ticketChannelManager.openTicket(
            configuration,
            u,
            r.message.guild
          );

          await helpChannelReactionMessage.reactions.removeAll();
          await helpChannelReactionMessage.react(configuration.reactionEmoticon);
        }
      });
    });    
  }

  async createHelpChannelMessage(configuration, message) {
    var helpChannel = message.guild.channels.cache.find(
      (m) => m.id == configuration.helpChannel
    );
    var embed = new Discord.MessageEmbed({
      title: configuration.helpChannelEmbedTitle,
      description: configuration.helpChannelEmbedText,
    });

    var m = await helpChannel.send(embed);

    await GuildConfigurationRepository.updateHelpChannelMessage(
      configuration,
      m.id
    );

    await m.react(configuration.reactionEmoticon);

    this.waitForReactions(configuration, m);
  }
}

module.exports = HelpChannelReactionManager;
