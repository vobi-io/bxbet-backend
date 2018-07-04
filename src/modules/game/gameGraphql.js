
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

  GameTC.addResolver({
    name: 'gameReport',
    args: {
      gameId: 'Float'
    },
    type: `type GameReport {
      total: Float,
      team1: Float,
      team2: Float,
      draw: Float,
    }`,
    resolve: ({ args, context: { user } }) => gameRepository.gameReport({...args, user})
  })

  // const OddReport = schemaComposer.TypeComposer.create({
  //   name: 'OddReport',
  //   fields: {
  //     odd: 'Float',
  //     amount: 'Float',
  //     lastName: 'String'
  //   }
  // })

  var OddReport = `type OddReport{
    odd: Float
    amount: Float
  }`

  const GameMaxOdds = schemaComposer.TypeComposer.create({
    name: 'GameMaxOdds',
    fields: {
      drawBuy: [OddReport],
      drawSell: [OddReport],
      team1Buy: [OddReport],
      team1Sell: [OddReport],
      team2Buy: [OddReport],
      team2Sell: [OddReport]
    }
  })

  GameTC.addResolver({
    name: 'getGameMaxOdds',
    args: {
      gameId: 'Float'
    },
    type: GameMaxOdds,
    resolve: ({ args, context: { user } }) => gameRepository.getGameMaxOdds({...args})
  })

 // register queries
  schemaComposer
   .rootQuery()
   .addFields({
     ...queries,
     gameReport: GameTC.get('$gameReport'),
     getGameMaxOdds: GameTC.get('$getGameMaxOdds')
   })

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
