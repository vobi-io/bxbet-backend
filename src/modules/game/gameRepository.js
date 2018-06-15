/* eslint handle-callback-err:0 */
'use strict'
var { gameEvent } = require('app/services/contract')

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
}

module.exports = GameRepository

