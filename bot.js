const Discord = require('discord.io');
const logger = require('winston');
const auth = require('./auth.json');
const { prefix } = require('./config.json');
const index = require('./index.js');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
const bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `$`
    if (message.substring(0, 1) === prefix) {
        let args = message.substring(1).split(' '); //arguments
        let cmd = args[0]; // cmd is first argument only
       
        args = args.splice(1);
        switch(cmd) {
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;
            // Just add any case commands if you want to..
			case 'pasta':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pasta machine broke. Blame DadBot.'
                });
            break;
			case 'd6':
				let roll = index.rolldx(6)
                bot.sendMessage({
                    to: channelID,
                    message: 'Here\'s a d6: ' + roll
                });
			case '4d6': // more modular. Really just a test command.
				let rollObj = index.rollxdy(4,6);
				let rolls = rollObj.rolls;
                bot.sendMessage({
                    to: channelID,
                    message: 'Here\'s 4d6 using modular-ish code: ' + rolls[0] + ' ' + rolls[1] + ' ' + rolls[2] + ' ' + rolls[3]
                });
            break;
			case '4d6drop1': // more modular. Really just a test command.
                bot.sendMessage({
                    to: channelID,
                    message: index.rollxdydropz(4,6,1).sum
                });
            break;
			case 'rollstats': // later feature: suggest class based on rolls? TODO: Debug mode that shows the whole shebang, not just the final numbers
				let statArray = index.rollArray(6)
				console.log(statArray);
				let out = '';
				for(let i = 0; i < 6; i++){
					out += statArray[i].sum + ' ';
				}
                bot.sendMessage({
                    to: channelID,
                    message: out
                });
            break;
			case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'You think you need help? This bot can\'t do shit!'
                });
            break;
         }
     }
});