const express = require('express')
const { verifyToken, adminOnly } = require('../controllers/userController')
const {
  getProductsList,
  getDeletedProductsList,
  getProductById,
  getProductByIdAsAdmin,
  addProduct,
  editProduct,
  deleteProduct,
  restoreProduct
} = require('../controllers/productController')

const router = express.Router()

router.get('/getProductsList', getProductsList)
router.get(
  '/getDeletedProductsList',
  verifyToken,
  adminOnly,
  getDeletedProductsList
)
router.get('/getProductById/:id', getProductById)
router.get(
  '/getProductByIdAsAdmin/:id',
  verifyToken,
  adminOnly,
  getProductByIdAsAdmin
)
router.post('/addProduct/', verifyToken, adminOnly, addProduct)
router.patch('/editProduct/:id', verifyToken, adminOnly, editProduct)
router.delete('/deleteProduct/:id', verifyToken, adminOnly, deleteProduct)
router.patch('/restoreProduct/', verifyToken, adminOnly, restoreProduct)

module.exports = router
