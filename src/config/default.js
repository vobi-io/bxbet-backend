var ms = require('ms')
var path = require('path')

var rootFolder = path.resolve(__dirname, '..')

module.exports = {
  port: 8005,
  database: {
    connection: 'mongodb://bxbet:V0bi!walkthru@db.vobi.io/bxbet'
  },
  contract: {
    network: 'http://localhost:8545'
  },
  google: {
    projectId: 'test',
    credentials: {
    }
  },
  twilio: {
    accountSid: '',
    authToken: '',
    defaultPhoneNumber: '+19132465722'
  },
  socket: {
    port: 8006,
    server: 'http://localhost:8006/'
  },
  auth: {
    activationTokenExpiresIn: ms('1d'),
    resetPasswordTokenExpiresIn: ms('1d'),
    defaultInvitationPassword: 'qwerty'
  },
  multer: {
    uploadDir: `${rootFolder}/public/uploads/`
  },
  jwt: {
    secret: 'THISISSECRET',
    algorithm: 'HS256',
    issuer: 'vobi',
    audience: 'vobi',
    expiresIn: ms('1d'),
    ignoreExpiration: '',
    subject: ''
  },
  cronSecretKey: 'artqvaradzmurad',
  activityLogKey: 'artqvaradzmurad',
  HTTP_HOST: 'http://localhost:8001',
  systemEmail: 'contact@bxbet.com',
  mailgun: {
    apiKey: 'key-414e8b59f8a5af4aa6fe44ce917c8010',
    domainForMailgun: 'bxbet.com',
    // api host
    domainInTemplate: 'http://localhost:8001',
    frontendUrl: 'http://52.40.142.121',
    defaultFrom: 'contact@walkthru.com'
  },
  qrCodes: {
    upload: `${rootFolder}/public/qrcodes/`,
    assetFolder: `/qrcodes/`
  },

  deployment: {
    dev: {
      host: 'ec2-34-209-156-162.us-west-2.compute.amazonaws.com',
      username: 'ubuntu'
    },
    test: {
      host: 'ec2-34-209-156-162.us-west-2.compute.amazonaws.com',
      username: 'ubuntu'
    },
    prod: {
      host: '',
      username: 'ubuntu'
    }
  }
  // cronjobKey : 'vinc!ncGamax!losAm0wydesErtDges'

}

