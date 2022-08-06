const { SlashCommandBuilder } = require('discord.js')
const name = 'help'
const description = 'Might help, might not.'

module.exports = {
	name,
	description,
	async execute(interaction) {
		const commandList = interaction.client.commands

		const helpEmbed = {
			title: 'Command list',
			fields: commandList.map(command => {
				return {
					name: command.name,
					value: command.description || 'No description',
				}
			}),
		}
		return await interaction.followUp({ embeds: [ helpEmbed ] })
	},
	commandBuilder: new SlashCommandBuilder()
		.setName(name)
		.setDescription(description),

}
