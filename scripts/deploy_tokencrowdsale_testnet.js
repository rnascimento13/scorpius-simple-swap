// const { BigNumber } = require("@ethersproject/bignumber");
const { hre, ethers } = require("hardhat");

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
  const TOKEN_A = "TokenA";
  const TOKEN_CROWDSALE = "TokenCrowdsale";
  const crowdsaleAmount = "300000000";
  const rate = 10000; // rate 4 = 500 wei per token // rate 10000 = 1bnb per 1.000.000 tokens
  const cashoutWallet = "0x55d7dbe9377011fd553bcb80a7271366e0ec75a3"; // wallet to receive BNB
  const tokenAddress = "0x99D8e7b223534EAeb95B8CF420BbabF39376F6D1";
  const tokenWallet = "0x55d7dbe9377011fd553bcb80a7271366e0ec75a3"; // wallet to handle the tokens
  // const openingTime = 1650661200 // 22/04 18hrs gmt-3
  // const closingTime = 1651957200 // 07/04 18hrs gmt-3

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

  // deploy crowdsale contract
  const crowdsaleContract = await ethers.getContractFactory(TOKEN_CROWDSALE);
  const latestBlockTime = await latestTime();
  const openingTime = latestBlockTime + duration.minutes(1);
  const closingTime = openingTime + duration.weeks(1); // 1 week
  console.log("openingTime", openingTime);
  console.log("closeTime", closingTime);
  const crowdsale = await crowdsaleContract.deploy(
    rate,
    cashoutWallet,
    tokenAddress,
    tokenWallet,
    openingTime,
    closingTime
  );
  console.log("token wallet:", tokenWallet);

  await crowdsale.deployed();
  console.log("TokenCrowdsale deployed to: ", crowdsale.address);

  // approve crowdsale contract to spend 70% tokens
  await token.approve(crowdsale.address, ethers.utils.parseUnits(crowdsaleAmount, tokenDecimals));

  const accounts = await ethers.getSigners();
  const allowanceValue = await token.allowance(accounts[0].address, crowdsale.address);

  console.log("aproval of", ethers.utils.formatUnits(allowanceValue, tokenDecimals), "tokens");

  await hre.run("verify:verify", {
    address: token.address,
    contract: "contracts/TokenA.sol:TokenA",
  });

  await hre.run("verify:verify", {
    address: crowdsale.address,
    constructorArguments: [rate, cashoutWallet, tokenAddress, tokenWallet, openingTime, closingTime],
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
