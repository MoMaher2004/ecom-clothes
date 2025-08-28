const os = require('os')
const path = require('path')
const dotenv = require('dotenv')
require('dotenv').config({ path: path.resolve(__dirname, 'config.env') })
const express = require('express')
const userRoute = require('./routes/userRoute')
const productRoute = require('./routes/productRoute')
const wishlistRoute = require('./routes/wishlistRoute')
const orderRoute = require('./routes/orderRoute')
const shipmentCostsRoute = require('./routes/shipmentCostsRoute')
const offerRoute = require('./routes/offerRoute')
const exportRoutes = require('./routes/exportRoute')
const cors = require('cors')
const fs = require('fs')

const logFile = path.join(__dirname, 'error.log')

const originalError = console.error

console.error = function (...args) {
  const message = args
    .map(a => (typeof a === 'object' ? JSON.stringify(a) : a))
    .join(' ')

  const logMessage = `[${new Date().toISOString()}] ${message}\n`

  fs.appendFileSync(logFile, logMessage)

  originalError.apply(console, args)
}

const app = express()

const uploadDir = path.join(__dirname, '../images')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

app.use(cors({
  origin: ["https://www.saddletrendy.com", "https://saddletrendy.com", "https://accept.paymob.com"],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))

app.use(express.json())
app.use('../images', express.static('images'))
app.use(express.urlencoded({ extended: true }))

app.use('/api/user', userRoute)
app.use('/api/product', productRoute)
app.use('/api/wishlist', wishlistRoute)
app.use('/api/order', orderRoute)
app.use('/api/shipmentCost', shipmentCostsRoute)
app.use('/api/offer', offerRoute)
app.use('/api/exportDb', exportRoutes)
app.use('/health', (req, res) => {
  return res.status(200).json({ msg: 'hi! server is working' })
})

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
