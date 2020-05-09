const commando = require("discord.js-commando");
const Discord = require("discord.js");
var TicketChannelManager = require("../../managers/TicketChannelManager");

module.exports = class SetupCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: "close",
      group: "tickets",
      memberName: "close",
      description: "Close the ticket",
      examples: [ "t?close" ],
      guildOnly: true,
    });
  }

  async run(msg, args) {
    var ticketChannelManager = new TicketChannelManager();
    ticketChannelManager.closeTicket(msg);
  }
};
