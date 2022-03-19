const sqlite = require('sqlite3').verbose()
const fs = require('fs')
const dbPath = 'database'

const tableInitQueryMap = new Map([
	[ 'Rolls', `CREATE TABLE Rolls (
		userId INTEGER,
		data BLOB,
		timestamp BLOB,
		guildId INTEGER
	)` ],
])

function doQuery(query, ...args) {
	const db = new sqlite.Database('database')
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
	const db = new sqlite.Database('database')
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
			await doQueryFirst(tableInitQueryMap.get(table))
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
	initializeDatabase,
	databaseIsInitialized,
}
