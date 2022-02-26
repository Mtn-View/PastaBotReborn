const secretJSONPath = `./secrets/SecretList.json`
const secretBackupJSONPath = `./secrets/SecretListBackup.json`
const index = require('./index.js')
// const roll = require('./roll.js')
const fs = require('fs')
const { prefix } = require('./config.json')
const Discord = require('discord.js')

let totalNumSecrets = 17
// This is just here for now until I figure out what to do with the roll.js exports
function roll1dx(x) {
	return Math.ceil(Math.random() * x)
}

function loadSecretsJSON() {
	// let jsonString = fs.readFileSync(secretJSONPath, `utf8`)
	// let secretListJSON = JSON.parse(jsonString)
	// return secretListJSON
	return index.loadFromJSON(secretJSONPath)
}
function allowSecretDraws(allow) {
	let jsonString = fs.readFileSync(secretJSONPath, `utf8`)
	let secretListJSON = JSON.parse(jsonString)
	if (allow === true) {
		secretListJSON.allowDraws = true
	} else if (allow === false) {
		secretListJSON.allowDraws = false
	}
	index.writeToJSON(secretJSONPath, secretListJSON)
	return secretListJSON.allowDraws
}
async function getRandomSecret(user) {
	let takenByID = user.id
	let secretListJSON = loadSecretsJSON()
	// Only return a secret if drawing secrets is allowed.
	if (secretListJSON.allowDraws === true && secretListJSON.unclaimed > 0) {
		let fileNum = roll1dx(totalNumSecrets) - 1
		let secretObject = secretListJSON.secrets[fileNum]
		// Do not choose a  secret that's already taken
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
		await index.writeToJSON(secretJSONPath, secretListJSON)
		return secretObject
	}
	// return false if no secrets remaining
	return null
}
async function getSecretForMessage({ user }) {
	let secretObject = await getRandomSecret(user)
	// let numSecretsOwned = getNumberSecretsClaimedByAuthor(message)
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
		return { embeds: [ secretEmbed ], files: [ secretFile ], content: 'This is your secret. Be sure to write it down, and don\'t tell anyone!' }
	} else if (getSecretsRemaining() <= 0) {
		// channel.send({ content: `No secrets remaining.` })
		return { content: 'No secrets remaining; failed to draw a secret.' }
	} else {
		return { content: `Secret drawing not enabled; failed to draw a secret.` }
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
	await index.writeToJSON(secretJSONPath, secretListJSON)
	console.log(`Removed ${numSecretsRemoved} secrets.`)
	return numSecretsRemoved
}
function getNumberSecretsClaimedByAuthor(userId) {
	let secretListJSON = loadSecretsJSON()
	let numSecrets = 0
	secretListJSON.secrets.forEach(s => {
		if (s.takenID === userId) {
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
			let mem = await index.getGuildMemberByID(message, s.takenID)
			console.log(`${index.getNicknameByGuildMember(mem)} has the secret ${s.name}`)
			allSecrets += `${index.getNicknameByGuildMember(mem)} has the secret ${s.name}\n`
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
	index.writeToJSON(secretJSONPath, secretListJSON)
	return `Resetting all secrets... :arrows_counterclockwise:`
}
function restoreBackupSecretJSON(readPath) {
	if (readPath) {
		readPath = index.checkJSONExtPath(readPath, 'secrets/')
	} else {
		readPath = secretBackupJSONPath
	}
	console.log(`reading from path: ${ readPath}`)
	// let jsonString = fs.readFileSync(readPath, `utf8`)
	// let secretListBackupJSON = JSON.parse(jsonString)
	// index.writeToJSON(secretJSONPath, secretListBackupJSON)
	let success = index.copyJSON(readPath, secretJSONPath)
	if (success) {
		return readPath
	}
	return false
}
function backupSecretJSON(writePath) {
	if (writePath) {
		writePath = index.checkJSONExtPath(writePath, 'secrets/')
		index.copyJSON(secretJSONPath, writePath)
		return writePath
	}
	return false
}
module.exports = async function({ subcommand, enable, filename, quantity, user }) { // create a bunch of secrets, with fill-in-the-blank bits for different campaign settings
	switch (subcommand) {
		case 'draw':
			return getSecretForMessage({ user, quantity }) // how to handle multiple secrets? Multiple embeds?
		case 'redraw':
			await returnSecretByUserID(user.id)
			return getSecretForMessage({ user, quantity })
		case 'return':

			break
		case 'count':

			break
		case 'enable':

			break
		case 'reset':

			break
		case 'load':

			break
		case 'save':

			break
		case 'remaining':

			break
		case 'all':

			break
	}
	return { content: `${subcommand} ${enable} ${filename} ${quantity} ${user.toString()}` }
}

