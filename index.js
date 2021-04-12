const fs = require('fs')
const { ownerID } = require('./config.json')

var methods = {
	checkOwner(id) {
		return (id === ownerID)
	},
	async writeToJSON(jsonFilePath, jsonObject) {
		jsonFilePath = this.checkJSONExtension(jsonFilePath, '')
		await fs.writeFile(jsonFilePath, JSON.stringify(jsonObject, null, 4), err =>{
			if (err) {
				console.error(`Error writing file: ${err}`)
				return false
			}
		})
		return true
	},
	loadFromJSON(path) {
		path = this.checkJSONExtension(path)
		if (fs.existsSync(path)) {
			let jsonString = fs.readFileSync(path, `utf8`)
			try {
				return JSON.parse(jsonString)
			} catch (err) {
				console.error(err)
				return false
			}
		}
		return false
	},
	// reads a json file and writes its contents to another
	copyJSON(jsonReadPath, jsonWritePath) {
		try {
			let jsonString = fs.readFileSync(jsonReadPath, `utf8`)
			this.writeToJSON(jsonWritePath, JSON.parse(jsonString))
			return true
		} catch (err) {
			console.log(`copy err:\n${err}`)
			return false
		}
	},
	// works
	async getGuildMemberByID(message, id) {
		if (message.guild.available) {
			if (id) {
				return await message.guild.members.fetch(id)
			}
		}
	},
	checkJSONExtension(path) {
		if (!path.includes('.json')) {
			path = path.concat('.json')
		}
		return path
	},
	checkJSONExtPath(path, directory) {
		if (!path.includes('secrets/')) {
			path = 'secrets/'.concat(path)
		}
		if (!path.includes('.json')) {
			path = path.concat('.json')
		}
		return path
	},
	// Definitely does not work
	getNicknameByID(message, id) {
		this.getGuildMemberByID(message, id).then(gm =>{
			if (gm) {
				let nick = gm.nickname
				if (nick) {
					return nick
				}
				let username = gm.user.username
				return username
			}
		})
	},
	// Returns a guild member's nickname, or if they have none, their username.
	getNicknameByGuildMember(gm) {
		if (gm) {
			let nick = gm.nickname
			if (nick) {
				return nick
			}
			let username = gm.user.username
			return username
		}
	},
	async printAllGuildMembers(message) {
		return await message.guild.members.fetch({ force: true })
	},
}
module.exports = methods
