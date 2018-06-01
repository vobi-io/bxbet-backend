// admin user db.createUser({user: "easyshair",pwd: "adminpass",roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]})
module.exports = {
  port: 8002,
  HTTP_HOST: 'https://api.bxbet.com', // this is api endpoint full url
  database: {
    connection: 'mongodb://localhost:27017/bxbet'
  },
  mailgun: {
    apiKey: 'key-',
    domainForMailgun: 'bxbet.com',
    defaultFrom: 'service@bxbet.com',
    domainInTemplate: 'https://bxbet.com',
    frontendUrl: 'https://bxbet.com'
  },
  systemEmail: 'service@bxbet.com'
}
