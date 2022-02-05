// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./oz/Crowdsale.sol";
import "./oz/AllowanceCrowdsale.sol";
import "./oz/TimedCrowdsale.sol";
import "./oz/CappedCrowdsale.sol";

contract ITManTokenCrowdsale is AllowanceCrowdsale, TimedCrowdsale, CappedCrowdsale {
    using SafeMath for uint256;

	// Track investor contributions
  	uint256 public investorMinCap = 100000000000000000; // 0.1 ether
  	uint256 public investorHardCap = 3000000000000000000; // 3 ether
	uint256 public crowdCap = 131000000000000000000; // 131 ether
  	mapping(address => uint256) public contributions;

	constructor(
		uint256 _rate,
		address payable _wallet,
		ERC20 _token,
		address _tokenWallet,
		uint256 _openingTime,
		uint256 _closingTime
	)
		Crowdsale(_rate, _wallet, _token)
		AllowanceCrowdsale(_tokenWallet)
		CappedCrowdsale(crowdCap)
		TimedCrowdsale(_openingTime, _closingTime)
	{}

	/**
	 * @dev Extend parent behavior requiring to be within contributing period.
	 * @param beneficiary Token purchaser
	 * @param weiAmount Amount of wei contributed
	 */
	function _preValidatePurchase(address beneficiary, uint256 weiAmount)
		internal
		view
		override(Crowdsale, TimedCrowdsale, CappedCrowdsale)
		onlyWhileOpen
	{
		super._preValidatePurchase(beneficiary, weiAmount);
	}

    function _updatePurchasingState(address beneficiary, uint256 weiAmount) 
		internal 
		override(Crowdsale)
		onlyWhileOpen 
	{
        super._updatePurchasingState(beneficiary, weiAmount);
		uint256 _existingContribution = contributions[beneficiary];
    	uint256 _newContribution = _existingContribution.add(weiAmount);
	    require(_newContribution >= investorMinCap, "Crowdsale: Under Minimum Cap!");
    	require(_newContribution <= investorHardCap, "Crowdsale: Over Maximun Cap!");
    	contributions[beneficiary] = _newContribution;
    }

	/**
	 * @dev Overrides parent behavior by transferring tokens from wallet.
	 * @param beneficiary Token purchaser
	 * @param tokenAmount Amount of tokens purchased
	 */
	function _deliverTokens(address beneficiary, uint256 tokenAmount)
		internal
		override(Crowdsale, AllowanceCrowdsale)
	{
		super._deliverTokens(beneficiary, tokenAmount);
	}
}
