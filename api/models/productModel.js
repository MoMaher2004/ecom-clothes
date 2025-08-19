const conn = require('../config/db')

const getProductById = async (id, allowDeleted = false) => {
  try {
    const [rows] = await conn.query('SELECT * FROM products WHERE id = ? ' + (allowDeleted ? '' : 'AND isDeleted = 0'), [id])
    if (rows.length === 0) {
      return null
    }
    rows[0].isDeleted = allowDeleted ? rows[0].isDeleted : undefined
    return rows[0]
  } catch (error) {
    console.error('Error during getProductById:', error)
    throw new Error('Something went wrong')
  }
}

const getProductsList = async (page = 1, limit = 20, isDeleted = false, orderBy = false) => {
  try {
    const offset = (page - 1) * limit
    let filter
    if (orderBy == 'newAdded') {
      filter = ' ORDER BY createdAt DESC'
    } else if (orderBy == 'mostBought') {
      // filter = ' ORDER BY createdAt DESC'
      filter = ''
    } else {
      filter = ''
    }

    const [rows] = await conn.query('SELECT * FROM products WHERE isDeleted = ?' + filter + ' LIMIT ? OFFSET ?', [
      isDeleted ? 1 : 0,
      limit,
      offset
    ])
    if (rows.length === 0) {
      return []
    }
    return rows
  } catch (error) {
    console.error('Error during getProductsList:', error)
    throw new Error('Something went wrong')
  }
}

const addProduct = async (
  name,
  price,
  discount,
  description,
  withNursery,
  amountOfSmallSize,
  amountOfLargeSize
) => {
  try {
    const [res] = await conn.query(
      `INSERT INTO products 
      (name, price, discount, description, withNursery, amountOfSmallSize, amountOfLargeSize, isDeleted)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        name,
        price,
        discount,
        description,
        withNursery,
        amountOfSmallSize,
        amountOfLargeSize
      ]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Product added successfully' }
  } catch (error) {
    console.error('Error during addProduct:', error)
    throw new Error('Something went wrong')
  }
}

const editProduct = async (
  id,
  price,
  discount,
  description,
  amountOfSmallSize,
  amountOfLargeSize,
) => {
  try {
    const [res] = await conn.query(
      `UPDATE products SET
        price = ?,
        discount = ?,
        description = ?,
        amountOfSmallSize = ?,
        amountOfLargeSize = ?
        WHERE id = ?`,
      [
        price,
        discount,
        description,
        amountOfSmallSize,
        amountOfLargeSize,
        id
      ]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Product edited successfully' }
  } catch (error) {
    console.error('Error during editProduct:', error)
    throw new Error('Something went wrong')
  }
}

const deleteProduct = async id => {
  try {
    const [res] = await conn.query(
      `UPDATE products SET isDeleted = 1 WHERE id = ?`,
      [id]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Product deleted successfully' }
  } catch (error) {
    console.error('Error during deleteProduct:', error)
    throw new Error('Something went wrong')
  }
}

const restoreProduct = async id => {
  try {
    console.log(id)
    const [res] = await conn.query(
      `UPDATE products SET isDeleted = 0 WHERE id = ?`,
      [id]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Product restore successfully' }
  } catch (error) {
    console.error('Error during restoreProduct:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
  getProductById,
  getProductsList,
  addProduct,
  editProduct,
  deleteProduct,
  restoreProduct
}
