const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')
const config = require('app/config')
const mailUtil = require('../mail/mailUtils')
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
          from: 'no-reply@bx.bet',
          subject: 'Welcome to BX.BET',
          html
        })
        .catch(err => {
          console.log(err)
        })
    )

const sendPasswordResetEmail = user =>
  sgMail
    .send({
      to: user.email,
      from: 'no-reply@bx.bet',
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
          from: 'no-reply@bx.bet',
          subject: 'ACTION REQUIRED: Complete Your bx.bet of ' +
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
