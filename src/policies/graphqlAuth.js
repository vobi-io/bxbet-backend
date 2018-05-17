// var User = require('../modules/user/userModel')
var jwtService = require('../services/jwtService')
var Utils = require('../utils/Utils')

const authMiddleware = ({db}) => {
  return async (req, res, next) => {
    var token = Utils.extractToken(req)
    if (!token) return next()
    var payload
    try {
      payload = jwtService(req.app.settings.configuration.jwt).verify(token)
    } catch (ex) {
      return next()
    }

    try {
      const user = await db.UserModel.findById(payload.id)
      if (!user) return next()
      // check if account is active
      // Turned offf
      // if (!user.account.active) return res.notActiveUser()

      req.user = user
      next()
    } catch (err) {
      res.serverError(err)
    }
  }
}

const isAuthenticated = (resolvers) => {
  Object.keys(resolvers).forEach((k) => {
    resolvers[k] = resolvers[k].wrapResolve(next => (rp) => {
      if (!rp.context.user) {
        throw new Error('User not authorized')
      }
      return next(rp)
    })
  })
  return resolvers
}

module.exports = {
  authMiddleware,
  isAuthenticated
}
