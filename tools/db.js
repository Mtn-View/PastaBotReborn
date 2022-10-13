const sqlite = require('sqlite3').verbose()
const fs = require('fs')
const DB_PATH = 'database'

const tableInitQueryMap = new Map([
	[
		'Rolls',
		`CREATE TABLE Rolls (
		userId INTEGER PRIMARY KEY,
		data BLOB,
		timestamp BLOB,
		guildId INTEGER
	)` ],
	[
		'Schedule',
		`CREATE TABLE "Schedule" (
			"scheduleId"	INTEGER NOT NULL UNIQUE,
			"status"	INTEGER,
			"days"	BLOB,
			"ownerId"	INTEGER,
			PRIMARY KEY("scheduleId" AUTOINCREMENT)
		);`,
	],
	[
		'Schedule_Response',
		`CREATE TABLE "Schedule_Response" (
			"scheduleResponseId"	INTEGER NOT NULL UNIQUE,
			"scheduleId"	INTEGER,
			"respose"	BLOB,
			PRIMARY KEY("scheduleResponseId" AUTOINCREMENT),
			FOREIGN KEY("scheduleId") REFERENCES "Schedule"("scheduleId")
		);`,
	],
	[
		'Secret',
		`CREATE TABLE "Secret" (
			"secretId"	INTEGER NOT NULL UNIQUE,
			"deckId"	INTEGER NOT NULL,
			"name"	TEXT NOT NULL,
			"description"	TEXT NOT NULL,
			PRIMARY KEY("secretId" AUTOINCREMENT)
		);`,
	],
	[
		'Secret_Draw',
		`CREATE TABLE "Secret_Draw" (
			"secretId"	INTEGER NOT NULL UNIQUE,
			"userId"	INTEGER NOT NULL,
			PRIMARY KEY("secretId" AUTOINCREMENT)
		);`,
	],
	[
		'Secret_Deck',
		`CREATE TABLE "Secret_Deck" (
			"deckId"	INTEGER NOT NULL UNIQUE,
			"name"	TEXT NOT NULL,
			"description"	INTEGER NOT NULL,
			PRIMARY KEY("deckId" AUTOINCREMENT)
		);`,
	],
	[
		'File',
		`CREATE TABLE "File" (
			"fileId"	INTEGER NOT NULL UNIQUE,
			"blob"	BLOB NOT NULL,
			"name"	TEXT NOT NULL,
			"mime"	TEXT NOT NULL,
			PRIMARY KEY("fileId" AUTOINCREMENT)
		);`,
	],
	[
		'GlobalSettings',
		`CREATE TABLE "GlobalSettings" (
			"settingId"	INTEGER NOT NULL UNIQUE,
			"name"	TEXT NOT NULL UNIQUE,
			"type"	INTEGER NOT NULL CHECK(type IN('STRING', 'NUMBER', 'BOOLEAN')),
			"value"	TEXT NOT NULL,
			PRIMARY KEY("settingId" AUTOINCREMENT)
		);`,
	],
])

const tableDataInitQueryMap = new Map([
	[
		'GlobalSettings',
		`INSERT INTO GlobalSettings (name, type, value) VALUES ('SECRET_DRAW_ENABLED', 'BOOLEAN', '0');`,
	],
])
/**
 *	Used for when you want to insert/update something and get the ID of the row back
 * @param {String} query
 * @param  {...any} args
 * @returns {Promise<{lastId: Number, changes: String, sql: String}>}
 */

function doUpdate(query, ...args) {
	const db = new sqlite.Database(DB_PATH)
	return new Promise((resolve, reject) => {
		db.run(query, ...args, function(err) {
			if (err) {
				db.close()
				reject(err)
			}
			db.close()
			return resolve(this)
		})
	})
}

function doQuery(query, ...args) {
	const db = new sqlite.Database(DB_PATH)
	return new Promise((resolve, reject) => {
		db.all(query, ...args, (err, res) => {
			if (err) {
				db.close()
				reject(err)
			}
			db.close()
			return resolve(res)
		})
	})
}

function doQueryFirst(query, ...args) {
	const db = new sqlite.Database(DB_PATH)
	return new Promise((resolve, reject)=> {
		db.get(query, ...args, (err, res)=> {
			if (err) {
				db.close()
				reject(err)
			}
			db.close()
			return resolve(res)
		})
	})
}

function databaseFileExists(dbPath) {
	return fs.existsSync(dbPath)
}

function databaseIsInitialized(dbPath) {
	return databaseFileExists(dbPath) // might do other stuff later idk, but this is pretty redundant rn
}

async function initTablesIfAbsent() {
	const tables = Array.from(tableInitQueryMap.keys())
	return await Promise.all(tables.map(async table => {
		const res = await doQueryFirst(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`)
		if (res?.name !== table) { // Doesn't exist
			console.log(`Created table ${table}`)
			await doQueryFirst(tableInitQueryMap.get(table))
			await doQueryFirst(tableDataInitQueryMap.get(table))
			return `${table} created`
		}
		return `${table} exists`
	}))
}

async function initializeDatabase() {
	const initRes = await initTablesIfAbsent()
	return initRes
}

module.exports = {
	tableInitQueryMap,
	doQuery,
	doQueryFirst,
	doUpdate,
	initializeDatabase,
	databaseIsInitialized,
}
