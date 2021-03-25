const secretJSONPath = `./secrets/SecretList.json`
const secretBackupJSONPath = `./secrets/SecretListBackup.json`
const index = require('./index.js')
const fs = require('fs')
const { rejects } = require('assert')
const { resolve } = require('path')

// contains all the methods used in the secret function
var methods = {
	loadSecretsJSON() {
		let jsonString = fs.readFileSync(secretJSONPath, `utf8`)
		let secretListJSON = JSON.parse(jsonString)
		return secretListJSON
	},
	allowSecretDraws(allow) {
		let jsonString = fs.readFileSync(secretJSONPath, `utf8`)
		let secretListJSON = JSON.parse(jsonString)
		if (allow === true) {
			secretListJSON.allowDraws = true
		} else if (allow === false) {
			secretListJSON.allowDraws = false
		}
		index.writeToJSON(secretJSONPath, secretListJSON)
		return secretListJSON.allowDraws
	},
	getRandomSecret(msg) {
		let takenByID = msg.author.id
		let secretListJSON = this.loadSecretsJSON()
		// Only return a secret if drawing secrets is allowed.
		if (secretListJSON.allowDraws === true && secretListJSON.unclaimed > 0) {
			let fileNum = index.rolldx(17) - 1
			let secretObject = secretListJSON.secrets[fileNum]
			// Do not choose a  secret that's already taken
			while (secretObject.taken != false && secretListJSON.unclaimed > 0) {
				fileNum = index.rolldx(17) - 1
				secretObject = secretListJSON.secrets[fileNum]
			}
			// mark this secret as taken
			secretListJSON.secrets[fileNum].taken = true
			secretListJSON.unclaimed--
			secretObject.takenID = takenByID
			secretObject.takenUsername = msg.author.username
			if (msg.member.nickname) {
				secretObject.takenUsername = msg.member.nickname
			}
			console.log(`${secretListJSON.unclaimed} left unclaimed.`)
			// write out and return
			index.writeToJSON(secretJSONPath, secretListJSON)
			return secretObject
		}
		// return false if no secrets remaining
		return null
	},
	sendSecret(message, channel, discord) {
		let secretObject = this.getRandomSecret(message)
		if (secretObject) {
			console.log(secretObject)
			let secretEmbed = new discord.MessageEmbed()
				.setTitle(secretObject.name)
				.setDescription(secretObject.desc)
				.attachFiles(`./secrets/${secretObject.path}`)
				.setImage(`attachment://${secretObject.path}`)
			channel.send(`I've sent you your secret... :eyes:`)
			message.author.send(secretEmbed)
		} else if (this.getSecretsRemaining() <= 0) {
			channel.send(`No secrets remaining.`)
		} else {
			channel.send(`Secret drawing not enabled.`)
		}
	},
	removeSecretByUserID(id) {
		let secretListJSON = this.loadSecretsJSON()
		let numSecretsRemoved = 0
		secretListJSON.secrets.forEach(s => {
			if (s.takenID === id) {
				s.taken = false
				s.takenID = ""
				s.takenUsername = ""
				numSecretsRemoved++
			}
		})
		secretListJSON.unclaimed += numSecretsRemoved
		index.writeToJSON(secretJSONPath, secretListJSON)
		console.log(`Removed ${numSecretsRemoved} secrets.`)
		return numSecretsRemoved
	},
	getNumberSecretsClaimedByAuthor(msg) {
		let secretListJSON = this.loadSecretsJSON()
		let numSecrets = 0
		secretListJSON.secrets.forEach(s => {
			if (s.takenID === msg.author.id) {
				numSecrets++
			}
		})
		return numSecrets
	},
	getSecretsRemaining() {
		let secretListJSON = this.loadSecretsJSON()
		return secretListJSON.unclaimed
	},
	getAllClaimedSecrets(message) {
		let secretListJSON = this.loadSecretsJSON()
		let allSecrets = ""
		this.testout = ""
		secretListJSON.secrets.forEach(s => {
			if (s.takenID) {
				index.getGuildMemberPromiseByID(message, s.takenID).then(gm => {
					console.log(`${index.getNicknameByGM(gm)} has the secret ${s.name}`)
					allSecrets += `${index.getNicknameByGM(gm)} has the secret ${s.name}\n`
				})
			}
		})
		return new Promise((resolve, reject) => {
			// if (allSecrets) {
			// 	resolve(allSecrets)
			// } else {
			// 	console.log(allSecrets)
			// 	reject("ope")
			// }
			resolve(allSecrets)
		})
	},
	getAllClaimedSecretIDs() {
		let secretListJSON = this.loadSecretsJSON()
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
	},
	resetAllSecrets() {
		let secretListJSON = this.loadSecretsJSON()
		secretListJSON.secrets.forEach(s => {
			s.taken = false
			s.takenID = ""
			s.takenUsername = ""
		})
		secretListJSON.unclaimed = 17
		index.writeToJSON(secretJSONPath, secretListJSON)
	},
	restoreBackupSecretJSON(readPath) {
		if (readPath) {
			readPath = index.checkJSONPath(readPath)
		} else {
			readPath = secretBackupJSONPath
		}
		console.log(readPath)
		// let jsonString = fs.readFileSync(readPath, `utf8`)
		// let secretListBackupJSON = JSON.parse(jsonString)
		// index.writeToJSON(secretJSONPath, secretListBackupJSON)
		let success = index.copyJSON(readPath, secretJSONPath)
		if (success) {
			return readPath
		}
		return false
	},
	backupSecretJSON(writePath) {
		if (writePath) {
			writePath = index.checkJSONPath(writePath)
			index.copyJSON(secretJSONPath, writePath)
			return writePath
		}
		return false
	},
}
module.exports = methods

