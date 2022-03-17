const { SlashCommandBuilder, SlashCommandUserOption } = require('@discordjs/builders')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const { clientId, guildId, prodClientId } = require('./config.json')
const { token, prodToken } = require('./auth.json')
const fs = require('fs')

const ownerIds = [ 158763732254588928, 221753632566018061 ] // Aquahawk, CharlesKaup

const isDev = process.argv.includes('dev')
console.log("Dev?", isDev)
const rest = new REST({ version: '9' }).setToken(isDev ? token : prodToken)
const currentClientId = isDev ? clientId : prodClientId

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && !file.endsWith('_old.js'))

const commands = commandFiles.map(file => {
	const { commandBuilder } = require(`./commands/${file}`)
	return commandBuilder.toJSON()
})

console.log(commands)

async function deleteAllGuildCommands() {
	const guildCommands = await rest.get(Routes.applicationGuildCommands(currentClientId, guildId))
	const promises = []
	for (const command of guildCommands) {
		const deleteUrl = `${Routes.applicationGuildCommands(currentClientId, guildId)}/${command.id}`
		promises.push(rest.delete(deleteUrl))
	}
	return Promise.all(promises)
}

async function deleteAllGlobalCommands() {
	const globalCommands = await rest.get(Routes.applicationCommands(currentClientId))
	return await Promise.all(globalCommands.map(command => {
		const deleteURL = `${Routes.applicationCommands(currentClientId)}/${command.id}`
		return rest.delete(deleteURL)
	}))
}

async function start() {
	if (process.argv.includes('deleteGlobal')) {
		try {
			console.log('Deleting global commands')
			const res = await deleteAllGlobalCommands()
			console.log("Deleted global commands")
		} catch (err) {
			console.error(err)
		}
	}
	if (process.argv.includes('deleteGuild')) {
		try {
			console.log('Deleting guild commands')
			const res = await deleteAllGuildCommands()
			console.log("Deleted guild commands")
		} catch (err) {
			console.error(err)
		}
	}
	if (process.argv.includes('registerGlobal')) {
		try {
			console.log('Registering global commands')
			const res = await rest.put(Routes.applicationCommands(currentClientId), { body: commands })
			console.log('Registered application commands globally.')
		} catch (err) {
			console.error(err)
		}
	}
	if (process.argv.includes('registerGuild')) {
		try {
			console.log('Registering guild commands')
			const res = await rest.put(Routes.applicationGuildCommands(currentClientId, guildId), { body: commands })
			console.log('Registered application commands for guild.')
		} catch (err) {
			console.error(err)
		}
	}
}
start().then(()=> {
	console.log('Completed')
})

