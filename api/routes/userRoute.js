const express = require('express')
const {
    login,
    verifyToken,
    adminOnly,
    changePassword,
    updateUserRole,
    deactivateUser,
    addUser,
    getUsersList,
    resendEmailConfirmationToken,
    confirmUserEmail,
    logout
} = require('../controllers/userController')

const router = express.Router()

router.post('/login', (req, res) => login(req, res, false))
router.patch('/changePassword', verifyToken, changePassword)
router.patch(
  '/updateRole',
  verifyToken,
  (req, res, next) => adminOnly(req, res, next),
  updateUserRole
)
router.patch(
  '/deactivate',
  verifyToken,
  (req, res, next) => adminOnly(req, res, next),
  deactivateUser
)
router.patch(
  '/resendEmailConfirmationToken',
  verifyToken,
  resendEmailConfirmationToken
)
router.post('/add', addUser)
router.get(
  '/list',
  verifyToken,
  (req, res, next) => adminOnly(req, res, next),
  getUsersList
)
router.get('/confirm-email', verifyToken, confirmUserEmail)

router.get('/logout', verifyToken, logout)

module.exports = router
