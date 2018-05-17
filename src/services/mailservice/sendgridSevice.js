const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')
var config = require('app/config')
var mailUtil = require('app/services/mailService/mailUtils')
var mailConfig = config.mailgun

function sendTenantCode (data) {
  return new Promise((resolve, reject) => {
    var templateData = {
      inviteCode: data.inviteCode
    }
    mailUtil.readAndRenderTemplate('sendTenantCode', templateData).then(result => {
      const msg = {
        to: data.email,
        from: 'no-reply@mywalkrthru.com',
        subject: `Please Complete a ibxbet of ${data.address} for ${data.companyName}`,
                // text: `Please Complete a WalkThru of ${data.address} for ${data.companyName}`,
        html: result
      }
      resolve(sgMail.send(msg))
    }).catch((err) => reject(err))
  })
}

// Confiramtion button
function sendWelcomeEmail (user) {
  return new Promise((resolve, reject) => {
    mailUtil.readAndRenderTemplate('signup', {}).then(result => {
      const msg = {
        to: user.email,
        from: 'no-reply@bxbet.com',
        subject: 'Welcome to bxbet',
        html: result
      }
      resolve(sgMail.send(msg))
    }).catch((err) => reject(err))
  })
}

function sendPasswordResetEmail (user) {
  const msg = {
    to: user.email,
    from: 'no-reply@bxbet.com',
    subject: 'Reset password',
    text: 'bxbet reset password',
    html: `To reset password click  <a href="${mailConfig.frontendUrl}/reset-password?token=${user.account.resetPasswordToken}">here</a>`
  }

  return new Promise((resolve, reject) => {
    resolve(sgMail.send(msg))
  }).catch((err) => reject(err))
}

function sendReminderEmail (data) {
  return new Promise((resolve, reject) => {
    var templateData = {
      inviteCode: data.inviteCode,
      leaseExpires: data.leaseExpires,
      diffDays: data.diffDays
    }
    mailUtil.readAndRenderTemplate('reminder', templateData).then(result => {
      const msg = {
        to: data.email,
        from: 'no-reply@bxbet.com',
        subject: `ACTION REQUIRED: Complete Your ibxbet of ${data.address} for ${data.companyName}`,
        html: result
      }
      resolve(sgMail.send(msg))
    }).catch((err) => reject(err))
  })
}

module.exports = {
  sendTenantCode,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReminderEmail
}
