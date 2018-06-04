/* eslint camelcase:0 */
// var AuthRepository = require('./authRepository')
var MailService = require('app/services/sendgrid/sendgridSevice')
var Utils = require('app/utils/Utils')
var roles = require('app/roles/roles').roles

class AuthController {
  constructor ({db, authRepository}) {
    this.db = db
    this.authRepo = authRepository
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/sign-up user Signup
   * @apiName SignUp
   * @apiGroup User
   * @apiDescription Signup
   *
   *
   * @apiParam {String} email for user
   * @apiParam {String} password for user
   * @apiParam {String} firstName for user
   * @apiParam {String} lastName for user
   * @apiParam {String} phone for user
   * @apiParam {String} gender for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  signUp (req, res) {
    const {email, password, role} = req.body
    if (!email || !password) {
      return res.badRequest()
    }

    this.authRepo.signUp(email, password, 'Admin', req.body)
        .then((user) => {
          // send mail
          MailService.sendWelcomeEmail(user).then((data) => {
            res.ok('User Created')
          })
        })
      .catch(res.catchError)
  }

    /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/add-admin user addAdmin
   * @apiName AddAdmin
   * @apiGroup User
   * @apiDescription Add admin
   *
   *
   * @apiParam {String} email for user
   * @apiParam {String} password for user
   * @apiParam {String} role  role of user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  addAdmin (req, res) {
    const {role: currentUserRole} = req.user
    if (currentUserRole !== roles.superAdmin) {
      return res.forbidden('You have not access to create admin!')
    }
    const { email, firstName, lastName, jobPosition, role} = req.body
    if (!email) {
      return res.badRequest('missed email value!')
    }
    if (!role) {
      return res.badRequest('missed role value!')
    }
    const defaultPassword = Utils.generateRandomPassword(7)
    this.authRepo.addAdmin(email, defaultPassword, firstName, lastName, jobPosition, role)
        .then((user) => {
            // Send email here if we need it
          res.ok(user)
        })
        .catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/sign-in user SingIn
   * @apiName SingIn
   * @apiGroup User
   * @apiDescription SingIn
   *
   *
   * @apiParam {String} email for user
   * @apiParam {String} password for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  signIn (req, res) {
    const { email, password, device } = req.body
    if (!email || !password) {
      return res.badRequest('Invalid params')
    }

    this.authRepo.signIn(email, password, req.clientIp, device)
        .then((data) => {
          res.ok(data)
        }).catch(res.catchError)
  }
    /**
   * @apiVersion 1.0.0
   * @api {get} /api/v1/users/activate user activation
   * @apiName Activation
   * @apiGroup User
   * @apiDescription Activites user from activation link (Sent in email)
   *
   *
   * @apiParam {String} token for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  activateAccount (req, res) {
    const {token} = req.body
    if (!token) {
      return res.badRequest()
    }

    this.authRepo.activateAccount(token)
    .then((data) => {
      res.ok(data)
     // res.redirect({Location: '/login?activated=true'})
     // res.redirect('/')
    // }).catch(res.tokenExpired)
    }).catch((err) => {
      res.tokenExpired(err)
    })
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/deactivate-user request dectivate user
   * @apiName Deactivate user
   * @apiGroup User
   * @apiPermission Authorization (Roles: EAM, Admin)
   * @apiDescription User Deactivation by email
   *
   *
   * @apiParam {String} email for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  deactivateAccount (req, res) {
    // const {token} = req
    const { email } = req.body

    if (!email) {
      return res.badRequest()
    }

    this.authRepo.deactivateAccount(req.user, email)
    .then((data) => {
      res.ok(`user ${email} deactivated`)
    }).catch((err) => {
      res.badRequest(err)
    })
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/activate-user request activate user
   * @apiName Activate user
   * @apiGroup User
   * @apiPermission Authorization (Roles: EAM, Admin)
   * @apiDescription User Activation by email
   *
   * @apiParam {String} email for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  activateAccountByEmail (req, res) {
    // const {token} = req
    const { email } = req.body

    if (!email) {
      return res.badRequest()
    }

    this.authRepo.activateAccountByEmail(req.user, email)
    .then((data) => {
      res.ok(`user ${email} activated`)
    }).catch((err) => {
      res.badRequest(err)
    })
  }
   /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/request-reset-password request reset password
   * @apiName Request reset password
   * @apiGroup User
   * @apiDescription Request reset password
   *
   *
   * @apiParam {String} email for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  requestResetPassword (req, res) {
    const { email } = req.body
    if (!email) return res.badRequest()

    this.authRepo.requestResetPassword(email)
    .then((user) => {
      // res.ok(data)
      MailService.sendPasswordResetEmail(user).then((data) => {
        res.ok(user)
      })
    }).catch(res.catchError)
  }
  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/reset-password reset password token
   * @apiName Reset Password
   * @apiGroup User
   * @apiDescription Reset Password
   *
   *
   * @apiParam {String} token for user
   * @apiParam {String} password for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  resetPassword (req, res) {
    const { token, password } = req.body // get token from params
    // const { password } = req.body
    if (!token || !password) {
      return res.badRequest({message: 'token or password invalid!'})
    }
    this.authRepo.resetPassword(token, password)
    .then((user) => {
      res.ok(user)
    }).catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/change-password change password
   * @apiName Change Password
   * @apiGroup User
   * @apiDescription change Password
   *
   *
   * @apiParam {String} oldPassword for user
   * @apiParam {String} password new password for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  changePassword (req, res) {
    const { oldPassword, password } = req.body

    if (!oldPassword || !password) {
      return res.badRequest()
    }
    var user = req.user
    this.authRepo.changePassword(oldPassword, password, user)
    .then((user) => {
      res.ok(user)
    }).catch(res.catchError)
  }

  /**
   * @apiVersion 1.0.0
   * @api {post} /api/v1/users/refresh-token Refresh token
   * @apiName Refresh token
   * @apiGroup User
   * @apiDescription refresh token
   *
   *
   * @apiParam {String} access_token for user
   *
   * @apiSuccessExample Response success
   *     HTTP/1.1 201 Created
   *     {
   *        code: 'CREATED',
   *        message: 'The request has been fulfilled and resulted in a new resource being created',
   *        data : user
   *     }
   *
   * @apiUse Errors
   */
  refreshToken (req, res) {
    const access_token = Utils.extractToken(req)
    if (!access_token) {
      return res.badRequest()
    }
    this.authRepo.refreshToken(access_token)
    .then((data) => {
      res.ok(data)
    }).catch(res.catchError)
  }
}

module.exports = AuthController
