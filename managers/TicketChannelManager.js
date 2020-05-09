const Discord = require("discord.js");
const TicketRepository = require("../database/repositories/TicketRepository");

class TicketChannelManager {
  constructor() {}

  async openTicket(configuration, user, guild) {
    var allTicketsCount = await TicketRepository.countAll(guild.id);
    var nextTicket = allTicketsCount + 1;

    const everyone = guild.roles.cache.find((r) => r.name == "@everyone");

    var channel = await guild.channels.create("#ticket-" + nextTicket, {
      type: "text",
      topic: "Ticket #" + nextTicket + " created by " + user.name,
      parent: configuration.ticketsChannelCategory,
      permissionOverwrites: [
        {
          id: user.id,
          allow: [
            "SEND_MESSAGES",
            "VIEW_CHANNEL",
            "ADD_REACTIONS",
            "ATTACH_FILES",
            "EMBED_LINKS",
          ],
        },
        {
          id: everyone.id,
          deny: ["VIEW_CHANNEL"],
        },
      ],
    });

    var initialEmbed = new Discord.MessageEmbed({
      title: "You have opened a new ticket.",
      description: "A member of our team will be in touch shortly.",
    });

    var initialMessage = await channel.send(initialEmbed);

    await TicketRepository.create({
      guild: guild.id,
      author: user.id,
      channel: channel.id,
      number: nextTicket,
      authorName: user.username,
      guildName: guild.name,
      status: true,
      bannerMessage: initialMessage.id,
    });

    await initialMessage.react("🔒");

    this.waitForReactions(initialMessage);

    this.waitForMessages(channel);
  }

  async waitForReactions(message) {
    const filter = (reaction, user) => true;

    const reactionCollector = message.createReactionCollector(filter);
    reactionCollector.on("collect", async (r) => {
      r.users.cache.array().forEach(async (u) => {
        if (u.id != r.client.user.id) {
          console.log(r);

          reactionCollector.stop();

          this.closeTicket(message);
        }
      });
    });
  }

  async closeTicket(message) {
    var ticket = await TicketRepository.getByChannel(
      message.guild.id,
      message.channel.id
    );

    await TicketRepository.close(message.guild.id, message.channel.id);

    var user = message.client.users.resolve(ticket.author);

    if (user) {
      var dmChannel = await user.createDM();

      await dmChannel.send(
        "Ticket #" +
          ticket.number.toString() +
          " has been closed. Thank you for contacting " +
          message.guild.name
      );
    }

    await message.channel.delete();
  }

  async recoverWaitForReactions(client) {
    var openTickets = await TicketRepository.getAllOpen();

    openTickets.forEach(async (c) => {
      var guild = client.guilds.resolve(c.guild);

      if (guild) {
        var channel = guild.channels.resolve(c.channel);

        if (channel) {

          this.waitForMessages(channel);

          var message = await channel.messages.fetch(c.bannerMessage, true);

          if (message && message.constructor.name != "Collection") {
            this.waitForReactions(message);
          }
        }
      }
    });
  }

  async waitForMessages(channel) {
    const collector = new Discord.MessageCollector(
      channel,
      (m) => m.channel.id == channel.id
    );

    collector.on("collect", async (collectedMessage) => {
      TicketRepository.insertLog(collectedMessage);
    });
  }
}

module.exports = TicketChannelManager;
