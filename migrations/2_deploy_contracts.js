var Betting = artifacts.require("./Betting.sol")

module.exports = function(deployer) {
  var initialSupply = 175000000
  var tokenName = 'BXBet'
  var tokenSymbol = 'BX'
  deployer.deploy(Betting, initialSupply, tokenName, tokenSymbol);
};
