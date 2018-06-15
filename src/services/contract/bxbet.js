'use strict'
var config = require('app/config')
var Artifacts = require('../../../build/contracts/BXBet.json')
var Contract = require('truffle-contract')
var Web3 = require('web3')
const gas = 3000000
const freeTokens = 100

let bxbetAccount = '0x291c32452cd81eeaa4d32860d18fb50911dab602'

const getBexbetAccount = () => {
  return bxbetAccount
}

if (typeof global.web3 === 'undefined') {
  global.web3 = new Web3(new Web3.providers.HttpProvider(config.contract.network))
  // global.web3 = new Web3(config.contract.network)
}

global.web3.setProvider(global.web3.currentProvider)

// in development mode
global.web3.eth.getAccounts().then(accounts => {
  bxbetAccount = accounts[0]
})

const getDefaultAccount = async (index) => {
  try {
    const accounts = await global.web3.eth.getAccounts()
    return Promise.resolve(accounts[index])
  } catch (err) {
    console.log(err, getDefaultAccount)
    return Promise.reject(err)
  }
}

var contract = Contract(Artifacts)
contract.setProvider(global.web3.currentProvider)

if (typeof contract.currentProvider.sendAsync !== 'function') {
  contract.currentProvider.sendAsync = function() {
    return contract.currentProvider.send.apply(
      contract.currentProvider, arguments
    )
  }
}

// global.web3.eth.getAccounts((error, accounts) => {
//   if (error) {
//     console.error(error)
//   }
//   // console.log(accounts)
// })

const eventListener = (eventName, callback) => {
  let event
  contract.deployed().then((i) => {
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

const query = async (functionName, account, ...args) => {
  try {
    const data = {gas}
    if (account) {
      data.from = account
    }
    const result = await contract.deployed().then((i) => i[functionName].call(...args, data))
    return Promise.resolve(result)
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }
}

const mutation = async (functionName, from, to, ...args) => {
  try {
    const data = {from, gas}
    if (to) {
      data.to = to
    }
    const result = await contract.deployed().then((i) => i[functionName](...args, to, data))
    return Promise.resolve(result)
  } catch (err) {
    console.log(err)
    return Promise.reject(err)
  }
}

// events
const gameEvent = (cb) => eventListener('GameEvent', cb)
const orderEvent = (cb) => eventListener('OrderEvent', cb)
const transferEvent = (cb) => eventListener('Transfer', cb)
const blockTokensEvent = (cb) => eventListener('BlockTokens', cb)
const unblockTokensEvent = (cb) => eventListener('UnblockTokens', cb)

// query
const getGame = (_gameId, account) => query('getGame', account, Number(_gameId)).then(g => {
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

const getOrderById = (_gameId, _orderId, account) => query('getOrderById', account, _gameId, _orderId).then(g => {
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

const getBalance = (account) => query('getBalance', account).then(g => {
  return Promise.resolve({
    amount: Number(g[0]),
    blockAmount: Number(g[1]),
    owner: g[2]
  })
})

// mutation
const addGame = (_title, _team1, _team2, _category, _startDate, _endDate, status, account) =>
   mutation('addGame', account, null, _title, _team1, _team2, _category, _startDate, _endDate, status)

/**
*
* @param {Number} _gameId
* @param {Number} _orderType (0 -Buy, 1 -Sell)
* @param {Number} _amount
* @param {Number} _odd
* @param {Number} _outcome (0 - Draw, 1- One, 2- Two)
*/
const placeOrder = (_gameId, _orderType, _amount, _odd, _outcome, account) => mutation('placeOrder', account, null, _gameId,
                                                          _orderType, _amount, _odd, _outcome)
const giveFreeTokens = (toUserAccount, amount = 200) => {
  return mutation('giveFreeTokens', bxbetAccount, null, amount, toUserAccount, freeTokens)
}

/**
 *
 * @param {Number} gameId
 * @param {Number} outcome (0 - Draw, 1- One, 2- Two)
 */
const finishGame = (gameId, outcome, account) => mutation('finishGame', bxbetAccount, account, gameId, outcome)

/**
 * create Ethereum account
 */
// const createAccount = async (dataToSign, password) => {
//   try {
//     const account = global.web3.eth.accounts.create(global.web3.utils.randomHex(32))
//     const {privateKey, address} = account
//     const signatureObject = global.web3.eth.accounts.sign(dataToSign + password, privateKey)
//     return Promise.resolve({signatureObject, privateKey, address})
//   } catch (err) {
//     return Promise.reject(err)
//   }
//   // global.web3.eth.accounts.create(global.web3.utils.randomHex(32))
// }

const createAccount = async (password) => {
  try {
    const address = await global.web3.eth.personal.newAccount(password)
    //
    const unlock = await global.web3.eth.personal.unlockAccount(address, password)
    return Promise.resolve({unlock, address})
  } catch (err) {
    return Promise.reject(err)
  }
  // global.web3.eth.accounts.create(global.web3.utils.randomHex(32))
}

module.exports = {
  gameEvent,
  orderEvent,
  getGame,
  placeOrder,
  giveFreeTokens,
  getOrderById,
  getBalance,
  createAccount,
  finishGame,
  addGame,
  freeTokens,
  getDefaultAccount,
  getBexbetAccount,
  transferEvent,
  blockTokensEvent,
  unblockTokensEvent
}
