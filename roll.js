const index = require('./index.js')
const rollJsonPath = `./rolls/rolls.json`
const rollTemplateJsonPath = `./rolls/rolls_template.json`
const fs = require('fs')
const bot = require('./bot.js')
const crypto = require("crypto")

var methods = {
	catchCommand(bot, message, args) {
		let isOwner = index.checkOwner(message.author.id)
		let ch = message.channel
		let rollListJson = this.loadRollsJSON()
		let re = /\d+d\d+/
		let cmd = args[0]
		console.log(`roll args:${ args } ${typeof (args)}`)
		if (args[0] === (cmd.match(re) || {}).input) {
			// eslint-disable-next-line no-case-declarations
			let split = cmd.split('d')
			if (args[0] === 'drop' && typeof (args[1]) === Number) {
				let customRoll = this.rollxdydropz(split[0], split[1], args[1])
				ch.send(`${cmd} = ${customRoll.sum}`)
			} else {
				let customRoll = this.rollxdy(split[0], split[1])
				ch.send(`${cmd} = ${customRoll.sum}`)
			}
		} else if (args[0] === 'stats') { // later feature: suggest class based on rolls? TODO: Debug mode that shows the whole shebang, not just the final numbers
			// eslint-disable-next-line no-case-declarations
			let statArray = this.rollArray(6) // returns Object
			if (args[1] === 'v') {
				// console.log("Outputting verbose rolls");
				let verboseOut = ""
				for (let i = 0; i < 6; i++) {
					verboseOut += `**${statArray[i].sum}** (${statArray[i].rolls[0]} ${statArray[i].rolls[1]} ${statArray[i].rolls[2]} ~~${statArray[i].dropped[0]}~~)\n`
				}
				ch.send(`${message.member} here are your *verbose* stats: \n ${verboseOut}`)
			} else if (args[1] === 'legit' && isOwner) {
				ch.send(`${message.member} here are your *legit* stats: \n **18 18 18 18 18 18**`)
			} else if (args[1] === 'super' && args[2] === 'legit' && isOwner) {
				ch.send(`${message.member} here are your *super legit* stats: \n **20 20 20 20 20 20**`)
			} else {
				let out = ''
				for (let i = 0; i < 6; i++) {
					out += `${statArray[i].sum } `
				}
				if (args[1]) {
					args = args.splice(1)
					let argsString = args.join(' ')
					console.log(`args string: ${ argsString}`)
					ch.send(`${message.member} here are your *${argsString}* stats: \n **${out}**`)
				} else {
					ch.send(`${message.member} here are your stats: \n **${out}**`)
				}
				// this.addStatArrayToJson(rollListJson, statArray, message)
				this.updateRollCountJson(rollListJson)
			}
		} else if (args[0] === 'restore' && isOwner) {
			this.wipeRollsJSON()
		} else {
			ch.send(`Unknown command \`roll ${args}\``)
			console.log(`${cmd} === ${re} ? ${re.test(cmd)}`)
		}
	},
	rolldx(x) {
		return crypto.randomInt(1, x + 1)
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

	updateDiceRollCountStatus(bot) {
		let rollListJson = this.loadRollsJSON()
		let currentNumRolls = rollListJson.totalNumRolls
		bot.user.setPresence({
			status: 'online',
			activity: {
				name: `${currentNumRolls} stat arrays get rolled`,
				type: 'WATCHING',
			},
		})
	},

	/**
	 *
	 * @param {Object} jsonObject
	 * @param {Object} statObject
	 * @param {Message} message
	 */
	async addStatArrayToJson(jsonObject, statObject, message) {
		jsonObject.totalNumRolls = jsonObject.totalNumRolls + 1
		console.log(`statobject type: ${ typeof (statObject)}`)
		let statArray = {
			num: jsonObject.statArrays.length,
			user: index.getNicknameByGuildMember(message.member),
			userID: message.author.id,
			date: message.createdAt,
			rolls: statObject }
		jsonObject.statArrays.push(statArray)
		await index.writeToJSON(rollJsonPath, jsonObject)
		this.loadRollsJSON()
	},
	async updateRollCountJson(jsonObject) {
		jsonObject.totalNumRolls = jsonObject.totalNumRolls + 1
		return await index.writeToJSON(rollJsonPath, jsonObject)
	},

	loadRollsJSON() {
		if (!fs.existsSync(rollJsonPath)) {
			index.copyJSON(rollTemplateJsonPath, rollJsonPath)
		}
		return index.loadFromJSON(rollJsonPath)
	},
	wipeRollsJSON() {
		index.copyJSON(rollTemplateJsonPath, rollJsonPath)
	},
}
module.exports = methods
