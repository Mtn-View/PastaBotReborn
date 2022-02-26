const { SlashCommandBuilder, SlashCommandUserOption } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { clientId, guildId } = require('./config.json')
const { token } = require('./auth.json')

const ownerIds = [ 158763732254588928, 221753632566018061 ] // Aquahawk, CharlesKaup

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	new SlashCommandBuilder().setName('pasta').setDescription('Toggles Pasta Mode?'),
	new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Rolls some dice, maybe.') // dice / stats subcommands instead of formula
		.addStringOption(option =>
			option.setName('formula')
				.setDescription("The dice formula to roll. Either `xdy` or `stats`.")
				.setRequired(true))
		.addStringOption(option =>
			option.setName('name')
				.setDescription('A name for these stats'))
		.addBooleanOption(option =>
			option.setName('verbose')
				.setDescription('Show each dice roll, not just the totals.'))
		.addBooleanOption(option =>
			option.setName('hidden')
				.setDescription('The dice roll will be only visible to you.')),
	new SlashCommandBuilder()
		.setName('secret')
		.setDescription('Facilitate drawing "secrets" from a deck.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('draw')
				.setDescription('Draw a secret from the deck')
				.addIntegerOption(option =>
					option.setName('quantity')
						.setDescription('Number of secrets to draw')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('redraw')
				.setDescription('Returns all secrets to the deck, and draws new ones.')
				.addIntegerOption(option =>
					option.setName('quantity')
						.setDescription('Number of secrets to draw after returning the rest to the deck.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('return')
				.setDescription('Return all of your owned secrets to the deck.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('count')
				.setDescription('Returns the number of secrets you have.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('enable')
				.setDescription('(Admin Only) Whether to enable secret draws.')
				.addBooleanOption(option =>
					option.setName('enable')
						.setDescription('Whether to enable or disable secret draws.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reset')
				.setDescription('(Admin Only) Returns all secrets to the deck.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('load')
				.setDescription('(Admin Only) Loads an exported up secret file.')
				.addStringOption(option =>
					option.setName('filename')
						.setDescription('The name of the file to load.')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('save')
				.setDescription('(Admin Only) Saves a secret file')
				.addStringOption(option =>
					option.setName('filename')
						.setDescription('The name of the file to save.')),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('remaining')
				.setDescription('(Admin Only) Returns the amount of secrets remaining in the deck'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('all')
				.setDescription(`(Admin Only) Reveal everyone's secrets`)),
	// TODO: Add the rest
	new SlashCommandBuilder().setName('help').setDescription('Gives help, maybe.'),
	new SlashCommandBuilder().setName('server').setDescription('Shows server info.'),
	new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get info about a user or a server!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user')),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server')),
	/* 	new SlashCommandBuilder()
		.setName('music-trivia')
		.setDescription(`Doesn't start Music Trivia. This is only here for testing.`)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Adds a song to the music trivia list')
				.addUserOption(option => option.setName('url').setDescription("The YouTube URL for the song"))
				.addUserOption(option => option.setName('Artist').setDescription("The song's artist"))
				.addUserOption(option => option.setName('Title').setDescription("The song's title")),
		), */
	new SlashCommandBuilder()
		.setName('music-trivia')
		.setDescription('Music Trivia')
		.addSubcommand(subcommand =>
			subcommand
				.setName('play')
				.setDescription('Engage in a music quiz with your friends!')
				.addStringOption(option =>
					option
						.setName('length')
						.setDescription('How many songs would you like the trivia to have?'),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('add')
				.setDescription('Adds a song to the music trivia list.')
				.addStringOption(option => option.setName('url').setDescription("The YouTube URL for the song"))
				.addStringOption(option => option.setName('artist').setDescription("The song's artist"))
				.addStringOption(option => option.setName('title').setDescription("The song's title")),
		),
]
	.map(command => command.toJSON())

const rest = new REST({ version: '9' }).setToken(token)

// rest.get(Routes.applicationGuildCommands(clientId, guildId))
// 	.then(data => {
// 		const promises = []
// 		for (const command of data) {
// 			const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`
// 			promises.push(rest.delete(deleteUrl))
// 		}
// 		return Promise.all(promises)
// 	})

// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
// 	.then(() => console.log('Successfully registered application commands.'))
// 	.catch(console.error)
