// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
    function getOwner() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address _owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract TokenSwap {
    using SafeMath for uint256;

    uint256 public ratioIO = 1;
    IERC20 public tokenIn;
    IERC20 public tokenOut;
	address public tokenWallet;
    uint256 public tokenInSwapped;

 	event Swap(address indexed swapper, uint256 amounIn, uint256 amountOut);

	constructor(IERC20 _tokenIn, IERC20 _tokenOut, address _tokenWallet) {
		tokenIn = _tokenIn;
		tokenOut = _tokenOut;
		tokenWallet = address(_tokenWallet);
        tokenIn.approve(address(this), tokenIn.totalSupply());
        tokenOut.approve(address(this), tokenOut.totalSupply());
	}

	// swap token function
    function swap(uint256 amountIn) public returns (uint256) {
        require(amountIn > 0, "amountIn can't be zero");
        require(tokenIn.balanceOf(msg.sender) >= amountIn, "no tokenIn balance");

        uint256 exchangeA = uint256(mul(amountIn, ratioIO));
        
        uint256 tokenInDecimals = tokenIn.decimals();
        uint256 tokenOutDecimals = tokenOut.decimals();

        uint256 amountOut = (tokenInDecimals > tokenOutDecimals) 
            ? exchangeA / 10**(tokenIn.decimals()-tokenOut.decimals())
            : exchangeA * 10**(tokenOut.decimals()-tokenIn.decimals());

        require(amountOut > 0, "must be greater then zero");
        require(tokenOut.balanceOf(tokenWallet) > amountOut, "out of tokenOut");

        require(tokenIn.allowance(msg.sender, address(this)) >= amountIn, "ERC20 allowance too low!");
        tokenIn.transferFrom(msg.sender, tokenWallet, amountIn);

        tokenOut.approve(msg.sender, amountOut);
        tokenOut.transferFrom(tokenWallet, msg.sender, amountOut);
        tokenInSwapped = tokenInSwapped + amountIn;
        emit Swap(msg.sender, amountIn, amountOut);
        return amountOut;
    }
    
	function tokenOutRemaining() public view returns (uint256) {
		return
			min(
				tokenOut.balanceOf(tokenWallet),
				tokenOut.allowance(tokenWallet, address(this))
			);
	}

    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

}
