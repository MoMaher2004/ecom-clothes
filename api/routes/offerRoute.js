const express = require('express')
const { verifyToken, adminOnly } = require('../controllers/userController')
const {
    viewOffers,
    addOffer,
    deleteOffer
} = require('../controllers/offerController')

const router = express.Router()

router.get(
  '/viewOffers',
  viewOffers
)

router.post(
  '/addOffer',
  verifyToken,
  adminOnly,
  addOffer
)

router.delete(
  '/deleteOffer/:id',
  verifyToken,
  adminOnly,
  deleteOffer
)

module.exports = router
