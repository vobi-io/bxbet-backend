/* eslint handle-callback-err:0 */
'use strict'

var Promise = require('bluebird')
var { getBalance } = require('app/services/contract')
var _ = require('lodash')

class UserRepository {
  constructor ({ db }) {
    this.db = db
    this.updateBalance = this.updateBalance.bind(this)
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
      if (!balance || _.isEmpty(balance)) {
        return Promise.resolve()
      }
      const address = balance.owner
      var upBalance = {
        amount: Number(balance.amount),
        blockAmount: Number(balance.blockAmount),
        owner: (String(balance.owner)).toLocaleLowerCase()
      }
      await this.db.UserModel.update(
        { 'blockChain.address': address },
        {
          $set: {
            'blockChain.balance': upBalance
          }
        },
        { upsert: true })

      return Promise.resolve(true)
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

