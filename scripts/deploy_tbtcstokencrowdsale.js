// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// eslint-disable-next-line import/no-extraneous-dependencies
// const { BigNumber } = require("@ethersproject/bignumber");
const { ethers } = require("hardhat");

async function latestTime() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

const duration = {
  seconds(val) {
    return val;
  },
  minutes(val) {
    return val * this.seconds(60);
  },
  hours(val) {
    return val * this.minutes(60);
  },
  days(val) {
    return val * this.hours(24);
  },
  weeks(val) {
    return val * this.days(7);
  },
  years(val) {
    return val * this.days(365);
  },
};

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ITManToken = await ethers.getContractFactory("TBTCS");
  // const ITManToken = await ethers.getContractFactory("XMINE");
  const itManToken = await ITManToken.deploy();

  await itManToken.deployed();
  console.log("Token deployed to: ", itManToken.address);
  console.log("Name", await itManToken.name());
  console.log("Symbol", await itManToken.symbol());
  console.log("Decimals", await itManToken.decimals());
  const totalSupply = await itManToken.totalSupply();
  console.log("Total Supply", totalSupply);
  const owner = await itManToken.getOwner();
  console.log("Owner", owner);

  // deploy crowdsale contract
  const ITManTokenCrowdsale = await ethers.getContractFactory("ITManTokenCrowdsale");
  const rate = 4; // 500 wei per token
  const latestBlockTime = await latestTime();
  const openingTime = latestBlockTime + duration.minutes(10);
  const closeTime = openingTime + duration.weeks(1); // 1 week
  console.log("openingTime", openingTime);
  console.log("closeTime", closeTime);
  const itManTokenCrowdsale = await ITManTokenCrowdsale.deploy(
    rate,
    "0x766301680D3C52e35d4b2948B12B867169186424",
    itManToken.address,
    "0x766301680D3C52e35d4b2948B12B867169186424",
    openingTime,
    closeTime
  );
console.log("wallet 0x766301680D3C52e35d4b2948B12B867169186424")

  await itManTokenCrowdsale.deployed();
  console.log("TokenCrowdsale deployed to: ", itManTokenCrowdsale.address);

  // approve crowdsale contract to spend 70% tokens
  const isApproved = await itManToken.approve(
    itManTokenCrowdsale.address,
    totalSupply.mul(ethers.BigNumber.from(70)).div(ethers.BigNumber.from(100))
  );
  console.log("CrowdSale is approved?: ", isApproved);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
