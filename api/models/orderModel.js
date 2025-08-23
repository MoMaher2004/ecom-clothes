const pool = require('../config/db')

const makeOrder = async (
  id,
  government,
  city,
  address,
  phoneNumber,
  secondPhoneNumber = '',
  status = 'Pending',
  notes,
  zipCode,
) => {
  try {
    const conn = await pool.getConnection()
    await conn.beginTransaction()
    const [cartProducts] = await conn.query(
      `SELECT c.*,
        (p.price * (1 - p.discount)) AS price,
        p.name,
        p.amountOfSmallSize AS amountOfSmallSize,
        p.amountOfLargeSize AS amountOfLargeSize
        FROM carts c
        JOIN products p on c.productId = p.id
        WHERE c.userId = ?`,
      [id]
    )
    let lowAmounts = []
    for (let i = 0; i < cartProducts.length; i++) {
      if (cartProducts.smallQuantity > cartProducts.amountOfSmallSize) {
        lowAmounts.push({
          id: cartProducts.productId,
          name: cartProducts.name,
          userAmount: cartProducts.smallQuantity,
          availableAmount: cartProducts.amountOfSmallSize
        })
      }
    }
    if (lowAmounts.length > 0) {
      return { error: 'low amount', data: lowAmounts }
    }
    const [order] = await conn.query(
      `INSERT INTO orders 
      (userId,
      government,
      city,
      address,
      phoneNumber,
      secondPhoneNumber,
      status,
      notes,
      zipCode,
      shipmentCost)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT cost FROM shipmentCosts WHERE government = ?))
      `,
      [
        id,
        government,
        city,
        address,
        phoneNumber,
        secondPhoneNumber,
        status,
        notes,
        zipCode,
        government
      ]
    )
    if (order.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    const orderId = order.insertId
    let items = []
    for (let i = 0; i < cartProducts.length; i++) {
      await conn.query(
        `UPDATE products 
            SET amountOfSmallSize = amountOfSmallSize - ?,
            amountOfLargeSize = amountOfLargeSize - ?
            WHERE id = ?`,
        [
          cartProducts[i].smallQuantity,
          cartProducts[i].largeQuantity,
          cartProducts[i].productId
        ]
      )
      if (cartProducts[i].smallQuantity > 0) {
        items.push([
          orderId,
          cartProducts[i].productId,
          cartProducts[i].smallQuantity,
          cartProducts[i].price,
          'small'
        ])
      }
      if (cartProducts[i].largeQuantity > 0) {
        items.push([
          orderId,
          cartProducts[i].productId,
          cartProducts[i].largeQuantity,
          cartProducts[i].price,
          'large'
        ])
      }
    }
    const [res] = await conn.query(
      `INSERT INTO items (orderId, productId, quantity, pricePerUnit, size) VALUES ?`,
      [items]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    await conn.commit()
    return { success: 'Order is added successfully' }
  } catch (error) {
    console.error('Error during makeOrder:', error)
    await conn.rollback()
    throw new Error('Something went wrong')
  }
}

const viewOrderAsAdmin = async orderId => {
  try {
    const [rows] = await pool.query(
      `SELECT 
  o.id AS orderId,
  o.trackCode,
  o.government,
  o.city,
  o.address,
  o.phoneNumber,
  o.secondPhoneNumber,
  o.status,
  o.issuedAt,
  o.updatedAt,
  o.notes,
  o.zipCode,
  o.shipmentCost,
  u.id AS userId,
  u.firstName,
  u.lastName,
  u.email,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'productId', p.id,
      'productName', p.name,
      'withNursery', p.withNursery,
      'quantity', i.quantity,
      'pricePerUnit', i.pricePerUnit,
      'size', i.size
    )
  ) AS products
FROM orders o
JOIN users u ON u.id = o.userId
JOIN items i ON i.orderId = o.id
JOIN products p ON p.id = i.productId
WHERE o.id = ?
GROUP BY o.id, u.id, u.firstName, u.lastName, u.email, o.issuedAt, o.status;`,
      [orderId]
    )
    if (rows.length == 0) {
      return []
    }
    const [productsCost] = await pool.query(
      `SELECT SUM(pricePerUnit) FROM items WHERE orderId = ?`,
      orderId
    )
    return { data: rows[0], productsCost: productsCost[0] }
  } catch (error) {
    console.error('Error during viewOrderAsAdmin:', error)
    throw new Error('Something went wrong')
  }
}

const viewOrder = async (orderId, userId) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
  o.id AS orderId,
  o.trackCode,
  o.government,
  o.city,
  o.address,
  o.phoneNumber,
  o.secondPhoneNumber,
  o.status,
  o.issuedAt,
  o.updatedAt,
  o.notes,
  o.zipCode,
  o.shipmentCost,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'productName', p.name,
      'withNursery', p.withNursery,
      'quantity', i.quantity,
      'pricePerUnit', i.pricePerUnit,
      'size', i.size
    )
  ) AS products
FROM orders o
JOIN items i ON i.orderId = o.id
JOIN products p ON p.id = i.productId
WHERE o.id = ? AND o.userId = ?
GROUP BY o.id, o.issuedAt, o.status;`,
      [orderId, userId]
    )
    if (rows.length == 0) {
      return []
    }
    const [productsCost] = await pool.query(
      `SELECT SUM(pricePerUnit * quantity) AS productsCost FROM items WHERE orderId = ?`,
      orderId
    )
    return { data: rows[0], productsCost: productsCost[0].productsCost }
  } catch (error) {
    console.error('Error during viewOrder:', error)
    throw new Error('Something went wrong')
  }
}

const updateOrderStatus = async orderId => {
  try {
    const [res] = await pool.query(
      `UPDATE orders
SET status = CASE status
    WHEN 'Pending' THEN 'Processing'
    WHEN 'Processing' THEN 'Shipped'
    WHEN 'Shipped' THEN 'Delivered'
    ELSE status
END
WHERE id = ?`,
      [orderId]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return { success: 'order status is updated successfully' }
  } catch (error) {
    console.error('Error during updateOrderStatus:', error)
    throw new Error('Something went wrong')
  }
}

const cancelOrder = async orderId => {
  try {
    const conn = await pool.getConnection()
    await conn.beginTransaction()
    const [res] = await conn.query(
      `UPDATE orders
SET status = 'Cancelled'
WHERE id = ?`,
      [orderId]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    const [items] = await conn.query(
      `SELECT productId, quantity, size FROM items WHERE orderId = ?`,
      [orderId]
    )
    for (let i = 0; i < items.length; i++) {
      if (items[i].size == 'small') {
        await conn.query(
          `UPDATE products SET amountOfSmallSize = amountOfSmallSize + ? WHERE id = ?`,
          [items[i].quantity, items[i].productId]
        )
      }
      if (items[i].size == 'large') {
        await conn.query(
          `UPDATE products SET amountOfLargeSize = amountOfLargeSize + ? WHERE id = ?`,
          [items[i].quantity, items[i].productId]
        )
      }
    }
    conn.commit()
    return { success: 'order is canceled successfully' }
  } catch (error) {
    console.error('Error during cancelOrder:', error)
    await conn.rollback()
    throw new Error('Something went wrong')
  }
}

const viewOrdersListOfUserAsAdmin = async userId => {
  try {
    const [rows] = await pool.query(
      `SELECT 
  o.id AS orderId,
  o.trackCode,
  o.government,
  o.city,
  o.phoneNumber,
  o.secondPhoneNumber,
  o.status,
  o.issuedAt,
  o.updatedAt,
  o.shipmentCost,
  u.firstName,
  u.lastName,
  SUM(i.pricePerUnit * i.quantity) AS productsCost
FROM orders o
JOIN users u ON u.id = o.userId
JOIN items i ON i.orderId = o.id
WHERE o.userId = ?
GROUP BY 
  o.id,
  o.trackCode,
  o.government,
  o.city,
  o.phoneNumber,
  o.secondPhoneNumber,
  o.status,
  o.issuedAt,
  o.updatedAt,
  o.shipmentCost,
  u.firstName,
  u.lastName`,
      [userId]
    )
    if (rows.length == 0) {
      return []
    }
    return { data: rows }
  } catch (error) {
    console.error('Error during viewOrdersListAsAdminOfUser:', error)
    throw new Error('Something went wrong')
  }
}

const viewOrdersListAsAdmin = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT 
  o.id AS orderId,
  o.trackCode,
  o.government,
  o.city,
  o.phoneNumber,
  o.secondPhoneNumber,
  o.status,
  o.issuedAt,
  o.updatedAt,
  o.shipmentCost,
  u.firstName,
  u.lastName,
  SUM(i.pricePerUnit * i.quantity) AS productsCost
FROM orders o
JOIN users u ON u.id = o.userId
JOIN items i ON i.orderId = o.id
GROUP BY 
  o.id,
  o.trackCode,
  o.government,
  o.city,
  o.phoneNumber,
  o.secondPhoneNumber,
  o.status,
  o.issuedAt,
  o.updatedAt,
  o.shipmentCost,
  u.firstName,
  u.lastName`,
      []
    )
    if (rows.length == 0) {
      return []
    }
    return { data: rows }
  } catch (error) {
    console.error('Error during viewOrdersListAsAdmin:', error)
    throw new Error('Something went wrong')
  }
}

const viewOrdersList = async userId => {
  try {
    const [rows] = await pool.query(
      `SELECT 
  o.id AS orderId,
  o.trackCode,
  o.government,
  o.city,
  o.phoneNumber,
  o.secondPhoneNumber,
  o.status,
  o.issuedAt,
  o.updatedAt,
  o.shipmentCost,
  SUM(i.pricePerUnit * i.quantity) AS productsCost
FROM orders o
JOIN items i ON i.orderId = o.id
WHERE o.userId = ?
GROUP BY 
  o.id,
  o.trackCode,
  o.government,
  o.city,
  o.phoneNumber,
  o.secondPhoneNumber,
  o.status,
  o.issuedAt,
  o.updatedAt,
  o.shipmentCost`,
      [userId]
    )
    if (rows.length == 0) {
      return []
    }
    return { data: rows }
  } catch (error) {
    console.error('Error during viewOrdersList:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
  makeOrder,
  viewOrderAsAdmin,
  viewOrder,
  updateOrderStatus,
  cancelOrder,
  viewOrdersListOfUserAsAdmin,
  viewOrdersListAsAdmin,
  viewOrdersList
}
