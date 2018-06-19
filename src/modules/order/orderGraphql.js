
const {
  isAuthenticated,
  addOneToOneRelation,
  prepareCrudModel,
  attachToAll,
  attachOwner
} = require('../core/graphql')

module.exports = ({OrderModel, TC}) => {
  const {schemaComposer} = TC
  // generate crud queries and mutations for model
  // uses model.name to generate names
  const {
    queries: crudQueries,
    mutations: crudMutations,
    ModelTC: OrderTC
  } = prepareCrudModel({
    Model: OrderModel
  })

  // OrderTC.addRelation('userObj',
  //   {
  //     resolver: () => UserTC.getResolver('findById'),
  //     prepareArgs: {
  //       filter: source => ({ _id: source.user })
  //     },
  //     projection: { user: true }
  //   }
  // )

 // set all owner wrappers
  const queries = attachOwner(crudQueries)
  const mutations = attachOwner(crudMutations)

  // queries.bookingManyByTalent = BookingTC.getResolver('findMany').wrapResolve(next => rp => {
  //   if (!rp.args.filter) {
  //     rp.args.filter = {}
  //   }

  //   rp.args.filter.talentId = rp.context.user._id

  //   return next(rp)
  // })

  // queries.bookingCountByTalent = BookingTC.getResolver('count').wrapResolve(next => rp => {
  //   if (!rp.args.filter) {
  //     rp.args.filter = {}
  //   }

  //   rp.args.filter.talentId = rp.context.user._id

  //   return next(rp)
  // })

 // ad relations to model
  // addOneToOneRelation({
  //   ModelTC: BookingTC,
  //   RelationTC: UserTC,
  //   name: 'talent',
  //   relPropName: 'talentId'
  // })

  // addOneToOneRelation({
  //   ModelTC: BookingTC,
  //   RelationTC: UserTC,
  //   name: 'booker',
  //   relPropName: 'bookerId'
  // })

 // register queries
  schemaComposer
   .rootQuery()
   .addFields(queries)

 // register mutations
  schemaComposer
   .rootMutation()
   .addFields({
     ...attachToAll(isAuthenticated)(mutations)
   })

  TC.OrderTC = OrderTC

  return OrderTC
}
