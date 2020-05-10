const commando = require("discord.js-commando");
const Discord = require("discord.js");
const GuildConfigurationRepository = require("../../database/repositories/GuildConfigurationRepository");

module.exports = class SetupCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: "role",
      group: "tickets",
      memberName: "role",
      description: "Add permission to group",
      examples: [
        "t?role add support @role",
        "t?role add admin @role",
        "t?role remove admin @role",
      ],
      guildOnly: true,
      args: [
        {
          key: "action",
          prompt: "Action type (add or remove)",
          type: "string",
          oneOf: ["add", "remove"],
        },
        {
          key: "type",
          prompt: "Permission type (support or admin)",
          type: "string",
          oneOf: ["support", "admin"],
        },
        {
          key: "role",
          prompt: "Which role?",
          type: "role",
        },
      ],
    });
  }

  async run(msg, { type, action, role }) {
    if (
      msg.member.hasPermission("ADMINISTRATOR") ||
      msg.member.hasPermission("MANAGE_GUILD") ||
      await GuildConfigurationRepository.isAdmin(msg)
    ) {
      var guildConfiguration = await GuildConfigurationRepository.get(
        msg.guild.id
      );

      if (guildConfiguration) {
        if (action == "add") {
          await GuildConfigurationRepository.addRolePermission(
            msg.guild.id,
            type,
            role.id
          );

          msg.react("✅");
        }
      } else msg.reply("This guild is not configured yet. Please run `t?setup`");
    } else msg.reply("No permissions to perform this command");
  }
};
