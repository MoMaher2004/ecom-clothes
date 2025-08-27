
const axios = require('axios');
const crypto = require('crypto');

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_API_URL = process.env.PAYMOB_API_URL || 'https://accept.paymob.com/api';
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_HMAC_KEY = process.env.PAYMOB_HMAC_KEY;
const CALLBACK_URL = process.env.CALL_BACK || 'https://saddletrendy.com/api/order/paymobWebhook';


async function getAuthToken() {
    const response = await axios.post(`${PAYMOB_API_URL}/auth/tokens`, {
        api_key: PAYMOB_API_KEY,
    });
    return response.data.token;
}


async function createOrder(authToken, amount) {
    const response = await axios.post(
        `${PAYMOB_API_URL}/ecommerce/orders`,
        {
            auth_token: authToken,
            delivery_needed: "false",
            amount_cents: amount * 100, 
            currency: "EGP",
            items: [],
            callback: CALLBACK_URL
        }

    );
    return response.data.id; 
}

// should store phone_number in db
async function createPaymentKey(req, authToken, orderId, amount) {
  const response = await axios.post(`${PAYMOB_API_URL}/acceptance/payment_keys`, {
    auth_token: authToken,
    amount_cents: Math.round(amount * 100),
    expiration: 3600,
    order_id: orderId,
    billing_data: {
      first_name: req.body.firstName || "NA",
      last_name: req.body.lastName || "NA",
      phone_number: req.body.phone_number || "01000000000",
      email: req.body.email || "example@email.com",
      country: "EG",
      city: req.body.city || "NA",
      street: req.body.street || "NA",
      building: req.body.building || "NA",
      floor: req.body.floor || "NA",
      apartment: req.body.apartment || "NA",
      shipping_method: "NA",
      postal_code: "NA",
      state: "NA",
    },
    currency: "EGP",
    integration_id: parseInt(PAYMOB_INTEGRATION_ID),
  });


  return response.data.token;
};
async function createPayment(req, res) {
  try {
    const { amount } = req.body;

    const authToken = await getAuthToken();
    const orderId = await createOrder(authToken, amount);
    const paymentKey = await createPaymentKey(req, authToken, orderId, amount);

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;

    res.status(200).json({ success: true, iframeUrl, orderId });
  } catch (error) {
    console.error("Error creating payment:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
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
    const hmacHeader = req.query.hmac || 
                      req.headers['x-paymob-hmac'] || 
                      req.headers['x-paymob-signature'] || 
                      req.headers['hmac'] || '';

    const isHmacValid = await verifyHmac(payload, hmacHeader);
    if (!isHmacValid) {
      console.error('❌ Invalid HMAC signature');
      return res.status(400).json({ success: false, error: 'Invalid HMAC signature' });
    }

    const { order, success, is_voided, is_refunded, is_3d_secure, pending, 
            is_void, is_refund, error_occured, data } = payload;

    if (error_occured) {
      console.error('❌ Payment error:', payload);
      return res.status(200).json({ success: false, error: 'Payment failed' });
    }

    if (success === true || success === 'true') {

      console.log('✅ Payment successful for order:', order?.id);

      return res.status(200).json({ success: true, message: 'Payment processed successfully' });
    }

    console.log('ℹ️ Payment status update:', { 
      orderId: order?.id, 
      success, 
      is_voided, 
      is_refunded,
      pending
    });

    res.status(200).json({ success: true, message: 'Callback received' });
  } catch (error) {
    console.error('Error in payment callback:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
module.exports = {
  createPayment,
  handleCallback
};