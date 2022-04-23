// const { ethers } = require("hardhat");
const hre = require("hardhat");

const contractName = "TokenSwap";

const tokenIn = "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7";
const tokenOut = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684";
const tokenWallet = "0x35cd69249DA2D63C5ce24463888Ac86343c5EE35";

async function main() {
  const contract = await hre.ethers.getContractFactory(contractName);
  const deployedContract = await contract.deploy(tokenIn, tokenOut, tokenWallet);
  console.log("tokenIn: ", tokenIn);
  console.log("tokenOut:", tokenOut);
  console.log("tokenWallet", tokenWallet);
  await deployedContract.deployed();
  console.log("contract", contractName, "deployed to: ", deployedContract.address);

  await hre.run("verify:verify", {
    address: deployedContract.address,
    constructorArguments: [tokenIn, tokenOut, tokenWallet],
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
