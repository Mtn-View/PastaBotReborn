/* eslint-disable indent */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-case-declarations */
const Discord = require('discord.js')
// const logger = require('winston');
const auth = require('./auth.json')
const { prefix } = require('./config.json')
const index = require('./index.js')
const secret = require('./secret.js')
const roll = require('./roll.js')

// // Configure logger settings
// logger.remove(logger.transports.Console);
// logger.add(new logger.transports.Console, {
//     colorize: true
// });
// logger.level = 'debug';

// Initialize Discord Bot client
const bot = new Discord.Client()

bot.once('ready', () => {
	console.log('Connected')
	console.log(`Logged in as: ${bot.user.tag}`)
	if (process.argv[2] === 'dev') {
		console.log("Running in: Development mode.")
		bot.user.setPresence({
			status: 'dnd',
			activity: {
				name: 'with the code, expect unstable performance while developing.',
				type: 'PLAYING',
			},
		})
	} else {
		console.log("Running in: Uhh... Normal? mode.")
		bot.user.setPresence({
			status: 'online',
			activity: {
				name: 'the call of the void',
				type: 'LISTENING',
			},
		})
	}
})

//Login, yee haw
bot.login(auth.token)
/*
        (message.substring(0, 1) === prefix) {
        let args = message.substring(1).split(' '); //arguments
        let cmd = args[0]; // cmd is first argument only
        */
bot.on('message', message => {
	let messageString = message.content // the string containing the message content
	let ch = message.channel // stores the channel that the command message was sent in
	let isOwner = index.checkOwner(message.author.id)
	if (messageString.substring(0, 1) === prefix) { // check for the prefix specified in config.json
		let args = messageString.substring(1).split(' ') // indivual arguments of the command
		let cmd = args[0] // first word = command
		args = args.splice(1) // remove used argument from args array
		// Big chungus switch statement owo
		switch (cmd) {
			case 'ping':
				ch.send('That\'s pretty pongers, bro')
				break
				// Just add any case commands if you want to..
			case 'pasta':
				ch.send('Pasta machine broke. Blame DadBot.')
				break
			case 'roll':
				roll.catchCommand(bot, message, args)
				break
			case 'rollstats':
				ch.send(`Command \`rollstats\` deprecated, please use \`roll stats\` instead.`)
				args.unshift('stats')
				roll.catchCommand(Discord, message, args)
				break
			case 'secret':
			case 'secrets':
                secret.catchCommand(Discord, message, args)
				break
			case 'idtest':
					// This shit don't work
					// index.getNicknameByID(message, message.author.id)
					// 	.then(console.log)
					console.log(secret.getAllClaimedSecretIDs())
					console.log(index.getNicknameByGuildMember(message.member))
					break
			case 'memberstest':
					// index.printAllGuildMembers(message).then(m => {
					// 	console.log(m)
					// })
					message.guild.members.fetch()
						.then(console.log)
					break
			case 'naenae':
				const taggedUser = message.mentions.users.first()
				ch.send(`Sorry, ${taggedUser}, but you just got nae nae'd.`)
				break
			case 'sus':
                message.delete()
				ch.send(`sus`)
				break
			case 'template':
				ch.send('')
				break
			case 'help':
				ch.send('README.md on GitHub: https://github.com/Mtn-View/PastaBotReborn/blob/master/README.md \n(source code almost certainly out of date)')
				break
			default:
				ch.send(`Unknown command \`${cmd}\``)
		}
	}
})
/*
bot.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel
    let oldUserChannel = oldMember.voiceChannel

    if(oldUserChannel === undefined && newUserChannel !== undefined) {
       // User Joins a voice channel

    } else if(newUserChannel === undefined){
      // User leaves a voice channel

    }
  })

*/

//$pasta x x x
// reset @someone / all
// set @someone (admin only)
//
