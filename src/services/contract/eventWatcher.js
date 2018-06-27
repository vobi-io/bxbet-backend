var gameModule = require('app/modules/game')
var orderModule = require('app/modules/game')
var userModule = require('app/modules/user')

var { orderEvent, gameEvent, transferEvent,
  blockTokensEvent, unblockTokensEvent } = require('app/services/contract')

const runWatcher = async () => {
  try {
    const gameRepository = gameModule.getRepository(this.db)
    const orderRepository = orderModule.getRepository(this.db)
    const userRepository = userModule.getUserRepository(this.db)
    orderEvent(orderRepository.saveOrder)
    gameEvent(gameRepository.saveGame)
    unblockTokensEvent(userRepository.updateBalance)
    blockTokensEvent(userRepository.updateBalance)
    transferEvent(userRepository.updateUsersByTransfer)
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = {
  runWatcher
}
