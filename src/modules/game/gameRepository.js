/* eslint handle-callback-err:0 */
'use strict'
var { gameEvent, addGame: addGameInBlockChain, getDefaultAccount,
  getMutationResultId, getGame, finishGame } = require('app/services/contract')

class GameRepository {
  constructor ({db}) {
    this.db = db
    this.saveGame = this.saveGame.bind(this)
    gameEvent(this.saveGame)
  }
  async getGame (gameId) {
    return this.db.GameModel.findOne({gameId: gameId})
  }

  async saveGame (schema) {
    try {
      const gameId = Number(schema.gameId)
      await this.db.GameModel.update(
        {gameId: gameId},
        schema,
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
      const {team1, team2, category, startDate, endDate} = game
      const account = await getDefaultAccount(0)

      const dtNow = Math.round(new Date() / 1000)
      const start = dtNow
      const end = dtNow + 1000
      const result = await addGameInBlockChain(team1, team2, category, start, end, 0, address, account)
      const gameId = getMutationResultId(result, 'gameId')
      const schema = await getGame(gameId)
      const saveGame = await this.saveGame(schema)
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
    return Promise.resolve(saveGame)
  }
}

module.exports = GameRepository

