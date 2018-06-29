/* eslint handle-callback-err:0 */
'use strict'

const MyError = require('app/utils/responses/errors')
const Utils = require('app/utils/Utils')
const appConfig = require('app/config')
const roles = require('app/modules/roles/roles').roles
const MailService = require('app/services/sendgrid/sendgridSevice')
const jwtService = require('app/services/jwtService')
const Promise = require('bluebird')
var { giveFreeTokens, getBalance, createAccount} = require('app/services/contract')

class AuthRepository {
  constructor ({ db }) {
    this.db = db
  }

  async signUp ({ email, password, role }) {
    const { UserModel } = this.db
    if (!role) {
      role = roles.user
    }

    await UserModel.checkIfEmailExist(email)

    const generateHash = Utils.generateHash(password)
    const blockChain = await createAccount(generateHash)
    const schema = {
      email,
      password: generateHash,
      account: {
        activationToken: Utils.generateRandomHash(),
        activationExpires: Date.now() +
          appConfig.auth.activationTokenExpiresIn,
        active: true
      },
      role: role //  default role
    }
    blockChain.address = blockChain.address.toLowerCase()
    await giveFreeTokens(blockChain.address)
    blockChain.schema = await getBalance(blockChain.address)
    schema.blockChain = blockChain

    // const balance3 = await getBalance(getBexbetAccount())
    // const balance1 = await getBalance(getBexbetAccount())
    // console.log(balance3, balance, balance1)

    const user = await new UserModel(schema).save()

    // send mail
    await MailService.sendWelcomeEmail(user)

    const accessToken = jwtService(appConfig.jwt).sign({ id: user.id })
    return Promise.resolve({
      accessToken: accessToken,
      user: user.toJSONWithoutId()
    })
  }

  signIn ({ email, password, ip, device }) {
    const { UserModel } = this.db

    return UserModel
      .findOneByAnyEmailOrUsername(email)
      .then(user => {
        if (!user) {
          return Promise.reject(
            MyError.notFound(`The email doesn’t match any account or not active.`)
          )
        }
        if (!user.validatePassword(password)) {
          return Promise.reject(
            MyError.notFound('The password you’ve entered is incorrect.')
          )
        }

        const accessToken = jwtService(appConfig.jwt)
          .sign({ id: user.id })

        return {
          accessToken: accessToken
        }
      })
  }

  activateAccount ({ token }) {
    const { UserModel } = this.db

    return UserModel
      .findUserByToken(token)
      .then(user => {
        if (!user) {
          return Promise.reject(
            MyError.notFound('The token doesn’t match any account or not valid.')
          )
        }

        user.account.active = true
        user.account.activationToken = ''
        user.account.activationExpires = null

        return user
          .save()
      })
      .then(result => result.toJSONWithoutId())
  }

  deactivateAccount ({ user }) {
    user.account.active = false

    return user
      .save()
      .then(result => result.toJSONWithoutId())
  }

  requestResetPassword ({ email }) {
    const { UserModel } = this.db

    return UserModel
      .findOneByAnyEmailOrUsername(email)
      .then(user => {
        if (!user) {
          return Promise.reject(
            MyError.notFound('The email doesn’t match any account or not active.')
          )
        }
        user.account.resetPasswordToken = Utils.generateRandomHash()
        user.account.resetPasswordExpires = Date.now() +
          appConfig.auth.resetPasswordTokenExpiresIn

        return new UserModel(user)
          .save()
      })
      .then(user =>
        MailService
          .sendPasswordResetEmail(user)
          .then(() => user)
      )
      .then(result => result.toJSONWithoutId())
  }

  resetPassword ({ token, password }) {
    const { UserModel } = this.db

    return UserModel
      .findUserByPasswordToken(token)
      .then(user => {
        if (!user) {
          return Promise.reject(
            MyError.notFound('The token doesn’t match any account or not valid.')
          )
        }
        const newPassword = Utils
          .generateHash(password)
        user.password = newPassword
        user.account.resetPasswordToken = ''
        user.account.resetPasswordExpires = null

        return new UserModel(user)
          .save()
      })
      .then(result => result.toJSONWithoutId())
  }

  changePassword ({ oldPassword, newPassword, user }) {
    const { UserModel } = this.db

    if (!newPassword ||
      !user.validatePassword(oldPassword)
    ) {
      return Promise.reject(
        new Error('old password is incorrect')
      )
    }
    user.password = Utils
      .generateHash(newPassword)

    return new UserModel(user)
      .save()
      .then(result => result.toJSONWithoutId())
  }

  refreshToken ({ headers }) {
    return new Promise((resolve, reject) => {
      try {
        const token = Utils.extractToken({ headers })

        const oldDecoded = jwtService(appConfig.jwt)
          .decode(token)

        const accessToken = jwtService(appConfig.jwt)
          .sign({ id: oldDecoded.id })

        return resolve({
          accessToken
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = AuthRepository

