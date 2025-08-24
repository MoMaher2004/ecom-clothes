const shipmentCostsModel = require('../models/shipmentCostsModel')

const viewShipmentCosts = async (req, res) => {
  try {
    const data = await shipmentCostsModel.viewShipmentCosts()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error during viewShipmentCosts:', error)
return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })  }
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
return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })  }
}

module.exports = {
    viewShipmentCosts,
    modifyShipmentCost
}