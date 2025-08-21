const cartModel = require('../models/cartModel')

const addItem = async (req, res) => {
  try {
    const { id } = req.user
    const productId = req.body.productId
    const quantity = req.body.quantity
    if (!productId || productId < 1) {
      return res.status(400).json({ error: 'Enter a valid ID' })
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Enter a valid quantity' })
    }
    for (let i = 0; i < quantity; i++) {
      await cartModel.addItem(id, productId)
    }
    res.status(200).json({ success: 'Products were added successfully' })
  } catch (error) {
    console.error('Error during addItem:', error)
    throw new Error('Something went wrong')
  }
}

const deleteItem = async (req, res) => {
  try {
    const { id } = req.user
    const productId = parseInt(req.query.productId)
    const quantity = parseInt(req.query.quantity)
    if (isNaN(productId) || productId <= 1) {
      return res.status(400).json({ error: 'Enter a valid ID' })
    }
    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Enter a valid quantity' })
    }
    for (let i = 0; i < quantity; i++) {
      await cartModel.deleteItem(id, productId)
    }
    res.status(200).json({ success: 'Products were deleted successfully' })
  } catch (error) {
    console.error('Error during deleteItem:', error)
    throw new Error('Something went wrong')
  }
}

const viewCart = async (req, res) => {
  try {
    const id = req.user.id
    const limit = parseInt(req.query.limit) || 20
    const page = parseInt(req.query.page) || 1
    if (isNaN(limit) || limit < 1 || isNaN(page) || page < 1) {
      return res.status(404).json({ error: 'Page not found' })
    }
    const cart = await cartModel.viewCart(id, page, limit)
    res
      .status(200)
      .json({
        rows: cart.rows,
        totalPrice: cart.totalPrice,
        length: cart.length
      })
  } catch (error) {
    console.error('Error during viewCart:', error)
    throw new Error('Something went wrong')
  }
}

const viewCartAsAdmin = async (req, res) => {
  try {
    try {
      const id = req.params.id
      const limit = parseInt(req.query.limit) || 20
      const page = parseInt(req.query.page) || 1
      if (isNaN(limit) || limit < 1 || isNaN(page) || page < 1) {
        return res.status(404).json({ error: 'Page not found' })
      }
      if (isNaN(id) || id <= 1) {
        return res.status(400).json({ error: 'Invalid ID' })
      }
      const cart = await cartModel.viewCart(id, page, limit)
      res
        .status(200)
        .json({
          rows: cart.rows,
          totalPrice: cart.totalPrice,
          length: cart.length
        })
    } catch (error) {
      console.error('Error during viewCart:', error)
      throw new Error('Something went wrong')
    }
  } catch (error) {
    console.error('Error during addItem:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
  addItem,
  deleteItem,
  viewCart,
  viewCartAsAdmin
}
