const commando = require("discord.js-commando");
const Discord = require("discord.js");
const GuildConfigurationRepository = require("../../database/repositories/GuildConfigurationRepository");

module.exports = class SetupCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: "user",
      group: "tickets",
      memberName: "user",
      description: "Add permission to user",
      examples: [
        "t?user add support @user",
        "t?user add admin @user",
        "t?user remove admin @user",
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
          key: "user",
          prompt: "Which user?",
          type: "user",
        },
        {
          key: "topicEmojii",
          prompt: "Which topic emojii this user must reply to?",
          type: "string",
        },
      ],
    });
  }

  async run(msg, { type, action, user, topicEmojii }) {
    if (
      msg.member.hasPermission("ADMINISTRATOR") ||
      msg.member.hasPermission("MANAGE_GUILD") ||
      (await GuildConfigurationRepository.isAdmin(msg))
    ) {
      var guildConfiguration = await GuildConfigurationRepository.get(
        msg.guild.id
      );

      if (guildConfiguration) {
        if (action == "add") {
          await GuildConfigurationRepository.addUserPemission(
            msg.guild.id,
            type,
            user.id,
            topicEmojii
          );

          msg.react("✅");
        }
      } else
        msg.reply("This guild is not configured yet. Please run `t?setup`");
    }
  }
};
