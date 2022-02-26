/* eslint-disable no-case-declarations */
const Discord = require('discord.js')
// const logger = require('winston');
const auth = require('./auth.json')
const { prefix, guildId } = require('./config.json')
const index = require('./index.js')
const secret = require('./secret.js')
const roll = require('./roll.js')

const intents = new Discord.Intents([ 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS' ])
// Initialize Discord Bot client
const bot = new Discord.Client({ intents })

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

bot.on('interactionCreate', async interaction => {
	// console.log(interaction)
	if (!interaction.isCommand()) {
		return
	}

	const { commandName, user } = interaction

	switch (commandName) {
		case 'ping':
			await interaction.reply(`That's pretty pongers, bro.`)
			break
		case 'server':
			await interaction.reply(`Server name: ${interaction.guild.name}. Total members: ${interaction.guild.memberCount}`)
			break
		case 'roll':
			await interaction.reply({
				...roll({ // switch this to spread and not just do content for consistency
					formula: interaction.options.getString('formula'),
					name: interaction.options.getString('name'),
					verbose: interaction.options.getBoolean('verbose'),
					user,
				}),
				ephemeral: interaction.options.getBoolean('hidden'),
			})
			break
		case 'secret':
			const secretToSend = await secret({
				subcommand: interaction.options.getSubcommand(),
				enable: interaction.options.getBoolean('enable'),
				filename: interaction.options.getString('filename'),
				quantity: interaction.options.getInteger('quantity'),
				user,
			})
			await interaction.reply({
				...secretToSend,
				ephemeral: true,
			})
			break
		case 'pasta':
			await interaction.reply({ content: 'This is not the pasta you are looking for.' })
			break
		case 'music-trivia':
			await interaction.reply({})
			break
		case 'help':
			await interaction.reply({ content: 'All hope is lost' })
	}
})

bot.on('messageCreate', message => {
	let messageString = message.content // the string containing the message content
	let ch = message.channel // stores the channel that the command message was sent in
	let isOwner = index.checkOwner(message.author.id)
	console.log(messageString, ch.toString())
	if (messageString.substring(0, 1) === prefix) { // check for the prefix specified in config.json
		let args = messageString.substring(1).split(' ') // indivual arguments of the command
		let cmd = args[0] // first word = command
		args = args.splice(1) // remove used argument from args array
		// Big chungus switch statement owo
		switch (cmd) {
			case 'ping':
				ch.send({ content: 'That\'s pretty pongers, bro' })
				break
				// Just add any case commands if you want to..
			case 'pasta':
				ch.send({ content: 'Pasta machine broke. Blame DadBot.' })
				break
			case 'roll':
				roll.catchCommand(bot, message, args)
				break
			case 'rollstats':
				ch.send({ content: `Command \`rollstats\` deprecated, please use \`roll stats\` instead.` })
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
				// eslint-disable-next-line no-case-declarations
				const taggedUser = message.mentions.users.first()
				ch.send({ content: `Sorry, ${taggedUser}, but you just got nae nae'd.` })
				break
			case 'sus':
				message.delete()
				ch.send({ content: `sus` })
				break
			case 'template':
				ch.send({ content: '' })
				break
			case 'help':
				ch.send({ content: 'README.md on GitHub: https://github.com/Mtn-View/PastaBotReborn/blob/master/README.md \n(source code almost certainly out of date)' })
				break
			default:
				ch.send({ content: `Unknown command \`${cmd}\`` })
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
