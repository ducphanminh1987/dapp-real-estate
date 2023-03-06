import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [account, setAccount] = useState();
  const [balance, setBalance] = useState();

  const connectMetamask = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      console.log("please install Metamask");
    }
  };

  useEffect(() => {
    if (!account) return;
    console.log("getting balance for account", account);
    debugger;
    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.getBalance(account).then((balance) => {
      console.log("balance", balance);
      setBalance(balance.toString());
    });
  }, [account]);

  return (
    <div className="App">
      <button onClick={connectMetamask}>Connect to Wallet</button>
      <p>
        Connected to account: {account} and balance is {balance}
      </p>
    </div>
  );
}

export default App;
