const conn = require('../config/db')

const viewShipmentCosts = async () => {
  try {
    const [rows] = await conn.query(
      `SELECT * FROM shipmentCosts`,
      []
    )
    return { data: rows }
  } catch (error) {
    console.error('Error during viewShipmentCosts:', error)
    throw new Error('Something went wrong')
  }
}

const modifyShipmentCost = async (government, newCost) => {
  try {
    const [rows] = await conn.query(
      `UPDATE shipmentCosts SET cost = ? WHERE government = ?`,
      [newCost, government]
    )
    if (rows.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Cost is updated successfully' }
  } catch (error) {
    console.error('Error during modifyShipmentCost:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
  viewShipmentCosts,
  modifyShipmentCost
}
