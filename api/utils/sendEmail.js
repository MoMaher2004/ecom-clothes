const sendEmail = async (to, from, subject, message) => {
    console.log(`to: ${to}, from: ${from}, subject: ${subject}, message: ${message}`)
    return {success: 'email was sent successfully'}
}

module.exports = {
    sendEmail
}
