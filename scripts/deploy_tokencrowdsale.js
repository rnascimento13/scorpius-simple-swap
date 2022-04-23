const { hre, ethers } = require("hardhat");

async function main() {
  const TOKEN_CROWDSALE = "TokenCrowdsale";
  const rate = 10000; // rate 4 = 500 wei per token // rate 10000 = 1bnb per 1.000.000 tokens
  const cashoutWallet = "0x55d7dbe9377011fd553bcb80a7271366e0ec75a3"; // wallet to receive BNB
  const tokenAddress = "0x99D8e7b223534EAeb95B8CF420BbabF39376F6D1";
  const tokenWallet = "0x55d7dbe9377011fd553bcb80a7271366e0ec75a3"; // wallet to handle the tokens
  const openingTime = 1650661200; // 22/04 18hrs gmt-3
  const closingTime = 1651957200; // 07/04 18hrs gmt-3

  // deploy crowdsale contract
  const crowdsaleContract = await ethers.getContractFactory(TOKEN_CROWDSALE);
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
