const express = require('express')
const { verifyToken, adminOnly } = require('../controllers/userController')
const {
    addItem,
    deleteItem,
    viewCart,
    viewCartAsAdmin
} = require('../controllers/cartController')

const router = express.Router()

router.get(
  '/viewCart',
  verifyToken,
  viewCart
)

router.get(
  '/viewCartAsAdmin/:id',
  verifyToken,
  adminOnly,
  viewCartAsAdmin
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
