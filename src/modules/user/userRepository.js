/* eslint handle-callback-err:0 */
'use strict'

var Promise = require('bluebird')
var { transferEvent, unblockTokensEvent, blockTokensEvent, getBalance } = require('app/services/contract')

class UserRepository {
  constructor ({ db }) {
    this.db = db
    transferEvent(this.updateUsersByTransfer)
    unblockTokensEvent(this.updateBalance)
    blockTokensEvent(this.updateBalance)
  }

  async updateUsersByTransfer (transfer) {
    const fromBalance = await getBalance(transfer.from)
    const toBalance = await getBalance(transfer.to)

    return Promise.all([
      this.updateBalance(fromBalance),
      this.updateBalance(toBalance)])
  }

  async updateBalance (balance) {
    try {
      const address = balance.owner
      let order = await this.db.UserModel.findOne({ 'blockChain.address': address })
      await this.db.UserModel.update(
        { 'blockChain.address': address },
        {
          $set: { balance }
        },
        { upsert: true })

      return Promise.resolve(order)
    } catch (err) {
      return Promise.reject(err)
    }
  }

}

module.exports = UserRepository

