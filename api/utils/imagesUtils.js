const multer = require('multer')
const path = require('path')

const uploadDir = path.join(__dirname, '../../images')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowedTypes.test(ext)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'))
  }
}

const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
})

module.exports = {uploadImages}