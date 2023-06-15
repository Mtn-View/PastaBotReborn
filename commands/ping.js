const { SlashCommandBuilder } = require('discord.js')
const name = 'ping'
const description = 'Replies with Pong!'

module.exports = {
	name,
	description,
	isEphemeral: () => true,
	async execute(interaction) {
		return await interaction.followUp(`That's pretty pongers, bro.`)
	},
	commandBuilder: new SlashCommandBuilder()
		.setName(name)
		.setDescription(description),

}