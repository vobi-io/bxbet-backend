var Promise = require('bluebird')
var eol = require('os').EOL

module.exports = {
  sendMail: sendMail
}

function sendMail(from, to, subject, html) {
  return new Promise(function(resolve, reject) {
    var mail = 'From: ' + from + eol +
            'To: ' + to + eol +
            'Subject: ' + subject + eol +
            html

    return resolve(mail)
  })
}
