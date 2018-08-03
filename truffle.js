// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      from: '0xfcad0b19bb29d4674531d6f115237e16afce377c'
      // gas: 2900000
    },
    ropsten: {
      network_id: 3,
      host: 'localhost',
      port: 8545,
      gas: 2900000
    }
  }
}
