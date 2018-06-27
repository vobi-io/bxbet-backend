var BXBet = artifacts.require("./BXBet.sol")

module.exports = function(deployer) {
  var initialSupply = 175000000
  var tokenName = 'BXBet'
  var tokenSymbol = 'BX'
  deployer.deploy(BXBet, initialSupply, tokenName, tokenSymbol);
};
