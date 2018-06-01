
module.exports = {
  port: 800,
  HTTP_HOST: '',
  database: {
    connection: 'mongodb://localhost:27017/bxbet'
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

