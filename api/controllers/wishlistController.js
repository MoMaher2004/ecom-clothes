const wishlistModel = require('../models/wishlistModel')

const addItem = async (req, res) => {
  try {
    const { id } = req.user
    const productId = req.body.productId
    if (!productId || productId < 1) {
      return res.status(400).json({ error: 'Enter a valid ID' })
    }
    await wishlistModel.addItem(id, productId)
    return res.status(200).json({ success: 'Products were added successfully' })
  } catch (error) {
    console.error('Error during addItem:', error)
return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })  }
}

const deleteItem = async (req, res) => {
  try {
    const { id } = req.user
    const productId = parseInt(req.query.productId)
    if (isNaN(productId) || productId < 1) {
      return res.status(400).json({ error: 'Enter a valid ID' })
    }
    await wishlistModel.deleteItem(id, productId)
    return res.status(200).json({ success: 'Products were deleted successfully' })
  } catch (error) {
    console.error('Error during deleteItem:', error)
return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })  }
}

const viewWishlist = async (req, res) => {
  try {
    const id = req.user.id
    const limit = parseInt(req.query.limit) || 20
    const page = parseInt(req.query.page) || 1
    if (isNaN(limit) || limit < 1 || isNaN(page) || page < 1) {
      return res.status(404).json({ error: 'Page not found' })
    }
    const wishlist = await wishlistModel.viewWishlist(id, page, limit)
    return res.status(200).json({
      rows: wishlist.rows,
      totalPrice: wishlist.totalPrice,
      length: wishlist.length
    })
  } catch (error) {
    console.error('Error during viewWishlist:', error)
return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })  }
}

const viewWishlistAsAdmin = async (req, res) => {
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
      const wishlist = await wishlistModel.viewWishlist(id, page, limit)
      return res.status(200).json({
        rows: wishlist.rows,
        totalPrice: wishlist.totalPrice,
        length: wishlist.length
      })
    } catch (error) {
      console.error('Error during viewWishlist:', error)
      throw new Error('Something went wrong')
    }
  } catch (error) {
    console.error('Error during addItem:', error)
return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })  }
}

module.exports = {
  addItem,
  deleteItem,
  viewWishlist,
  viewWishlistAsAdmin
}
