const { error } = require('console')
const orderModel = require('../models/orderModel')
const va = require('../utils/validators')
const axios = require('axios')
const crypto = require('crypto')

async function createPaymobPayment(totalPayment, billingData = {}) {
  const authRes = await axios.post(
    'https://accept.paymob.com/api/auth/tokens',
    {
      api_key: process.env.PAYMOB_API_KEY
    }
  )
  const authToken = authRes.data.token

  const paymobOrderRes = await axios.post(
    `${process.env.PAYMOB_API_URL}/ecommerce/orders`,
    {
      auth_token: authToken,
      delivery_needed: 'false',
      amount_cents: Math.round(totalPayment * 100),
      currency: 'EGP',
      items: [],
      callback: process.env.CALL_BACK
    }
  )
  const paymobOrderId = paymobOrderRes.data.id

  const paymentKeyRes = await axios.post(
    `${process.env.PAYMOB_API_URL}/acceptance/payment_keys`,
    {
      auth_token: authToken,
      amount_cents: Math.round(totalPayment * 100),
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID),
      redirection_url: "https://saddletrendy.com/profile" 
    }
  )
  const paymentToken = paymentKeyRes.data.token

  const iframeURL = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`

  return { iframeURL, paymobOrderId, paymentToken }
}

async function verifyHmac(payload, receivedHmac) {
  try {
    const dataToSign = JSON.stringify(payload);
    const computedHmac = crypto
      .createHmac('sha512', PAYMOB_HMAC_KEY)
      .update(dataToSign)
      .digest('hex');
    
    return computedHmac === receivedHmac;
  } catch (error) {
    console.error('Error verifying HMAC:', error);
    return false;
  }
}

async function handleCallback(req, res) {
  try {
    const payload = req.body.obj || req.body;
    const hmacHeader = req.headers['hmac'] || 
                      req.headers['x-paymob-hmac'] || 
                      req.headers['x-paymob-signature'] || '';
    const { order, success, pending, error_occured } = payload;
    const paymobOrderId = order.id

    const isHmacValid = await verifyHmac(payload, hmacHeader);
    if (!isHmacValid) {
      console.error('❌ Invalid HMAC signature');
      await orderModel.updateOrderStatusToFailed(paymobOrderId)
      return res.status(400).json({ error: "Invalid HMAC" });
    }

    console.log("✅ HMAC verified");
    console.log("payload: ", payload);


    let paymentStatus = "failed";

    if (error_occured) {
      paymentStatus = "error";
      console.error('❌ Payment error:', payload);
      await orderModel.updateOrderStatusToFailed(paymobOrderId)
    } else if (success === true || success === "true") {
      paymentStatus = "paid";
      console.log('✅ Payment successful for order:', order?.id);
      const orderId = await orderModel.getOrderByPaymobId(paymobOrderId)
      await orderModel.confirmOrder(orderId.id)
    } else if (pending === true || pending === "true") {
      paymentStatus = "pending";
      console.log('⏳ Payment pending for order:', order?.id);
      await orderModel.updateOrderStatusToFailed(paymobOrderId)
    } else {
      console.log('❌ Payment failed for order:', order?.id);
      await orderModel.updateOrderStatusToFailed(paymobOrderId)
    }

    return res.status(200).json({ status: "received", paymentStatus });

  } catch (error) {
    console.error('🔥 Error in payment callback:', error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

const makeOrder = async (req, res) => {
  try {
    const { id } = req.user
    const {
      government,
      city,
      address,
      phoneNumber,
      secondPhoneNumber,
      notes,
      zipCode,
      items,
      paymentMethod
    } = req.body
    const egyptGovernorates = [
      'Alexandria',
      'Aswan',
      'Assiut',
      'Beheira',
      'Beni Suef',
      'Cairo',
      'Dakahlia',
      'Damietta',
      'Fayoum',
      'Gharbia',
      'Giza',
      'Ismailia',
      'Kafr El Sheikh',
      'Luxor',
      'Matrouh',
      'Minya',
      'Monufia',
      'New Valley',
      'North Sinai',
      'Port Said',
      'Qalyubia',
      'Qena',
      'Red Sea',
      'Sharqia',
      'Sohag',
      'South Sinai',
      'Suez'
    ]
    if (
      !zipCode ||
      !government ||
      !city ||
      !address ||
      !phoneNumber ||
      !items ||
      items == [] ||
      !paymentMethod
    ) {
      return res.status(400).json({ error: 'Enter valid data' })
    }
    if (!egyptGovernorates.includes(government)) {
      return res.status(400).json({ error: 'Enter valid government' })
    }
    if (!['cashOnDelivery', 'paymob'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Enter valid payment method' })
    }
    const order = await orderModel.makeOrder(
      id,
      government,
      city,
      address,
      phoneNumber,
      secondPhoneNumber,
      'Pending',
      notes,
      zipCode,
      items,
      paymentMethod
    )
    if (order.error) {
      return res.status(400).json({ error: order.error })
    }

    // const cartProducts = await cartModel.viewCart(id)
    // if (!cartProducts || cartProducts.length === 0) {
    //   await orderModel.deleteOrderById(order.insertId)
    //   return res.status(400).json({ error: 'Cart is empty' })
    // }

    if (paymentMethod == 'paymob') {
      const totalAmount = order.shipmentCost + order.totalProductsCost
      const billing = {
        first_name: req.user.firstName,
        last_name: req.user.lastName,
        email: req.user.email,
        phone_number: phoneNumber,
        apartment: 'NA',
        floor: 'NA',
        street: address,
        building: 'NA',
        postal_code: zipCode,
        city: city,
        state: government,
        country: 'EG'
      }

      const { iframeURL, paymobOrderId } = await createPaymobPayment(
        totalAmount,
        billing
      )

      await orderModel.setPaymobOrderId(order.insertId, paymobOrderId)
      return res.status(200).json({ orderId: order.insertId, iframeURL })
    }else if(paymentMethod == 'cashOnDelivery'){
      await orderModel.confirmOrder(order.insertId)
      return res.status(200).json({ success: 'Order is placed successfully', orderId: order.insertId })
    }
    
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
    const id = parseInt(req.body.orderId)
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
    const id = parseInt(req.body.orderId)
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
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    if (isNaN(id) || id < 1) {
      return res.status(400).json({ error: 'Enter valid ID' })
    }
    const result = await orderModel.viewOrdersListOfUserAsAdmin(
      id,
      page,
      limit,
      req.query.status
    )
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
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const result = await orderModel.viewOrdersListAsAdmin(
      page,
      limit,
      req.query.status
    )
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
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const result = await orderModel.viewOrdersList(
      id,
      page,
      limit,
      req.query.status
    )
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
  handleCallback,
  viewOrdersList
}
