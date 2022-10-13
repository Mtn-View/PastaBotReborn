const Discord = require('discord.js')
const fs = require('fs')
const auth = require('./auth.json')
const { prefix, guildId } = require('./config.json')
const db = require('./tools/db')

const IS_DEV = process.argv[2] === 'dev'

const intents = [
	Discord.GatewayIntentBits.Guilds,
	Discord.GatewayIntentBits.GuildMembers,
	Discord.GatewayIntentBits.GuildMessages,
	Discord.GatewayIntentBits.GuildMessageReactions,
	Discord.GatewayIntentBits.DirectMessages,
	Discord.GatewayIntentBits.DirectMessageReactions,
]
// Initialize Discord Bot client
const client = new Discord.Client({ intents })
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && !file.endsWith('_old.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	if (IS_DEV || !command.dev) {
		client.commands.set(command.name, command)
	}
}

//Login, yee haw
client.login(process.argv[2] === 'dev' ? auth.token : auth.prodToken)
db.initializeDatabase().then(() => console.log("Initialized database"))

client.once('ready', () => {
	console.log('Connected')
	console.log(`Logged in as: ${client.user.tag}`)
	if (IS_DEV) {
		client.user.setPresence({
			status: 'dnd',
			activities: [ {
				name: 'with the code.',
				type: 'PLAYING',
			} ],
		})
		console.log("Running in development mode.")
	} else {
		client.user.setPresence({
			status: 'online',
			activities: [ {
				name: 'the call of the void',
				type: 'LISTENING',
			} ],
		})
		console.log("Running in production :clown: mode")
	}
})

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const { commandName } = interaction
		const command = client.commands.get(commandName)
		await interaction.deferReply({ ephemeral: !!command?.isEphemeral?.(interaction) })

		try {
			return await command.execute(interaction)
		} catch (error) {
			console.error(error)
			try {
				return interaction.followUp({ content: 'Error executing command' })
			} catch (err) {
				// Probably just if the message has been followed up already
				console.error(err)
			}
		}
	} else if (interaction.isMessageComponent()) {
		const regex = /(\w+)-(\d+)-(\w+)/
		const [ full, commandName, id, type ] = interaction.customId.match(regex)
		console.log(commandName, id, type)
		const command = client.commands.get(commandName)

		try {
			return await command.executeComponent(interaction, id, type)
		} catch (err) {
			return interaction.followUp({ content: `Error executing ${type} command` })
		}
		// return interaction.followUp({ content: `Message component: ${ commandName } ${id } ${type}`, ephemeral: true })
	}
	return interaction.reply({ content: 'Unknown interaction' })

	/* else if (interaction.isSelectMenu()) {
		console.log('Select', interaction)
		return interaction.followUp({ content: `Selected ${interaction.values.toString()}`, ephemeral: true })
	} else if (interaction.isButton()) {
		console.log('Button', interaction.component.label, interaction)
		return interaction.followUp({ content: `${interaction.component.label} button pressed`, ephemeral: true })
	} */
})
