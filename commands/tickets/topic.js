const commando = require("discord.js-commando");
const Discord = require("discord.js");
const GuildConfigurationRepository = require("../../database/repositories/GuildConfigurationRepository");
const HelpChannelReactionManager = require("../../managers/HelpChannelReactionManager");

module.exports = class SetupCommand extends commando.Command {
  constructor(client) {
    super(client, {
      name: "topic",
      group: "tickets",
      memberName: "topic",
      description: "Add topics",
      examples: ["t?topic"],
      userPermissions: ["ADMINISTRATOR", "MANAGE_GUILD"],
      guildOnly: true,
      args: [
        {
          key: "action",
          prompt: "Action type (add or remove)",
          type: "string",
          oneOf: ["add", "remove"],
        },
        {
          key: "emojii",
          prompt: "Emojii to add or remove",
          type: "string",
        },
        {
          key: "topic",
          prompt: "Topic description",
          type: "string",
        },
      ],
    });
  }

  async run(msg, { action, emojii, topic }) {
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
          await GuildConfigurationRepository.addTopic(
            msg.channel.guild.id,
            emojii,
            topic
          );

          var helpChannelMessage = await new HelpChannelReactionManager().fetchHelpChannelMessage(
            msg.client,
            guildConfiguration
          );

          if (helpChannelMessage) {
            await helpChannelMessage.react(emojii);
          }

          msg.react("✅");
        }
      } else
        msg.reply("This guild is not configured yet. Please run `t?setup`");
    } else msg.reply("No permissions to perform this command");
  }
};
