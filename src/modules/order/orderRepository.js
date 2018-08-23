/* eslint handle-callback-err:0 */
'use strict'
var { getGame: getGameFromBlockChain, placeOrder,
   getOrderById, getDefaultAccount, getMutationResultId } = require('app/services/contract')
var scenarios = require('app/modules/helpers/datasets/scenarios')
var _ = require('lodash')

class OrderRepository {
  constructor ({db, gameRepository}) {
    this.db = db
    this.saveOrder = this.saveOrder.bind(this)
    this.gameRepository = gameRepository
  }

  async saveOrder (schema) {
    try {
      if (!schema || _.isEmpty(schema)) {
        return Promise.resolve()
      }
      const orderId = Number(schema.orderId)
      const gameId = Number(schema.gameId)

      let gameFromBl = await getGameFromBlockChain(gameId)
      const game = await this.gameRepository.saveGame(gameFromBl)
      schema.game = game._id
      await this.db.OrderModel.update(
        {orderId, gameId},
        {$set: {
          ...schema
        }},
        {upsert: true, setDefaultsOnInsert: true})

      let order = await this.db.OrderModel.findOne({orderId, gameId})
      return Promise.resolve(order)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async placeOrder ({order, user}) {
    try {
      const {blockChain: {address}} = user
      const {gameId, orderType, amount, odd, outcome} = order
      const account = await getDefaultAccount(0)
      const result = await placeOrder(gameId, orderType, amount, odd, outcome, address, account)
      const orderId = getMutationResultId(result, 'orderId')
      // const orderId = result.logs[1].args.orderId.toString()
      const schema = await getOrderById(gameId, orderId)
      const saveOrder = await this.saveOrder(schema)
      global.sendRealTimeInfoToUsers([], {
        type: 'placeOrder',
        order: saveOrder.toJSON(),
        fromUserId: user._id
      })
      return Promise.resolve(saveOrder)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async randomPlaceOrders ({gameId, user}) {
    var random = Math.floor(Math.random() * Math.floor(3))
    const orders = scenarios[random.toString()]

    for (const item of orders) {
      await this.placeOrder({ order: {...item, gameId}, user })
    }
    return true
  }
}

module.exports = OrderRepository

