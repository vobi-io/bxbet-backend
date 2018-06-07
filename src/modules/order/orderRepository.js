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
      let order = await this.db.OrderModel.findOne({orderId: orderId})
      let gameFromBl = await getGameFromBlockChain(gameId)
      const game = await this.gameRepository.saveGame(gameFromBl)
      schema.game = game
      if (order) {
        order.set(schema)
        await order.save()
      } else {
        let newOrder = new this.db.OrderModel(schema)
        order = await newOrder.save()
      }
      return Promise.resolve(order)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = OrderRepository

