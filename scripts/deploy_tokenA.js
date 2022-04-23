const { hre, ethers } = require("hardhat");

async function main() {
  const TOKEN_A = "TokenA";

  const tokenContract = await ethers.getContractFactory(TOKEN_A);
  const token = await tokenContract.deploy();
  await token.deployed();

  console.log("Token deployed to: ", token.address);
  console.log("Name", await token.name());
  console.log("Symbol", await token.symbol());
  const tokenDecimals = await token.decimals();
  console.log("Decimals", tokenDecimals);
  const totalSupply = await token.totalSupply();
  console.log("Total Supply", ethers.utils.formatUnits(totalSupply, tokenDecimals));

  await hre.run("verify:verify", {
    address: token.address,
    contract: "contracts/TokenA.sol:TokenA",
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
