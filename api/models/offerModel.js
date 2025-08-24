const conn = require('../config/db')

const viewOffers = async () => {
  try {
    const [rows] = await conn.query(
      `SELECT * FROM offers ORDER BY id DESC`,
      []
    )
    return { data: rows }
  } catch (error) {
    console.error('Error during viewOffers:', error)
    throw new Error('Something went wrong')
  }
}

const addOffer = async (title, badge = '', subTitle = '', oldPrice, discount, endTime, url) => {
  try {
    const [rows] = await conn.query(
      `INSERT INTO offers (title, badge, subTitle, oldPrice, discount, endTime, url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, badge, subTitle, oldPrice, discount, endTime, url]
    )
    if (rows.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Offer is added successfully' }
  } catch (error) {
    console.error('Error during addOffer:', error)
    throw new Error('Something went wrong')
  }
}

const deleteOffer = async (id) => {
  try {
    const [rows] = await conn.query(
      `DELETE FROM offers WHERE id = ?`,
      [id]
    )
    if (rows.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Offer is deleted successfully' }
  } catch (error) {
    console.error('Error during deleteOffer:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
  viewOffers,
  addOffer,
  deleteOffer
}
