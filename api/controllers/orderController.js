const { error } = require('console')
const orderModel = require('../models/orderModel')
const va = require('../utils/validators')

const makeOrder = async (req, res) => {
  try {
    const { id } = req.user
    const { government, city, address, phoneNumber, secondPhoneNumber, notes } =
      req.body
    const zipCode = parseInt(req.body.zipCode)
    const egyptGovernorates = [
  "Alexandria",
  "Aswan",
  "Asyut",
  "Beheira",
  "Beni Suef",
  "Cairo",
  "Dakahlia",
  "Damietta",
  "Faiyum",
  "Gharbia",
  "Giza",
  "Ismailia",
  "Kafr El Sheikh",
  "Luxor",
  "Matruh",
  "Minya",
  "Monufia",
  "New Valley",
  "North Sinai",
  "Port Said",
  "Qalyubia",
  "Qena",
  "Red Sea",
  "Sharqia",
  "Sohag",
  "South Sinai",
  "Suez"
]
    if ((isNaN(zipCode) || !government || !city || !address || !phoneNumber)) {
      return res.status(400).json({ error: 'Enter valid data' })
    }
    if(!egyptGovernorates.includes(government)){
      return res.status(400).json({ error: 'Enter valid government' })
    }
    const result = await orderModel.makeOrder(
      id,
      government,
      city,
      address,
      phoneNumber,
      secondPhoneNumber,
      'Pending',
      notes,
      zipCode
    )
    if (result.error) {
      return res.status(400).json({ error: result.error })
    }
    return res.status(200).json({ success: 'Order is sent successfully' })
  } catch (error) {
    console.error('makeOrder error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const viewOrderAsAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: 'Enter valid ID' })
    }
    const result = await orderModel.viewOrderAsAdmin(id)
    if (result.error) {
      return res.status(400).json({ error: result.error })
    }
    return res.status(200).json(result)
  } catch (error) {
    console.error('viewOrderAsAdmin error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const viewOrder = async (req, res) => {
  try {
    const userId = req.user.id
    const id = parseInt(req.params.id)
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: 'Enter valid ID' })
    }
    const result = await orderModel.viewOrder(id, userId)
    if (result.error) {
      return res.status(400).json({ error: result.error })
    }
    return res.status(200).json(result)
  } catch (error) {
    console.error('viewOrder error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.body.productId)
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: 'Enter valid ID' })
    }
    await orderModel.updateOrderStatus(id)
    return res
      .status(200)
      .json({ success: 'Order status is updated successfully' })
  } catch (error) {
    console.error('updateOrderStatus error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const cancelOrder = async (req, res) => {
  try {
    const id = parseInt(req.body.productId)
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: 'Enter valid ID' })
    }
    await orderModel.cancelOrder(id)
    return res
      .status(200)
      .json({ success: 'Order status is updated successfully' })
  } catch (error) {
    console.error('cancelOrder error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const viewOrdersListOfUserAsAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: 'Enter valid ID' })
    }
    const result = await orderModel.viewOrdersListOfUserAsAdmin(id)
    if (result.error) {
      return res.status(400).json({ error: result.error })
    }
    return res.status(200).json(result)
  } catch (error) {
    console.error('viewOrdersListOfUserAsAdmin error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const viewOrdersListAsAdmin = async (req, res) => {
  try {
    const result = await orderModel.viewOrdersListAsAdmin()
    if (result.error) {
      return res.status(400).json({ error: result.error })
    }
    return res.status(200).json(result)
  } catch (error) {
    console.error('viewOrdersListAsAdmin error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const viewOrdersList = async (req, res) => {
  try {
    const id = req.user.id
    const result = await orderModel.viewOrdersList(id)
    return res.status(200).json(result)
  } catch (error) {
    console.error('viewOrdersList error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

module.exports = {
  makeOrder,
  viewOrderAsAdmin,
  viewOrder,
  updateOrderStatus,
  cancelOrder,
  viewOrdersListOfUserAsAdmin,
  viewOrdersListAsAdmin,
  viewOrdersList
}
