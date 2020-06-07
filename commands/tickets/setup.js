const commando = require("discord.js-commando");
const Discord = require("discord.js");
var SetupManager = require("../../managers/SetupManager");

module.exports = class SetupCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: "setup",
      group: "tickets",
      memberName: "setup",
      description: "Setup the bot",
      examples: ["t?setup" ],
      userPermissions: ['ADMINISTRATOR', 'MANAGE_GUILD'],
      guildOnly: true,
    });
  }

  async run(msg) {
    var setupManager = new SetupManager();
    setupManager.setup(msg);
  }
};
