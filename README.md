# BX.BET README FILE

#### Truffle Install
``` npm install -g truffle ```

#### Compile Contracts
``` truffle compile ```

#### Deployment to Ropsten network
``` truffle migrate --network ropsten ```

#### Run ganache
``` node_modules/.bin/ganache-cli --account="0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef,1000000000000000000000000000000000000000" ```

default: 0xfcad0b19bb29d4674531d6f115237e16afce377c

#### Deployment to local (ganache)
``` truffle migrate --reset ```



#### Seed fakes games
``` npm run seed:games 10```
``` npm run seed:orders 100```
``` npm run seed:uses 10```


#### Run ether for personal account
``` geth --rpc --rpcapi="db,eth,net,web3,personal" ```
geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="0x48ea6a114a00992feba10c599629d881fd5fb1d4"

Run Test mode
-----------
```shell
truffle exec ./contracts/seed.js
```
