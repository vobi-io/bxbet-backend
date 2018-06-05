'use strict'
var config = require('app/config')
var bxBetArtifacts = require('../../../build/contracts/BXBet.json')
var contract = require('truffle-contract')
var Web3 = require('Web3')
var provider = new Web3.providers.HttpProvider(config.contract.network)
var bxBet = contract(bxBetArtifacts)
bxBet.setProvider(provider)

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
  bxBet.deployed().then((i) => {
    i[functionName].call(...args)
    .then((f) => {
      console.log(f)
      return Promise.resolve(f)
    })
    .catch(err => {
      console.log(err)
    })
  })
}

// mutation
const mutation = async (functionName, ...args) => {
  bxBet.deployed().then((i) => {
    i[functionName](...args)
    .then((f) => {
      console.log(f)
      return Promise.resolve(f)
    })
    .catch(err => {
      console.log(err)
    })
  })
}

// events
const addGameEvent = (saveGame) => eventListener('AddGameEvent', saveGame)
const finishGameEvent = (saveGame) => eventListener('FinishGameEvent', saveGame)

// query
const getGame = (_gameId) => query('getGame', _gameId)
const getOrderById = (_gameId, _orderId) => query('getOrderById', _gameId, _orderId)

// mutation
const placeOrder = (_gameId, _orderType, _amount, _odd, _outcome) => mutation('placeOrder', _gameId, _orderType, _amount, _odd, _outcome)
const takeFreeTokens = (_amount) => mutation('takeFreeTokens', _amount)

module.exports = {
  addGameEvent,
  finishGameEvent,
  getGame,
  placeOrder,
  takeFreeTokens,
  getOrderById
}
