const { SlashCommandBuilder } = require('@discordjs/builders')
const name = 'roles'
const description = 'Test some roles shit'

module.exports = {
	name,
	description,
	async execute(interaction) {
		const role = interaction.options.getRole('role')
		const members = await interaction.guild.members.fetch({ force: true, time: 10000 })
		const roleMembers = members.filter(member => {
			return member?.roles?.cache?.has(role.id)
		})
		return await interaction.followUp({ content: JSON.stringify(roleMembers, null, 2), ephemeral: true })
	},
	commandBuilder: new SlashCommandBuilder()
		.setName(name)
		.setDescription(description)
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('The role to get the members of.')
				.setRequired(true)),

}
