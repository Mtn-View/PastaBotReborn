const { SlashCommandBuilder } = require('discord.js')
const name = 'pasta'
const description = 'Yo dawg, I heard you like pasta'

module.exports = {
	name,
	description,
	async execute(interaction) {
		return await interaction.followUp({ content: 'Pasta mode WIP', ephemeral: false })
	},
	commandBuilder: new SlashCommandBuilder()
		.setName(name)
		.setDescription(description),

}
