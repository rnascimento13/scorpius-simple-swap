/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
const { ethers } = require("hardhat");
// import { ethers } from "hardhat";

// const TBTCSArtifacts = require("../src/artifacts/contracts/tbtcs.sol/TBTCS.json");

// const { TBTCS__factory, TBTCS } = require ("../src/types/factories");
const { TBTCS } = require ("../src/types/TBTCS");
// eslint-disable-next-line import/no-unresolved
// eslint-disable-next-line camelcase
// const { TBTCS } = require("../src/types/TBTCS");
// const { TBTCS } = require("../src/types/TBTCS");

// const { TBTCS__factory, TBTCS } = require("../src/types/factories/TBTCS__factory");

async function main() {
  // const _Token = "TheBestLocal";
  // const _Factory = "PancakeFactory";
  // const _Router = "PancakeRouter";
  // const _WETH = "WETH"
  // const _USDT = "BEP20USDT";
  // const _BUSD = "BUSD";
  // const _DAI = "BEP20DAI";

  const TOKEN_ADDRESS = "0x6d592Ab1483CDaE6D99956402ee0c9C413390354";

  const [owner] = await ethers.getSigners();
  // const token = await hre.getContract(TOKEN_ADDRESS, TBTCSArtifact.abi);
  // eslint-disable-next-line camelcase
  // const token = TBTCSArtifact.connect(TOKEN_ADDRESS, owner);
  const token = TBTCS.connect(TOKEN_ADDRESS, owner);
  // const token = TheBestFactory.connect(TOKEN_ADDRESS, owner);
  // console.log("___2");
  const dec = await token.decimals();
  const bal = (await token.balanceOf(owner.address)).div(10 ** dec);
  console.log(`Contract deployed to: ${  ethers.utils.parseUnits(bal.toString(), "wei")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
