const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js')
const db = require('../tools/db')

const name = 'schedule'
const description = 'Create a poll where participants can choose days of the week they are free.'

const STATUS_ENUM = new Map([
	[
		[ 'pending', 0 ],
		[ 'active', 1 ],
		[ 'cancelled', 2 ],
		[ 'completed', 3 ],
	],
])

const DAYS_ARR = [
	{
		label: 'Monday',
		value: 'mon',
		description: 'Monday',
	},
	{
		label: 'Tuesday',
		value: 'tue',
		description: 'Tuesday',
	},
	{
		label: 'Wednesday',
		value: 'wed',
		description: 'Wednesday',
	},
	{
		label: 'Thursday',
		value: 'thu',
		description: 'Thursday',
	},
	{
		label: 'Friday',
		value: 'fri',
		description: 'Friday',
	},
	{
		label: 'Saturday',
		value: 'sat',
		description: 'Saturday',
	},
	{
		label: 'Sunday',
		value: 'sun',
		description: 'Sunday',
	},
]

async function getNextId() {
	const query = `SELECT COUNT(scheduleId) FROM Schedule;`
	const lastId = Number(await db.doQueryFirst(query))
	return lastId + 1
}

module.exports = {
	name,
	description,
	dev: true,
	async execute(interaction) {
		// Save poll in 'pending' state
		const { lastID: pollId } = await db.doUpdate(`INSERT INTO Schedule (status) VALUES (0);`)

		const createPollRows = [
			new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId(`${name}-${pollId}-select`)
						.setPlaceholder('Select all days to include in the poll')
						.setMinValues(1)
						.setMaxValues(7)
						.addOptions(DAYS_ARR)),
			new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId(`${name}-${pollId}-create`)
						.setLabel('Create Poll')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId(`${name}-${pollId}-cancel`)
						.setLabel('Cancel Poll')
						.setStyle('DANGER'),
					new MessageButton()
						.setCustomId(`${name}-${pollId}-all`)
						.setLabel('All Days')
						.setStyle('PRIMARY'),
				),
		]
		return await interaction.followUp({ content: 'Create a poll?\nSelect days from the dropdown or press "All days".', components: createPollRows, ephemeral: true })
	},
	async executeComponent(interaction, id, type) {
		let message = ''
		if (type === 'select') {
			const days = interaction.values
			const res = await db.doUpdate(`UPDATE Schedule SET days = '${JSON.stringify(days)}' WHERE scheduleId = ${id};`)
			message = `Poll days set to ${days.join(', ')} (You can change this later).`
		} else if (type === 'create') {
		// update poll to 'active' state
			const res = await db.doUpdate(`UPDATE Schedule SET status = 1 WHERE scheduleId = ${id};`)
			// create a message with the selected days in a select, and a button to say you can't attend
			message = 'Poll Created!'
		} else if (type === 'all') {
			// update poll to 'active' state
			const res = await db.doUpdate(`UPDATE Schedule SET days = '${JSON.stringify(DAYS_ARR.map(day => day.value))}' WHERE scheduleId = ${id};`)
			message = 'Poll created with all days selected.'
		} else if (type === 'cancel') {
			// update poll to cancelled state
			const res = await db.doUpdate(`UPDATE Schedule SET status = 2 WHERE scheduleId = ${id};`)
			// cancel the poll
			message = 'Poll cancelled.'
		}

		// delete original message
		await interaction.deleteMessage()
		return interaction.followUp({ content: message, ephemeral: true })
	},
	commandBuilder: new SlashCommandBuilder()
		.setName(name)
		.setDescription(description),

}
