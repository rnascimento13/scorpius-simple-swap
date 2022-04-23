import { formatUnits, formatEther, parseEther, parseUnits } from "@ethersproject/units";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, BigNumberish, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";

import TokenSwapArtifacts from "./artifacts/contracts/TokenSwap.sol/TokenSwap.json";
import IERC20Artifacts from "./artifacts/contracts/TokenSwap.sol/IERC20.json";
import logger from "./logger";
import { TokenSwap } from "./types/TokenSwap";
import { IERC20 } from "./types/IERC20";
import ProgressBar from "./components/progress-bar";
import logo1 from "./assets/logo1.jpg";

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

const TokenInfo = ({ tokenAddress, setDecimals, tokenBalance }: { tokenAddress: string , setDecimals: React.Dispatch<React.SetStateAction<any>>, tokenBalance:BigNumberish}) => {
  const { library } = useWeb3React();
  const fetchTokenInfo = async () => {
    logger.warn("fetchTokenInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const tokenContract = new ethers.Contract(tokenAddress, IERC20Artifacts.abi, provider);
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    logger.warn("token info", { name, symbol, decimals, tokenBalance });
    
    setDecimals(decimals)
    
    return { name, symbol, decimals, tokenBalance};
  };
  const { error, isLoading, data } = useQuery(["token-info", tokenAddress], fetchTokenInfo, {
    enabled: tokenAddress !== "",
  });
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;
  return (
    <div>
      <button className="btn">
        {data?.name}
        <div className="ml-2 badge">{data?.tokenBalance}</div>
        <div className="ml-2 badge">{data?.symbol}</div>
        <div className="ml-2 badge">{data?.decimals}</div>
      </button>
    </div>
  );
};

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
  const [tokenWallet, setTokenWallet] = useState("")
  const [tokenInSwapped, setTokenInSwapped] = useState("0")
  const [tokenOutRemaining, setTokenOutRemaining] = useState("0")
  
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState<number| null>();
  const [balanceTokenIn, setBalanceTokenIn] = useState<number>(0);
  const [balanceTokenOut, setBalanceTokenOut] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  
  // fetch crowdsale token info
  const fetchContractInfo = async () => {
    logger.warn("fetchContractInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const contract = new ethers.Contract(contractAddress, TokenSwapArtifacts.abi, provider);
    logger.warn("fetchContractInfo2");
    // contract.tokenIn().then(setTokenIn).catch(logger.error);
    // contract.tokenOut().then(setTokenOut).catch(logger.error);
    // contract.tokenWallet().then(setTokenWallet).catch(logger.error);
    // contract.tokenInSwapped().then(setTokenInSwapped).catch(logger.error);
    // contract.tokenOutRemaining().then(setTokenOutRemaining).catch(logger.error);

    const _tokenIn =await contract.tokenIn()
    setTokenIn(_tokenIn)
    logger.warn("fetchContractInfo3");
    setTokenOut(await contract.tokenOut())
    setTokenWallet(await contract.tokenWallet())
    setTokenInSwapped(await contract.tokenInSwapped())
    // setTokenOutRemaining(await contract.tokenOutRemaining())
    logger.warn(_tokenIn, 'tokenIn fetchContractInfo4')

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
      if (tokenIn?.length < 1) fetchContractInfo();
    } catch (error) {
      logger.error(error);
    }
  }, [library]);

  React.useEffect((): any => {
    if (!!account && !!library) {
      logger.warn('useEfect balances')
      let stale = false;

      if (tokenIn?.length > 1) {
        const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
        const tokenInContract = new ethers.Contract(tokenIn, IERC20Artifacts.abi, provider);
        tokenInContract.balanceOf(account)
          .then((tokenBalance: any) => { if (!stale) setBalanceTokenIn(tokenBalance); logger.warn(fromWei(tokenBalance,18))})
          .catch(() => { if (!stale) setBalanceTokenIn(0); });
      }

      if (tokenOut?.length > 1) {
        const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
        const tokenOutContract = new ethers.Contract(tokenOut, IERC20Artifacts.abi, provider);
        tokenOutContract.balanceOf(account)
          .then((tokenBalance: any) => { if (!stale) setBalanceTokenOut(tokenBalance); logger.warn(fromWei(tokenBalance,18))})
          .catch(() => { if (!stale) setBalanceTokenOut(0); });
      }

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
        setBalance(undefined);
        setIsConnected(false);
      };
    }
  }, [tokenIn, tokenOut, account, library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds

  // buy token base on quantity
  const doSwap = async () => {
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    // const signer = provider.getSigner();

    //    TODO
    const contract = new ethers.Contract(contractAddress, TokenSwapArtifacts.abi, provider);
    
    // const tx = await contract.swap(toWei(amount, ));

    try {
      if (!account) {
        await requestAccount();
        return;
      }
      // const transaction = await signer.sendTransaction(txPrams);

      // const txPrams = {
      //   to: contractAddress,
      //   value: ethers.BigNumber.from(parseUnits(String(Number(amount) / Number(price) / 100 ), 18)),
      // };
      // logger.warn({ txPrams });
      // const transaction = await signer.sendTransaction(txPrams);
      // toast.promise(transaction.wait(), {
      //   loading: `Transaction submitted. Wait for confirmation...`,
      //   success: <b>Transaction confirmed!</b>,
      //   error: <b>Transaction failed!.</b>,
      // });

      // refetch total token after processing
      //   transaction
      //     .wait()
      //     .then(() => fetchContractInfo())
      //     .catch(logger.error);
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

  React.useEffect((): any => {
    logger.warn('warnings')
    let _warningMessage;
    if (balance == null) {
      _warningMessage = "Please connect to BSC first";
    } else if (balance == undefined) {
      _warningMessage = "Please connect to BSC first";
    } else if (chainId !== 97) {
      _warningMessage = "Please connect to Binance Smart Chain TestNet";
    // } else if (Number(formatUnits(balance ?? 0, 18)) < 0.105 ) {
    //   _warningMessage = "You need more funds, Minimum 0.1 BNB";
    // } else if (Number(formatUnits(balance ?? 0, 18)) < totalCost) {
    //   _warningMessage = "You do not have enough BNB";
    // } else if (Number(formatUnits(balance ?? 0, 18)) > totalCost) {
    //   _warningMessage = "";
    } else {
      _warningMessage = "Error";
    }
    if (_warningMessage == warningMessage) return
      setWarningMessage(_warningMessage);
    if (_warningMessage == "") setDisabled(false);
    else setDisabled(true);
    // console.log("change")
    // toast("Wow so easy!");
  }, [balance, chainId]);

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
                <label>Please connect to the BSC.</label>
              )}
            </div>
          </div>
          <div className="divider"></div>
        </>
      )}
      <div className="flex items-center w-full px-4 py-10 bg-cover card bg-base-200">
        <img className="stats py-5" style={{width: "480px"}} src={logo1} alt="Logo" />
        <h2 className="card-title py-10">Token Swap</h2>
        {fromWei(balanceTokenIn, 18)}{fromWei(balanceTokenOut, 18)}
        <div className="grid grid-cols-3 space-x-4 card">
          <TokenInfo tokenAddress={tokenIn} setDecimals={setTokenInDecimals} tokenBalance={fromWei(balanceTokenIn, tokenInDecimals)}/>
          <div>
            <div className="justify-center card-actions">
              <button onClick={doSwap} disabled={disabled} type="button" className="btn btn-outline btn-accent">
                Swap Now
              </button>
            </div>
            <div style={{color: "red"}}>{warningMessage}</div>
          </div>
          <TokenInfo tokenAddress={tokenOut} setDecimals={setTokenOutDecimals} tokenBalance={fromWei(balanceTokenOut, tokenOutDecimals)}/>
        </div>
        <div className="divider"></div>
        <div className="items-center justify-center max-w-2xl px-4 py-4 mx-auto text-xl border-orange-500 lg:flex md:flex">
          <div className="p-2 font-semibold">
            <a
              href={`https://bscscan.com/address/${tokenOut}`}
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
