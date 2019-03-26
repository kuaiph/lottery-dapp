import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = {
    storageValueWei: 0,
    web3: null,
    accounts: null,
    contract: null
  };

  etherToWei = (value) => {
    return value * 1000000000000000000;
  }

  weiToEther = (value) => {
    return value / 1000000000000000000;
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.init);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  init = async () => {
    const { contract } = this.state;

    // get the account balance from of the smart contract
    const response = await contract.methods.getContractBalance().call();

    // update state with the result
    this.setState({ storageValueWei: response });
  }

  sendMoney = async () => {
    const { accounts, contract } = this.state;

    // send a given value of wei to the smart contract
    const value = this.etherToWei(1);
    await contract.methods.sendWei().send({ from: accounts[0], value: value });

    // update state with stored value of wei
    this.setState({ storageValueWei: await contract.methods.getContractBalance().call() });
  };

  getMoneyBack = async () => {
    const { accounts, contract } = this.state;

    // get the whole account balance of the smart contract
    await contract.methods.getBack().send({ from: accounts[0] });

    // update state with stored value of wei
    this.setState({ storageValueWei: await contract.methods.getContractBalance().call() });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show
          a stored value of 1 (by default).
        </p>
        <p>
          Try changing the value stored on <strong>line 55</strong> of App.js.
        </p>
        <div>The stored value is: {this.state.storageValueWei} Wei</div>
        <div>The stored value is: {this.weiToEther(this.state.storageValueWei)} Ether</div>

        <button onClick={this.sendMoney}>Hit Me To Send Money</button>
        <button onClick={this.getMoneyBack}>Hit Me To Get Your Money Back</button>
      </div>
    );
  }
}

export default App;
