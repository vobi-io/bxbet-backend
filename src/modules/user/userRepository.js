/* eslint handle-callback-err:0 */
'use strict'

var Promise = require('bluebird')
var { transferEvent } = require('app/services/contract')

class UserRepository {
  constructor ({ db }) {
    this.db = db
    transferEvent(this.updateBalance)
  }

  async updateBalance (schema) {
    try {
      const orderId = Number(schema.orderId)
      const gameId = Number(schema.gameId)

      // let gameFromBl = await getGameFromBlockChain(gameId)
      // const game = await this.gameRepository.saveGame(gameFromBl)
      // schema.game = game._id
      // await this.db.OrderModel.update(
      //   {orderId, gameId},
      //   schema,
      //   {upsert: true, setDefaultsOnInsert: true})

      let order = await this.db.OrderModel.findOne({orderId})
      return Promise.resolve(order)
    } catch (err) {
      return Promise.reject(err)
    }
  }

}

module.exports = UserRepository

