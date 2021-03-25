const fs = require('fs')
const { ownerID } = require('./config.json')
var methods = {
	rolldx(x) {
		return Math.ceil(Math.random() * x)
	},
	rollxdy(x, y) { //will return array of rolls and sum in an object
		let rolls = new Array()
		let sum = 0
		for (let i = 0; i < x; i++) {
			rolls[i] = this.rolldx(y)
			sum += rolls[i]
		}
		let obj = {
			rolls,
			sum,
		}
		return obj
	},
	rollxdydropz(x, y, z) {
		let rolls = this.rollxdy(x, y).rolls // Syntax?
		let dropped = new Array()
		let sum = 0

		rolls.sort() // sort ascending order
		let allRolls = Array.from(rolls)
		for (let i = 0; i < z; i++) {
			dropped[i] = rolls.shift() // moves dropped rolls from 'rolls' to 'dropped'
		}
		//let sum = rolls => rolls.reduce((a,b) => a + b, 0); // how is this supposed to work?
		for (let i = 0; i < x - z; i++) {
			sum += rolls[i]
		}
		let ret = {
			allRolls,
			rolls,
			dropped,
			sum,
		}
		//console.log(ret);
		return ret
	},
	rollArray(x) {
		let stats = new Array()
		for (let i = 0; i < x; i++) {
			stats[i] = this.rollxdydropz(4, x, 1)
		}
		stats.sort((a, b) => (a.sum < b.sum) ? 1 : -1)
		return stats
	},
	checkOwner(id) {
		return (id === ownerID)
	},
	writeToJSON(jsonFilePath, jsonObject) {
		fs.writeFile(jsonFilePath, JSON.stringify(jsonObject, null, 4), err =>{
			if (err) {
				console.error(`Error writing file: ${err}`)
				return false
			}
		})
		return true
	},
	// reads a json file and writes its contents to another
	copyJSON(jsonReadPath, jsonWritePath) {
		try {
			let jsonString = fs.readFileSync(jsonReadPath, `utf8`)
			this.writeToJSON(jsonWritePath, JSON.parse(jsonString))
			return true
		} catch (err) {
			console.log(err)
			return false
		}
	},
	getGuildMemberPromiseByID(message, id) {
		if (message.guild.available) {
			if (id) {
				return message.guild.members.fetch(id)
			}
		}
	},
	checkJSONPath(path) {
		if (!path.includes('secrets/')) {
			path = 'secrets/'.concat(path)
		}
		if (!path.includes('.json')) {
			path = path.concat('.json')
		}
		return path
	},
	getNicknameByID(message, id) {
		this.getGuildMemberPromiseByID(message, id).then(gm =>{
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
	getNicknameByGM(gm) {
		if (gm) {
			let nick = gm.nickname
			if (nick) {
				return nick
			}
			let username = gm.user.username
			return username
		}
	},
	printAllGuildMembers(message) {
		message.guild.members.fetch({ force: true }).then(m =>{
			return m
		})
	},
}
module.exports = methods
