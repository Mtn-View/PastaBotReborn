const { SlashCommandBuilder } = require('discord.js')
const name = 'secret'
const description = 'Facilitate drawing "secrets" from a deck.'
const secretJSONPath = `./secrets/SecretList.json`
const secretBackupJSONPath = `./secrets/SecretListBackup.json`
const util = require('../util.js')
const fs = require('fs')
const Discord = require('discord.js')
const ordinal = require('ordinal')
const db = require('../tools/db.js')
const setting = require('../tools/setting.js')

let totalNumSecrets = 17
// This is just here for now until I figure out what to do with the roll.js exports
function roll1dx(x) {
	return Math.ceil(Math.random() * x)
}

function loadSecretsJSON() {
	// let jsonString = fs.readFileSync(secretJSONPath, `utf8`)
	// let secretListJSON = JSON.parse(jsonString)
	// return secretListJSON
	return util.loadFromJSON(secretJSONPath)
}
function allowSecretDraws(allow) {
	let jsonString = fs.readFileSync(secretJSONPath, `utf8`)
	let secretListJSON = JSON.parse(jsonString)
	if (allow === true) {
		secretListJSON.allowDraws = true
	} else if (allow === false) {
		secretListJSON.allowDraws = false
	}
	util.writeToJSON(secretJSONPath, secretListJSON)
	return secretListJSON.allowDraws
}
async function getRandomSecret(user) {
	let takenByID = user.id
	let secretListJSON = loadSecretsJSON()
	// Only return a secret if drawing secrets is allowed.
	if (secretListJSON.allowDraws === true && secretListJSON.unclaimed > 0) {
		let fileNum = roll1dx(totalNumSecrets) - 1
		let secretObject = secretListJSON.secrets[fileNum]
		// Do not choose a secret that's already taken
		while (secretObject.taken != false && secretListJSON.unclaimed > 0) {
			fileNum = roll1dx(totalNumSecrets) - 1
			secretObject = secretListJSON.secrets[fileNum]
		}
		// mark this secret as taken
		secretListJSON.secrets[fileNum].taken = true
		secretListJSON.unclaimed--
		// record whose secret this is
		secretObject.takenID = takenByID
		// secretObject.takenUsername = index.getNicknameByGuildMember(user)
		secretObject.takenUsername = user.username

		console.log(`${secretListJSON.unclaimed} secrets left unclaimed.`)
		// write out and return
		await util.writeToJSON(secretJSONPath, secretListJSON)
		return secretObject
	}
	// return false if no secrets remaining
	return null
}
async function getSecretForMessage(interaction) {
	const { user } = interaction
	let secretObject = await getRandomSecret(user)
	let numSecretsOwned = getNumberSecretsClaimedByAuthor(interaction)
	if (secretObject) {
		console.log(`secret object:`, secretObject)
		let secretEmbed = new Discord.MessageEmbed()
			.setTitle(secretObject.name)
			.setDescription(secretObject.desc)
		// .attachFiles(`./secrets/${secretObject.path}`)
			.setImage(`attachment://${secretObject.path}`)
		const secretFile = `./secrets/${secretObject.path}`
		// channel.send({ content: `I've sent you your secret... :eyes:` })
		// message.author.send(`You have ${numSecretsOwned} secret(s).`)
		// message.author.send({ embeds: [ secretEmbed ], files: [ secretFile ] })
		return interaction.followUp({
			embeds: [ secretEmbed ],
			files: [ secretFile ],
			content: `This is your ${ordinal(numSecretsOwned)} secret. Be sure to write it down, and don't tell anyone!`,
		})
	} else if (getSecretsRemaining() <= 0) {
		return { content: 'No secrets remaining; no secrets were drawn.' }
	} else {
		return { content: `Secret drawing not enabled; no secrets were drawn.` }
	}
}
async function returnSecretByUserID(userId) {
	let secretListJSON = loadSecretsJSON()
	let numSecretsRemoved = 0
	secretListJSON.secrets.forEach(secret => {
		if (secret.takenID === userId) {
			secret.taken = false
			secret.takenID = ""
			secret.takenUsername = ""
			numSecretsRemoved++
		}
	})
	secretListJSON.unclaimed += numSecretsRemoved
	await util.writeToJSON(secretJSONPath, secretListJSON)
	console.log(`Removed ${numSecretsRemoved} secrets.`)
	return numSecretsRemoved
}
function getNumberSecretsClaimedByAuthor(interaction) {
	let secretListJSON = loadSecretsJSON()
	let numSecrets = 0
	secretListJSON.secrets.forEach(s => {
		if (s.takenID === interaction.user.id) {
			numSecrets++
		}
	})
	return numSecrets
}
function getSecretsRemaining() {
	let secretListJSON = loadSecretsJSON()
	return secretListJSON.unclaimed
}
async function getAllClaimedSecrets(message) {
	let secretListJSON = loadSecretsJSON()
	let allSecrets = ""
	// testout = ""
	// await secretListJSON.secrets.forEach(s => {
	for (const s of secretListJSON.secrets) {
		if (s.takenID) {
			console.log(`taken by: ${ s.takenID}`)
			let mem = await util.getGuildMemberByID(message, s.takenID)
			console.log(`${util.getNicknameByGuildMember(mem)} has the secret ${s.name}`)
			allSecrets += `${util.getNicknameByGuildMember(mem)} has the secret ${s.name}\n`
		}
	}
	return allSecrets
}
function getAllClaimedSecretIDs() {
	let secretListJSON = loadSecretsJSON()
	let IDs = [ [], [] ]
	let numIDs = 0
	secretListJSON.secrets.forEach(s => {
		if (s.takenID) {
			let newTuple = [ s.takenID, s.name, s.num ]
			IDs[numIDs] = newTuple
			numIDs++
		}
	})
	return IDs
}
function resetAllSecrets() {
	let secretListJSON = loadSecretsJSON()
	secretListJSON.secrets.forEach(s => {
		s.taken = false
		s.takenID = ""
		s.takenUsername = ""
	})
	secretListJSON.unclaimed = totalNumSecrets
	util.writeToJSON(secretJSONPath, secretListJSON)
	return `Resetting all secrets... :arrows_counterclockwise:`
}
function restoreBackupSecretJSON(readPath) {
	if (readPath) {
		readPath = util.checkJSONExtPath(readPath, 'secrets/')
	} else {
		readPath = secretBackupJSONPath
	}
	console.log(`reading from path: ${ readPath}`)
	// let jsonString = fs.readFileSync(readPath, `utf8`)
	// let secretListBackupJSON = JSON.parse(jsonString)
	// index.writeToJSON(secretJSONPath, secretListBackupJSON)
	let success = util.copyJSON(readPath, secretJSONPath)
	if (success) {
		return readPath
	}
	return false
}
function backupSecretJSON(writePath) {
	if (writePath) {
		writePath = util.checkJSONExtPath(writePath, 'secrets/')
		util.copyJSON(secretJSONPath, writePath)
		return writePath
	}
	return false
}

module.exports = {
	name,
	description,
	dev: true,
	subcommandDescription: {
		draw: 'Draw a secret from the deck.',
		redraw: 'Return all of your secrets to the deck, and draw a new one.',
		unclaim: 'Return all of your secrets to the deck.',
		count: 'Return the number of secrets that you have.',
	},
	isEphemeral: interaction => [].includes(interaction?.options.getSubcommand()),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand()
		const filename = interaction.options.getString('filename')
		const quantity = interaction.options.getInteger('quantity')
		const deck = interaction.options.getString('deck')
		const user = interaction.user

		switch (subcommand) {
			case 'draw': {
				const getEnabledRes = await setting.getGlobalSettingValue('SECRET_DRAW_ENABLED', 'False', 'BOOLEAN')
				const getDeckRes = await setting.getGlobalSettingValue('SECRET_ACTIVE_DECK', '', 'STRING')
				// return await interaction.followUp(getSecretForMessage({ user, quantity })) // how to handle multiple secrets? Multiple embeds?
				break
			}
			case 'redraw': {
				const getEnabledRes = await setting.getGlobalSettingValue('SECRET_DRAW_ENABLED', 'False', 'BOOLEAN')
				const getDeckRes = await setting.getGlobalSettingValue('SECRET_ACTIVE_DECK', '', 'STRING')
				// await returnSecretByUserID(user.id)
				// return await interaction.followUp(getSecretForMessage({ user, quantity }))
				break
			}
			case 'return': {
				const returned = await returnSecretByUserID(user.id)
				// return interaction.followUp({ content: `Returned ${returned} secrets to the deck. You have no secrets.` })
				break
			}
			case 'count': {
				break
				// const numSecrets = getNumberSecretsClaimedByAuthor(interaction)

				// return interaction.followUp({ content: `You have ${numSecrets} secrets.` })
			}
			case 'disable':
			case 'enable': {
				// TODO: ADMIN
				const enable = subcommand === 'enable'
				const setEnabledRes = await setting.setGlobalSettingValue('SECRET_DRAW_ENABLED', enable, 'BOOLEAN')
				const setDeckRes = await setting.setGlobalSettingValue('SECRET_ACTIVE_DECK', enable ? deck : '', 'STRING')

				const getEnabledRes = await setting.getGlobalSettingValue('SECRET_DRAW_ENABLED', 'False', 'BOOLEAN')
				const getDeckRes = await setting.getGlobalSettingValue('SECRET_ACTIVE_DECK', '', 'STRING')

				return interaction.followUp({ content: `Secrets have been ${enable ? 'enabled' : 'disabled'}.` })
			}
			case 'reset':
				// TODO: admin
				// Probably make this per deck, or per campaign
				break
			case 'remaining':

				break
			case 'list':

				break
		}
		// return { content: `${subcommand} ${enable} ${filename} ${quantity} ${user.toString()}` }

		return await interaction.followUp({ content: `${subcommand} ${filename} ${quantity} ${user.toString()}` })
	},
	commandBuilder: new SlashCommandBuilder()
		.setName(name)
		.setDescription(description)
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
				.setDescription('(Admin Only) Enable drawing from a secret deck.')
				.addStringOption(option =>
					option.setName('deck')
						.setDescription('Which deck to enable')
						.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('disable')
				.setDescription('(Admin Only) Disable drawing from a secret deck.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('reset')
				.setDescription('(Admin Only) Returns all secrets to the deck.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('remaining')
				.setDescription('(Admin Only) Returns the amount of secrets remaining in the deck'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('list')
				.setDescription(`(Admin Only) Reveal everyone's secrets`)),
// TODO: Add the rest
}