/* eslint handle-callback-err:0 */
'use strict'
var MyError = require('app/utils/responses/errors')
var Utils = require('app/utils/Utils')
var appConfig = require('app/config')
var jwtService = require('app/services/jwtService')
var geoip = require('geoip-lite')
var Promise = require('bluebird')
var roles = require('app/modules/roles/roles').roles

class AuthRepo {
  constructor (teamRepository) {

  }

  signUp (email, password, role, user) {
    const models = global.db
    return global.db.UserModel.checkIfEmailExist(email)
      .then(() => {
        var schema = {
          email,
          password: Utils.generateHash(password),
          account: {
            activationToken: Utils.generateRandomHash(),
            activationExpires: Date.now() + appConfig.auth.activationTokenExpiresIn,
            active: true
          },
          role: role //  default role
        }
        schema = Object.assign({}, user, schema)
        let newUser = new models.UserModel(schema)
        return newUser.save()
      })
      .catch((err) => {
        return Promise.reject(err)
      })
  }

  addAdmin (email, password, firstName, lastName, jobPosition, role = roles.admin) {
    const models = global.db
    return global.db.UserModel.checkIfEmailExist(email)
      .then(() => {
        var schema = {
          email,
          password: Utils.generateHash(password),
          account: {
            activationToken: Utils.generateRandomHash(),
            activationExpires: Date.now() + appConfig.auth.activationTokenExpiresIn,
            active: true
          },
          firstName,
          lastName,
          jobPosition,
          role
        }
        let newUser = new models.UserModel(schema)
        return newUser.save()
      })
      .catch((err) => {
        return Promise.reject(err)
      })
  }

  signIn (email, password, ip, device) {
    return global.db.UserModel.findOneByAnyEmailOrUsername(email)
      .then((user) => {
        if (!user) return Promise.reject(MyError.notFound(`The email doesn’t match any account or not active.`))
        if (!user.validatePassword(password)) return Promise.reject(MyError.notFound('The password you’ve entered is incorrect.'))
        // MAYBE we will need it now when EAM is signups active sets false
        // for all users after invite we are setting default property to ture
        // if (user.role === roles.EAM && user.account.active === false) return Promise.reject(MyError.notFound('User is not activated!'))
        // if (!user.account.active) return Promise.reject({message: 'Not active user'})

        // var geo = geoip.lookup(ip)

        // if (geo || device !== null) {
        //   if (geo) {
        //     user.lastLocation = `${geo.country} ${geo.city}`
        //   }
          // if (!user.devices.includes(device)) {
          //   user.devices.push(device)
          // }
        // user.save()
        // }

        var accessToken = jwtService(appConfig.jwt).sign({id: user.id})
        return Promise.resolve({
          access_token: accessToken,
          user: user.toJSONWithoutId()
        })
      })
  }

  activateAccount (token) {
    return global.db.UserModel.findUserByToken(token)
      .then((user) => {
        user.account.active = true
        user.account.activationToken = ''
        user.account.activationExpires = null
        return user.save()
      })
      .catch((err) => {
        return Promise.reject(err)
      })
  }

  async deactivateAccount (currentUser, userEmail) {
    try {
      var user = await global.db.UserModel.findOneByAnyEmailOrUsername(userEmail)
      if (!user) return Promise.reject(`User ${userEmail} not found or already deactivated`)
      if (String(user.company) === String(currentUser.company.id)) {
        user.account.active = false
        return user.save()
      } else {
        return Promise.reject(`You can not deactivate user from other company`)
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async activateAccountByEmail (currentUser, userEmail) {
    try {
      var user = await global.db.UserModel.getByEmail(userEmail)
      if (!user) return Promise.reject(`User ${userEmail} not found`)
      if (String(user.company) === String(currentUser.company.id)) {
        user.account.active = true
        return user.save()
      } else {
        return Promise.reject(`You can not activate user from other company`)
      }
    } catch (err) {
      return Promise.reject(err)
    }
  }

  requestResetPassword (email) {
    return global.db.UserModel.findOneByAnyEmailOrUsername(email)
      .then((user) => {
        if (!user) return Promise.reject(MyError.notFound(`The email doesn’t match any account or not active.`))
        user.account.resetPasswordToken = Utils.generateRandomHash()
        user.account.resetPasswordExpires = Date.now() + appConfig.auth.resetPasswordTokenExpiresIn
        let newUser = new global.db.UserModel(user)
        return newUser.save()
      }).catch((err) => {
        return Promise.reject(MyError.notFound(err))
      })
  }

  resetPassword (token, password) {
    return global.db.UserModel.findUserByPasswordToken(token)
      .then((user) => {
        if (!user) return Promise.reject(MyError.notFound(`The token doesn’t match any account or not valid.`))
        const newPassword = Utils.generateHash(password)
        user.password = newPassword
        user.account.resetPasswordToken = ''
        user.account.resetPasswordExpires = null
        let newUser = new global.db.UserModel(user)
        return newUser.save()
      }).catch((err) => {
        return Promise.reject(MyError.notFound(err))
      })
  }

  changePassword (oldPassword, password, user) {
    if (!password || !user.validatePassword(oldPassword)) {
      return Promise.reject(MyError.badRequest({message: 'old password is incorrect'}))
    }
    user.password = Utils.generateHash(password)
    let newUser = new global.db.UserModel(user)
    return newUser.save()
  }

  refreshToken (accessToken) {
    return new Promise((resolve, reject) => {
      try {
        var oldDecoded = jwtService(appConfig.jwt)
          .decode(accessToken)

        var newAccessTokem = jwtService(appConfig.jwt)
          .sign({id: oldDecoded.id})

        resolve({
          access_token: newAccessTokem
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = AuthRepo

