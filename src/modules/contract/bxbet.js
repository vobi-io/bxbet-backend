'use strict'
var config = require('app/config')
var bxBetArtifacts = require('../../../build/contracts/BXBet.json')
var contract = require('truffle-contract')
var Web3 = require('Web3')
var provider = new Web3.providers.HttpProvider(config.contract.network)
var bxBet = contract(bxBetArtifacts)
bxBet.setProvider(provider)

const defaultSetupEvent = (eventName, callback) => {
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

const setupGameEventListener = (saveGame) => {
  defaultSetupEvent('AddGameEvent', saveGame)
}

module.exports = {
  setupGameEventListener
}
