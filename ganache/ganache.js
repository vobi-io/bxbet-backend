var ganache = require('ganache-cli')
var config = require('app/config')
const port = config.ganache.port
// var truffle =
var server = ganache.server({
  accounts: [{
    secretKey: config.blockChain.secretKey,
    balance: config.blockChain.secretKey.balance
  }],
  // unlocked_accounts: [config.blockChain.account],
  // port,
  logger: {
    log: (response) => {
      console.log(response)
    }
  },
  // host: 'localhost',
  network_id: 3,
  debug: true
  // gas: 2900000
})
server.listen(port, function(err, blockchain) {
  if (err) {
    console.log(err)
  }
  if (blockchain) {
    console.log(blockchain)
  }
})
