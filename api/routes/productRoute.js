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
  // restoreProduct,
  deleteImage,
  uploadImages
} = require('../controllers/productController')
const imagesUtils = require('../utils/imagesUtils')

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
// router.patch('/restoreProduct/', verifyToken, adminOnly, restoreProduct)

router.post('/uploadImages', verifyToken, adminOnly, imagesUtils.uploadImages.array('images', 10), uploadImages)
router.delete('/deleteImage/:imageName', verifyToken, adminOnly, deleteImage)

module.exports = router
