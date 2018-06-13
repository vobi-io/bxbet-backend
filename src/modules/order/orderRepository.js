/* eslint handle-callback-err:0 */
'use strict'
var { OrderEvent, getGame: getGameFromBlockChain } = require('app/services/contract')
var gameModule = require('app/modules/game')

class OrderRepository {
  constructor ({db}) {
    this.db = db
    this.saveOrder = this.saveOrder.bind(this)
    OrderEvent(this.saveOrder)
    this.gameRepository = gameModule.getRepository(this.db)
  }

  async saveOrder (schema) {
    try {
      const orderId = Number(schema.orderId)
      const gameId = Number(schema.gameId)
      let gameFromBl = await getGameFromBlockChain(gameId)
      const game = await this.gameRepository.saveGame(gameFromBl)
      schema.game = game._id
      await this.db.OrderModel.update(
        {orderId: orderId},
        schema,
        {upsert: true, setDefaultsOnInsert: true})
      let order = await this.db.OrderModel.findOne({orderId: orderId})
      return Promise.resolve(order)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = OrderRepository

