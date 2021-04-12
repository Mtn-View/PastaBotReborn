const secretJSONPath = `./secrets/SecretList.json`
const secretBackupJSONPath = `./secrets/SecretListBackup.json`
const index = require('./index.js')
const roll = require('./roll.js')
const fs = require('fs')
const { prefix } = require('./config.json')

let totalNumSecrets = 17
// contains all the methods used in the secret function
var methods = {
	catchCommand(discord, message, args) {
		let ch = message.channel
		let isOwner = index.checkOwner(message.author.id)
		// reset
		if (args[0] === 'reset' && isOwner) {
			ch.send(`Resetting all secrets... :arrows_counterclockwise:`)
			this.resetAllSecrets()
		// enable
		} else if (args[0] === 'enable' && isOwner) {
			if (this.allowSecretDraws(true)) {
				ch.send(`Secret draws enabled. :shushing_face:`)
			} else {
				ch.send(`Failed to enable secret draws...?`)
			}
		// disable
		} else if (args[0] === 'disable' && isOwner) {
			if (!this.allowSecretDraws(false)) {
				ch.send(`Secret draws disabled. :no_entry_sign:`)
			} else {
				ch.send(`Failed to disable secret draws...?`)
			}
		// remaining
		} else if (args[0] === 'remaining' && isOwner) {
			ch.send(`There are ${this.getSecretsRemaining()} unclaimed secrets remaining.`)
		} else if (args[0] === 'restore' && isOwner) {
			let restorePath = this.restoreBackupSecretJSON(args[1])
			if (restorePath) {
				ch.send(`Restored database from \`${restorePath}\`.`)
			} else {
				ch.send(`:thinking: Error restoring database from file...`)
			}
		// backup
		} else if (args[0] === 'backup' && isOwner) {
			let writePath = this.backupSecretJSON(args[1])
			if (writePath) {
				ch.send(`Successfully written to \`${writePath}\``)
			} else {
				ch.send(`Backup successfully failed. No really. It didn't work. IDK why. I'm too lazy to write code to check how you fucked this up.`)
			}
		// all
		} else if (args[0] === 'all' && isOwner) {
			ch.send("Revealing everyone's secrets... Privately. :eyes:")
			this.getAllClaimedSecrets(message)
				.then(result => {
					if (result) {
						message.author.send(result)
						console.log(`s${result}s`)
					} else {
						message.author.send("FUCK")
						console.log(`s${result}s`)
					}
				})
		// redraw
		} else if (args[0] === 'redraw') {
			let numSecretsRemoved = this.removeSecretByUserID(message.author.id)
			if (numSecretsRemoved > 0) {
				ch.send(`Redrawing your secret... One moment, please... :timer:`)
			} else {
				ch.send(`You don't have any secrets to redraw! Redrawing anyways... One moment, please... :timer:`)
			}
			setTimeout(() => {
				this.sendSecret(message, ch, discord)
			}, 2000)
		// unclaim
		} else if (args[0] === 'unclaim') { // move into a method so it can check if it's enabled better
			this.removeSecretByUserID(message.author.id)
			ch.send(`Unclaimed all your secrets.`)
		// count
		} else if (args[0] === 'count') {
			ch.send(`You have ${this.getNumberSecretsClaimedByAuthor(message)} secrets.`)
		// draw
		} else if (args[0] === 'draw') {
			this.sendSecret(message, ch, discord)
		// "default"
		} else if (!args[0]) { // Default secret command with no args
			ch.send(`Use \`${prefix}secret draw\` to draw a secret, or \`${prefix}help\` for help.`)
		} else { // just in case they fuck it up or try and reset without permissions
			ch.send(`Unknown command \`${args}\` or insufficient permissions.`)
		}
	},
	loadSecretsJSON() {
		// let jsonString = fs.readFileSync(secretJSONPath, `utf8`)
		// let secretListJSON = JSON.parse(jsonString)
		// return secretListJSON
		return index.loadFromJSON(secretJSONPath)
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
	async getRandomSecret(msg) {
		let takenByID = msg.author.id
		let secretListJSON = this.loadSecretsJSON()
		// Only return a secret if drawing secrets is allowed.
		if (secretListJSON.allowDraws === true && secretListJSON.unclaimed > 0) {
			let fileNum = roll.rolldx(totalNumSecrets) - 1
			let secretObject = secretListJSON.secrets[fileNum]
			// Do not choose a  secret that's already taken
			while (secretObject.taken != false && secretListJSON.unclaimed > 0) {
				fileNum = roll.rolldx(totalNumSecrets) - 1
				secretObject = secretListJSON.secrets[fileNum]
			}
			// mark this secret as taken
			secretListJSON.secrets[fileNum].taken = true
			secretListJSON.unclaimed--
			// record whose secret this is
			secretObject.takenID = takenByID
			secretObject.takenUsername = index.getNicknameByGuildMember(msg.member)

			console.log(`${secretListJSON.unclaimed} secrets left unclaimed.`)
			// write out and return
			await index.writeToJSON(secretJSONPath, secretListJSON)
			return secretObject
		}
		// return false if no secrets remaining
		return null
	},
	async sendSecret(message, channel, discord) {
		let secretObject = await this.getRandomSecret(message)
		// let numSecretsOwned = this.getNumberSecretsClaimedByAuthor(message)
		if (secretObject) {
			console.log(`secret object: ${secretObject}`)
			let secretEmbed = new discord.MessageEmbed()
				.setTitle(secretObject.name)
				.setDescription(secretObject.desc)
				.attachFiles(`./secrets/${secretObject.path}`)
				.setImage(`attachment://${secretObject.path}`)
			channel.send(`I've sent you your secret... :eyes:`)
			// message.author.send(`You have ${numSecretsOwned} secret(s).`)
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
	async getAllClaimedSecrets(message) {
		let secretListJSON = this.loadSecretsJSON()
		let allSecrets = ""
		this.testout = ""
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
		secretListJSON.unclaimed = totalNumSecrets
		index.writeToJSON(secretJSONPath, secretListJSON)
	},
	restoreBackupSecretJSON(readPath) {
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
	},
	backupSecretJSON(writePath) {
		if (writePath) {
			writePath = index.checkJSONExtPath(writePath, 'secrets/')
			index.copyJSON(secretJSONPath, writePath)
			return writePath
		}
		return false
	},
}
module.exports = methods

