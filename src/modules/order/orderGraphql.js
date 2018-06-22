
const {
  isAuthenticated,
  addOneToOneRelation,
  prepareCrudModel,
  attachToAll,
  attachOwner
} = require('../core/graphql')

module.exports = ({OrderModel, orderRepository, TC}) => {
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
  const queries = crudQueries// attachOwner(crudQueries)
  const mutations = attachOwner(crudMutations)

  OrderTC.addResolver({
    name: 'placeOrder',
    args: {
      gameId: 'Float',
      orderType: 'Float',
      amount: 'Float',
      odd: 'Float',
      outcome: 'Float'
    },
    type: OrderTC,
    resolve: ({ args, context: { user } }) => orderRepository.placeOrder({args, user})
  })

 // register queries
  schemaComposer
   .rootQuery()
   .addFields(queries)

 // register mutations
  schemaComposer
   .rootMutation()
   .addFields({
     ...attachToAll(isAuthenticated)({
       placeOrder: OrderTC.getResolver('placeOrder')
     })
   })

  TC.OrderTC = OrderTC

  return OrderTC
}
