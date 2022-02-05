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
  const payAddress = "0xacff9441993604382274Eb7ac778b0e8EB29A490";
  const tokenAddress = "0x4cc95976745dc118a10111f289e2485aca031ff8";
  const tokenWallet = "0x88Bea2Ef691A63b94ea0C4A751a7Bbf4dC1C23c6";
  console.log("token: ", tokenAddress);
  const ITManTokenCrowdsale = await ethers.getContractFactory("ITManTokenCrowdsale");
  const rate = 1733; // 500 wei per token
  // const rate = 1; // 500 wei per token
  // const latestBlockTime = await latestTime();
  const openingTime = 1643587200;
  const closeTime = 1644026400;
  console.log("openingTime", openingTime);
  console.log("closeTime", closeTime);
  const itManTokenCrowdsale = await ITManTokenCrowdsale.deploy(
    rate,
    payAddress,
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
