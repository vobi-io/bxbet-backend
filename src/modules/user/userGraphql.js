var { composeWithMongoose } = require('graphql-compose-mongoose/node8')
const customizationOptions = {} // left it empty for simplicity, described below

module.exports = ({UserModel, isAuthenticated, TC}) => {
  const { schemaComposer } = TC
  const UserTC = composeWithMongoose(UserModel, customizationOptions)

  schemaComposer.rootQuery().addFields({
    userById: UserTC.getResolver('findById'),
    userByIds: UserTC.getResolver('findByIds'),
    userOne: UserTC.getResolver('findOne'),
    userMany: UserTC.getResolver('findMany'),
    userCount: UserTC.getResolver('count'),
    userConnection: UserTC.getResolver('connection'),
    userPagination: UserTC.getResolver('pagination')

    // ...isAuthenticated({
    //   currentUser: (parent, args, context, info) => context.user
    // })
  })

  schemaComposer.rootMutation().addFields({
    userCreate: UserTC.getResolver('createOne'),
    userUpdateById: UserTC.getResolver('updateById'),
    userUpdateOne: UserTC.getResolver('updateOne'),
    userUpdateMany: UserTC.getResolver('updateMany'),
    userRemoveById: UserTC.getResolver('removeById'),
    userRemoveOne: UserTC.getResolver('removeOne'),
    userRemoveMany: UserTC.getResolver('removeMany')
  })

  TC.UserTC = UserTC
  return UserTC
}
