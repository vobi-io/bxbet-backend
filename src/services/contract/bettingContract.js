'use strict'
var config = require('app/config')
var Artifacts = require('../../../build/contracts/Betting.json')
var Contract = require('truffle-contract')
var Web3 = require('web3')
const gas = 3000000
const decimal = 100

let companyAccount = config.blockChain.account

const getCompanyAccount = () => {
  return companyAccount
}

if (typeof global.web3 === 'undefined') {
  global.web3 = new Web3(new Web3.providers.HttpProvider(config.contract.network))
  // global.web3 = new Web3(config.contract.network)
}

global.web3.setProvider(global.web3.currentProvider)

// in development mode
// global.web3.eth.getAccounts().then(accounts => {
//   companyAccount = accounts[0]

//   console.log(companyAccount, 'companyAccountcompanyAccountcompanyAccountcompanyAccount')

//   // var balance = global.web3.eth.getBalance(companyAccount)
//   // balance.then(i => {
//   //   console.log(i, ' ------------ ', 'balance')
//   // })
// })

const getDefaultAccount = async (index = 0) => {
  return companyAccount
  // try {
  //   const accounts = await global.web3.eth.getAccounts()
  //   return Promise.resolve(accounts[index])
  // } catch (err) {
  //   console.log(err, getDefaultAccount)
  //   return Promise.reject(err)
  // }
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
const logUint = (cb) => eventListener('LogUint', cb)
const orderEvent = (cb) => eventListener('OrderEvent', (res) => {
  const newObj = res
  newObj.amount = Number(newObj.amount / decimal)
  newObj.odd = Number(newObj.odd / decimal)
  newObj.matchedAmount = Number(newObj.matchedAmount / decimal)
  cb(newObj)
})
const transferEvent = (cb) => eventListener('Transfer', (res) => {
  const newObj = res
  newObj.value = Number(newObj.value / decimal)
  cb(newObj)
})
const blockTokensEvent = (cb) => eventListener('BlockTokens', (res) => {
  const newObj = res
  newObj.amount = Number(newObj.amount / decimal)
  newObj.blockAmount = Number(newObj.blockAmount / decimal)
  cb({newObj})
})
const unblockTokensEvent = (cb) => eventListener('UnblockTokens', (res) => {
  const newObj = res
  newObj.amount = Number(newObj.amount / decimal)
  newObj.blockAmount = Number(newObj.blockAmount / decimal)
  cb(newObj)
})

// query
const getGame = (_gameId, account) => query('getGame', account, Number(_gameId)).then(g => {
  return Promise.resolve({
    gameId: Number(g[0]),
    homeTeam: g[1],
    awayTeam: g[2],
    category: g[3],
    startDate: Number(g[4]),
    endDate: Number(g[5]),
    status: Number(g[6]),
    owner: g[7],
    totalOrders: Number(g[8])
  })
})

const getOrderById = (_gameId, _orderId, account) => query('getOrderById', account, _gameId, _orderId).then(g => {
  return Promise.resolve({
    orderId: Number(g[0]),
    player: g[1],
    gameId: Number(g[2]),
    orderType: Number(g[3]),
    amount: Number(Number(g[4]) / decimal),
    odd: Number(g[5]) / decimal,
    outcome: Number(g[6]),
    status: Number(g[7]),
    matchedAmount: Number(g[8] / decimal)
  })
})

const getBalance = (account) => query('getBalance', account).then(g => {
  return Promise.resolve({
    amount: Number(g[0]) / decimal,
    blockAmount: Number(g[1]) / decimal,
    owner: g[2]
  })
})

// mutation
const addGame = (_homeTeam, _awayTeam, _category, _startDate, _endDate, status, _owner, account) =>
   mutation('addGame', account, null, _homeTeam, _awayTeam, _category, _startDate, _endDate, status, _owner)

/**
*
* @param {Number} _gameId
* @param {Number} _orderType (0 -Buy, 1 -Sell)
* @param {Number} _amount
* @param {Number} _odd
* @param {Number} _outcome (0 - Draw, 1- One, 2- Two)
*/
const placeOrder = (_gameId, _orderType, _amount, _odd, _outcome, _player, account) => mutation('placeOrder', account, null, _gameId,
                                                          _orderType, _amount * decimal, _odd * 100, _outcome, _player)
const giveFreeTokens = (toUserAccount, amount = 20000) => {
  return mutation('giveFreeTokens', companyAccount, null, amount * decimal, toUserAccount)
}

/**
 *
 * @param {Number} gameId
 * @param {Number} outcome (0 - Draw, 1- One, 2- Two)
 */
const finishGame = (gameId, outcome, account) => mutation('finishGame', companyAccount, account, gameId, outcome)

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

const getMutationResultId = (result, key) => {
  for (var i of result.logs) {
    if (i.args && i.args[key]) {
      return i.args[key].toString()
    }
  }
  return null
}
module.exports = {
  gameEvent,
  logUint,
  orderEvent,
  getGame,
  placeOrder,
  giveFreeTokens,
  getOrderById,
  getBalance,
  createAccount,
  finishGame,
  addGame,
  getDefaultAccount,
  getCompanyAccount,
  transferEvent,
  blockTokensEvent,
  unblockTokensEvent,
  getMutationResultId
}
