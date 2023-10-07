import { useRef, useState } from 'react';
import { ethers } from 'ethers';
import { abi, contractAddress } from './contract';

function App() {
  const [connected, setConnected] = useState<boolean>(false);
  const [ethAmount, setEthAmount] = useState<string>('0.1');

  const connectedAddress = useRef<string | null>(null);

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') return console.warn('Require install metamask');
    const { ethereum } = window;
    try {
      const request = { method: 'eth_requestAccounts' };
      const ethRequest = (await ethereum.request(request)) as string[] | null;
      connectedAddress.current = ethRequest && ethRequest[0];

      setConnected(true);
    } catch (error) {
      console.log('Connect issue', error);
      setConnected(false);
      connectedAddress.current = null;
    }

    console.debug('Connected');
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    console.debug('accs', accounts);
  };

  const withdraw = async () => {
    console.log(`Withdrawing...`);
    if (typeof window.ethereum === 'undefined') return console.warn('Require install metamask');

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
      console.log('Withdraw issue', error);
    }
  };

  const fund = async () => {
    console.debug(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum === 'undefined') return console.debug('Require install metamask');

    try {
      // Get RPC URL from Metamask
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      console.debug(`Provider`, provider);

      // Get signer of provided account
      const signer = provider.getSigner();
      console.debug(`signer`, signer);

      // Create instance of given contract
      const contract = new ethers.Contract(contractAddress, abi, signer);
      console.debug(`contract`, contract);

      // Call fund method of contract and provide eth amount from input
      const parsedEth = ethers.utils.parseEther(ethAmount);
      console.log('Parsed value to abi fund method', parsedEth);
      const transactionResponse = await contract.fund({
        value: parsedEth,
      });

      console.debug(`transactionResponse`, transactionResponse);
      // Waiting for a blockchain response to confirm that the invoked contract method was executed
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log('Fund issue', error);
    }
  };

  async function getBalance() {
    if (typeof window.ethereum === 'undefined') return console.warn('Require install metamask');

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const balance = await provider.getBalance(contractAddress);
      console.debug('Balance is', ethers.utils.formatEther(balance));
    } catch (error) {
      console.log('Get balance issue', error);
    }
  }

  function listenForTransactionMine(transactionResponse: any, provider: any) {
    console.debug(`Mining ${transactionResponse.hash}`);
    return new Promise<void>((resolve) => {
      provider.once(transactionResponse.hash, (transactionReceipt: any) => {
        console.log(`Completed with ${transactionReceipt.confirmations} confirmations.`);
        resolve();
      });
    });
  }

  const displayAddress = (): string => {
    if (!connectedAddress.current) return 'Not connected';

    // Extract the first 4 and last 4 characters of the address
    const first4 = connectedAddress.current.slice(0, 5);
    const last4 = connectedAddress.current.slice(-4);

    // Shorten the address with an ellipsis in the middle
    return `${first4}...${last4}`;
  };

  return (
    <>
      <h1>Fund Me App</h1>
      <h2>Connected wallet: {displayAddress()}</h2>

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
