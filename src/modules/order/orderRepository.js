/* eslint handle-callback-err:0 */
'use strict'
var { OrderEvent, getGame: getGameFromBlockChain, placeOrder, getOrderById } = require('app/services/contract')
var gameModule = require('app/modules/game')

class OrderRepository {
  constructor ({db}) {
    this.db = db
    this.saveOrder = this.saveOrder.bind(this)
    OrderEvent(this.saveOrder)
    this.gameRepository = gameModule.getRepository(this.db)

    setTimeout(() => {
      // getGameFromBlockChain(3).then(i => {
      //   console.log(i, 'aaaa')

      //   getOrderById(3, 3).then(y => {
      //     console.log(y)
      //   })
      //   // placeOrder(3, 1, 89, 1, 1, 1528892459)
      // })
    }, 2000)
  }

  async saveOrder (schema) {
    try {
      const orderId = Number(schema.orderId)
      const gameId = Number(schema.gameId)

      let gameFromBl = await getGameFromBlockChain(gameId)
      const game = await this.gameRepository.saveGame(gameFromBl)
      schema.game = game._id
      await this.db.OrderModel.update(
        {orderId, gameId},
        schema,
        {upsert: true, setDefaultsOnInsert: true})

      let order = await this.db.OrderModel.findOne({orderId})
      return Promise.resolve(order)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

module.exports = OrderRepository

