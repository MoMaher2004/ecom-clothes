const pool = require('../config/db')

// const makeOrder = async (
//   id,
//   government,
//   city,
//   address,
//   phoneNumber,
//   secondPhoneNumber = '',
//   status = 'Pending',
//   notes,
//   zipCode
// ) => {
//   const conn = await pool.getConnection()
//   try {
//     await conn.beginTransaction()
//     const [cartProducts] = await conn.query(
//       `SELECT c.*,
//         (p.price * (1 - p.discount)) AS price,
//         p.name,
//         p.amountOfSmallSize AS amountOfSmallSize,
//         p.amountOfLargeSize AS amountOfLargeSize
//         FROM carts c
//         JOIN products p on c.productId = p.id
//         WHERE c.userId = ?`,
//       [id]
//     )
//     if (cartProducts.length == 0) {
//       await conn.rollback()
//       return { error: 'Cart is empty' }
//     }
//     let lowAmounts = []
//     for (let i = 0; i < cartProducts.length; i++) {
//       if (cartProducts.smallQuantity > cartProducts.amountOfSmallSize) {
//         lowAmounts.push({
//           id: cartProducts.productId,
//           name: cartProducts.name,
//           userAmount: cartProducts.smallQuantity,
//           availableAmount: cartProducts.amountOfSmallSize
//         })
//       }
//     }
//     if (lowAmounts.length > 0) {
//       await conn.rollback()
//       return { error: 'low amount', data: lowAmounts }
//     }
//     const [order] = await conn.query(
//       `INSERT INTO orders
//       (userId,
//       government,
//       city,
//       address,
//       phoneNumber,
//       secondPhoneNumber,
//       status,
//       notes,
//       zipCode,
//       shipmentCost)
//       VALUES
//       (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT cost FROM shipmentCosts WHERE government = ?))
//       `,
//       [
//         id,
//         government,
//         city,
//         address,
//         phoneNumber,
//         secondPhoneNumber,
//         status,
//         notes,
//         zipCode,
//         government
//       ]
//     )
//     if (order.affectedRows === 0) {
//       throw new Error('Something went wrong')
//     }
//     const orderId = order.insertId
//     let items = []
//     for (let i = 0; i < cartProducts.length; i++) {
//       await conn.query(
//         `UPDATE products
//             SET amountOfSmallSize = amountOfSmallSize - ?,
//             amountOfLargeSize = amountOfLargeSize - ?
//             WHERE id = ?`,
//         [
//           cartProducts[i].smallQuantity,
//           cartProducts[i].largeQuantity,
//           cartProducts[i].productId
//         ]
//       )
//       if (cartProducts[i].smallQuantity > 0) {
//         items.push([
//           orderId,
//           cartProducts[i].productId,
//           cartProducts[i].smallQuantity,
//           cartProducts[i].price,
//           'small'
//         ])
//       }
//       if (cartProducts[i].largeQuantity > 0) {
//         items.push([
//           orderId,
//           cartProducts[i].productId,
//           cartProducts[i].largeQuantity,
//           cartProducts[i].price,
//           'large'
//         ])
//       }
//     }
//     const [res] = await conn.query(
//       `INSERT INTO items (orderId, productId, quantity, pricePerUnit, size) VALUES ?`,
//       [items]
//     )
//     if (res.affectedRows === 0) {
//       throw new Error('Something went wrong')
//     }

//     await conn.query(`DELETE FROM carts WHERE userId = ?`, [id])
//     await conn.commit()
//     return { success: 'Order is added successfully' }
//   } catch (error) {
//     console.error('Error during makeOrder:', error)
//     await conn.rollback()
//     throw new Error('Something went wrong')
//   }
// }

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
  cartProducts,
  paymentMethod
) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
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
      shipmentCost,
      paymentMethod)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT cost FROM shipmentCosts WHERE government = ?), ?)
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
        government,
        paymentMethod
      ]
    )
    if (order.affectedRows === 0) {
      await conn.rollback()
      throw new Error('Something went wrong')
    }
    const orderId = order.insertId

    const [shipmentCost] = await conn.query(
      `SELECT cost FROM shipmentCosts WHERE government = ?`,
      [government]
    )

    let product
    let totalProductsCost = 0
    let lowAmounts = []
    for (let i = 0; i < cartProducts.length; i++) {
      ;[product] = await conn.query(
        `SELECT price, name, discount, amountOfSmallSize, amountOfLargeSize FROM products WHERE id = ?`,
        [cartProducts[i].productId]
      )
      product = product[0]
      if (cartProducts.amountOfSmallSize > product.amountOfSmallSize) {
        lowAmounts.push({
          id: cartProducts.productId,
          name: cartProducts.name,
          userAmount: cartProducts.amountOfSmallSize,
          availableAmount: cartProducts.amountOfSmallSize
        })
      }
      if (cartProducts.amountOfLargeSize > product.amountOfLargeSize) {
        lowAmounts.push({
          id: cartProducts.productId,
          name: product.name,
          userAmount: cartProducts.amountOfSmallSize,
          availableAmount: product.amountOfLargeSize
        })
      }
      cartProducts[i].pricePerUnit = (1 - product.discount) * product.price
      totalProductsCost +=
        cartProducts[i].pricePerUnit *
        (cartProducts[i].amountOfLargeSize + cartProducts[i].amountOfSmallSize)
    }
    if (lowAmounts.length > 0) {
      await conn.rollback()
      return { error: 'low amount', data: lowAmounts }
    }

    let items = []
    for (let i = 0; i < cartProducts.length; i++) {
      // await conn.query(
      //   `UPDATE products
      //       SET amountOfSmallSize = amountOfSmallSize - ?,
      //       amountOfLargeSize = amountOfLargeSize - ?
      //       WHERE id = ?`,
      //   [
      //     cartProducts[i].amountOfSmallSize,
      //     cartProducts[i].amountOfLargeSize,
      //     cartProducts[i].productId
      //   ]
      // )
      if (cartProducts[i].amountOfSmallSize > 0) {
        items.push([
          orderId,
          cartProducts[i].productId,
          cartProducts[i].amountOfSmallSize,
          cartProducts[i].pricePerUnit,
          'small'
        ])
      }
      if (cartProducts[i].amountOfLargeSize > 0) {
        items.push([
          orderId,
          cartProducts[i].productId,
          cartProducts[i].amountOfLargeSize,
          cartProducts[i].pricePerUnit,
          'large'
        ])
      }
    }
    const [res] = await conn.query(
      `INSERT INTO items (orderId, productId, quantity, pricePerUnit, size) VALUES ?`,
      [items]
    )
    if (res.affectedRows === 0) {
      await conn.rollback()
      throw new Error('Something went wrong')
    }
    conn.commit()
    return {
      success: 'Order is added successfully',
      insertId: orderId,
      shipmentCost: shipmentCost[0].cost,
      totalProductsCost
    }
  } catch (error) {
    console.error('Error during makeOrder:', error)
    await conn.rollback()
    throw new Error('Something went wrong')
  }
}

const setPaymobOrderId = async (orderId, paymobOrderId) => {
  try {
    const [res] = await pool.query(
      `UPDATE orders SET paymobOrderId = ? WHERE id = ?`,
      [paymobOrderId, orderId]
    )
    if (res.affectedRows === 0) {
      throw new Error('Something went wrong')
    }
    return {
      success: 'Order paymob ID is added successfully'
    }
  } catch (error) {
    console.error('Error during makeOrder:', error)
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
  o.paymentMethod,
  u.id AS userId,
  u.firstName,
  u.lastName,
  u.email,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'productId', p.id,
      'productImages', (
          SELECT JSON_ARRAYAGG(im.fileName)
          FROM images im
          WHERE im.productId = p.id
      ),
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
      `SELECT SUM(pricePerUnit * quantity) AS totalCost FROM items WHERE orderId = ?`,
      orderId
    )
    return { data: rows[0], productsCost: productsCost[0].totalCost }
  } catch (error) {
    console.error('Error during viewOrderAsAdmin:', error)
    throw new Error('Something went wrong')
  }
}

const confirmOrder = async orderId => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const [items] = await conn.query(
      `SELECT * FROM items WHERE orderId = ?`,
      [orderId]
    )
    for (let i = 0; i < items.length; i++) {
      if (items[i].size == 'small') {
        await conn.query(
          `UPDATE products 
         SET amountOfSmallSize = amountOfSmallSize - ?
         WHERE id = ?`,
          [items[i].quantity, items[i].productId]
        )
      } else if (items[i].size == 'large') {
        await conn.query(
          `UPDATE products 
         SET amountOfLargeSize = amountOfLargeSize - ?
         WHERE id = ?`,
          [items[i].quantity, items[i].productId]
        )
      }
    }

    await conn.query(
      `UPDATE orders SET status = 'Processing', updatedAt = NOW() WHERE id = ?`,
      [orderId]
    )

    await conn.commit()
    return { success: 'Order confirmed and processed' }
  } catch (error) {
    console.error('Error during confirmOrder:', error)
    await conn.rollback()
    throw new Error('Something went wrong')
  } finally {
    conn && conn.release()
  }
}

const updateOrderStatusToFailed = async paymobOrderId => {
  try {
    const [res] = await pool.query(
      `UPDATE orders SET status = 'Failed' WHERE paymobOrderId = ?`,
      [paymobOrderId]
    )
    return res
  } catch (err) {
    console.error('updateOrderStatusToFailed error:', err)
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
  o.paymentMethod,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'productId', p.id,
      'productImages', (
          SELECT JSON_ARRAYAGG(im.fileName)
          FROM images im
          WHERE im.productId = p.id
      ),
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
GROUP BY o.id, o.issuedAt, o.status;
`,
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

const getOrderByPaymobId = async paymobOrderId => {
  try {
    const [rows] = await pool.query(
      `SELECT id FROM orders WHERE paymobOrderId = ?`,
      [paymobOrderId]
    )
    if (rows.length == 0) {
      return []
    }
    return rows[0]
  } catch (error) {
    console.error('Error during getOrderByPaymobId:', error)
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
  const conn = await pool.getConnection()
  try {
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

const viewOrdersListOfUserAsAdmin = async (
  userId,
  page = 1,
  limit = 20,
  status = null
) => {
  try {
    const offset = (page - 1) * limit
    let selectStatus = ''
    if (status == 'processing') {
      selectStatus = ` AND status = 'Processing'`
    } else if (status == 'pending') {
      selectStatus = ` AND status = 'Pending'`
    } else if (status == 'shipped') {
      selectStatus = ` AND status = 'Shipped'`
    } else if (status == 'delivered') {
      selectStatus = ` AND status = 'Delivered'`
    } else if (status == 'cancelled') {
      selectStatus = ` AND status = 'Cancelled'`
    } else if (status == 'failed') {
      selectStatus = ` AND status = 'Failed'`
    }

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
  o.paymentMethod,
  u.firstName,
  u.lastName,
  SUM(i.pricePerUnit * i.quantity) AS productsCost
FROM orders o
JOIN users u ON u.id = o.userId
JOIN items i ON i.orderId = o.id
WHERE o.userId = ? ${selectStatus}
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
  u.lastName
  ORDER BY CASE status
    WHEN 'Processing' THEN 2
    WHEN 'Pending' THEN 1
    WHEN 'Shipped' THEN 3
    WHEN 'Delivered' THEN 4
    WHEN 'Cancelled' THEN 5
    WHEN 'Failed' THEN 6
  END 
  LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    )
    if (rows.length == 0) {
      return { data: [], length: 0 }
    }
    const [length] = await pool.query(
      `SELECT COUNT(*) AS count FROM orders WHERE userId = ?`,
      [userId]
    )
    return { data: rows, length: length[0].count }
  } catch (error) {
    console.error('Error during viewOrdersListAsAdminOfUser:', error)
    throw new Error('Something went wrong')
  }
}

const viewOrdersListAsAdmin = async (page = 1, limit = 20, status = null) => {
  try {
    const offset = (page - 1) * limit
    let selectStatus = ''
    if (status == 'processing') {
      selectStatus = ` WHERE status = 'Processing'`
    } else if (status == 'pending') {
      selectStatus = ` WHERE status = 'Pending'`
    } else if (status == 'shipped') {
      selectStatus = ` WHERE status = 'Shipped'`
    } else if (status == 'delivered') {
      selectStatus = ` WHERE status = 'Delivered'`
    } else if (status == 'cancelled') {
      selectStatus = ` WHERE status = 'Cancelled'`
    } else if (status == 'failed') {
      selectStatus = ` WHERE status = 'Failed'`
    }
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
  o.paymentMethod,
  u.firstName,
  u.lastName,
  SUM(i.pricePerUnit * i.quantity) AS productsCost
FROM orders o
JOIN users u ON u.id = o.userId
JOIN items i ON i.orderId = o.id
${selectStatus}
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
  u.lastName
  ORDER BY CASE status
    WHEN 'Processing' THEN 2
    WHEN 'Pending' THEN 1
    WHEN 'Shipped' THEN 3
    WHEN 'Delivered' THEN 4
    WHEN 'Cancelled' THEN 5
    WHEN 'Failed' THEN 6
  END 
  LIMIT ? OFFSET ?`,
      [limit, offset]
    )
    if (rows.length == 0) {
      return { data: [], length: 0 }
    }
    const [length] = await pool.query(
      `SELECT COUNT(*) AS count FROM orders`,
      []
    )
    return { data: rows, length: length[0].count }
  } catch (error) {
    console.error('Error during viewOrdersListAsAdmin:', error)
    throw new Error('Something went wrong')
  }
}

const viewOrdersList = async (userId, page = 1, limit = 20, status = null) => {
  try {
    const offset = (page - 1) * limit
    let selectStatus = ''
    if (status == 'processing') {
      selectStatus = ` AND status = 'Processing'`
    } else if (status == 'pending') {
      selectStatus = ` AND status = 'Pending'`
    } else if (status == 'shipped') {
      selectStatus = ` AND status = 'Shipped'`
    } else if (status == 'delivered') {
      selectStatus = ` AND status = 'Delivered'`
    } else if (status == 'cancelled') {
      selectStatus = ` AND status = 'Cancelled'`
    }
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
  o.paymentMethod,
  SUM(i.pricePerUnit * i.quantity) AS productsCost
FROM orders o
JOIN items i ON i.orderId = o.id
WHERE o.userId = ? AND o.status != 'Failed' ${selectStatus}
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
  o.shipmentCost
  ORDER BY CASE status
    WHEN 'Processing' THEN 2
    WHEN 'Pending' THEN 1
    WHEN 'Shipped' THEN 3
    WHEN 'Delivered' THEN 4
    WHEN 'Cancelled' THEN 5
    WHEN 'Failed' THEN 6
  END 
  LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    )
    if (rows.length == 0) {
      return { data: [], length: 0 }
    }
    const [length] = await pool.query(
      `SELECT COUNT(*) AS count FROM orders WHERE userId = ?`,
      [userId]
    )
    return { data: rows, length: length[0].count }
  } catch (error) {
    console.error('Error during viewOrdersList:', error)
    throw new Error('Something went wrong')
  }
}

const deleteOrderById = async orderId => {
  try {
    await pool.query(`DELETE FROM orders WHERE id = ?`, [orderId])
  } catch (error) {
    console.error('Error during deleteOrderById:', error)
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
  viewOrdersList,
  setPaymobOrderId,
  getOrderByPaymobId,
  confirmOrder,
  updateOrderStatusToFailed,
  deleteOrderById
}
