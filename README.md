# BX.BET README FILE

#### Truffle Install
``` npm install -g truffle ```

#### Compile Contracts
``` truffle compile ```

#### Deployment to Ropsten network
``` truffle migrate --network ropsten ```

#### Run ganache
``` node_modules/.bin/ganache-cli ```

#### Deployment to local (ganache)
``` truffle migrate --reset ```



#### Seed fakes games
``` npm run seed:games --10```

Run Test mode
-----------
```shell
truffle exec ./contracts/seed.js
```
