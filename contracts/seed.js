Eutil = require('ethereumjs-util')
BXBet = artifacts.require('./bxbet.sol')

module.exports = function (callback) {
  current_time = Math.round(new Date() / 1000)
  amt_1 = web3.toWei(1, 'ether')
  BXBet.deployed().then((i) => { i.addGame('Germany vs Italy', 'Germany', 'Italy', 'Football', current_time + 10000, current_time + 40000, 0).then((f) => { console.log(f) }).catch((err) => { console.log(err) }) })
  BXBet.deployed().then( (i) => { i.addGame('Georgia vs Russia', 'Georgia', 'Russia', 'Football', current_time + 10000, current_time + 40000, 0).then((f) => { console.log(f) }) })
  BXBet.deployed().then((i)=>{ i.gameIndex.call().then((f)=>{ console.log(f) }) })
  BXBet.deployed().then((i)=>{ i.getGame.call(1).then((f)=>{ console.log(f) }) })
  BXBet.deployed().then((i)=>{ i.getGame.call(2).then((f)=>{ console.log(f) }) })
  // BXBet.deployed().then((i)=>{ i.getGame.call(2).then((f)=>{ console.log(f) }) })


  // BXBet.deployed().then((i) => { i.gameIndex.call().then((f) => { console.log(f) }) })
}
