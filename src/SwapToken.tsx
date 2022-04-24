import { formatUnits, formatEther, parseEther, parseUnits } from "@ethersproject/units";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, BigNumberish, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";

import TokenSwapArtifacts from "./artifacts/contracts/TokenSwap.sol/TokenSwap.json";
import IERC20Artifacts from "./artifacts/contracts/oz/IERC20.sol/IERC20.json";
import logger from "./logger";
import { TokenSwap } from "./types/TokenSwap";
import { IERC20 } from "./types/IERC20";
import ProgressBar from "./components/progress-bar";
import logo1 from "./assets/logo1.svg";

interface Props {
  contractAddress: string;
}

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

const toWei = (amount: string | number, unit: BigNumberish | undefined): BigNumber => 
  parseUnits(amount.toString(), unit);
const fromWei = (amount: BigNumberish, unit: BigNumberish | undefined): string => 
  formatUnits(amount.toString(), unit);

const providerUrl = import.meta.env.VITE_PROVIDER_URL;

// const TokenInfo = ({ tokenAddress, setDecimals, tokenBalance }: { tokenAddress: string , setDecimals: React.Dispatch<React.SetStateAction<any>>, tokenBalance:BigNumberish}) => {
//   const { library } = useWeb3React();
//   const fetchTokenInfo = async () => {
//     logger.warn("fetchTokenInfo");
//     const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
//     const tokenContract = new ethers.Contract(tokenAddress, IERC20Artifacts.abi, provider);
//     const name = await tokenContract.name();
//     const symbol = await tokenContract.symbol();
//     const decimals = await tokenContract.decimals();
//     logger.warn("token info", { name, symbol, decimals, tokenBalance });
    
//     setDecimals(decimals)
    
//     return { name, symbol, decimals, tokenBalance};
//   };
//   const { error, isLoading, data } = useQuery(["token-info", tokenAddress], fetchTokenInfo, {
//     enabled: tokenAddress !== "",
//   });
//   if (error) return <div>failed to load</div>;
//   if (isLoading) return <div>loading...</div>;
//   return (
//     <div>
//       <button className="btn">
//         {data?.name}
//         <div className="ml-2 badge">{data?.tokenBalance}</div>
//         <div className="ml-2 badge">{data?.symbol}</div>
//         <div className="ml-2 badge">{data?.decimals}</div>
//       </button>
//     </div>
//   );
// };

async function requestAccount() {
  if (window.ethereum?.request) return window.ethereum.request({ method: "eth_requestAccounts" });

  throw new Error("Missing install Metamask. Please access https://metamask.io/ to install extension on your browser");
}

const SwapToken = ({ contractAddress }: Props) => {
  const { library, chainId, account } = useWeb3React();
  const [tokenIn, setTokenIn] = useState("")
  const [tokenOut, setTokenOut] = useState("")
  const [tokenInDecimals, setTokenInDecimals] = useState(undefined)
  const [tokenOutDecimals, setTokenOutDecimals] = useState(undefined)
  const [tokenInName, setTokenInName] = useState("")
  const [tokenOutName, setTokenOutName] = useState("")
  const [tokenInSymbol, setTokenInSymbol] = useState("")
  const [tokenOutSymbol, setTokenOutSymbol] = useState("")
  const [tokenInAllowance, setTokenInAllowance] = useState<number | null>(null)
  
  const [tokenWallet, setTokenWallet] = useState("")
  const [tokenInSwapped, setTokenInSwapped] = useState("0")
  const [tokenOutRemaining, setTokenOutRemaining] = useState("0")
  
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceTokenIn, setBalanceTokenIn] = useState<number | null>(null);
  const [balanceTokenOut, setBalanceTokenOut] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  
  // fetch crowdsale token info
  const fetchContractInfo = async () => {
    logger.warn("fetchContractInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const contract = new ethers.Contract(contractAddress, TokenSwapArtifacts.abi, provider) as TokenSwap;

    const _tokenIn = await contract.tokenIn()
    setTokenIn(_tokenIn)
    const _tokenOut = await contract.tokenOut()
    setTokenOut(_tokenOut)

    const tokenInContract = new ethers.Contract(_tokenIn, IERC20Artifacts.abi, provider);
    const _tokenInName = await tokenInContract.name();
    setTokenInName(_tokenInName)
    const _tokenInSymbol = await tokenInContract.symbol();
    setTokenInSymbol(_tokenInSymbol)
    const _tokenInDecimals = await tokenInContract.decimals();
    setTokenInDecimals(_tokenInDecimals)

    const tokenOutContract = new ethers.Contract(_tokenOut, IERC20Artifacts.abi, provider);
    const _tokenOutName = await tokenOutContract.name();
    setTokenOutName(_tokenOutName)
    const _tokenOutSymbol = await tokenOutContract.symbol();
    setTokenOutSymbol(_tokenOutSymbol)
    const _tokenOutDecimals = await tokenOutContract.decimals();
    setTokenOutDecimals(_tokenOutDecimals)

    if (!!account) {
      const _allowance = await tokenInContract.allowance(account, contractAddress)
      setTokenInAllowance(Number(fromWei(_allowance, _tokenInDecimals)))
      logger.warn('allowance', Number(fromWei(_allowance, _tokenInDecimals)))

      const _balanceTokenIn = await tokenInContract.balanceOf(account)
      setBalanceTokenIn(_balanceTokenIn)
      logger.warn('balance tokenIn', Number(fromWei(_balanceTokenIn, _tokenInDecimals)))
      // setBalanceTokenIn(Number(fromWei(_balanceTokenIn, _tokenInDecimals)))
      // logger.warn('balance tokenIn', _balanceTokenIn)

      const _balanceTokenOut = await tokenOutContract.balanceOf(account)
      setBalanceTokenOut(_balanceTokenOut)
      logger.warn('balance tokenOut', Number(fromWei(_balanceTokenOut, _tokenOutDecimals)))
      // setBalanceTokenOut(Number(fromWei(_balanceTokenOut, _tokenOutDecimals)))
      // logger.warn('balance tokenOut', _balanceTokenOut)


    }

    const _tokenWallet = await contract.tokenWallet()
    setTokenWallet(_tokenWallet)
    const _tokenInSwapped = await contract.tokenInSwapped()
    setTokenInSwapped(fromWei(_tokenInSwapped, _tokenInDecimals))
    const _tokenOutRemaining = await contract.tokenOutRemaining()
    setTokenOutRemaining(fromWei(_tokenOutRemaining, _tokenOutDecimals))

    // contract.tokenInSwapped()
    //   .then((swapped) => setTokenInSwapped(BigNumber.from(swapped).toString()))
    //   .catch(logger.error);
    // contract.remainingTokens()
    //   .then((remaining) => setTokenOutRemaining(BigNumber.from(remaining).toString()))
    //   .catch(logger.error);
          // .then((rate) => setPrice(formatUnits(rate, 9)))
  };
  useEffect(() => {
    try {
      fetchContractInfo();
    } catch (error) {
      logger.error(error);
    }
  }, [library, account]);

  React.useEffect((): any => {
    if (!!account && !!library) {
      logger.warn('connect and get balances')
      let stale = false;

      // const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
      // const tokenInContract = new ethers.Contract(tokenIn, IERC20Artifacts.abi, provider);
      // tokenInContract.balanceOf(account)
      //   .then((tokenBalance: any) => { if (!stale) setBalanceTokenIn(tokenBalance);})
      //   .catch(() => { if (!stale) setBalanceTokenIn(null); });

      // const tokenOutContract = new ethers.Contract(tokenOut, IERC20Artifacts.abi, provider);
      // tokenOutContract.balanceOf(account)
      //   .then((tokenBalance: any) => { if (!stale) setBalanceTokenOut(tokenBalance);})
      //   .catch(() => { if (!stale) setBalanceTokenOut(null); });


      library.getBalance(account).then((balance: any) => {
        if (!stale) {
          setBalance(balance);
          setIsConnected(true);
        }
      }).catch(() => { 
          if (!stale) {
            setBalance(null);
            setIsConnected(false);
          }
      });

      return () => {
        stale = true;
        setBalance(null);
        setIsConnected(false);
      };
    }
  }, [account, library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds

  // buy token base on quantity
  const doSwap = async () => {
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, TokenSwapArtifacts.abi, signer);
    try {
      if (!account) {
        await requestAccount();
        return;
      }
      if (balanceTokenIn) {
        const tx = await contract.swap(balanceTokenIn);
        toast.promise(tx.wait(), {
          loading: `Transaction submitted. Wait for confirmation...`,
          success: <b>Transaction confirmed!</b>,
          error: <b>Transaction failed!.</b>,
        });
        tx.wait(2)
          .then(() => fetchContractInfo())
          .catch(logger.error);
      }
      //   // console.log(receipt);
    } catch (error) {
      logger.error(error);
      // if ((error as {message: String}).message.search("User denied transaction signature")) {
      //   toast.error('Error: User denied transaction');
      // }
      // console.log('error: ', (error as {message: String}).message)
      // console.log('error: ', (error as {code: String}).code)
      // console.log('error: ', (error as {data: {message: String}}).data.message)

    }
  };

  const doApprove = async () => {
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const signer = provider.getSigner();
    const tokenInContract = new ethers.Contract(tokenIn, IERC20Artifacts.abi, signer);
    // logger.warn('doApprove')
    try {
      if (!account ) {
        await requestAccount();
        return;
      }
      if (balanceTokenIn) {
        const tx = await tokenInContract.approve(contractAddress, balanceTokenIn)
        toast.promise(tx.wait(), {
          loading: `Approval submitted. Wait for confirmation...`,
          success: <b>Approval confirmed!</b>,
          error: <b>Approval failed!.</b>,
        });
        tx.wait(2)
          .then(() => fetchContractInfo())
          .catch(logger.error);
      }

    } catch (error) {
      logger.error(error);
    }
  };

  React.useEffect((): any => {
    // logger.warn('warnings')
    let _warningMessage;
    if (balance == null) {
      _warningMessage = "Please connect to BSC Testnet first";
    } else if (balance == undefined) {
      _warningMessage = "Please connect to BSC Testnet first";
    } else if (chainId !== 97) {
      _warningMessage = "Please connect to Binance Smart Chain TestNet";

    } else if (tokenInAllowance && balanceTokenIn && (tokenInAllowance < Number(fromWei(balanceTokenIn, tokenInDecimals)))) {
      _warningMessage = "Need approve the token before swap";

    } else if (Number(formatUnits(balanceTokenIn ?? 0, tokenInDecimals)) == 0 ) {
      _warningMessage = "You dont have the token needed to swap";

    } else if (Number(tokenOutRemaining) < Number(fromWei(balanceTokenIn||0, tokenInDecimals))) {
      _warningMessage = "Sorry we only have "+tokenOutRemaining+" "+tokenOutSymbol+" remaining";

    // } else if (Number(formatUnits(balance ?? 0, 18)) < totalCost) {
    //   _warningMessage = "You do not have enough BNB";
    } else if (Number(formatUnits(balanceTokenIn ?? 0, tokenInDecimals)) > 0 ) {
      _warningMessage = "";
    } else {
      _warningMessage = "Error";
    }
    if (_warningMessage == warningMessage) return
      setWarningMessage(_warningMessage);
    if (_warningMessage == "") setDisabled(false);
    else setDisabled(true);
    // console.log("change")
    // toast("Wow so easy!");
  }, [tokenOutRemaining, balanceTokenIn, balanceTokenOut, balance, chainId]);

  return (
    <div className="relative py-3 sm:max-w-5xl sm:mx-auto">
      {chainId !== 97 && (
        <>
          <div className="alert">
            <div className="flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#ff5722"
                className="w-6 h-6 mx-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              {isConnected && (
                <label>Wrong Chain, please connect to the Binance Smart Chain Testnet.</label>
              )}
              {!isConnected && (
                <label>Please connect to the BSC Testnet.</label>
              )}
            </div>
          </div>
          <div className="divider"></div>
        </>
      )}
      <div className="flex items-center w-full px-4 py-10 bg-cover card bg-base-200">
        <img className="stats py-5" style={{width: "480px"}} src={logo1} alt="Logo" />
        <h2 className="card-title py-10">Token Swap</h2>

        <div className="grid grid-cols-3 card w-full">

          {tokenIn.length > 0 && (
            <div className="p-4 w-80">
              <div className="p-8 bg-gray-500 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800">{tokenInName}</h2>
                  {!!balanceTokenIn && (
                    <p className="text-gray-600">{fromWei(balanceTokenIn, tokenInDecimals)} {tokenInSymbol}</p>
                  )}
              </div>
            </div>
          )}
          {!(tokenIn.length > 0) && (<div className="p-4 w-80"> </div>)}

          {/* <TokenInfo tokenAddress={tokenIn} setDecimals={setTokenInDecimals} tokenBalance={fromWei(balanceTokenIn, tokenInDecimals)}/> */}
          <div>
            <div className="justify-center card-actions p-4 w-80">
              {((tokenInAllowance || -1) < (Number(fromWei(balanceTokenIn || 0, tokenInDecimals))) ) && (
                <button onClick={doApprove} disabled={disabled} type="button" className="btn btn-outline btn-accent">
                  Approve Token
                </button>
              )}
              <button onClick={doSwap} disabled={disabled} type="button" className="btn btn-outline btn-accent">
                Swap Now
              </button>
              <div style={{color: "red"}}>{warningMessage}</div>

            </div>
          </div>

          {tokenOut.length > 0 && (
            <div className="p-4 w-80">
              <div className="p-8 bg-gray-500 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold text-gray-800">{tokenOutName}</h2>
                  {!!balanceTokenOut && (
                    <p className="text-gray-600">{fromWei(balanceTokenOut, tokenOutDecimals)} {tokenOutSymbol}</p>
                  )}
              </div>
            </div>
          )}
          {!(tokenOut.length > 0) && (<div className="p-4 w-80"> </div>)}
          {/* <TokenInfo tokenAddress={tokenOut} setDecimals={setTokenOutDecimals} tokenBalance={fromWei(balanceTokenOut, tokenOutDecimals)}/> */}
        </div>
        {/* {tokenInAllowance} {fromWei(balanceTokenIn||0,tokenInDecimals)} */}
        <div className="divider"></div>
        <div className="items-center justify-center max-w-2xl px-4 py-4 mx-auto text-xl border-orange-500 lg:flex md:flex">
          <div className="p-2 font-semibold">
            <a
              href={`https://testnet.bscscan.com/address/${tokenOut}`}
              target="_blank"
              className="px-4 py-1 ml-2 bg-orange-500 rounded-full shadow focus:outline-none"
              rel="noreferrer"
            >
              View Token on BSC
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SwapToken;
