Hello this is my bot, I only worked on it for like three hours so it does all of three things basically.
I don't remember the command to fetch the dependencies and it's almost 5am so I'm going to save that for later if I remember how to do that.
Also add your discord bot's token to "auth.json" to get it to work with your bot.
I also really don't know how to use git that well so hopefully this works well enough.
Also sorry comments are trash I wasn't really ever planning on sharing this until I did.

run bot.json with node or nodemon to start the bot.
config.json lets you set the prefix, might add more stuff to that later, idk.
index.json contains all the helper methods used in bot.json

<h1>Basic commands:</h1>

* ping: Self explanatory.
* pasta: TODO.
* roll: various dice rolling commands
  * stats - rolls a standard 4d6 drop 1 * 6 array for D&D 5e.
  * xdy - roll an arbitrary x number of y sided dice and return the result. Better output TODO.
* secret: Sends a random secret from Icewind Dale: Rime of the Frostmaiden.
  * Player commands: (owner must enable secrets)
    * draw - draw a secret
    * redraw - return your all your secrets to the deck, and draw a new one
    * unclaim - return all your secrets to the deck
    * count - check how many secrets you have
  * Owner only commands:
    * enable - allow drawing of secrets
    * disable - dissallow drawing of secrets
	* reset - reset `SecretList.json` to its default values. (For all secrets, `taken = false`, `takenByID = ""`, `takenUsername = ""`)
    * remaining - show how many secrets are left in the deck
	* all - all claimed secrets and their owner to the console. Owner PM TODO, promises are heck.
	* backup - back up the current `SecretList.json` to the specified file.
    * restore - restore from specified file, or if not specified, from `SecretListBackup.json`.

<h1>Usage:</h1>
`npm run startdev` to start the bot with nodemon and update the bot status to say it's in development.
`npm run start` to start the bot with node, and give the normal status message.

Before using the secret feature, you'll have to populate the fields yourself because I'm not about to distribute WOTC content on my GitHub.
