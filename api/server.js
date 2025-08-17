const os = require('os')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const express = require('express')
const userRoute = require('./routes/userRoute')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/user', userRoute)

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
