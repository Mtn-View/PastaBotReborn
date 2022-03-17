module.exports = {
	name: 'pasta',
	description: 'Yo dawg, I heard you like pasta',
	async execute(interaction) {
		return await interaction.reply({ content: 'Pasta mode WIP', ephemeral: false })
	},
}
