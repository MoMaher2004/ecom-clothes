const conn = require('../config/db')
const {
  compareToken,
  generateToken,
  hashToken
} = require('../utils/tokenUtils')
const bcrypt = require('bcrypt')

const login = async (email, password) => {
  try {
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE email = ? AND isDeleted = 0',
      [email]
    )

    if (rows.length === 0) {
      return null
    }
    const passwordComparisonRes = await bcrypt.compare(
      password,
      rows[0].password
    )
    if (!passwordComparisonRes) {
      return null
    }
    rows[0].password = undefined
    rows[0].passwordResetTokenExpiresAt = undefined
    rows[0].passwordResetToken = undefined
    rows[0].passwordLastUpdatedAt = undefined
    rows[0].isDeleted = undefined
    rows[0].emailConfirmationToken = undefined
    return rows[0]
  } catch (error) {
    console.error('Error during login:', error)
    throw new Error('Something went wrong')
  }
}

const checkPasswordToken = async (email, passwordResetToken) => {
  try {
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE email = ? AND isDeleted = 0 AND passwordResetTokenExpiresAt > NOW()',
      [email]
    )

    if (rows.length === 0) {
      return { error: 'Token is not valid or expired, Try again' }
    }
    const passwordTokenComparisonRes = await bcrypt.compare(
      passwordResetToken,
      rows[0].passwordResetToken
    )
    if (!passwordTokenComparisonRes) {
      return { error: 'Token is not valid or expired, Try again' }
    }

    await conn.query(
      'UPDATE users SET passwordResetTokenExpiresAt = NULL, passwordResetToken = NULL WHERE id = ?',
      [rows[0].id]
    )

    rows[0].password = undefined
    rows[0].passwordResetTokenExpiresAt = undefined
    rows[0].passwordResetToken = undefined
    rows[0].passwordLastUpdatedAt = undefined
    rows[0].isDeleted = undefined
    rows[0].emailConfirmationToken = undefined
    return rows[0]
  } catch (error) {
    console.error('Error during login:', error)
    throw new Error('Something went wrong')
  }
}

const changePassword = async (email, oldPassword, newPassword) => {
  try {
    const loginRes = await login(email, oldPassword)
    if (!loginRes) {
      return { error: 'Old password is incorrect' }
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const [res] = await conn.query(
      'UPDATE users SET password = ?, passwordLastUpdatedAt = NOW() WHERE email = ? AND isDeleted = 0',
      [hashedPassword, email]
    )
    if (res.affectedRows === 0) {
      throw new Error('Failed to change password')
    }
    return { success: 'Password changed successfully' }
  } catch (error) {
    console.error('Error during changing password:', error)
    throw new Error('Something went wrong')
  }
}

const checkUserAuth = async id => {
  try {
    const [rows] = await conn.query(
      'SELECT passwordLastUpdatedAt, isEmailConfirmed, isDeleted, email, isAdmin FROM users WHERE id = ?',
      [id]
    )
    return rows[0]
  } catch (error) {
    console.error('Error during checking password change:', error)
    throw new Error('Something went wrong')
  }
}

const getUserById = async (id) => {
  try {
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE id = ? ',
      [id]
    )
    if (rows.length === 0) {
      return null
    }
    rows[0].password = undefined
    rows[0].passwordResetToken = undefined
    rows[0].emailConfirmationToken = undefined
    return rows[0]
  } catch (error) {
    console.error('Error during getting user by id:', error)
    throw new Error('Something went wrong')
  }
}

const getUserByEmail = async (email) => {
  try {
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE email = ? ',
      [email]
    )
    if (rows.length === 0) {
      return null
    }
    rows[0].password = undefined
    rows[0].passwordResetToken = undefined
    rows[0].emailConfirmationToken = undefined
    return rows[0]
  } catch (error) {
    console.error('Error getUserByEmail:', error)
    throw new Error('Something went wrong')
  }
}

const updateUserRole = async (id, isAdmin) => {
  try {
    const [res] = await conn.query(
      'UPDATE users SET isAdmin = ? WHERE id = ?',
      [isAdmin, id]
    )
    if (res.affectedRows === 0) {
      throw new Error('Failed to update user role')
    }
    return { success: 'User role updated successfully' }
  } catch (error) {
    console.error('Error during updating user role:', error)
    throw new Error('Something went wrong')
  }
}

const deactivateUser = async id => {
  try {
    const [res] = await conn.query(
      'UPDATE users SET isDeleted = 1 WHERE id = ?',
      [id]
    )
    if (res.affectedRows === 0) {
      throw new Error('Failed to deactivate user')
    }
    return { success: 'User deactivated successfully' }
  } catch (error) {
    console.error('Error during deactivating user:', error)
    throw new Error('Something went wrong')
  }
}

const restoreUser = async id => {
  try {
    const [res] = await conn.query(
      'UPDATE users SET isDeleted = 0 WHERE id = ?',
      [id]
    )
    if (res.affectedRows === 0) {
      throw new Error('Failed to restore user')
    }
    return { success: 'User restored successfully' }
  } catch (error) {
    console.error('Error during restoreUser:', error)
    throw new Error('Something went wrong')
  }
}

const updateEmailConfirmationToken = async email => {
  try {
    const emailConfirmationToken = generateToken()
    const hashedEmailConfirmationToken = await hashToken(emailConfirmationToken)
    const [res] = await conn.query(
      'UPDATE users SET emailConfirmationToken = ? WHERE email = ? AND isDeleted = 0 AND isEmailConfirmed = 0',
      [hashedEmailConfirmationToken, email]
    )
    if (res.affectedRows === 0) {
      throw new Error('Failed to update email confirmation token')
    }
    return {
      success: 'Email confirmation token updated successfully',
      emailConfirmationToken: emailConfirmationToken
    }
  } catch (error) {
    console.error('Error during updating email confirmation token:', error)
    throw new Error('Something went wrong')
  }
}

const updateResetPasswordToken = async email => {
  try {
    const resetPasswordToken = generateToken()
    const hashedResetPasswordToken = await hashToken(resetPasswordToken)
    const [res] = await conn.query(
      'UPDATE users SET passwordResetToken = ?, passwordResetTokenExpiresAt = DATE_ADD(NOW(), INTERVAL 30 MINUTE) WHERE email = ? AND isDeleted = 0',
      [hashedResetPasswordToken, email]
    )
    if (res.affectedRows === 0) {
      throw new Error('Failed to update Reset Password Token')
    }
    return {
      success: 'Password reset token updated successfully',
      resetPasswordToken: resetPasswordToken
    }
  } catch (error) {
    console.error('Error during updateResetPasswordToken:', error)
    throw new Error('Something went wrong')
  }
}

const addUser = async (firstName, lastName, email, password, birthDate) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    const [checkEmail] = await conn.query(
      'SELECT * FROM users WHERE email = ? and isDeleted = 0',
      [email]
    )
    if (checkEmail.length > 0) {
      return { error: 'Email already exists' }
    }
    const [res] = await conn.query(
      'INSERT INTO users (firstName, lastName, email, password, birthDate) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, hashedPassword, birthDate]
    )
    if (res.affectedRows === 0) {
      throw new Error('Failed to add user')
    }
    return {
      success: 'User added successfully',
      id: res.insertId
    }
  } catch (error) {
    console.error('Error during adding user:', error)
    throw new Error('Something went wrong')
  }
}

const getUsersList = async (page = 1, limit = 20, isDeleted = 0) => {
  try {
    const offset = (page - 1) * limit
    const [rows] = await conn.query(
      'SELECT id, firstName, lastName, email, isAdmin FROM users WHERE isDeleted = ? LIMIT ? OFFSET ?',
      [isDeleted ? 1 : 0, limit, offset]
    )
    const [count] = await conn.query(
      'SELECT COUNT(*) AS length FROM users WHERE isDeleted = ?',
      [isDeleted ? 1 : 0]
    )
    return {data: rows, length: count[0]['length']}
  } catch (error) {
    console.error('Error during getting user list:', error)
    throw new Error('Something went wrong')
  }
}

const confirmUserEmail = async (id, token) => {
  try {
    const [rows] = await conn.query(
      'SELECT emailConfirmationToken, isEmailConfirmed FROM users WHERE id = ? AND isDeleted = 0',
      [id]
    )

    if (rows.length === 0) {
      return { error: 'User not found' }
    }

    if (rows[0].isEmailConfirmed === 1) {
      return { success: 'Email is already confirmed' }
    }

    if (!(await compareToken(token, rows[0].emailConfirmationToken))) {
      return { error: 'token is not valid' }
    }

    const [res] = await conn.query(
      'UPDATE users SET isEmailConfirmed = 1, emailConfirmationToken = "" WHERE id = ?',
      [id]
    )
    if (res.affectedRows === 0) {
      return { error: 'Failed to confirm email' }
    }

    return { success: 'Email is confirmed successfully' }
  } catch (error) {
    console.error('Error during confirming Email:', error)
    throw new Error('Something went wrong')
  }
}

const accountInfo = async (id) => {
  try {
    const [rows] = await conn.query(
      'SELECT * FROM users WHERE id = ? AND isDeleted = 0',
      [id]
    )
    if (rows.length === 0) {
      return null
    }
    rows[0].password = undefined
    rows[0].passwordResetTokenExpiresAt = undefined
    rows[0].passwordResetToken = undefined
    rows[0].passwordLastUpdatedAt = undefined
    rows[0].isDeleted = undefined
    rows[0].emailConfirmationToken = undefined
    return rows[0]
  } catch (error) {
    console.error('Error during accountInfo:', error)
    throw new Error('Something went wrong')
  }
}

module.exports = {
  login,
  changePassword,
  checkUserAuth,
  getUserById,
  updateUserRole,
  deactivateUser,
  updateEmailConfirmationToken,
  addUser,
  getUsersList,
  confirmUserEmail,
  restoreUser,
  accountInfo,
  getUserByEmail,
  updateResetPasswordToken,
  checkPasswordToken
}
