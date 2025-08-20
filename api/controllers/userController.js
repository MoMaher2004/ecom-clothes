const userModel = require('../models/userModel')
const validators = require('../utils/validators')
const jwt = require('jsonwebtoken')
const { sendEmail } = require('../utils/sendEmail')

const createToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  })
}

const invalidateToken = res => {
  res.clearCookie('token', {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  })
  return true
}

const logout = (req, res) => {
  try {
    invalidateToken(res)
    return res
      .status(200)
      .json({ message: 'Logged out successfully', redirect: 'homePage' })
  } catch (error) {
    console.error('Logout error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const verifyJWT = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err)
      resolve(decoded)
    })
  })
}

const verifyToken = async (req, res, next) => {
  try {
    if (!req.headers['authorization']) {
      return res.status(401).json({
        error: 'No token provided, Please login',
        redirect: 'loginPage'
      })
    }
    const token = req.headers['authorization'].split(' ')[1]
    if (!token) {
      return res.status(401).json({
        error: 'No token provided, Please login',
        redirect: 'loginPage'
      })
    }
    let decoded
    try {
      decoded = await verifyJWT(token, process.env.JWT_SECRET)
    } catch (error) {
      return res.status(401).json({
        error: 'Failed to authenticate token',
        redirect: 'loginPage'
      })
    }
    const tokenIssuedAt = new Date(decoded.iat * 1000)
    const checkUserAuth = await userModel.checkUserAuth(decoded.id)

    if (!checkUserAuth || checkUserAuth.isDeleted) {
      return res.status(404).json({
        error: 'User not found',
        redirect: 'loginPage'
      })
    }

    // if (new Date(checkUserAuth.passwordUpdatedAt) > tokenIssuedAt) {
    //   invalidateToken(res)
    //   return res
    //     .status(401)
    //     .json({ error: 'Password changed, please login again' })
    // }
    if (checkUserAuth.isEmailConfirmed == 0 && !(['/resendEmailConfirmationToken', '/confirm-email'].includes(req.route.path))) {
      return res
        .status(301)
        .json({
          error: 'Email is not confirmed yet',
          redirect: 'emailConfirmPage'
        })
    }
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: checkUserAuth.isAdmin
    }
    next()
  } catch (error) {
    invalidateToken(res)
    return res.status(401).json({
      error: 'Token is not valid, Please login again',
      redirect: 'loginPage'
    })
  }
}

const saveCookies = (res, token) => {
  try {
    res.cookie('token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: process.env.COOKIE_EXPIRES_IN
        ? Number(process.env.COOKIE_EXPIRES_IN) * 1000
        : 8 * 60 * 60 * 1000
    })
  } catch (error) {
    console.error('save cookies error:', error)
  }
}

const adminOnly = async (req, res, next) => {
  try {
    if (!req.user.isAdmin || req.user.isAdmin == false) {
      return res.status(403).json({ error: 'Access denied' })
    }
    next()
  } catch (error) {
    console.error('check user role error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const login = async (req, res, fromFunction = false) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const result = await userModel.login(email, password)

    if (result == null) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    result.token = createToken(result.id, result.email)
    saveCookies(res, result.token)
    if (fromFunction) {
      console.log(fromFunction)
      return true
    }
    let redirect
    if (result.isEmailConfirmed == 0) {
      redirect = 'confirmEmailPage'
    } else {
      redirect = 'homePage'
    }
    return res
      .status(200)
      .json({ success: 'Login is successful', redirect: redirect })
  } catch (error) {
    console.error('login error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const changePassword = async (req, res) => {
  try {
    const { email } = req.user
    const { oldPassword, newPassword } = req.body

    if (!oldPassword) {
      return res.status(400).json({ error: 'Old password is required' })
    }

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 8 characters' })
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different' })
    }
    const result = await userModel.changePassword(
      email,
      oldPassword,
      newPassword
    )
    if (result.error) {
      return res.status(400).json({ error: result.error })
    }

    return res.status(200).json(result)
  } catch (error) {
    console.error('change password error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const updateUserRole = async (req, res) => {
  try {
    const { id, isAdmin } = req.body
    if (!id || id <= 0) {
      return res.status(400).json({ error: 'User ID and role are required' })
    }
    const result = await userModel.updateUserRole(id, isAdmin)
    return res.status(200).json(result.success)
  } catch (error) {
    console.error('update user role error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const deactivateUser = async (req, res) => {
  try {
    const { id } = req.body
    if (!id || id <= 0) {
      return res.status(400).json({ error: 'Valid user ID is required' })
    }
    const result = await userModel.deactivateUser(id)

    return res.status(200).json(result.success)
  } catch (error) {
    console.error('deactivate user error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const restoreUser = async (req, res) => {
  try {
    const { id } = req.body
    if (!id || id <= 0) {
      return res.status(400).json({ error: 'Valid user ID is required' })
    }
    const result = await userModel.restoreUser(id)

    return res.status(200).json(result.success)
  } catch (error) {
    console.error('restoreUser error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const updateEmailConfirmationToken = async email => {
  try {
    const result = await userModel.updateEmailConfirmationToken(email)
    if (!result.success) {
      throw new Error('unknown error')
    }
    return result
  } catch (error) {
    console.error('updating email token error:', error)
    throw new Error('unknown error')
  }
}

const updateResetPasswordToken = async email => {
  try {
    const result = await userModel.updateResetPasswordToken(email)
    if (!result.success) {
      throw new Error('unknown error')
    }
    return result
  } catch (error) {
    console.error('updateResetPasswordToken:', error)
    throw new Error('unknown error')
  }
}

const resendEmailConfirmationToken = async (req, res) => {
  try {
    const { email, id } = req.user
    const result = await updateEmailConfirmationToken(email)
    const from = 'support'
    const subject = 'Confirm Email'
    const message = `click here to confirm your email: ${process.env.URL}/user/confirm-email?token=${encodeURIComponent(result.emailConfirmationToken)}&id=${encodeURIComponent(id)}`
    let sendEmailRes
    try {
      sendEmailRes = await sendEmail(email, from, subject, message)
    } catch (error) {
      console.error('send email error:', error)
    }
    if (sendEmailRes.error) {
      return res.status(400).json({ error: sendEmailRes.error })
    }
    return res.status(200).json({ success: 'email was sent successfully' })
  } catch (error) {
    console.error('resendEmailConfirmationToken:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const sendResetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body
    const result = await updateResetPasswordToken(email)
    const from = 'support'
    const subject = 'Reset Password'
    const message = `click here to reset your password: ${process.env.URL}/user/confirm-email?token=${encodeURIComponent(result.resetPasswordToken)}&email=${encodeURIComponent(email)}`
    let sendEmailRes
    try {
      sendEmailRes = await sendEmail(email, from, subject, message)
    } catch (error) {
      console.error('send email error:', error)
    }
    if (sendEmailRes.error) {
      return res.status(400).json({ error: sendEmailRes.error })
    }
    return res.status(200).json({ success: 'email was sent successfully' })
  } catch (error) {
    console.error('resendResetPasswordToken:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const confirmUserEmail = async (req, res) => {
  try {
    const { id, token } = req.query
    if (!id || !token) {
      return res.status(400).json({ error: 'Invalid URL' })
    }
    const result = await userModel.confirmUserEmail(
      decodeURIComponent(id),
      decodeURIComponent(token)
    )
    if (result.error) {
      return res.status(400).json({ error: 'Invalid URL' })
    }
    return res
      .status(200)
      .json({ success: 'Login is successful', redirect: 'homePage' })
  } catch (error) {
    console.error('email confirmation error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const addUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthDate } = req.body

    if (!firstName || !lastName || !email || !password || !birthDate) {
      return res.status(400).json({ error: 'All fields are required' })
    }
    if (
      !validators.validateName(firstName) ||
      !validators.validateName(lastName) ||
      !validators.validateEmail(email)
    ) {
      return res.status(400).json({ error: 'Invalid inputs' })
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters' })
    }
    const addUserRes = await userModel.addUser(
      firstName,
      lastName,
      email,
      password,
      birthDate
    )

    if (addUserRes.error) {
      return res.status(400).json({ error: addUserRes.error })
    }
    const result = await updateEmailConfirmationToken(email)
    const from = 'support'
    const subject = 'Confirm Email'
    const message = `click here to confirm your email: ${process.env.URL}/users/confirm-email?token=${result.emailConfirmationToken}&id=${addUserRes.id}`
    let sendEmailRes
    try {
      sendEmailRes = await sendEmail(email, from, subject, message)
    } catch (error) {
      console.error('send email error:', error)
    }
    if (sendEmailRes.error) {
      return res.status(400).json({ error: sendEmailRes.error })
    }
    return res.status(201).json({
      success:
        'User was added successfully, Check your inbox to confirm your email'
    })
  } catch (error) {
    console.error('add user error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const getUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const isDeleted = req.query.isDeleted === 'true'
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: 'Invalid pagination parameters' })
    }
    if (limit > 100) {
      return res.status(400).json({ error: 'Limit cannot exceed 100' })
    }
    const users = await userModel.getUsersList(page, limit, isDeleted)

    return res.status(200).json(users)
  } catch (error) {
    console.error('get users list error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.user
    if (!id || id <= 0) {
      return res.status(403).json({ error: 'You are not logged in' })
    }
    const result = await userModel.deactivateUser(id)

    return res.status(200).json(result.success)
  } catch (error) {
    console.error('deleteAccount error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const accountInfo = async (req, res) => {
  try {
    const { id } = req.user
    const result = await userModel.accountInfo(id)

    return res.status(200).json(result)
  } catch (error) {
    console.error('accountInfo error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await userModel.getUserById(id)

    return res.status(200).json(result)
  } catch (error) {
    console.error('getUserById error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query
    const result = await userModel.getUserByEmail(email)

    return res.status(200).json(result)
  } catch (error) {
    console.error('getUserByEmail error:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

const checkPasswordToken = async (req, res) => {
  try {
    const { email, token } = req.query
    if (!email || !token) {
      return res.status(400).json({ error: 'URL is not valid' })
    }
    const result = await userModel.checkPasswordToken(email, token)

    if (result.error) {
      return res.status(400).json({ error: 'URL is not valid' })
    }

    if (result == null) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    result.token = createToken(result.id, result.email)
    saveCookies(res, result.token)

    return res
      .status(200)
      .json({ success: 'Authentication is successful', redirect: 'changePasswordPage' })
  } catch (error) {
    console.error('checkPasswordToken:', error)
    return res
      .status(500)
      .json({ error: 'Internal server error, Please try again' })
  }
}

module.exports = {
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
  restoreUser,
  accountInfo,
  getUserById,
  getUserByEmail,
  sendResetPasswordToken,
  checkPasswordToken
}
