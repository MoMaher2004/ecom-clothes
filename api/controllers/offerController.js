const offerModel = require('../models/offerModel')

const viewOffers = async (req, res) => {
  try {
    const data = await offerModel.viewOffers()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error during viewOffers:', error)
    throw new Error('Something went wrong')
  }
}

const addOffer = async (req, res) => {
  try {
    const {title, badge, subTitle, oldPrice, discount, endTime, url} = req.body
    if (!title || !oldPrice || !discount || !endTime || !url) {
        return res.status(400).json({ error: 'Enter valid data' })
    }
    await offerModel.addOffer(title, badge, subTitle, oldPrice, discount, endTime, url)
    return res.status(200).json({ success: 'Offer is added successfully' })
  } catch (error) {
    console.error('Error during addOffer:', error)
    throw new Error('Something went wrong')
  }
}

const deleteOffer = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: 'Enter valid id' })
    }
    await offerModel.deleteOffer(id)
    return res.status(200).json({ success: 'Cost is modified successfully' })
  } catch (error) {
    console.error('Error during deleteOffer:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
    viewOffers,
    addOffer,
    deleteOffer
}