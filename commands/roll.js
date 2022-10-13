const { SlashCommandBuilder } = require('discord.js')
const name = 'roll'
const description = 'Roll some dice!'
const util = require('../util.js')
const rollJsonPath = `./rolls/rolls.json`
const rollTemplateJsonPath = `./rolls/rolls_template.json`
const fs = require('fs')
const db = require('../tools/db')

async function logRolltoDb({ userId, guildId, data }) {
	const query = `INSERT INTO Rolls (userId, data, timestamp, guildId) VALUES ($userId, $data, $timestamp, $guildId);`
	const res = await db.doQueryFirst(query, {
		$userId: userId,
		$data: data,
		$timestamp: Date.now(),
		$guildId: guildId,
	})
	return res
}

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

/* function updateDiceRollCountStatus(bot) {
	let rollListJson = loadRollsJSON()
	let currentNumRolls = rollListJson.totalNumRolls
	bot.user.setPresence({
		status: 'online',
		activity: {
			name: `${currentNumRolls} stat arrays get rolled`,
			type: 'WATCHING',
		},
	})
} */

/*
async function addStatArrayToJson(jsonObject, statObject, message) {
	jsonObject.totalNumRolls = jsonObject.totalNumRolls + 1
	console.log(`statobject type: ${ typeof (statObject)}`)
	let statArray = {
		num: jsonObject.statArrays.length,
		user: util.getNicknameByGuildMember(message.member),
		userID: message.author.id,
		date: message.createdAt,
		rolls: statObject }
	jsonObject.statArrays.push(statArray)
	await util.writeToJSON(rollJsonPath, jsonObject)
	loadRollsJSON()
} */
/* async function updateRollCountJson(jsonObject) {
	jsonObject.totalNumRolls = jsonObject.totalNumRolls + 1
	return await util.writeToJSON(rollJsonPath, jsonObject)
} */

/* function loadRollsJSON() {
	if (!fs.existsSync(rollJsonPath)) {
		util.copyJSON(rollTemplateJsonPath, rollJsonPath)
	}
	return util.loadFromJSON(rollJsonPath)
}
function wipeRollsJSON() {
	util.copyJSON(rollTemplateJsonPath, rollJsonPath)
} */

async function getStatsForMessage({ verbose, name, user, guildId }) {
	const array = rollArray(6)
	const res = await logRolltoDb({ userId: user.id, data: JSON.stringify(array), guildId })

	return array.reduce((previousValue, currentValue) => {
		const { total, rolls, dropped } = currentValue
		if (verbose) {
			return previousValue.concat(`**${total}** = ${rolls.join(' + ')} (dropped ${dropped})\n`)
		}
		return previousValue.concat(`**${total}** `)
	}, `${user.toString()} here are your ${verbose ? 'verbose ' : ''}${name ? `'${name}' ` : ''}stats\n`)
}

async function getRollxdyForMessage({ verbose, name, x, y, user, guildId }) {
	const { rolls, total } = rollxdy(x, y)
	const res = await logRolltoDb({ userId: user.id, data: JSON.stringify({ rolls, total }, guildId) })

	if (verbose) {
		return `${x}d${y} ${name ? `(${name}) ` : ''}= ${rolls.join(' + ')} = **${total}**`
	}
	return `${x}d${y} ${name ? `(${name}) ` : ''}= **${total}**`
}

/* module.exports = function({ formula, name = '', verbose = true, hidden = false, user = {} } = {}) {

} */

module.exports = {
	name,
	description,
	isEphemeral: interaction => !!interaction?.options?.getBoolean('hidden'),
	async execute(interaction) {
		const formula = interaction.options.getString('formula')
		const name = interaction.options.getString('name')
		const verbose = interaction.options.getBoolean('verbose')
		const user = interaction.user

		let xdyRegex = /\d+d\d+/

		if (formula === 'stats') {
			const roll = await getStatsForMessage({ verbose, name, user, guildId: interaction.guildId })
			return await interaction.followUp({ content: roll })
		} else if (formula.match(xdyRegex)) {
			const [ x, y ] = formula.split('d')
			const roll = await getRollxdyForMessage({ verbose, name, x, y, user, guildId: interaction.guildId })
			return await interaction.followUp({ content: roll })
		} else {
			return await interaction.followUp({ content: "Invalid formula. It should be either `xdy` (roll a y-sided die x times) or `stats` (roll 4d6d1 * 6)." })
		}
	},
	commandBuilder: new SlashCommandBuilder()
		.setName(name)
		.setDescription(description) // dice / stats subcommands instead of formula
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

}
