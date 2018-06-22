'use strict'

const {
  composeWithMongoose
} = require('graphql-compose-mongoose/node8')
const {
  isAuthenticated,
  attachToAll

} = require('app/modules/core/graphql')

module.exports = ({
  UserModel,
  TC,
  authRepository,
  userRepository
}) => {
  const { schemaComposer } = TC

  const AccessTokenTC = `
    type AccessToken {
      accessToken: String
    }
  `
  const UserTC = composeWithMongoose(UserModel, {})

  UserTC.removeField(['password', '__v', 'account'])

  UserTC.addResolver({
    name: 'me',
    type: UserTC,
    resolve: ({ context }) =>
      context.user.toJSON()
  })

  UserTC.addResolver({
    name: 'signUp',
    args: {
      email: 'String',
      password: 'String',
      role: UserTC.getFieldType('role')
    },
    type: AccessTokenTC,
    resolve: ({ args }) =>
      authRepository.signUp(args)
  })

  UserTC.addResolver({
    name: 'signIn',
    args: {
      email: 'String',
      password: 'String'
    },
    type: AccessTokenTC,
    resolve: ({ args }) =>
      authRepository.signIn(args)
  })

  UserTC.addResolver({
    name: 'refreshToken',
    args: {
      token: 'String'
    },
    type: AccessTokenTC,
    resolve: ({ context }) =>
      authRepository.refreshToken(context)
  })

  UserTC.addResolver({
    name: 'changePassword',
    args: {
      oldPassword: 'String',
      newPassword: 'String'
    },
    type: UserTC,
    resolve: ({ args, context: { user } }) =>
      authRepository.changePassword(
        Object.assign(args, { user })
      )
  })

  UserTC.addResolver({
    name: 'requestResetPassword',
    args: {
      email: 'String'
    },
    type: UserTC,
    resolve: ({ args }) =>
      authRepository.requestResetPassword(args)
  })

  UserTC.addResolver({
    name: 'resetPassword',
    args: {
      token: 'String',
      password: 'String'
    },
    type: UserTC,
    resolve: ({ args }) =>
      authRepository.resetPassword(args)
  })

  UserTC.addResolver({
    name: 'activateAccount',
    args: {
      token: 'String'
    },
    type: UserTC,
    resolve: ({ args }) =>
      authRepository.activateAccount(args)
  })

  UserTC.addResolver({
    name: 'deactivateAccount',
    args: {},
    type: UserTC,
    resolve: ({ context }) =>
      authRepository.deactivateAccount(context)
  })

  UserTC.addResolver({
    name: 'getBalance',
    args: {},
    type: ` type Balance {
      amount: Number,
      blockAmount: Number
    }`,
    resolve: ({ context: { user } }) => userRepository.getBalance(user)
  })

  schemaComposer
    .rootQuery()
    .addFields({
      ...attachToAll(isAuthenticated)({
        me: UserTC.getResolver('me')
      })
    })

  schemaComposer
    .rootMutation()
    .addFields({
      signUp: UserTC.getResolver('signUp'),
      signIn: UserTC.getResolver('signIn'),
      requestResetPassword: UserTC.getResolver('requestResetPassword'),
      resetPassword: UserTC.getResolver('resetPassword'),
      activateAccount: UserTC.getResolver('activateAccount'),
      refreshToken: UserTC.getResolver('refreshToken'),
      ...attachToAll(isAuthenticated)({
        changePassword: UserTC.getResolver('changePassword'),
        deactivateAccount: UserTC.getResolver('deactivateAccount')
      })
    })

  TC.UserTC = UserTC

  return UserTC
}
