const conn = require('../config/db')

async function getTables() {
  const [rows] = await conn.query("SHOW TABLES");
  return rows.map(row => Object.values(row)[0]);
}

async function getTableData(table) {
  const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
  return rows;
}

module.exports = {
  getTables,
  getTableData
};
