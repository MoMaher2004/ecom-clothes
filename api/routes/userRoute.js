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
    logout,
    deleteAccount,
    accountInfo,
    getUserById,
    getUserByEmail,
    sendResetPasswordToken,
    checkPasswordToken,
    resetPassword
} = require('../controllers/userController')

const router = express.Router()

router.post('/login', (req, res) => login(req, res, false))
router.patch('/changePassword', verifyToken, changePassword)
router.patch('/resetPassword', verifyToken, resetPassword)
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
router.delete(
  '/deleteAccount',
  verifyToken,
  deleteAccount
)
router.patch(
  '/resendEmailConfirmationToken',
  resendEmailConfirmationToken
)
router.post('/add', addUser)
router.get(
  '/list',
  verifyToken,
  (req, res, next) => adminOnly(req, res, next),
  getUsersList
)
router.get('/confirm-email', confirmUserEmail)

router.get('/logout', verifyToken, logout)

router.get('/accountInfo', verifyToken, accountInfo)
router.get('/getUserById/:id', verifyToken, (req, res, next) => adminOnly(req, res, next), getUserById)
router.get('/getUserByEmail', verifyToken, (req, res, next) => adminOnly(req, res, next), getUserByEmail)

router.patch('/sendResetPasswordToken', sendResetPasswordToken)
router.get('/checkPasswordToken', checkPasswordToken)
module.exports = router
