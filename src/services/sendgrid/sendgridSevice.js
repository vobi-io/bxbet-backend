const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')
const config = require('app/config')
const mailUtil = require('../mailgun/mailUtils')
const mailConfig = config.mailgun

const sendTenantCode = data =>
  mailUtil
    .readAndRenderTemplate(
      'sendTenantCode',
      { inviteCode: data.inviteCode }
    )
    .then(html =>
      sgMail
        .send({
          to: data.email,
          from: 'no-reply@mywalkrthru.com',
          subject: 'Please Complete a ibookinggenius of ' +
            `${data.address} for ${data.companyName}`,
          html
        })
    )

// Confiramtion button
const sendWelcomeEmail = user =>
  mailUtil
    .readAndRenderTemplate('signup', {})
    .then(html =>
      sgMail
        .send({
          to: user.email,
          from: 'no-reply@bookinggenius.com',
          subject: 'Welcome to bookinggenius',
          html
        })
    )

const sendPasswordResetEmail = user =>
  sgMail
    .send({
      to: user.email,
      from: 'no-reply@bookinggenius.com',
      subject: 'Reset password',
      text: 'bookinggenius reset password',
      html: 'To reset password click  ' +
        `<a href="${mailConfig.frontendUrl}/reset-password?` +
        `token=${user.account.resetPasswordToken}">here</a>`
    })

const sendReminderEmail = data =>
  mailUtil
    .readAndRenderTemplate(
      'reminder',
      data
    )
    .then(html =>
      sgMail
        .send({
          to: data.email,
          from: 'no-reply@bookinggenius.com',
          subject: 'ACTION REQUIRED: Complete Your ibookinggenius of ' +
            `${data.address} for ${data.companyName}`,
          html
        })
    )

module.exports = {
  sendTenantCode,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendReminderEmail
}
