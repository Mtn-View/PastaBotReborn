const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js')
const name = 'button'
const description = 'I am testing the buttons'

module.exports = {
	name,
	description,
	dev: true,
	async execute(interaction) {
		const rows = [
			new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('yes')
						.setLabel('Yes')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('no')
						.setLabel('No')
						.setStyle('DANGER'),
				),
			new MessageActionRow()
				.addComponents(
					new MessageSelectMenu()
						.setCustomId('select')
						.setPlaceholder('Select something')
						.addOptions([
							{
								label: 'Option 1',
								value: 'option1',
								description: 'This is the first option',
							},
							{
								label: 'Option 2',
								value: 'option2',
								description: 'This is the second option',
							},
						])) ]
		return await interaction.followUp({ content: 'Gamers?', components: rows })
	},
	commandBuilder: new SlashCommandBuilder()
		.setName(name)
		.setDescription(description),

}
