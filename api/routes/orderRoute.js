const express = require('express')
const { verifyToken, adminOnly } = require('../controllers/userController')
const {
  makeOrder,
  viewOrderAsAdmin,
  viewOrder,
  updateOrderStatus,
  cancelOrder,
  viewOrdersListOfUserAsAdmin,
  viewOrdersListAsAdmin,
  handleCallback,
  viewOrdersList
} = require('../controllers/orderController')

const router = express.Router()

router.post(
  '/makeOrder',
  verifyToken,
  makeOrder
)

router.post(
  '/paymobWebhook',
  handleCallback
)

router.get(
  '/viewOrderAsAdmin/:id',
  verifyToken,
  adminOnly,
  viewOrderAsAdmin
)

router.get(
  '/viewOrder/:id',
  verifyToken,
  viewOrder
)

router.patch(
  '/updateOrderStatus',
  verifyToken,
  adminOnly,
  updateOrderStatus
)

router.patch(
  '/cancelOrder',
  verifyToken,
  adminOnly,
  cancelOrder
)

router.get(
  '/viewOrdersListOfUserAsAdmin/:id',
  verifyToken,
  adminOnly,
  viewOrdersListOfUserAsAdmin
)

router.get(
  '/viewOrdersListAsAdmin',
  verifyToken,
  adminOnly,
  viewOrdersListAsAdmin
)

router.get(
  '/viewOrdersList',
  verifyToken,
  viewOrdersList
)

module.exports = router