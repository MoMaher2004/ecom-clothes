const conn = require('../config/db')

const getProductById = async (id, allowDeleted = false, userId = 0) => {
  try {
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
    GROUP_CONCAT(i.fileName) AS images,
    CASE WHEN c.productId IS NOT NULL THEN c.smallQuantity ELSE 0 END AS smallQuantity,
    CASE WHEN c.productId IS NOT NULL THEN c.largeQuantity ELSE 0 END AS largeQuantity,
    CASE WHEN w.productId IS NOT NULL THEN TRUE ELSE FALSE END AS wishlist
FROM products p
LEFT JOIN images i ON p.id = i.productId
LEFT JOIN wishlists w ON w.userId = ? AND w.productId = p.id
LEFT JOIN carts c ON c.userId = ? AND c.productId = p.id
WHERE p.id = ?
       ${allowDeleted ? '' : ' AND p.isDeleted = 0 '}
GROUP BY 
    p.id, 
    p.name, 
    p.price, 
    p.discount, 
    p.description, 
    p.withNursery, 
    p.amountOfSmallSize, 
    p.amountOfLargeSize
      `,
      [userId, userId, id]
    )
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

const getProductsList = async (
  page = 1,
  limit = 20,
  isDeleted = false,
  orderBy = false,
  nursery = null,
  id = 0
) => {
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
    let withNursery
    if (nursery == 'yes') {
      withNursery = 'AND withNursery = 1'
    } else if (nursery == 'no') {
      withNursery = 'AND withNursery = 0'
    } else {
      withNursery = ''
    }

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
    GROUP_CONCAT(i.fileName) AS images,
    CASE WHEN c.productId IS NOT NULL THEN c.smallQuantity ELSE 0 END AS smallQuantity,
    CASE WHEN c.productId IS NOT NULL THEN c.largeQuantity ELSE 0 END AS largeQuantity,
    CASE WHEN w.productId IS NOT NULL THEN TRUE ELSE FALSE END AS wishlist
FROM products p
LEFT JOIN images i ON p.id = i.productId
LEFT JOIN wishlists w ON w.userId = ? AND w.productId = p.id
LEFT JOIN carts c ON c.userId = ? AND c.productId = p.id
WHERE p.isDeleted = ?
       ${withNursery}
GROUP BY 
    p.id, 
    p.name, 
    p.price, 
    p.discount, 
    p.description, 
    p.withNursery, 
    p.amountOfSmallSize, 
    p.amountOfLargeSize
    ${filter}
       LIMIT ? OFFSET ?`,
      [id, id, isDeleted ? 1 : 0, limit, offset]
    )
    const [count] = await conn.query(
      `SELECT COUNT(id) AS total
       FROM products
       WHERE isDeleted = ?
       ${withNursery}
       ${filter}`,
      [isDeleted ? 1 : 0]
    )
    if (rows.length === 0) {
      return []
    }
    return { rows, count: count[0].total }
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
    return { productId: res.insertId }
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
  amountOfLargeSize
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
      [price, discount, description, amountOfSmallSize, amountOfLargeSize, id]
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

// const restoreProduct = async id => {
//   try {
//     const [res] = await conn.query(
//       `UPDATE products SET isDeleted = 0 WHERE id = ?`,
//       [id]
//     )
//     if (res.affectedRows === 0) {
//       throw new Error('Something went wrong')
//     }
//     return { success: 'Product restore successfully' }
//   } catch (error) {
//     console.error('Error during restoreProduct:', error)
//     throw new Error('Something went wrong')
//   }
// }

const uploadImages = async (getProductById, fileName) => {
  try {
    const [res] = await conn.query(
      `INSERT INTO images (productId, fileName) VALUES (?, ?)`,
      [getProductById, fileName]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Image was uploaded successfully' }
  } catch (error) {
    console.error('Error during uploadImages:', error)
    throw new Error('Something went wrong')
  }
}

const deleteImage = async fileName => {
  try {
    const [res] = await conn.query(`DELETE FROM images WHERE fileName = ?`, [
      fileName
    ])
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'Image was deleted successfully' }
  } catch (error) {
    console.error('Error during deleteImage:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
  getProductById,
  getProductsList,
  addProduct,
  editProduct,
  deleteProduct,
  restoreProduct,
  uploadImages,
  deleteImage
}
