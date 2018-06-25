/* eslint handle-callback-err:0 */
'use strict'

var Promise = require('bluebird')
var { transferEvent, unblockTokensEvent, blockTokensEvent, getBalance } = require('app/services/contract')

class UserRepository {
  constructor ({ db }) {
    this.db = db
    this.updateBalance = this.updateBalance.bind(this)
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
          $set: {
            amount: Number(balance.amount),
            blockAmount: Number(balance.blockAmount),
            owner: String(balance.owner)
          }
        },
        { upsert: true })

      return Promise.resolve(order)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  async getBalance ({user}) {
    const balance = await getBalance(user.blockChain.address)
    return Promise.resolve(balance)
  }

}

module.exports = UserRepository

