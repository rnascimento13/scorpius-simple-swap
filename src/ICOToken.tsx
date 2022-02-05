import { formatUnits, formatEther, parseEther, parseUnits } from "@ethersproject/units";
import { useWeb3React } from "@web3-react/core";
import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";

import ITManTokenArtifacts from "./artifacts/contracts/ITManToken.sol/ITManToken.json";
import TBTCSArtifacts from "./artifacts/contracts/tbtcs.sol/TBTCS.json";
import ITManTokenCrowdsaleArtifacts from "./artifacts/contracts/ITManTokenCrowdsale.sol/ITManTokenCrowdsale.json";
import logger from "./logger";
import { ITManToken } from "./types/ITManToken";
import { TBTCS } from "./types/TBTCS";
import { ITManTokenCrowdsale } from "./types/ITManTokenCrowdsale";
import ProgressBar from "./components/progress-bar";
import logo1 from "./assets/logo1.png";

interface Props {
  crowdsaleAddress: string;
}

declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

const providerUrl = import.meta.env.VITE_PROVIDER_URL;

const TokenInfo = ({ tokenAddress }: { tokenAddress: string }) => {
  const { library } = useWeb3React();

  const fetchTokenInfo = async () => {
    logger.warn("fetchTokenInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    
    // const tokenContract = new ethers.Contract(tokenAddress, ITManTokenArtifacts.abi, provider) as ITManToken;
    const tokenContract = new ethers.Contract(tokenAddress, TBTCSArtifacts.abi, provider) as TBTCS;
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const totalSupply = await tokenContract.totalSupply();
    logger.warn("token info", { name, symbol, decimals });
    return {
      name,
      symbol,
      decimals,
      totalSupply,
    };
  };
  const { error, isLoading, data } = useQuery(["token-info", tokenAddress], fetchTokenInfo, {
    enabled: tokenAddress !== "",
  });

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    // <div className="flex flex-col">
    <div className="flex flex-col pt-10">

      <button className="btn">
        {data?.name}
        <div className="ml-2 badge">{data?.symbol}</div>
      </button>

      {/* <div className="shadow stats">
        <div className="stat">
          <div className="stat-title">Total Supply</div>
          <div className="stat-value">{formatUnits(data?.totalSupply ?? 0, 9)}</div>
        </div>
      </div> */}
    </div>
  );
};

async function requestAccount() {
  if (window.ethereum?.request) return window.ethereum.request({ method: "eth_requestAccounts" });

  throw new Error("Missing install Metamask. Please access https://metamask.io/ to install extension on your browser");
}

const ICOToken = ({ crowdsaleAddress }: Props) => {
  const { library, chainId, account } = useWeb3React();
  const [tokenAddress, setTokenAddress] = useState("");
  const [availableForSale, setAvailableForSale] = useState("0");
  const [price, setPrice] = useState("0");
  const [closingTime, setClosingTime] = useState("0");
  const [raised, setRaised] = useState("0");
  const [amount, setAmount] = useState(17330);
  const [balance, setBalance] = useState<number| null>();
  const [disabled, setDisabled] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  
  // fetch crowdsale token info
  const fetchCrowdsaleTokenInfo = () => {
    logger.warn("fetchCrowdsaleTokenInfo");
    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const contract = new ethers.Contract(
      crowdsaleAddress,
      ITManTokenCrowdsaleArtifacts.abi,
      provider
    ) as ITManTokenCrowdsale;
    contract.token().then(setTokenAddress).catch(logger.error);
    contract
      .remainingTokens()
      .then((total) => setAvailableForSale(BigNumber.from(total).toString()))
      .catch(logger.error);
    contract
      .rate()
      .then((rate) => setPrice(BigNumber.from(rate).toString()))
      // .then((rate) => setPrice(formatUnits(rate, 9)))
      .catch(logger.error);
    contract
      .weiRaised()
      .then((raised) => setRaised(BigNumber.from(raised).toString()))
      .catch(logger.error);
    // contract
    //   .closingTime()
    //   .then((time) => setClosingTime(BigNumber.from(time).toString()))
    //   .catch(logger.error);
  };
  useEffect(() => {
    try {
      fetchCrowdsaleTokenInfo();
    } catch (error) {
      logger.error(error);
    }
  }, [library]);

  React.useEffect((): any => {
    if (!!account && !!library) {
      let stale = false;

      library
        .getBalance(account)
        .then((balance: any) => {
          if (!stale) {
            setBalance(balance);
            setIsConnected(true);
          }
        })
        .catch(() => {
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
  }, [account, library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds


  // buy token base on quantity
  const buyTokens = async () => {
    // console.log("value: " + ethers.BigNumber.from(parseEther(String(1 / Number(price)))).mul(amount));
    // console.log("value: " + String(Number(price) * Number(amount)));
    // console.log("price: " + price);
    // console.log("amount: " + amount);
    // console.log("bnb: " + ethers.BigNumber.from(parseEther(String(1 / Number(price)))).mul(amount));
    // console.log("bnb: " + ethers.BigNumber.from(parseUnits(String(1 / Number(price)), 12)).mul(amount));



    const provider = library || new ethers.providers.Web3Provider(window.ethereum || providerUrl);
    const signer = provider.getSigner();
    try {
      if (!account) {
        await requestAccount();
        return;
      }
      console.log(ethers.utils.formatEther(ethers.utils.parseEther('0.1')));
      console.log(ethers.utils.formatEther(ethers.BigNumber.from(parseUnits(String(((1 / Number(price)) * amount)), 18))));
      console.log(ethers.BigNumber.from(parseUnits(String(Number(amount) / Number(price)), 15)));
      console.log(ethers.utils.formatEther(ethers.BigNumber.from(parseUnits(String(Number(amount) / Number(price)), 18))));

      

      const txPrams = {
        to: crowdsaleAddress,
        // value: ethers.BigNumber.from(formatUnits(Strin g(((1 / Number(price)) * amount) / 1000000), 9)),
        // value: ethers.BigNumber.from(formatUnits(String(((1 / Number(price)) * amount) / 10000000), 9)),
        // value: ethers.BigNumber.from(parseUnits(String(1 / Number(price)), 9)).mul(amount),
        // value: ethers.BigNumber.from(parseUnits(String(Number(0.1)), 18)),
        value: ethers.BigNumber.from(parseUnits(String(Number(amount) / Number(price) / 100 ), 18)),
        // value: ethers.BigNumber.from(parseUnits(String(((1 / Number(price)) * amount)))),
        // value: ethers.BigNumber.from(parseEther(String(1 / Number(price)))).mul(amount),

      };
      logger.warn({ txPrams });
      const transaction = await signer.sendTransaction(txPrams);
      toast.promise(transaction.wait(), {
        loading: `Transaction submitted. Wait for confirmation...`,
        success: <b>Transaction confirmed!</b>,
        error: <b>Transaction failed!.</b>,
      });

      // refetch total token after processing
      transaction
        .wait()
        .then(() => fetchCrowdsaleTokenInfo())
        .catch(logger.error);
      // console.log(receipt);
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

  // const totalCost = ((1 / Number(price)) * amount) / 1000000;
  const totalCost = ((amount / Number(price)) / 100 );
  console.log('price: '+price+ ' amount: '+amount);
  console.log('totalcost: '+totalCost);
  
React.useEffect((): any => {
  let _warningMessage;
  if (balance == null) {
    _warningMessage = "Please connect to BSC first";
  } else if (balance == undefined) {
    _warningMessage = "Please connect to BSC first";
  } else if (chainId !== 56) {
    _warningMessage = "Please connect to Binance Smart Chain";
  } else if (Number(formatUnits(balance ?? 0, 18)) < 0.105 ) {
    _warningMessage = "You need more funds, Minimum 0.1 BNB";
  } else if (Number(formatUnits(balance ?? 0, 18)) < totalCost) {
    _warningMessage = "You do not have enough BNB";
  } else if (Number(formatUnits(balance ?? 0, 18)) > totalCost) {
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
}, [balance, chainId, totalCost]);



  // let disableButtom = false;


// console.log("balance: ", balance);
// console.log("balance2: ", formatUnits(balance ?? 0, 18));
  // const warningMessage = totalCost.toString() + " xx " + formatUnits(balance ?? 0, 18);

  // const totalCost = formatUnits(String((1 / Number(price)) * amount), 9);
  // formatUnits(price, 14)

  return (
    <div className="relative py-3 sm:max-w-5xl sm:mx-auto">
      {chainId !== 56 && (
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
                <label>Wrong Chain, please connect to the Binance Smart Chain.</label>
              )}
              {!isConnected && (
                <label>Please connect to the BSC.</label>
              )}
            </div>
          </div>
          <div className="divider"></div>
        </>
      )}
      

      <div className="flex items-center w-full px-4 py-0 bg-cover card bg-base-200">
      <TokenInfo tokenAddress={tokenAddress} />
      <img className="stats py-5" style={{width: "480px"}} src={logo1} alt="Logo" />

      <div className="shadow stats">
        <div className="stat">
          <div className="stat-title">Total Raised</div>
          <div className="stat-value">{formatUnits(raised ?? 0, 18)} / 131 BNB</div>
         
          <div className="stat-title">
            <ProgressBar completed={(Number(formatUnits(raised ?? 0, 18)) * 2).toString().substr(0,4)} />
          </div>
        </div>
      </div>

        <div className="text-center card">
        {/* <div className="card-body"> */}
        <div className="card-body px-10" style={{width: "480px"}}>
            <h2 className="card-title">Pre-Sale MetaSwap Token</h2>
            <div className="shadow stats">
              <div className="stat px-1">
                <div className="stat-title">Total</div>
                <div className="stat-value">{totalCost} BNB</div>
              </div>
              <div className="stat px-1 border-none">
                <div className="stat-title">Order Quantity</div>
                <div className="stat-value">{amount}</div>
              </div>
            </div>
            <input
              type="range"
              // min="400000"
              // max="12000000"
              // step="40000"
              min="17330"
              max="519900"
              step="1733"
              value={amount}
              onChange={(evt) => setAmount(evt.target.valueAsNumber)}
              className="range range-accent"
            />
            <div>
              <div className="justify-center card-actions">
                <button onClick={buyTokens} disabled={disabled} type="button" className="btn btn-outline btn-accent">
                  Buy Now
                </button>
              </div>
              <div style={{color: "red"}}>{warningMessage}</div>
              {/* <div className="badge badge-md">Total: {totalCost} BNB</div> */}
            </div>
          </div>
        </div>


        <div className="divider"></div>


        <div className="items-center justify-center max-w-2xl px-4 py-4 mx-auto text-xl border-orange-500 lg:flex md:flex">
          <div className="p-2 font-semibold">
            <a
              href={`https://bscscan.com/address/${tokenAddress}`}
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

export default ICOToken;
