/* eslint handle-callback-err:0 */
'use strict'
var { addGameEvent } = require('app/services/contract')

class GameRepository {
  constructor ({db}) {
    this.db = db
    this.saveGame = this.saveGame.bind(this)
    addGameEvent(this.saveGame)
  }

  async saveGame (schema) {
    try {
      let game = await this.db.GameModel.findOne({gameId: Number(schema.gameId)})
      if (game) {
        game.set(schema)
        await game.save()
      } else {
        let newGame = new this.db.GameModel(schema)
        game = await newGame.save()
      }
      return Promise.resolve(game)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = GameRepository

