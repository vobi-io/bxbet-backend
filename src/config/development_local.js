
module.exports = {
  port: 8005,
  HTTP_HOST: 'http://localhost:8001',
  database: {
    connection: 'mongodb://localhost:27017/bxbet'
  },
  mailgun: {
    apiKey: 'key-3e652d629b8d9177f917a49ca5ff1205',
    domainForMailgun: 'bxbet.com',
    defaultFrom: 'service@bxbet.com',
    domainInTemplate: 'https://bxbet.com',
    frontendUrl: 'https://bxbet.com'
  },
  systemEmail: 'service@bxbet.com',
  stripeKey: 'sk_test_Dhb6ICQkc3hWBCaF1C5IPAI9'
}
