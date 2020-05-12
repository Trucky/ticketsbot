const Commando = require("discord.js-commando");
const path = require("path");
const sqlite = require("sqlite");
const argv = require("yargs").argv;
const mongoose = require("mongoose");
const sqlite3 = require("sqlite3");
var HelpChannelReactionManager = require("./managers/HelpChannelReactionManager");
var TicketChannelManager = require("./managers/TicketChannelManager");

if (argv.dev) require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const client = new Commando.Client({
      owner: process.env.OWNER_ID,
      commandPrefix: "t?",
      disableEveryone: false
    });

    client.registry
      // Registers your custom command groups
      .registerGroups([["tickets", "Tickets commands"]])

      // Registers all built-in groups, commands, and argument types
      .registerDefaults()

      // Registers all of your commands in the ./commands/ directory
      .registerCommandsIn(path.join(__dirname, "commands"));

    sqlite
      .open({
        filename: path.join(__dirname, "settings.sqlite3"),
        driver: sqlite3.Database,
      })
      .then((db) => {
        client.setProvider(new Commando.SQLiteProvider(db));
      });

    client.on("ready", () => {
      var helpChannelReactionManager = new HelpChannelReactionManager();
      helpChannelReactionManager.recoverWaitForReactions(client);

      var ticketChannelManager = new TicketChannelManager();
      ticketChannelManager.recoverWaitForReactions(client);
    });

    client.login(process.env.BOT_TOKEN);
  });
