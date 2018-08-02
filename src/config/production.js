
module.exports = {
  port: 8005,
  HTTP_HOST: '',
  database: {
    connection: 'mongodb://bxbet:V0bi!walkthru@db.vobi.io/bxbet'
  },
  socket: {
    port: 8006,
    server: 'https://wsbx.vobi.io/'
  },
  mailgun: {
    apiKey: 'key-',
    domainForMailgun: 'bxbet.com',
    defaultFrom: 'service@bxbet.com',
    domainInTemplate: '',
    frontendUrl: ''
  },
  systemEmail: 'service@bxbet.com'
}

