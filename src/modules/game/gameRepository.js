/* eslint handle-callback-err:0 */
'use strict'
var { addGame: addGameInBlockChain, getDefaultAccount,
  getMutationResultId, getGame, finishGame } = require('app/services/contract')
var _ = require('lodash')

class GameRepository {
  constructor ({db}) {
    this.db = db
    this.saveGame = this.saveGame.bind(this)
  }

  async getGame (gameId) {
    return this.db.GameModel.findOne({gameId: gameId})
  }

  async saveGame (schema) {
    try {
      if (!schema || _.isEmpty(schema)) {
        return Promise.resolve()
      }
      const gameId = Number(schema.gameId)
      await this.db.GameModel.update(
        {gameId: gameId},
        {$set: {
          ...schema
        }},
        {upsert: true, setDefaultsOnInsert: true})

      let game = await this.db.GameModel.findOne({gameId})
      return Promise.resolve(game)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async createGame ({game, user}) {
    try {
      const {blockChain: {address}} = user
      const {homeTeam, awayTeam, category, startDate, endDate} = game
      const account = await getDefaultAccount(0)

      const dtNow = Math.round(new Date() / 1000)
      const start = dtNow
      const end = dtNow + 1000
      const result = await addGameInBlockChain(homeTeam, awayTeam, category, start, end, 0, address, account)
      const gameId = getMutationResultId(result, 'gameId')
      const schema = await getGame(gameId)
      const saveGame = await this.saveGame(schema)

      global.sendRealTimeInfoToUsers([], {
        type: 'createGame',
        game: saveGame.toJSON(),
        fromUserId: user._id
      })
      return Promise.resolve(saveGame)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async finishGame ({gameId, outcome, user}) {
    const account = await getDefaultAccount(0)
    await finishGame(gameId, outcome, account)
    const schema = await getGame(gameId)
    const saveGame = await this.saveGame(schema)

    global.sendRealTimeInfoToUsers([], {
      type: 'finishGame',
      game: saveGame.toJSON(),
      fromUserId: user._id
    })
    return Promise.resolve(saveGame)
  }

  async gameReport ({gameId}) {
    try {
      const result = await this.db.OrderModel.aggregate([
        {'$match': { gameId }},
        {
          '$group': {
            _id: '$outcome',
            total: {$sum: 1}
          }
        }
      ])
      let data = {
        total: 0,
        homeTeam: 0,
        awayTeam: 0,
        draw: 0
      }
      result.map(i => {
        switch (i._id) {
          case 1:
            data.homeTeam = i.total
            break
          case 0:
            data.draw = i.total
            break
          case 2:
            data.awayTeam = i.total
            break
        }
        data.total += i.total
      })
      return data
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async getGameMaxOdds ({gameId}) {
    try {
      const getQuery = (outcome, orderType) => {
        return [
          {$match: {orderType, outcome, gameId, status: 0}},
          {$sort: {odd: -1}},
          {$limit: 3},
          {$project: {odd: 1, amount: 1, outcome: 1}}
        ]
      }

      const [drawBuy, drawSell, homeTeamBuy, homeTeamSell,
        awayTeamBuy, awayTeamSell] = await Promise.all([
          this.db.OrderModel.aggregate(getQuery(0, 0)), // Draw - Buy
          this.db.OrderModel.aggregate(getQuery(0, 1)), // Draw - Sell
          this.db.OrderModel.aggregate(getQuery(1, 0)), // One - Buy
          this.db.OrderModel.aggregate(getQuery(1, 1)), // One - Sell
          this.db.OrderModel.aggregate(getQuery(2, 0)), // Two - Buy
          this.db.OrderModel.aggregate(getQuery(2, 1)) // Two - Sell
        ])
      const data = {
        drawBuy, drawSell, homeTeamBuy, homeTeamSell, awayTeamBuy, awayTeamSell
      }
      return data
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = GameRepository

