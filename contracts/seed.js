Eutil = require('ethereumjs-util')
BXBet = artifacts.require('./BXBet.sol')
module.exports = function (callback) {
  current_time = Math.round(new Date() / 1000)
  startDate = current_time + 10000
  endDate = startDate + 15000
  amt_1 = web3.toWei(1, 'ether')
  BXBet.deployed().then((i) => { i.addGame('Germany vs Italy', 'Germany', 'Italy', 'Football', startDate, endDate, 0).then((f) => { console.log(f) }) })
  BXBet.deployed().then((i) => { i.gameIndex.call().then((f) => { console.log(f) }) })

  BxbBXBetet.deployed().then( (i) => { i.addGame('Georgia vs Russia', 'Georgia', 'Russia', 'Football', startDate, endDate, 0).then((f) => { console.log(f) }) })
  BXBet.deployed().then((i) => { i.gameIndex.call().then((f) => { console.log(f) }) })
}
