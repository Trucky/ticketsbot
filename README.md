# Tickets Bot for Discord
This is the bot used in Trucky Discord server to offer support. It exposes simple and quick feature to be configured via Discord messages.

Has been created because all others supports bot for Discord contains too much simple features, are not enough stable or good features are paid.

## Development

`git clone https://github.com/Trucky/ticketsbot.git`

`npm install`

`npm run dev`

## Discord configuration

Administrators and server managers have to run `t?setup` to starts the configuration. The bot will ask various questions to configure the first message to show in support channel and the reaction to which users must react to open a ticket.

## Features

When configured, the bot create an initial message embed with a title, a description and a reaction to which users have to react to open a ticket.

Opening a ticket, creates a channel under the Tickets category, adding ticket creator with basic permissions and Admin\Supports people with manage channel permissions.

In the ticket channel, the bot creates an intial message with embed with a message and a reaction (a locker) to which people may react to close the ticket. A ticket could be closed also with `t?close`.

## Commands

`t?setup` > Starts the bot setup 

`t?close` > Sent in a ticket channel, closes the ticket

`t?role <add|remove> <admin|support> @role` > Adds role as bot admin or support

`t?user <add|remove> <admin|support>` @user > Adds user as bot admin or support

`t?logs <ticket number>` > Shows conversation logs for given ticket number