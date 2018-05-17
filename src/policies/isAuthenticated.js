// var User = require('../modules/user/userModel')
var jwtService = require('../services/jwtService')
var Utils = require('../utils/Utils')
var roleObjects = require('../modules/roles/roles').roleObjects

module.exports = isAuthenticated

function isAuthenticated (req, res, next) {
  var token = Utils.extractToken(req)
  if (!token) return res.unauthorized()
  var payload
  try {
    payload = jwtService(req.app.settings.configuration.jwt).verify(token)
  } catch (ex) {
    if (ex.name === 'TokenExpiredError') {
      return res.tokenExpired()
    } else {
      return res.unauthorized()
    }
  }

  global.db.UserModel.findById(payload.id).populate('company')
        .exec().then((user) => {
          if (!user) return res.unauthorized()

          // check if account is active
          // Turned offf
          // if (!user.account.active) return res.notActiveUser()

          req.user = user

          next()
        }).catch((err) => {
          res.serverError(err)
        })
}
