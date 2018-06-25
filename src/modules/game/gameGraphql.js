
const {
  isAuthenticated,
  addOneToOneRelation,
  prepareCrudModel,
  attachToAll,
  attachOwner
} = require('../core/graphql')

module.exports = ({GameModel, gameRepository, TC}) => {
  const {schemaComposer} = TC
  // generate crud queries and mutations for model
  // uses model.name to generate names
  const {
    queries: crudQueries,
    mutations: crudMutations,
    ModelTC: GameTC
  } = prepareCrudModel({
    Model: GameModel
  })

 // set all owner wrappers
  const queries = crudQueries // attachOwner(crudQueries)
  // const mutations = attachOwner(crudMutations)

  GameTC.addResolver({
    name: 'createGame',
    args: {
      team1: 'String',
      team2: 'String',
      category: 'String',
      startDate: 'Date',
      endDate: 'Date'
    },
    type: GameTC,
    resolve: ({ args, context: { user } }) => gameRepository.createGame({game: args, user})
  })

  GameTC.addResolver({
    name: 'finishGame',
    args: {
      gameId: 'Float',
      outcome: 'Float'
    },
    type: GameTC,
    resolve: ({ args, context: { user } }) => gameRepository.finishGame({...args, user})
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
       createGame: GameTC.get('$createGame'),
       finishGame: GameTC.get('$finishGame')

     })
   })

  TC.GameTC = GameTC

  return GameTC
}
