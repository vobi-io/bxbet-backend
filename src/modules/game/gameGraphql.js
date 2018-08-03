
const {
  isAuthenticated,
  addOneToOneRelation,
  prepareCrudModel,
  attachToAll,
  attachOwner
} = require('../core/graphql')

module.exports = ({GameModel, gameRepository, orderRepository, TC}) => {
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
      homeTeam: 'String',
      awayTeam: 'String',
      category: 'String',
      startDate: 'Date',
      endDate: 'Date'
    },
    type: GameTC,
    resolve: async ({ args, context: { user } }) => {
      const game = await gameRepository.createGame({game: args, user})

      await orderRepository.randomPlaceOrders({gameId: game.gameId, user})

      return game
    }
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
      homeTeam: Float,
      awayTeam: Float,
      draw: Float,
    }`,
    resolve: ({ args, context: { user } }) => gameRepository.gameReport({...args, user})
  })

  var OddReport = `type OddReport{
    odd: Float
    amount: Float
  }`

  const GameMaxOdds = schemaComposer.TypeComposer.create({
    name: 'GameMaxOdds',
    fields: {
      drawBuy: [OddReport],
      drawSell: [OddReport],
      homeTeamBuy: [OddReport],
      homeTeamSell: [OddReport],
      awayTeamBuy: [OddReport],
      awayTeamSell: [OddReport]
    }
  })

  GameTC.addResolver({
    name: 'getGameMaxOdds',
    args: {
      gameId: 'Float'
    },
    type: GameMaxOdds,
    resolve: ({ args, context: { user } }) => gameRepository.getGameMaxOdds({...args, user})
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
