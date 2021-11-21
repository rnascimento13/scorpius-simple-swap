// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// eslint-disable-next-line import/no-extraneous-dependencies
// const { BigNumber } = require("@ethersproject/bignumber");
// eslint-disable-next-line import/no-extraneous-dependencies
const { ethers } = require("hardhat");

async function main() {
  // deploy crowdsale contract
  const tokenAddress = "0xDE28EF00141D488dAEf5abCA20A6e7e3B855Df3F";
  const tokenWallet = "0x560367f3ace284578F3DBA7215f121C1889D5Df7";
  console.log("token: ", tokenAddress);
  const ITManTokenCrowdsale = await ethers.getContractFactory("ITManTokenCrowdsale");
  const rate = 4; // 500 wei per token
  // const latestBlockTime = await latestTime();
  const openingTime = 1637010000;
  const closeTime = 1668535200
  console.log("openingTime", openingTime);
  console.log("closeTime", closeTime);
  const itManTokenCrowdsale = await ITManTokenCrowdsale.deploy(
    rate,
    tokenWallet,
    tokenAddress,
    tokenWallet,
    openingTime,
    closeTime
  );
  console.log("wallet: ", tokenWallet);

  await itManTokenCrowdsale.deployed();
  console.log("TokenCrowdsale deployed to: ", itManTokenCrowdsale.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
