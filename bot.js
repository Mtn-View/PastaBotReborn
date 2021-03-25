/* eslint-disable indent */
/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-case-declarations */
const Discord = require('discord.js')
const { debug } = require('winston')
// const logger = require('winston');
const auth = require('./auth.json')
const { prefix } = require('./config.json')
const { ownerID } = require('./config.json')
const index = require('./index.js')
const secret = require('./secret.js')

// // Configure logger settings
// logger.remove(logger.transports.Console);
// logger.add(new logger.transports.Console, {
//     colorize: true
// });
// logger.level = 'debug';

// Initialize Discord Bot client
const bot = new Discord.Client()

bot.once('ready', () => {
	console.log('Connected')
	console.log(`Logged in as: ${bot.user.tag}`)
})

//Login, yee haw
bot.login(auth.token)
/*
        (message.substring(0, 1) === prefix) {
        let args = message.substring(1).split(' '); //arguments
        let cmd = args[0]; // cmd is first argument only
        */
bot.on('message', message => {
	let messageString = message.content // the string containing the message content
	let ch = message.channel // stores the channel that the command message was sent in
	if (messageString.substring(0, 1) === prefix) { // check for the prefix specified in config.json
		let args = messageString.substring(1).split(' ') // indivual arguments of the command
		let cmd = args[0] // first word = command
		args = args.splice(1) // remove used argument from args array
		// Big chungus switch statement owo
		switch (cmd) {
			case 'ping':
				ch.send('That\'s pretty pongers, bro')
				break
				// Just add any case commands if you want to..
			case 'pasta':
				ch.send('Pasta machine broke. Blame DadBot.')
				break
			case 'd6':
				let roll = index.rolldx(6)
				ch.send(`1d6: ${ roll}`)
				break
			case '4d6': // more modular. Really just a test command.
				let rollObj = index.rollxdy(4, 6)
				let rolls = rollObj.rolls
				ch.send(`4d6: ${ rolls[0] } ${ rolls[1] } ${ rolls[2] } ${ rolls[3]}`)
				break
			case '4d6drop1': // more modular. Really just a test command. Or if you need to reroll just one.
				ch.send(`4d6 drop 1: ${ index.rollxdydropz(4, 6, 1).sum}`)
				break
			case 'rollstats': // later feature: suggest class based on rolls? TODO: Debug mode that shows the whole shebang, not just the final numbers
				let statArray = index.rollArray(6)
				console.log(statArray)
				// console.log(args[1]);
				if (args[0] === 'v') {
					// console.log("Outputting verbose rolls");
					let verboseOut = ""
					for (let i = 0; i < 6; i++) {
						verboseOut += `**${statArray[i].sum}** (${statArray[i].rolls[0]} ${statArray[i].rolls[1]} ${statArray[i].rolls[2]} ~~${statArray[i].dropped[0]}~~)\n`
					}
					ch.send(`${message.member} here are your *verbose* stats: \n ${verboseOut}`)
				} else if (args[0] === 'legit' && message.author.id === '158763732254588928') {
					ch.send(`${message.member} here are your *legit* stats: \n **18 18 18 18 18 18**`)
				} else if (args[0] === 'super' && args[1] === 'legit' && message.author.id === '158763732254588928') {
					ch.send(`${message.member} here are your *super legit* stats: \n **20 20 20 20 20 20**`)
				} else {
					let out = ''
					for (let i = 0; i < 6; i++) {
				        out += `${statArray[i].sum } `
					}
					ch.send(`${message.member} here are your stats: \n **${out}**`)
				}
				break
                // should definitely refactor code and put different modules into different js files
			case 'secret':
                let isOwner = index.checkOwner(message.author.id)
                if (args[0] === 'reset' && isOwner) {
                    ch.send(`Resetting all secrets... :arrows_counterclockwise:`)
                    secret.resetAllSecrets()
                } else if (args[0] === 'enable' && isOwner) {
                    if (secret.allowSecretDraws(true)) {
                        ch.send(`Secret draws enabled. :shushing_face:`)
                    } else {
                        ch.send(`Failed to enable secret draws...?`)
                    }
                } else if (args[0] === 'disable' && isOwner) {
                    if (!secret.allowSecretDraws(false)) {
                        ch.send(`Secret draws disabled. :no_entry_sign:`)
                    } else {
                        ch.send(`Failed to disable secret draws...?`)
                    }
                } else if (args[0] === 'remaining' && isOwner) {
                    ch.send(`There are ${secret.getSecretsRemaining()} unclaimed secrets remaining.`)
				} else if (args[0] === 'restore' && isOwner) {
                    secret.restoreBackupSecretJSON()
                    ch.send(`Restored database to initial state.`)
                } else if (args[0] === 'backup') {
					let written = secret.backupSecretJSON(args[1])
					if (written) {
						ch.send(`Successfully written to \`${written}\``)
					} else {
						ch.send(`Backup successfully failed. No really. It didn't work. IDK why. I'm too lazy to write code to check how you fucked this up.`)
					}
                } else if (args[0] === 'redraw') {
                    let numSecretsRemoved = secret.removeSecretByUserID(message.author.id)
                    if (numSecretsRemoved > 0) {
                        ch.send(`Redrawing your secret... One moment, please... :timer:`)
                    } else {
                        ch.send(`You don't have any secrets to redraw! Redrawing anyways... One moment, please... :timer:`)
                    }
                    setTimeout(() => {
                        secret.sendSecret(message, ch, Discord)
                    }, 2000)
                } else if (args[0] === 'unclaim') { // move into a method so it can check if it's enabled better
				secret.removeSecretByUserID(message.author.id)
                    ch.send(`Unclaimed all your secrets.`)
                } else if (args[0] === 'count') {
                    ch.send(`You have ${secret.getNumberSecretsClaimedByAuthor(message)} secrets.`)
                } else if (args[0] === 'draw') {
                    secret.sendSecret(message, ch, Discord)
				} else if (args[0] === 'all' && isOwner) {
					ch.send("Revealing everyone's secrets... Privately. :eyes:")
					console.log(`s${ secret.getAllClaimedSecrets(message)}s`)
                } else if (!args[0]) { // Default secret command with no args
                    ch.send(`Use \`${prefix}secret draw\` to draw a secret, or \`${prefix}help\` for help.`)
                } else { // just in case they fuck it up or try and reset without permissions
                    ch.send(`Unknown command \`${args}\` or insufficient permissions.`)
                }
				break
			case 'idtest':
					// console.log(index.getGuildMemberPromiseByID(message, message.author.id))
					console.log(index.getNicknameByID(message, message.author.id))
					console.log(secret.getAllClaimedSecretIDs())
					break
			case 'memberstest':
					console.log(index.printAllGuildMembers(message))
					break
			case 'naenae':
				const taggedUser = message.mentions.users.first()
				ch.send(`Sorry, ${taggedUser}, but you just got nae nae'd.`)
				break
			case 'sus':
                message.delete()
				ch.send(`sus`)
				break
			case 'template':
				ch.send('')
				break
			case 'help':
				ch.send('README.md on GitHub: https://github.com/Mtn-View/PastaBotReborn/blob/master/README.md \n(source code almost certainly out of date)')
				break
		}
	}
})
/*
bot.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel
    let oldUserChannel = oldMember.voiceChannel

    if(oldUserChannel === undefined && newUserChannel !== undefined) {
       // User Joins a voice channel

    } else if(newUserChannel === undefined){
      // User leaves a voice channel

    }
  })

*/

//$pasta x x x
// reset @someone / all
// set @someone (admin only)
//
