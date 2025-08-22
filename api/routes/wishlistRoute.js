const express = require('express')
const { verifyToken, adminOnly } = require('../controllers/userController')
const {
    addItem,
    deleteItem,
    viewWishlist,
    viewWishlistAsAdmin
} = require('../controllers/wishlistController')

const router = express.Router()

router.get(
  '/viewWishlist',
  verifyToken,
  viewWishlist
)

router.get(
  '/viewWishlistAsAdmin/:id',
  verifyToken,
  adminOnly,
  viewWishlistAsAdmin
)

router.post(
  '/addItem',
  verifyToken,
  addItem
)

router.delete(
  '/deleteItem',
  verifyToken,
  deleteItem
)

module.exports = router
