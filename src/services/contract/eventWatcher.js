var gameModule = require('app/modules/game')
var orderModule = require('app/modules/order')
var userModule = require('app/modules/user')

var { orderEvent, gameEvent, transferEvent,
  blockTokensEvent, unblockTokensEvent, logUint } = require('app/services/contract')

const runWatcher = async (db) => {
  try {
    const userRepository = userModule.getUserRepository(db)
    const gameRepository = gameModule.getRepository(db)
    const orderRepository = orderModule.getRepository(db)

    orderEvent(orderRepository.saveOrder)
    gameEvent(gameRepository.saveGame)
    unblockTokensEvent(userRepository.updateBalance)
    blockTokensEvent(userRepository.updateBalance)
    transferEvent(userRepository.updateUsersByTransfer)
    logUint((result) => {
      console.log('aaaaaaaaaaa', result)
    })
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = {
  runWatcher
}
