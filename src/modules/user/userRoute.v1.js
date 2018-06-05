
module.exports = ({ isAuthenticated, UserCtrl, AuthCtrl }) => {
  return {
    '/api/v1/users': {
      '/ping': {
        get: [UserCtrl.ping.bind(UserCtrl)]
      },
      get: [isAuthenticated, UserCtrl.listUsers.bind(UserCtrl)],
      '/activate': {
        post: [AuthCtrl.activateAccount.bind(AuthCtrl)]
      },
      '/reset-password': {
        post: [AuthCtrl.resetPassword.bind(AuthCtrl)]
      },
      '/sign-in': {
        post: [AuthCtrl.signIn.bind(AuthCtrl)]
      },
      '/sign-up': {
        post: [AuthCtrl.signUp.bind(AuthCtrl)]
      },
      '/refresh-token': {
        post: [AuthCtrl.refreshToken.bind(AuthCtrl)]
      },
      '/request-reset-password': {
        post: [AuthCtrl.requestResetPassword.bind(AuthCtrl)]
      },
      '/change-password': {
        post: [isAuthenticated, AuthCtrl.changePassword.bind(AuthCtrl)]
      },
      '/upload-avatar': {
        post: [isAuthenticated, UserCtrl.uploadCurrentUserAvatar.bind(UserCtrl)]
      },
      '/info': {
        get: [isAuthenticated, UserCtrl.getUserInfo.bind(UserCtrl)]
      },
      '/update-profile': {
        put: [isAuthenticated, UserCtrl.updateUserProfile.bind(UserCtrl)]
      },
      '/admins': {
        get: [isAuthenticated, UserCtrl.listUsers.bind(UserCtrl)],
        post: [isAuthenticated, AuthCtrl.addAdmin.bind(AuthCtrl)]
      },
      '/:id': {
        get: [isAuthenticated, UserCtrl.getUser.bind(UserCtrl)],
        delete: [isAuthenticated, UserCtrl.deleteUser.bind(UserCtrl)],
        put: [isAuthenticated, UserCtrl.editUser.bind(UserCtrl)],
        '/upload-avatar': {
          post: [isAuthenticated, UserCtrl.uploadUserAvatar.bind(UserCtrl)]
        }
      }
    }
  }
}
