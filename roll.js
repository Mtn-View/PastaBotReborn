const index = require('./index.js')
const rollJsonPath = `./rolls/rolls.json`
const rollTemplateJsonPath = `./rolls/rolls_template.json`
const fs = require('fs')
const bot = require('./bot.js')

function roll1dx(x) {
	return Math.ceil(Math.random() * x)
}
function rollxdy(x, y) { //will return array of rolls and total in an object
	let rolls = new Array()
	let total = 0
	for (let i = 0; i < x; i++) {
		rolls[i] = roll1dx(y)
		total += rolls[i]
	}
	let obj = {
		rolls,
		total,
	}
	return obj
}
function rollxdydropz(x, y, z) {
	let rolls = rollxdy(x, y).rolls // Syntax?
	let dropped = new Array()
	let total = 0

	rolls.sort() // sort ascending order
	let allRolls = Array.from(rolls)
	for (let i = 0; i < z; i++) {
		dropped[i] = rolls.shift() // moves dropped rolls from 'rolls' to 'dropped'
	}
	//let total = rolls => rolls.reduce((a,b) => a + b, 0); // how is this supposed to work?
	for (let i = 0; i < x - z; i++) {
		total += rolls[i]
	}
	let ret = {
		allRolls,
		rolls,
		dropped,
		total,
	}
	return ret
}
/**
 *
 * @param {number} x The number of time to roll 4d6d1
 * @returns {array} [
 * 	{
 * 		allRolls: Array<Number>,
 * 		rolls: Array<Number>,
 * 		dropped: Array<Number>,
 * 		total: Number
 * 	}
 * ]
 */
function rollArray(x) {
	let stats = new Array()
	for (let i = 0; i < x; i++) {
		stats[i] = rollxdydropz(4, x, 1)
	}
	stats.sort((a, b) => (a.total < b.total) ? 1 : -1)
	return stats
}

function updateDiceRollCountStatus(bot) {
	let rollListJson = loadRollsJSON()
	let currentNumRolls = rollListJson.totalNumRolls
	bot.user.setPresence({
		status: 'online',
		activity: {
			name: `${currentNumRolls} stat arrays get rolled`,
			type: 'WATCHING',
		},
	})
}

/**
	 *
	 * @param {Object} jsonObject
	 * @param {Object} statObject
	 * @param {Message} message
	 */
async function addStatArrayToJson(jsonObject, statObject, message) {
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
	loadRollsJSON()
}
async function updateRollCountJson(jsonObject) {
	jsonObject.totalNumRolls = jsonObject.totalNumRolls + 1
	return await index.writeToJSON(rollJsonPath, jsonObject)
}

function loadRollsJSON() {
	if (!fs.existsSync(rollJsonPath)) {
		index.copyJSON(rollTemplateJsonPath, rollJsonPath)
	}
	return index.loadFromJSON(rollJsonPath)
}
function wipeRollsJSON() {
	index.copyJSON(rollTemplateJsonPath, rollJsonPath)
}

function getStatsForMessage({ verbose, name, user }) {
	const array = rollArray(6)
	return array.reduce((previousValue, currentValue) => {
		const { total, rolls, dropped } = currentValue
		if (verbose) {
			return previousValue.concat(`**${total}** = ${rolls.join(' + ')} (dropped ${dropped})\n`)
		}
		return previousValue.concat(`**${total}** `)
	}, `${user.toString()} here are your ${verbose ? 'verbose ' : ''}${name ? `'${name}' ` : ''}stats\n`)
}

function getRollxdyForMessage({ verbose, name, x, y }) {
	const { rolls, total } = rollxdy(x, y)
	if (verbose) {
		return `${x}d${y} ${name ? `(${name}) ` : ''}= ${rolls.join(' + ')} = **${total}**`
	}
	return `${x}d${y} ${name ? `(${name}) ` : ''}= **${total}**`
}

module.exports = function({ formula, name = '', verbose = true, hidden = false, user = {} } = {}) {
	let xdyRegex = /\d+d\d+/

	if (formula === 'stats') {
		return { content: getStatsForMessage({ verbose, name, user }) }
	} else if (formula.match(xdyRegex)) {
		const [ x, y ] = formula.split('d')

		return { content: getRollxdyForMessage({ verbose, name, x, y }) }
	} else {
		return { content: "Invalid formula. It should be either `xdy` (roll a y-sided die x times) or `stats` (roll 4d6d1 * 6)." }
	}
}
