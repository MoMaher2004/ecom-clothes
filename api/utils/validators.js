const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateName = name => {
  const nameRegex = /^[\p{L}'][\p{L}\s'-]{1,49}$/u
  return nameRegex.test(name)
}

module.exports = {
    validateEmail,
    validateName
}
