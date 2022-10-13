const db = require('./db')

module.exports = {
	async getGlobalSettingValue(settingName, defaultValue, dataType = 'STRING') {
		const query = `SELECT * FROM GlobalSettings WHERE name = '${settingName}';`
		const res = await db.doQueryFirst(query)

		if (!res && defaultValue && dataType) { // Res will only be falsy if there is no result
			await this.setGlobalSettingValue(settingName, defaultValue, dataType)
			const { value } = await this.getGlobalSettingValue(settingName, defaultValue, dataType)
			return value
		} else if (res?.type === 'NUMBER') {
			return Number(res.value)
		} else if (res?.type === 'BOOLEAN') {
			if (typeof settingName === 'string') {
				res.value = res.value.trim().toUpperCase()
				return res.value === 'TRUE' || res.value === '1'
			}
			return !!res.value
		} else {
			return res.value
		}
	},
	async setGlobalSettingValue(settingName, settingValue, dataType) {
		const query = `INSERT OR IGNORE INTO GlobalSettings (value, name, type) VALUES ('${settingValue}', '${settingName}', '${dataType}');`
		if (dataType === 'BOOLEAN' && typeof settingValue === 'boolean') {
			settingValue = settingValue ? 1 : 0
		}
		const res = await db.doQueryFirst(query)
		return res
	},
}
