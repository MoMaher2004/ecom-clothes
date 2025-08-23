const express = require('express')
const { verifyToken, adminOnly } = require('../controllers/userController')
const {
    viewShipmentCosts,
    modifyShipmentCost
} = require('../controllers/shipmentCostsController')

const router = express.Router()

router.get(
  '/viewShipmentCosts',
  viewShipmentCosts
)

router.patch(
  '/modifyShipmentCost',
  verifyToken,
  adminOnly,
  modifyShipmentCost
)

module.exports = router
