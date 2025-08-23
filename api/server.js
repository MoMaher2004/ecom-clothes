const os = require('os')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const express = require('express')
const userRoute = require('./routes/userRoute')
const productRoute = require('./routes/productRoute')
const cartRoute = require('./routes/cartRoute')
const wishlistRoute = require('./routes/wishlistRoute')
const orderRoute = require('./routes/orderRoute')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()

const uploadDir = path.join(__dirname, '../images')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

app.use(cors({
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  methods: ["GET", "POST", "PATCH", 'PUT', "DELETE"],
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
