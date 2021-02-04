const Discord = require("discord.js");
const TicketRepository = require("../database/repositories/TicketRepository");
const GuildConfigurationRepository = require("../database/repositories/GuildConfigurationRepository");

class TicketChannelManager {
  constructor() {}

  async openTicket(user, guild, selectedTopic) {
    var configuration = await GuildConfigurationRepository.get(guild.id);

    var allTicketsCount = await TicketRepository.countAll(guild.id);
    var nextTicket = allTicketsCount + 1;

    const everyone = guild.roles.cache.find((r) => r.name == "@everyone");

    var mentions = [
      `<@${user.id}>`
    ];

    var permissionOverwrites = [
      {
        id: user.id,
        allow: [
          "SEND_MESSAGES",
          "VIEW_CHANNEL",
          "ADD_REACTIONS",
          "ATTACH_FILES",
        ],
      },
      {
        id: everyone.id,
        deny: ["VIEW_CHANNEL"],
      },
    ];

    configuration.usersPermissions.forEach((m) => {

      mentions.push(`<@${m.id}>`);

      permissionOverwrites.push({
        id: m.id,
        allow: [
          "MANAGE_CHANNELS",
          "SEND_MESSAGES",
          "VIEW_CHANNEL",
          "ADD_REACTIONS",
          "ATTACH_FILES",
          "EMBED_LINKS",
        ],
      });
    });

    configuration.rolesPermissions.filter(m => m.topicEmojii == selectedTopic.reactionEmoji).forEach((m) => {
      
      mentions.push(`<@&${m.id}>`);

      permissionOverwrites.push({
        id: m.id,
        allow: [
          "MANAGE_CHANNELS",
          "SEND_MESSAGES",
          "VIEW_CHANNEL",
          "ADD_REACTIONS",
          "ATTACH_FILES",
          "EMBED_LINKS",
        ],
      });
    });

    var channel = await guild.channels.create("#ticket-" + nextTicket + '-' + user.username, {
      type: "text",
      topic: `Ticket #${nextTicket} created by ${user.username} - Topic: ${selectedTopic.topicName}`,
      parent: configuration.ticketsChannelCategory,
      permissionOverwrites: permissionOverwrites,
    });

    var initialEmbed = new Discord.MessageEmbed({
      title: "Welcome to the " + guild.name + " Help channel!",
      description:
        "You have opened a new ticket.\nA member of our team will be in touch shortly.",
    });

    initialEmbed.fields.push({ name: "Opened by", value: `<@${user.id}>` });

    initialEmbed.fields.push({ name: "Topic", value: `${selectedTopic.reactionEmoji} ${selectedTopic.topicName}` });

    initialEmbed.fields.push({
      name: "Knowledge Base",
      value: "https://truckyapp.com/kb/",
    });

    initialEmbed.fields.push({
      name: "Need support in your language?",
      value: "Add your language flag as reaction to this message",
    });

    initialEmbed.fields.push({
      name: "Rules",
      value:
        "We offer support as best effort, please don't mention anyone from the staff, we'll get to you as soon as possible",
    });

    var initialMessage = await channel.send(initialEmbed);

    var ticket = await TicketRepository.create({
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

    await this.sendOpeningTicketSupportLog(initialMessage.guild, ticket);

    var everyOneMessage = await channel.send(mentions.join(' '));

    await everyOneMessage.delete();

    this.waitForReactions(initialMessage);

    this.waitForMessages(channel);
  }

  async waitForReactions(message) {
    const filter = (reaction, user) => true;

    const reactionCollector = message.createReactionCollector(filter);
    reactionCollector.on("collect", async (r) => {
      r.users.cache.array().forEach(async (u) => {
        if (u.id != r.client.user.id) {
          //console.log(r);

          if (r.emoji.name == "🔒") {
            reactionCollector.stop();

            this.closeTicket(message, u);
          }
        }
      });
    });
  }

  async closeTicket(message, user) {
    var ticket = await TicketRepository.getByChannel(
      message.guild.id,
      message.channel.id
    );

    ticket = await TicketRepository.close(
      message.guild.id,
      message.channel.id,
      user.username
    );

    var user = message.client.users.resolve(ticket.author);

    if (user) {
      try {
        var dmChannel = await user.createDM();

        await dmChannel.send(
          "Ticket #" +
            ticket.number.toString() +
            " has been closed. Thank you for contacting " +
            message.guild.name
        );
      } catch (ex) {
        console.error(ex);
      }
    }

    this.sendClosingTicketSupportLog(message.guild, ticket);

    await message.channel.delete();
  }

  async sendOpeningTicketSupportLog(guild, ticket) {
    var configuration = await GuildConfigurationRepository.get(guild.id);

    var embed = new Discord.MessageEmbed();
    embed.setTitle("Ticket #" + ticket.number + " has been created");
    embed.addField("Author", ticket.authorName);
    embed.setTimestamp(new Date());

    await guild.channels.resolve(configuration.supportLogChannel).send(embed);
  }

  async sendClosingTicketSupportLog(guild, ticket) {
    var configuration = await GuildConfigurationRepository.get(guild.id);

    var embed = new Discord.MessageEmbed();
    embed.setTitle("Ticket #" + ticket.number + " has been closed");
    embed.addField("Author", ticket.authorName);
    embed.addField("Closed by", ticket.closedBy);
    embed.setTimestamp(new Date());

    await guild.channels.resolve(configuration.supportLogChannel).send(embed);
  }

  async recoverWaitForReactions(client) {
    var openTickets = await TicketRepository.getAllOpen();

    openTickets.forEach(async (c) => {
      var guild = client.guilds.resolve(c.guild);

      if (guild) {
        var channel = guild.channels.resolve(c.channel);

        if (channel) {
          this.waitForMessages(channel);

          try
          {
            var message = await channel.messages.fetch(c.bannerMessage, true);

            if (message && message.constructor.name != "Collection") {
              this.waitForReactions(message);
            }
          }
          catch (ex)
          {
            console.error(ex);
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
