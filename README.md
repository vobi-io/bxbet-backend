# BX.BET README FILE

#### Truffle Install
``` npm install -g truffle ```

#### Compile Contracts
``` truffle compile ```

#### Deployment to Ropsten network
``` truffle migrate --network ropsten ```

#### Deployment to ganache
``` truffle migrate --reset ```


Run Test mode
-----------

```shell
node_modules/.bin/ganache-cli

truffle exec ./contracts/seed.js
truffle console
```
