'use strict'
var config = require('app/config')
var bxBetArtifacts = require('../../../build/contracts/BXBet.json')
var contract = require('truffle-contract')
var Web3 = require('web3')

if (typeof global.web3 === 'undefined') {
  global.web3 = new Web3(new Web3.providers.HttpProvider(config.contract.network))
}

// const getProvider = () => {
//   return global.web3 && global.web3.currentProvider ? global.web3.currentProvider : new Web3.providers.HttpProvider(config.contract.network)
// }

var bxBet = contract(bxBetArtifacts)

bxBet.setProvider(global.web3.currentProvider)

global.web3.eth.getAccounts(function (error, accounts) {
  if (error) {
    console.error(error)
  }
  // console.log(accounts)
})

const eventListener = (eventName, callback) => {
  let event
  bxBet.deployed().then((i) => {
    event = i[eventName]({ fromBlock: 0, toBlock: 'latest' })

    event.watch((err, result) => {
      if (err) {
        console.log(err)
        return
      }
      console.log(result.args)
      callback(result.args)
    })
  })
}

const query = async (functionName, ...args) => {
  try {
    const result = await bxBet.deployed().then((i) => i[functionName].call(...args))
    return Promise.resolve(result)
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }
}

const mutation = async (functionName, ...args) => {
  try {
    const result = await bxBet.deployed().then((i) => i[functionName](...args, {from: global.web3.eth.accounts[0], gas: 3000000}))
    return Promise.resolve(result)
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }
}

// events
const GameEvent = (cb) => eventListener('GameEvent', cb)
const finishGameEvent = (cb) => eventListener('FinishGameEvent', cb)
const OrderEvent = (cb) => eventListener('OrderEvent', cb)

// query
const getGame = (_gameId) => query('getGame', Number(_gameId)).then(g => {
  return Promise.resolve({
    gameId: Number(g[0]),
    title: g[1],
    team1: g[2],
    team2: g[3],
    category: g[4],
    startDate: Number(g[5]),
    endDate: Number(g[6]),
    status: Number(g[7]),
    owner: g[8],
    totalOrders: Number(g[9])
  })
})
const getOrderById = (_gameId, _orderId) => query('getOrderById', _gameId, _orderId).then(g => {
  return Promise.resolve({
    orderId: Number(g[0]),
    player: g[1],
    gameId: Number(g[2]),
    orderType: Number(g[3]),
    amount: Number(g[4]),
    odd: Number(g[5]),
    outcome: Number(g[6]),
    status: Number(g[7]),
    matchedOrderId: Number(g[8])
  })
})

// mutation
const addGame = (_title, _team1, _team2, _category, _startDate, _endDate, status) =>
   mutation('addGame', _title, _team1, _team2, _category, _startDate, _endDate, status)

  /**
  *
  * @param {Number} _gameId
  * @param {Number} _orderType (0 -Buy, 1 -Sell)
  * @param {Number} _amount
  * @param {Number} _odd
  * @param {Number} _outcome (0 - Draw, 1- One, 2- Two)
  */
const placeOrder = (_gameId, _orderType, _amount, _odd, _outcome) => mutation('placeOrder', _gameId,
                                                          _orderType, _amount, _odd, _outcome)
const takeFreeTokens = (_amount) => mutation('takeFreeTokens', _amount)

/**
 * create Ethereum account
 */
const createAccount = () => {
  return global.web3.eth.accounts.create(global.web3.utils.randomHex(32))
}

module.exports = {
  GameEvent,
  finishGameEvent,
  getGame,
  placeOrder,
  takeFreeTokens,
  getOrderById,
  OrderEvent,
  createAccount,
  addGame
}
