const Discord = require("discord.js");
var HelpChannelReactionManager = require("./HelpChannelReactionManager");
const GuildConfigurationRepository = require('../database/repositories/GuildConfigurationRepository');

const setupMessages = [
  { type: "helpChannel", text: "Set the help channel" },
  {
    type: "helpChannelEmbedTitle",
    text: "Set the help channel message embed title",
  },
  {
    type: "helpChannelEmbedText",
    text: "Set the help channel message embed text",
  },
  { type: "reactionEmoticon", text: "Set the reaction emoticon" },
  {
    type: "supportLogChannel",
    text: "Set the channel where support log will be sent",
  },
  {
    type: "ticketChannelCategory",
    text: "Set the channel category where tickets channel will be created",
  },
];

class SetupManager {
  constructor() {}

  async setup(originalMessage) {
    var configuration = {
      guild: originalMessage.guild.id,
      helpChannel: "",
      helpChannelEmbedText: "",
      reactionEmoticon: "",
      ticketsChannelCategory: "",
      helpChannelMessage: "",
      helpChannelEmbedTitle: "",
      supportLogChannel: ""
    };

    const collector = new Discord.MessageCollector(
      originalMessage.channel,
      (m) =>
        m.author.id == originalMessage.author.id &&
        m.channel.id == originalMessage.channel.id
    );

    originalMessage.channel.send(setupMessages[0].text);

    var currentResponse = 0;

    collector.on("collect", async (collectedMessage) => {
      console.log(collectedMessage);

      if (collectedMessage.content == "cancel") {
        collectedMessage.channel.send("Setup canceled");
        collector.stop("canceled");
        return;
      }

      switch (setupMessages[currentResponse].type) {
        case "helpChannel":
          if (collectedMessage.mentions.channels.size > 0) {
            currentResponse++;

            collectedMessage.react("✅");

            collectedMessage.channel.send(setupMessages[currentResponse].text);

            configuration.helpChannel = collectedMessage.mentions.channels.array()[0].id;
          } else {
            msg.channel.send("Mention a channel with #");
          }
          break;
        case "helpChannelEmbedTitle":
          currentResponse++;

          collectedMessage.react("✅");

          collectedMessage.channel.send(setupMessages[currentResponse].text);

          configuration.helpChannelEmbedTitle = collectedMessage.content;

          break;
        case "helpChannelEmbedText":
          currentResponse++;

          collectedMessage.react("✅");

          collectedMessage.channel.send(setupMessages[currentResponse].text);

          configuration.helpChannelEmbedText = collectedMessage.content;

          break;
        case "reactionEmoticon":
          currentResponse++;

          collectedMessage.react("✅");

          collectedMessage.channel.send(setupMessages[currentResponse].text);

          configuration.reactionEmoticon = collectedMessage.content;

          break;
        case "supportLogChannel":
          currentResponse++;

          collectedMessage.react("✅");

          collectedMessage.channel.send(setupMessages[currentResponse].text);

          configuration.supportLogChannel = collectedMessage.mentions.channels.array()[0].id;

          break;
        case "ticketChannelCategory":
          collectedMessage.react("✅");

          collectedMessage.channel.send("Setup completed");

          let category = collectedMessage.guild.channels.cache.find(
            (c) =>
              c.name.toLowerCase() == collectedMessage.content.toLowerCase() &&
              c.type == "category"
          );

          if (!category) collectedMessage.channel.send("Category not found");
          else {
            configuration.ticketsChannelCategory = category.id;

            collector.stop();

            await GuildConfigurationRepository.createOrUpdate(configuration);

            var helpChannelReactionManager = new HelpChannelReactionManager();
            helpChannelReactionManager.createHelpChannelMessage(
              configuration,
              collectedMessage
            );
          }
          break;
      }
    });
  }
}

module.exports = SetupManager;
