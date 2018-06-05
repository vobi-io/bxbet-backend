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
  console.log(accounts)
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
const addGameEvent = (saveGame) => eventListener('AddGameEvent', saveGame)
const finishGameEvent = (saveGame) => eventListener('FinishGameEvent', saveGame)
const placeOrderEvent = (saveGame) => eventListener('PlaceOrderEvent', saveGame)

// query
const getGame = (_gameId) => query('getGame', _gameId)
const getOrderById = (_gameId, _orderId) => query('getOrderById', _gameId, _orderId)

// mutation
const addGame = (_title, _team1, _team2, _category, _startDate, _endDate, status) =>
   mutation('addGame', _title, _team1, _team2, _category, _startDate, _endDate, status)

const placeOrder = (_gameId, _orderType, _amount, _odd, _outcome) => mutation('placeOrder', _gameId, _orderType, _amount, _odd, _outcome)
const takeFreeTokens = (_amount) => mutation('takeFreeTokens', _amount)

/**
 * create Ethereum account
 */
const createAccount = () => {
  return global.web3.eth.accounts.create(global.web3.utils.randomHex(32))
}

module.exports = {
  addGameEvent,
  finishGameEvent,
  getGame,
  placeOrder,
  takeFreeTokens,
  getOrderById,
  placeOrderEvent,
  createAccount,
  addGame
}
