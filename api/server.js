const os = require('os')
const path = require('path')
const dotenv = require('dotenv')
require("dotenv").config({ path: path.resolve(__dirname, "config.env") })
const express = require('express')
const userRoute = require('./routes/userRoute')
const productRoute = require('./routes/productRoute')
const cartRoute = require('./routes/cartRoute')
const wishlistRoute = require('./routes/wishlistRoute')
const orderRoute = require('./routes/orderRoute')
const shipmentCostsRoute = require('./routes/shipmentCostsRoute')
const offerRoute = require('./routes/offerRoute')
const cors = require('cors')
const fs = require('fs')

const app = express()

const uploadDir = path.join(__dirname, '../images')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

// app.use((req, res, next) => {
//   console.log('Request received:');
//   console.log('Method:', req.method);
//   console.log('URL:', req.originalUrl);
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
//   next(); // pass to next middleware or route
// });

// app.use(cors())
app.use(cors({
  origin: ["https://www.saddletrendy.com", "https://saddletrendy.com"],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

app.use(express.json())
app.use('../images', express.static('images'))
app.use(express.urlencoded({ extended: true }))

app.use('/api/user', userRoute)
app.use('/api/product', productRoute)
app.use('/api/cart', cartRoute)
app.use('/api/wishlist', wishlistRoute)
app.use('/api/order', orderRoute)
app.use('/api/shipmentCost', shipmentCostsRoute)
app.use('/api/offer', offerRoute)
app.use('/health', (req, res) => {
  return res.status(200).json({msg: 'hi! server is working'})
})

const paymentRoutes = require('./routes/paymob.route')
app.use('/api/paymob', paymentRoutes);

// http://192.168.1.24:3000/api/paymob/create-payment
// http://192.168.1.24:3000/api/paymob/webhook



const port = process.env.PORT || 3000

const interfaces = os.networkInterfaces()
var address
for (const name in interfaces) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      address = iface.address
      break
    }
  }
}
app.listen(port, () => {
  console.log(`server started at: http://${address}:${port}`)
})
