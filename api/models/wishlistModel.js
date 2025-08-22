const conn = require('../config/db')

const addItem = async (id, productId) => {
  try {
    const [res] = await conn.query(
      `INSERT INTO wishlists (userId, productId)
        VALUES (?, ?)`,
      [id, productId]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Item was added successfully' }
  } catch (error) {
    console.error('Error during addItem:', error)
    throw new Error('Something went wrong')
  }
}

const deleteItem = async (id, productId) => {
  try {
    await conn.query(
      `DELETE FROM wishlists
        WHERE userId = ? AND productId = ?`,
      [id, productId]
    )
    return { success: 'Item was deleted successfully' }
  } catch (error) {
    console.error('Error during deleteItem:', error)
    throw new Error('Something went wrong')
  }
}

const viewWishlist = async (id, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit
    const [rows] = await conn.query(
        `SELECT 
            p.id, 
            p.name, 
            p.price, 
            p.discount, 
            p.description, 
            p.withNursery, 
            p.amountOfSmallSize, 
            p.amountOfLargeSize, 
            GROUP_CONCAT(i.fileName) AS images 
          FROM wishlists c
          LEFT JOIN products p ON c.productId = p.id 
          LEFT JOIN images i ON c.productId = i.productId 
          WHERE c.userId = ? AND p.isDeleted = 0
          GROUP BY p.id, p.name, p.price, p.discount, 
                   p.description, p.withNursery, p.amountOfSmallSize, 
                   p.amountOfLargeSize
          LIMIT ? OFFSET ?`,
        [id, limit, offset]
      )

    if (rows.length == 0) {
      return { rows: [], length: 0 }
    }

    const [metaData] = await conn.query(
        `SELECT COUNT(*) AS length 
         FROM wishlists c
         LEFT JOIN products p ON c.productId = p.id 
         WHERE c.userId = ? AND p.isDeleted = 0`,
        [id]
      )
    return { rows, length: metaData[0].length }
  } catch (error) {
    console.error('Error during deleteItem:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
  addItem,
  deleteItem,
  viewWishlist
}
