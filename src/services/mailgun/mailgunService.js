/* eslint handle-callback-err:0 */

var Mailgun = require('mailgun-js')

// GET MAIL CONFIG FROM DEFAULT CONFIG
var config = require('app/config')
var mailConfig = config.mailgun
var mailUtil = require('./mailUtils')

var mailgun = new Mailgun({
  apiKey: mailConfig.apiKey,
  domain: mailConfig.domainForMailgun
})

// Confiramtion button
function sendWelcomeEmail (user) {
  return new Promise((resolve, reject) => {
    // This is template to pass for MJML Template
    var templateData = {
      email: user.email,
      domain: mailConfig.frontendUrl,
      activationLink: `${mailConfig.frontendUrl}/login?token=${user.account.activationToken}`
    }
    // Read and render template before sending
    mailUtil.readAndRenderTemplate('welcome', templateData).then(result => {
      var data = {
        from: mailConfig.defaultFrom,
        to: user.email,
        subject: 'Thanks for your registration',
        html: result
      }
      mailgun.messages().send(data, (err, body) => {
        resolve(body)
      })
    }).catch((err) => reject(err))
  })
}

function sendPasswordResetEmail (user) {
  return new Promise((resolve, reject) => {
    // This is template to pass for MJML Template
    var templateData = {
      userName: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      domain: mailConfig.frontendUrl,
      passwordResetLink: `${mailConfig.frontendUrl}/reset-password?token=${user.account.resetPasswordToken}`
    }
    // Read and render template before sending
    mailUtil.readAndRenderTemplate('request_reset_password', templateData).then(result => {
      var data = {
        from: mailConfig.defaultFrom,
        to: user.email,
        subject: 'Reset password email from BookingGenius',
        html: result
      }

      mailgun.messages().send(data, (err, body) => {
        resolve(body)
      })
    }).catch((err) => reject(err))
  })
}

function sendInbox (user) {
  return new Promise((resolve, reject) => {
    // This is template to pass for MJML Template
    var templateData = {
      loginLink: `${mailConfig.frontendUrl}`
    }
    // Read and render template before sending
    mailUtil.readAndRenderTemplate('inbox', templateData).then(result => {
      var data = {
        from: mailConfig.defaultFrom,
        to: user.email,
        subject: 'You have a new message from the WEDF Team!',
        html: result
      }

      mailgun.messages().send(data, (err, body) => {
        resolve(body)
      })
    }).catch((err) => reject(err))
  })
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendInbox
}
