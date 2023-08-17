var CharityToken = artifacts.require("./CharityToken.sol");
var Charity = artifacts.require("./Charity.sol");
module.exports = async function(deployer) {
  await deployer.deploy(CharityToken);
  await deployer.deploy(Charity);
};
