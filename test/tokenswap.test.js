const { expect, use } = require("chai");
const { ethers } = require("hardhat");
// const web3 = require('web3');
const { solidity } = require("ethereum-waffle");
// const chaiAlmost = require('chai-almost');
// const { subtask } = require('hardhat/config');

use(solidity);
// use(chaiAlmost(0.0000000001));

function toWei(amount, unit) {
  return ethers.utils.parseUnits(amount.toString(), unit);
}

function fromWei(amount, unit) {
  return ethers.utils.formatUnits(amount.toString(), unit);
}

let tokenSwap;
let tokenA;
let tokenB;
let tokenASupply;
let tokenBSupply;
let amountTKA;
let amountTKB;
let tokenADecimals;
let tokenBDecimals;
let owner;
let user1;
const swapAmount = 100.0000002;

beforeEach(async () => {
  [owner, user1] = await ethers.getSigners();

  const TOKENA = await ethers.getContractFactory("TokenA");
  tokenA = await TOKENA.deploy();
  await tokenA.deployed();

  const TOKENB = await ethers.getContractFactory("TokenB");
  tokenB = await TOKENB.deploy();
  await tokenB.deployed();

  const TOKENSWAP = await ethers.getContractFactory("TokenSwap");
  tokenSwap = await TOKENSWAP.deploy(tokenA.address, tokenB.address, owner.address);
  await tokenSwap.deployed();

  tokenADecimals = await tokenA.decimals();
  tokenBDecimals = await tokenB.decimals();

  tokenASupply = fromWei(await tokenA.totalSupply(), tokenADecimals);
  tokenBSupply = fromWei(await tokenB.totalSupply(), tokenBDecimals);
  amountTKA = toWei(tokenASupply / 10, tokenADecimals);
  amountTKB = toWei(tokenBSupply / 2, tokenBDecimals);

  // await tokenA.approve(tokenSwap.address, amountTKA);
  await tokenB.approve(tokenSwap.address, amountTKB);

  if (swapAmount.toString().split(String(".")).length > 1) {
    expect(swapAmount.toString().split(String("."))[1].length).is.not.greaterThan(tokenADecimals);
    expect(swapAmount.toString().split(String("."))[1].length).is.not.greaterThan(tokenBDecimals);
  } else {
    expect(0).is.not.greaterThan(tokenADecimals);
    expect(0).is.not.greaterThan(tokenBDecimals);
  }

  // expect(swapAmount.toString().split(String("."))[1]?.length || 0).is.not.greaterThan(tokenADecimals)
  // expect(swapAmount.toString().split(String("."))[1]?.length || 0).is.not.greaterThan(tokenBDecimals)
});

describe("Balance", () => {
  it("Check Balance", async () => {
    const tokenAOwner = await tokenA.balanceOf(owner.address);
    const tokenBOwner = await tokenB.balanceOf(owner.address);
    const tokenInSwapped = await tokenSwap.tokenInSwapped();
    const tokenOutRemaining = await tokenSwap.tokenOutRemaining();

    // console.log(tokenADecimals, tokenBDecimals, tokenADecimals-tokenBDecimals, tokenBDecimals-tokenADecimals)
    // console.log(fromWei(tokenAOwner, tokenADecimals))
    // console.log(fromWei(tokenBOwner, tokenBDecimals))
    // console.log(fromWei(tokenInSwapped, tokenADecimals))
    // console.log(fromWei(tokenOutRemaining, tokenBDecimals))

    expect(parseFloat(tokenAOwner)).greaterThan(0);
    expect(parseFloat(tokenBOwner)).greaterThan(0);
    expect(parseFloat(tokenInSwapped)).equal(0);
    expect(parseFloat(tokenOutRemaining)).greaterThan(0);
  });
});

describe("Swap", () => {
  it("Swap tokens", async () => {
    tokenA.transfer(user1.address, toWei(swapAmount, tokenADecimals));
    const tokenAOwnerOld = await tokenA.balanceOf(owner.address);
    const tokenAUser1Old = await tokenA.balanceOf(user1.address);
    // console.log('TokenA owner:',fromWei(tokenAOwnerOld, tokenADecimals), 'user1:', fromWei(tokenAUser1Old, tokenADecimals))
    const tokenBOwnerOld = await tokenB.balanceOf(owner.address);
    const tokenBUser1Old = await tokenB.balanceOf(user1.address);
    // console.log('TokenB owner:',fromWei(tokenBOwnerOld, tokenBDecimals), 'user1:', fromWei(tokenBUser1Old, tokenBDecimals))

    const TOKENA = await ethers.getContractFactory("TokenA");
    const tokenAUser1 = new ethers.Contract(tokenA.address, TOKENA.interface, user1);
    await tokenAUser1.approve(tokenSwap.address, amountTKA);

    const TOKENSWAP = await ethers.getContractFactory("TokenSwap");
    const tokenSwapUser1 = new ethers.Contract(tokenSwap.address, TOKENSWAP.interface, user1);
    await tokenSwapUser1.swap(toWei(swapAmount, tokenADecimals));

    const tokenAOwnerNew = await tokenA.balanceOf(owner.address);
    const tokenAUser1New = await tokenA.balanceOf(user1.address);
    // console.log('TokenA owner:',fromWei(tokenAOwnerNew, tokenADecimals), 'user1:', fromWei(tokenAUser1New, tokenADecimals))
    const tokenBOwnerNew = await tokenB.balanceOf(owner.address);
    const tokenBUser1New = await tokenB.balanceOf(user1.address);
    // console.log('TokenB owner:',fromWei(tokenBOwnerNew, tokenADecimals), 'user1:', fromWei(tokenBUser1New, tokenADecimals))

    // console.log(fromWei(tokenAOwnerOld, tokenADecimals))
    // console.log(fromWei(tokenBOwnerOld, tokenBDecimals))
    // console.log(fromWei(tokenAUser1Old, tokenADecimals))
    // console.log(fromWei(tokenBUser1Old, tokenBDecimals))

    // console.log(fromWei(tokenAOwnerNew, tokenADecimals))
    // console.log(fromWei(tokenBOwnerNew, tokenBDecimals))
    // console.log(fromWei(tokenAUser1New, tokenADecimals))
    // console.log(fromWei(tokenBUser1New, tokenBDecimals))

    expect(BigInt(tokenAUser1Old) - BigInt(tokenAUser1New)).equal(toWei(swapAmount, tokenADecimals));
    expect(BigInt(tokenAOwnerNew) - BigInt(tokenAOwnerOld)).equal(toWei(swapAmount, tokenADecimals));
    expect(BigInt(tokenBUser1New) - BigInt(tokenBUser1Old)).equal(toWei(swapAmount, tokenBDecimals));
    expect(BigInt(tokenBOwnerOld) - BigInt(tokenBOwnerNew)).equal(toWei(swapAmount, tokenBDecimals));
  });
});

// describe('Exchange', () => {
//     let balanceTKAOld, balanceTKBOld;

//     beforeEach(async () => {
//         await tokenB.approve(tokenSwap.address, amountTKB);
//         await tokenSwap.deposit(tokenB.address, amountTKB);
//         await tokenA.transfer(user, amountTKA);
//         await tokenA.approve(tokenSwap.address, amountTKA, { from: user });

//         balanceTKAOld = fromWei(await tokenA.balanceOf(user), 'ether');
//         balanceTKBOld = fromWei(await tokenB.balanceOf(user), 'ether');
//     });

//     describe('Successfull call', () => {
//         let priceToCheck = 0;

//         it("Allows users to swap a token", async () => {
//             await tokenSwap.exchange(tokenA.address, amountTKA, {from: user});
//             priceToCheck = initialPrice;
//         });

//         it("Changes swap amount after updating the price", async () => {
//             await tokenSwap.updatePrice(toWei(changePrice, 'ether'));
//             await tokenSwap.exchange(tokenA.address, amountTKA, {from: user});
//             priceToCheck = changePrice;
//         });

//         afterEach(async () => {
//             const balanceTKANew = fromWei(await tokenA.balanceOf(user), 'ether');
//             const balanceTKBNew = fromWei(await tokenB.balanceOf(user), 'ether');

//             expect(balanceTKBOld == 0).to.be.true;
//             expect(balanceTKBNew == 0).to.be.false;
//             expect(balanceTKAOld/balanceTKBNew).to.almost.equal(priceToCheck);
//             expect(balanceTKANew == 0).to.be.true;
//         });
//     })

//     it("Reverts when there is not enough token amount to swap", async () => {
//         await tokenSwap.updatePrice(toWei(changePriceOverflow, 'ether'));
//         expect(tokenSwap.exchange(tokenA.address, amountTKA, {from: user})).to.revertedWith("ERC20 balance too low!");

//         const balanceTKANew = fromWei(await tokenA.balanceOf(user), 'ether');
//         const balanceTKBNew = fromWei(await tokenB.balanceOf(user), 'ether');
//         expect(balanceTKAOld == balanceTKANew).to.be.true;
//         expect(balanceTKBOld == balanceTKBNew).to.be.true;
//     });

//     it("Reverts when exchange a different coin", async () => {
//         const token_false = await TOKENB.new();
//         await token_false.approve(tokenSwap.address, amountTKB);
//         expect(tokenSwap.exchange(token_false.address, amountTKB)).to.revertedWith("Exchange not allowed!");
//     });
// });
