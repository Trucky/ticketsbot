const commando = require("discord.js-commando");
const Discord = require("discord.js");
const GuildConfigurationRepository = require("../../database/repositories/GuildConfigurationRepository");
const TicketRepository = require("../../database/repositories/TicketRepository");
const moment = require('moment');

module.exports = class SetupCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: "logs",
      group: "tickets",
      memberName: "logs",
      description: "Get ticket logs",
      examples: [
        "t?logs 1",
      ],
      guildOnly: true,
      args: [
        {
          key: "ticketNumber",
          prompt: "Which ticket number?",
          type: "integer",
        },
      ],
    });
  }

  async run(msg, { ticketNumber }) {
    if (
      msg.member.hasPermission("ADMINISTRATOR") ||
      msg.member.hasPermission("MANAGE_GUILD") ||
      await GuildConfigurationRepository.isAdmin(msg) ||
      await GuildConfigurationRepository.isSupport(msg)
    ) {
      var guildConfiguration = await GuildConfigurationRepository.get(
        msg.guild.id
      );

      if (guildConfiguration) {
          var ticket = await TicketRepository.getByTicketNumber(msg.guild.id, ticketNumber);

          if (ticket)
          {
              if (ticket.logs.length > 0)
              {
                var text = "```" + ticket.logs.map(m => {
                    return moment(m.timestamp).format('DD-MM-YYYY hh:mm a') + " - " + m.authorName + " > " + m.content;
                }).join('\n') + "```";

                msg.channel.send(text);
              }
              else
                msg.channel.send('No messages sent for this ticket');
          }
          else
            msg.reply('No ticket found');
      }
        
    } else msg.reply("No permissions to perform this command");
  }
};
