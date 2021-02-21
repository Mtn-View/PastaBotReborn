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
* d6: Roll a d6.
* 4d6: Roll 4d6, shows individual rolls.
* 4d6drop1: Roll 4d6, drop 1, show sum.
* rollstats: Roll 4d6, drop 1, times 6. Displays each total.
* secret: Sends a random secret from Icewind Dale: Rime of the Frostmaiden.
  * Player commands:
    * draw - draw a secret
    * redraw - return your all your secrets to the deck, and draw a new one
    * unclaim - return all your secrets to the deck
    * count - check how many secrets you have
  * Owner only commands:
    * enable - allow drawing of secrets
    * disable - dissallow drawing of secrets
    * remaining - show how many secrets are left in the deck
    * restore - restore from `SecretListBackup.json` in case of catastrophic database failure
* help: Sends you here, lmao.
