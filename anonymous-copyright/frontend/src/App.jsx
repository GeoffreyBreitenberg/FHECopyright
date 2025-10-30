import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import Header from './components/Header';
import ConnectWallet from './components/ConnectWallet';
import AuthorRegistration from './components/AuthorRegistration';
import WorkRegistration from './components/WorkRegistration';
import WorksList from './components/WorksList';
import WorkVerification from './components/WorkVerification';
import DisputeManagement from './components/DisputeManagement';
import { getContract, CONTRACT_ADDRESS, NETWORK } from './utils/contract';
import { initializeFHE, isFHEInitialized } from './utils/fhe';
import './App.css';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fheReady, setFheReady] = useState(false);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setLoading(true);

      if (!window.ethereum) {
        toast.error('Please install MetaMask!');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(address);

      // Get contract instance
      const contractInstance = await getContract(web3Signer);
      setContract(contractInstance);

      // Initialize FHE
      if (!isFHEInitialized()) {
        toast.loading('Initializing FHE encryption...', { id: 'fhe-init' });
        try {
          await initializeFHE(NETWORK, CONTRACT_ADDRESS);
          setFheReady(true);
          toast.success('FHE encryption ready', { id: 'fhe-init' });
        } catch (fheError) {
          console.error('FHE initialization failed:', fheError);
          toast.error('FHE initialization failed', { id: 'fhe-init' });
          // Continue anyway - FHE will be retried on first use
          setFheReady(false);
        }
      } else {
        setFheReady(true);
      }

      // Check if user is registered author
      const registered = await contractInstance.isRegisteredAuthor(address);
      setIsAuthor(registered);

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setContract(null);
    setIsAuthor(false);
    toast.success('Wallet disconnected');
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Handle author registration success
  const handleAuthorRegistered = () => {
    setIsAuthor(true);
    toast.success('Registered as author successfully!');
  };

  return (
    <div className="app">
      <Toaster position="top-right" />

      <Header
        account={account}
        isAuthor={isAuthor}
        onDisconnect={disconnectWallet}
      />

      <main className="container">
        {!account ? (
          <div className="welcome-section">
            <h1>Anonymous Copyright Protection</h1>
            <p>Protect your creative works with FHE encryption</p>
            <ConnectWallet
              onConnect={connectWallet}
              loading={loading}
            />
          </div>
        ) : (
          <div className="dashboard">
            {!isAuthor ? (
              <div className="registration-prompt">
                <h2>Register as Author</h2>
                <p>Register to start protecting your works</p>
                <AuthorRegistration
                  contract={contract}
                  account={account}
                  onRegistered={handleAuthorRegistered}
                />
              </div>
            ) : (
              <div className="author-dashboard">
                <div className="dashboard-grid">
                  <div className="dashboard-section">
                    <h2>Register New Work</h2>
                    <WorkRegistration
                      contract={contract}
                      account={account}
                    />
                  </div>

                  <div className="dashboard-section">
                    <h2>Verify Work</h2>
                    <WorkVerification
                      contract={contract}
                      account={account}
                    />
                  </div>

                  <div className="dashboard-section">
                    <h2>Dispute Management</h2>
                    <DisputeManagement
                      contract={contract}
                      account={account}
                    />
                  </div>
                </div>

                <div className="works-section">
                  <h2>My Works</h2>
                  <WorksList
                    contract={contract}
                    account={account}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with FHEVM SDK | Powered by Zama</p>
      </footer>
    </div>
  );
}

export default App;
