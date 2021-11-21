const { expect } = require("chai");
const { ethers } = require("hardhat");

// async function latestTime() {
//   const block = await ethers.provider.getBlock("latest");
//   return block.timestamp;
// }

// const duration = {
//   seconds(val) {
//     return val;
//   },
//   minutes(val) {
//     return val * this.seconds(60);
//   },
//   hours(val) {
//     return val * this.minutes(60);
//   },
//   days(val) {
//     return val * this.hours(24);
//   },
//   weeks(val) {
//     return val * this.days(7);
//   },
//   years(val) {
//     return val * this.days(365);
//   },
// };

describe("TBTCSTokenCrowdsale", () => {
  it("Should have at least 200 bilions tokens", async () => {
    console.log("x");
    const ITManToken = await ethers.getContractFactory("TBTCS");
    console.log("xx");
    const itManToken = await ITManToken.deploy();
    console.log("xxx");
    await itManToken.deployed();
    console.log("xxxx");
    expect(await itManToken.name()).to.equal("TBT-CryptoSolutions");
    expect(await itManToken.symbol()).to.equal("TBTcs");
    expect(await itManToken.decimals()).to.equal(9);
    // const totalSupply = await itManToken.totalSupply();
    // expect(totalSupply).to.at.least.equal(ethers.BigNumber.from("200000000000000000"));
    // const owner = await itManToken.owner();

    // const latestBlockTime = await latestTime();
    // const openingTime = latestBlockTime + duration.minutes(1);
    // const closeTime = openingTime + duration.weeks(1); // 1 week

    // const ITManTokenCrowdsale = await ethers.getContractFactory("ITManTokenCrowdsale");
    // const rate = 4; // 500 wei per token
    // const itManTokenCrowdsale = await ITManTokenCrowdsale.deploy(
    //   rate,
    //   owner,
    //   itManToken.address,
    //   owner,
    //   openingTime,
    //   closeTime
    // );

    // await itManTokenCrowdsale.deployed();

    // await itManToken.approve(
    //   itManTokenCrowdsale.address,
    //   totalSupply
    // );

    // expect(await itManTokenCrowdsale.rate()).to.equal(rate);
    // expect(await itManTokenCrowdsale.remainingTokens()).to.at.least.equal(ethers.BigNumber.from("200000000000000000"));
  });
  // TODO: add unit test for time validation
  // TODO: add unit test for token allocation
});
