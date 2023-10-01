import { useRef, useState } from 'react';
import { ethers } from 'ethers';
import { abi, contractAddress } from './contract';

function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const [ethAmount, setEthAmount] = useState<string>('0.1');

  const connectedAddress = useRef<string>('');

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const { ethereum } = window;
      try {
        const ethRequest = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log('ethRequest', ethRequest);
        setConnected(true);
      } catch (error) {
        console.log('Connect issue', error);
        setConnected(false);
      }

      console.debug('Connected');
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      console.log(accounts);
    } else {
      console.warn('Require install metamask');
    }
  };

  const withdraw = async () => {
    console.log(`Withdrawing...`);
    if (typeof window.ethereum !== 'undefined') {
      const ethereum = window.ethereum;

      const provider = new ethers.providers.Web3Provider({
        send: (request, callback) =>
          ethereum.request(request).then(
            (result) => callback(null, { result }),
            (error) => callback(error, null),
          ),
        sendAsync: (request, callback) =>
          ethereum.request(request).then(
            (result) => callback(null, { result }),
            (error) => callback(error, null),
          ),
        isMetaMask: ethereum.isMetaMask,
      });
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.withdraw();
        await listenForTransactionMine(transactionResponse, provider);
        // await transactionResponse.wait(1)
      } catch (error) {
        console.log(error);
      }
    } else {
      console.warn('Require install metamask');
    }
  };

  const fund = async () => {
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.fund({
          value: ethers.utils.parseEther(ethAmount),
        });
        await listenForTransactionMine(transactionResponse, provider);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.debug('Require install metamask');
    }
  };

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      try {
        const balance = await provider.getBalance(contractAddress);
        console.debug('Balance is', ethers.utils.formatEther(balance));
      } catch (error) {
        console.log(error);
      }
    } else {
      console.warn('Require install metamask');
    }
  }

  function listenForTransactionMine(transactionResponse: any, provider: any) {
    console.debug(`Mining ${transactionResponse.hash}`);
    return new Promise<void>((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt: any) => {
        console.log(`Completed with ${transactionReceipt.confirmations} confirmations. `);
        resolve();
      });
    });
  }

  return (
    <>
      <h1>Fund Me App</h1>
      <button onClick={connect}>{connected ? 'Connected' : 'Connect'}</button>
      <button onClick={getBalance}>Get Balance</button>
      <button onClick={withdraw}>Withdraw</button>
      <label htmlFor="ethAmount">ETH Amount</label>
      <input
        id="ethAmount"
        placeholder="0.1"
        value={ethAmount}
        onChange={(e) => setEthAmount(e.target.value)}
      />
      <button onClick={fund}>Fund</button>
    </>
  );
}

export default App;
