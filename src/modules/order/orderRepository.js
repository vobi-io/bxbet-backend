/* eslint handle-callback-err:0 */
'use strict'
var { placeOrderEvent } = require('app/services/contract')

class OrderRepository {
  constructor ({db}) {
    this.db = db
    this.saveOrder = this.saveOrder.bind(this)
    placeOrderEvent(this.saveOrder)
  }

  async saveOrder (schema) {
    try {
      let order = await this.db.OrderModel.findOne({orderId: Number(schema.orderId)})
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

