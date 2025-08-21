const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  timezone: '+00:00',
  typeCast: function (field, next) {
    if (field.type === 'NEWDECIMAL' || field.type === 'DECIMAL') {
      const val = field.string()
      return val === null ? null : Number(val)
    }
    return next()
  }
})

module.exports = pool