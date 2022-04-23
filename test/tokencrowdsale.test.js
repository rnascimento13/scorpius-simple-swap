const { expect } = require("chai");
const { ethers } = require("hardhat");

function toWei(amount, unit) {
  return ethers.utils.parseUnits(amount.toString(), unit);
}

function fromWei(amount, unit) {
  return ethers.utils.formatUnits(amount.toString(), unit);
}

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

const TOKEN_A = "TokenA"
const TOKEN_CROWDSALE = "TokenCrowdsale"
const rate = 10000 // rate 4 = 500 wei per token
let CROWDSALE; let crowdsale; let tokenA; let amountTKA; let tokenADecimals;
let owner; let user1;
const swapRemain = 300000000

// const swapAmount = 100

beforeEach(async () => {
  [owner, user1] = await ethers.getSigners();
  
  const TOKENA = await ethers.getContractFactory(TOKEN_A);
  tokenA = await TOKENA.deploy();
  await tokenA.deployed();

  const latestBlockTime = await latestTime();
  const openingTime = latestBlockTime + duration.seconds(1);
  const closeTime = openingTime + duration.weeks(1); // 1 week
  CROWDSALE = await ethers.getContractFactory(TOKEN_CROWDSALE);
  crowdsale = await CROWDSALE.deploy(
    rate,
    owner.address,
    tokenA.address,
    owner.address,
    openingTime,
    closeTime
  );
  await crowdsale.deployed();

  tokenADecimals = await tokenA.decimals()
  // tokenASupply = fromWei(await tokenA.totalSupply(), tokenADecimals);
  amountTKA = toWei(swapRemain, tokenADecimals);
  await tokenA.approve(crowdsale.address, amountTKA);
});

describe("TokenCrowdsale", () => {
  it("should have tokens to sell", async () => {
    const remainTokensBN = await crowdsale.remainingTokens()
    const remainTokens = fromWei(remainTokensBN, tokenADecimals)
    expect(parseFloat(remainTokens)).equal(parseFloat(swapRemain));
  });

  it("should be able to buy it", async () => {
    const tokenABalanceUser1Old = await tokenA.balanceOf(user1.address)
    const crowdsaleUser1 = new ethers.Contract(crowdsale.address, CROWDSALE.interface, user1);
    const tx = await crowdsaleUser1.buyTokens(user1.address,{value: toWei('1')})
    tx.wait(2)    
    const tokenABalanceUser1New = await tokenA.balanceOf(user1.address)
    console.log('    1 BNB buy', fromWei(tokenABalanceUser1New, tokenADecimals), 'tokens')
    expect(parseFloat(tokenABalanceUser1New)).greaterThan(parseFloat(tokenABalanceUser1Old));
  });

  it("should be able to buy minimum", async () => {
    const investorMinCapBN = await crowdsale.investorMinCap()
    const investorMinCap = fromWei(investorMinCapBN)
    const tokenABalanceUser1Old = await tokenA.balanceOf(user1.address)
    const crowdsaleUser1 = new ethers.Contract(crowdsale.address, CROWDSALE.interface, user1);
    const tx = await crowdsaleUser1.buyTokens(user1.address,{value: toWei(investorMinCap)})
    tx.wait(2)    
    const tokenABalanceUser1New = await tokenA.balanceOf(user1.address)
    console.log('   ',investorMinCap,'BNB buy', fromWei(tokenABalanceUser1New, tokenADecimals), 'tokens')
    expect(parseFloat(tokenABalanceUser1New)).greaterThan(parseFloat(tokenABalanceUser1Old));
  });

  it("should be able to buy maximum", async () => {
    const investorHardCapBN = await crowdsale.investorHardCap()
    const investorHardCap = fromWei(investorHardCapBN)
    const tokenABalanceUser1Old = await tokenA.balanceOf(user1.address)
    const crowdsaleUser1 = new ethers.Contract(crowdsale.address, CROWDSALE.interface, user1);
    const tx = await crowdsaleUser1.buyTokens(user1.address,{value: toWei(investorHardCap)})
    tx.wait(2)    
    const tokenABalanceUser1New = await tokenA.balanceOf(user1.address)
    console.log('   ',investorHardCap,'BNB buy', fromWei(tokenABalanceUser1New, tokenADecimals), 'tokens')
    expect(parseFloat(tokenABalanceUser1New)).greaterThan(parseFloat(tokenABalanceUser1Old));
  });

  it("should not be able to buy less than minimum", async () => {
    const investorMinCapBN = await crowdsale.investorMinCap()
    const investorMinCap = fromWei(investorMinCapBN)
    const lessThanMinimum = Number(investorMinCap) - 0.001
    const crowdsaleUser1 = new ethers.Contract(crowdsale.address, CROWDSALE.interface, user1);
    await expect(crowdsaleUser1.buyTokens(user1.address,{value: toWei(lessThanMinimum)}))
      .to.be.revertedWith('Crowdsale: Under Minimum Cap!')
  });

  it("should not be able to buy pass invertor hardcap", async () => {
    const investorHardCapBN = await crowdsale.investorHardCap()
    const investorHardCap = fromWei(investorHardCapBN)
    const moreThanMaximum = Number(investorHardCap) + 0.001
    const crowdsaleUser1 = new ethers.Contract(crowdsale.address, CROWDSALE.interface, user1);
    await expect(crowdsaleUser1.buyTokens(user1.address,{value: toWei(moreThanMaximum)}))
      .to.be.revertedWith('Crowdsale: Over Maximun Cap!')
  });

  it("should not be able to buy pass CrowdCap", async () => {
    const crowdCapBN = await crowdsale.crowdCap()
    const crowdCap = fromWei(crowdCapBN)
    const moreThanCrowdCap = Number(crowdCap) + 0.001
    const crowdsaleUser1 = new ethers.Contract(crowdsale.address, CROWDSALE.interface, user1);
    await expect(crowdsaleUser1.buyTokens(user1.address,{value: toWei(moreThanCrowdCap)}))
      .to.be.revertedWith('CappedCrowdsale: cap exceeded')
  });




  // TODO: add unit test for time validation
  // TODO: add unit test for token allocation
});
