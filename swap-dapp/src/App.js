import React, { useState, useEffect } from "react";
import { useEthers } from "@usedapp/core";
import { Client } from "xrpl";

import styles from "./styles";
import { usePools } from "./hooks";
import { uniswapLogo } from "./assets";
import { Exchange, Loader, WalletButton } from "./components";

const App = () => {
  const { account } = useEthers();
  const [poolsLoading, pools] = usePools();
  const [xrplClient, setXrplClient] = useState(null);
  const [xrplBalance, setXrplBalance] = useState(null);
  const [xrplTransactions, setXrplTransactions] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const connectToXrpl = async () => {
      const client = new Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
      setXrplClient(client);
    };

    connectToXrpl();

    return () => {
      if (xrplClient) {
        xrplClient.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchXrplData = async () => {
      try {
        if (xrplClient && walletConnected) {
          const balanceResponse = await xrplClient.request({
            command: "account_info",
            account: account,
          });
          setXrplBalance(balanceResponse.result.account_data.Balance);

          const txResponse = await xrplClient.request({
            command: "account_tx",
            account: account,
          });
          setXrplTransactions(txResponse.result.transactions);
        }
      } catch (error) {
        console.error("Error fetching XRPL data:", error);
      }
    };

    fetchXrplData();
  }, [xrplClient, walletConnected, account]);

  const connectWallet = async () => {
    try {
      const wallet = Wallet.generate();
      console.log(`Generated new wallet: ${wallet.classicAddress}`);

      setXrplWallet(wallet);
      setWalletConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <header className={styles.header}>
          <img
            src={uniswapLogo}
            alt="uniswap-logo"
            className="w-16 h-16 object-contain"
          />
          <button onClick={connectWallet} className={styles.walletButton}>
            {walletConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>
        </header>

        <div className={styles.exchangeContainer}>
          <h1 className={styles.headTitle}>Uniswap 2.0</h1>
          <p className={styles.subTitle}>Exchange tokens in seconds</p>

          <div className={styles.exchangeBoxWrapper}>
            <div className={styles.exchangeBox}>
              <div className="pink_gradient" />
              <div className={styles.exchange}>
                {account ? (
                  poolsLoading ? (
                    <Loader title="Loading pools, please wait!" />
                  ) : (
                    <Exchange pools={pools} />
                  )
                ) : (
                  <Loader title="Please connect your wallet" />
                )}
              </div>
              <div className="blue_gradient" />
            </div>
          </div>

          <div className={styles.xrplBalanceContainer}>
            <h2 className={styles.xrplBalanceTitle}>XRPL Balance</h2>
            {xrplBalance !== null ? (
              <p className={styles.xrplBalance}>{xrplBalance} XRP</p>
            ) : (
              <Loader title="Fetching XRPL balance..." />
            )}
          </div>

          <div className={styles.transactionHistoryContainer}>
            <h2 className={styles.transactionHistoryTitle}>Transaction History</h2>
            {xrplTransactions.length > 0 ? (
              <ul className={styles.transactionHistoryList}>
                {xrplTransactions.map((tx, index) => (
                  <li key={index} className={styles.transactionHistoryItem}>
                    <p>Transaction ID: {tx.tx.hash}</p>
                    <p>Type: {tx.tx.TransactionType}</p>
                    <p>Amount: {tx.tx.Amount / 1000000} XRP</p>
                  </li>
                ))}
              </ul>
            ) : (
              <Loader title="Fetching transaction history..." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
