const shipmentCostsModel = require('../models/shipmentCostsModel')

const viewShipmentCosts = async (req, res) => {
  try {
    const rows = await shipmentCostsModel.viewShipmentCosts()
    return res.status(200).json({ data: rows })
  } catch (error) {
    console.error('Error during viewShipmentCosts:', error)
    throw new Error('Something went wrong')
  }
}

const modifyShipmentCost = async (req, res) => {
  try {
    const {government, newCost} = req.body
    if (newCost < 0) {
        return res.status(400).json({ error: 'Enter valid cost' })
    }
    await shipmentCostsModel.modifyShipmentCost(government, newCost)
    return res.status(200).json({ success: 'Cost is modified successfully' })
  } catch (error) {
    console.error('Error during modifyShipmentCost:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
    viewShipmentCosts,
    modifyShipmentCost
}