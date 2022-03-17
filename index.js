const Discord = require('discord.js')
const fs = require('fs')
const auth = require('./auth.json')
const { prefix, guildId } = require('./config.json')

const intents = new Discord.Intents([ 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS' ])
// Initialize Discord Bot client
const client = new Discord.Client({ intents })
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && !file.endsWith('_old.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

//Login, yee haw
client.login(process.argv[2] === 'dev' ? auth.token : auth.prodToken)

client.once('ready', () => {
	console.log('Connected')
	console.log(`Logged in as: ${client.user.tag}`)
	if (process.argv[2] === 'dev') {
		client.user.setPresence({
			status: 'dnd',
			activity: {
				name: 'with the code, expect unstable performance while developing.',
				type: 'PLAYING',
			},
		})
		console.log("Running in development mode.")
	} else {
		client.user.setPresence({
			status: 'online',
			activity: {
				name: 'the call of the void',
				type: 'LISTENING',
			},
		})
		console.log("Running in production :clown: mode")
	}
})

client.on('interactionCreate', async interaction => {
	interaction.deferReply()
	if (interaction.type === 'APPLICATION_COMMAND') {
		const { commandName } = interaction
		const command = client.commands.get(commandName)

		try {
			return await command.execute(interaction)
		} catch (error) {
			console.error(error)
			return interaction.followUp({ content: 'Error executing command', ephemeral: true })
		}
	}
})
