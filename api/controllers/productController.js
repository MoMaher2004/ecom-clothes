const { error } = require('console')
const productModel = require('../models/productModel')
const va = require('../utils/validators')
const fs = require('fs').promises
const path = require('path')

const getProductsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const orderBy = ['', 'newAdded', 'mostBought'].includes(req.query.orderBy)
      ? req.query.orderBy
      : ''
    const withNursery = ['', 'yes', 'no'].includes(req.query.withNursery)
      ? req.query.withNursery
      : ''
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' })
    }
    const products = await productModel.getProductsList(
      page,
      limit,
      false,
      orderBy,
      withNursery
    )

    if (products.length === 0) {
      return res.status(200).json({ success: [] })
    }

    return res.status(200).json({ data: products['rows'], length: products['count'] })
  } catch (error) {
    console.error('getProductsList error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const getDeletedProductsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' })
    }
    const products = await productModel.getProductsList(page, limit, true)

    if (products.length === 0) {
      return res.status(200).json({ success: [] })
    }

    return res.status(200).json({ data: products['rows'], length: products['count'] })
  } catch (error) {
    console.error('getDeletedProductsList error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id) || id < 1) {
      return res.status(404).json({ error: 'Product not found' })
    }
    const product = await productModel.getProductById(id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.status(200).json(product)
  } catch (error) {
    console.error('getProductById error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const getProductByIdAsAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const allowDeleted = req.user.isAdmin
    if (isNaN(id) || id < 1) {
      return res.status(404).json({ error: 'Product not found' })
    }
    const product = await productModel.getProductById(id, allowDeleted)

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    return res.status(200).json(product)
  } catch (error) {
    console.error('getProductById error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      discount,
      description,
      withNursery,
      amountOfSmallSize,
      amountOfLargeSize
    } = req.body

    if (
      !name ||
      !price ||
      typeof price !== 'number' ||
      price <= 0 ||
      typeof discount !== 'number' ||
      discount < 0 ||
      discount >= 100 ||
      typeof description !== 'string' ||
      typeof withNursery !== 'boolean' ||
      !amountOfSmallSize ||
      typeof amountOfSmallSize !== 'number' ||
      amountOfSmallSize < 0 ||
      !amountOfLargeSize ||
      typeof amountOfLargeSize !== 'number' ||
      amountOfLargeSize < 0
    ) {
      return res
        .status(400)
        .json({ error: 'All fields are required and must be valid' })
    }

    const result = await productModel.addProduct(
      name,
      price,
      discount,
      description,
      withNursery,
      amountOfSmallSize,
      amountOfLargeSize
    )

    if (result.error) {
      return res.status(400).json({ error: result.error })
    }

    return res.status(201).json({ success: 'Product was added successfully' })
  } catch (error) {
    console.error('addProduct error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const editProduct = async (req, res) => {
  try {
    const id = parseInt(req.body.id)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Valid product ID is required' })
    }
    const {
      price,
      discount,
      description,
      amountOfSmallSize,
      amountOfLargeSize
    } = req.body
    if (
      !price ||
      typeof price !== 'number' ||
      price <= 0 ||
      typeof discount !== 'number' ||
      discount < 0 ||
      discount >= 100 ||
      typeof description !== 'string' ||
      !amountOfSmallSize ||
      typeof amountOfSmallSize !== 'number' ||
      amountOfSmallSize < 0 ||
      !amountOfLargeSize ||
      typeof amountOfLargeSize !== 'number' ||
      amountOfLargeSize < 0
    ) {
      return res
        .status(400)
        .json({ error: 'All fields are required and must be valid' })
    }

    const product = await productModel.getProductById(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const result = await productModel.editProduct(
      id,
      price,
      discount,
      description,
      amountOfSmallSize,
      amountOfLargeSize
    )

    if (result.error) {
      return res.status(400).json({ error: result.error })
    }

    return res.status(200).json(result)
  } catch (error) {
    console.error('editProduct error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.body.id)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Valid product ID is required' })
    }
    await productModel.deleteProduct(id)
    return res.status(200).json({ success: 'Product was deleted successfully' })
  } catch (error) {
    console.error('deleteProduct error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const restoreProduct = async (req, res) => {
  try {
    const id = parseInt(req.query.id)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Valid product ID is required' })
    }
    await productModel.restoreProduct(id)
    return res
      .status(200)
      .json({ success: 'Product was restored successfully' })
  } catch (error) {
    console.error('restoreProduct error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const uploadImages = async (req, res) => {
  try {
    const productId = parseInt(Object.values(req.body)[0])
    if (isNaN(productId) || productId < 1) {
      return res.status(400).json({ message: 'Product ID is invalid' })
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    for (const file of req.files) {
      await productModel.uploadImages(productId, file.filename)
    }

    return res
      .status(200)
      .json({ success: 'Images were uploaded successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error, Please try again' })
  }
}

const deleteImage = async (req, res) => {
  try {
    const fileName = req.params.imageName
    const result = await productModel.deleteImage(fileName)
    if (result.error) {
      res.status(400).json({ error: result.error })
    }
    const filePath = path.join(__dirname, '../../images', fileName)
    await fs.unlink(filePath)
    return res.status(200).json({ success: 'Images were deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error, Please try again' })
  }
}

module.exports = {
  getProductsList,
  getDeletedProductsList,
  getProductById,
  getProductByIdAsAdmin,
  addProduct,
  editProduct,
  deleteProduct,
  restoreProduct,
  uploadImages,
  deleteImage
}
