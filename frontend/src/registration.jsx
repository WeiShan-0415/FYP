import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import { ethers } from "ethers";

const AGENT_ADDRESS = "0x47aEc0f75CE06ce16dCB873894836CBB3E1cEaB0";

export default function Registration() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [hasExistingDID, setHasExistingDID] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    const storedWallet = localStorage.getItem('walletAddress');
    const storedDID = localStorage.getItem('userDID');
    
    if (storedWallet) {
      setWalletAddress(storedWallet);
      // Check if they have an existing DID (just need to add username)
      if (storedDID) {
        setHasExistingDID(true);
      }
    } else {
      // If no wallet, redirect back to login
      navigate('/');
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      alert('Please enter your full name');
      return;
    }

    if (!walletAddress) {
      alert('Wallet not connected. Please go back to login.');
      navigate('/');
      return;
    }

    setIsRegistering(true);

    try {
      // Check if this is updating an existing DID or creating a new one
      if (hasExistingDID) {
        console.log('Updating username on blockchain for existing DID...');
        
        // Update username on blockchain using MetaMask
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const DID_REGISTRY = '0x03d5003bf0e79c5f5223588f347eba39afbc3818';
        const ABI = [
          'function setAttribute(address identity, bytes32 name, bytes value, uint validity) external'
        ];
        
        const registry = new ethers.Contract(DID_REGISTRY, ABI, signer);
        const name = ethers.encodeBytes32String('did/pub/username');
        const value = ethers.toUtf8Bytes(username.trim());
        const validity = 86400 * 365 * 10; // 10 years
        
        alert('Please confirm the transaction in MetaMask to update your username...');
        const tx = await registry.setAttribute(walletAddress, name, value, validity);
        console.log('Transaction sent:', tx.hash);
        
        alert('Please wait while transaction is being confirmed...');
        await tx.wait();
        
        // Update server cache
        await fetch('/api/agent/update-did', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress, username: username.trim(), txHash: tx.hash })
        }).catch(err => console.log('Cache update failed:', err));
        
        localStorage.setItem('username', username.trim());
        alert(`Username updated successfully!\nTransaction: ${tx.hash}`);
        
      } else {
        console.log('Registering new DID on Sepolia blockchain...');
        
        const registerResponse = await fetch('/api/agent/register-did-onchain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress, username: username.trim() })
        });

        if (!registerResponse.ok) {
          const error = await registerResponse.json();
          throw new Error(error.error || 'Failed to register DID on blockchain');
        }

        const result = await registerResponse.json();
        console.log('DID registered on blockchain:', result);
        
        localStorage.setItem('userDID', result.did);
        localStorage.setItem('username', username.trim());
        localStorage.setItem('didCreatedAt', result.createdAt);
        
        if (result.transactionHash) {
          console.log('Transaction hash:', result.transactionHash);
          alert(`DID created successfully!\nTransaction: ${result.transactionHash}`);
        }
      }

      // Navigate to homepage after successful registration/update
      navigate('/homepage');
      
    } catch (error) {
      console.error('Registration/Update failed:', error);
      alert('Failed to ' + (hasExistingDID ? 'update username' : 'register DID') + ': ' + error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginContent">
        <div className="logoCircle">
          <img src='/logo.png' alt="TrustID Logo" className="logoImage" />
        </div>

        <h1 className="loginTitle">Welcome to TrustID</h1>

        <p className="registrationSubtitle">
          {hasExistingDID 
            ? 'Please add your full name to complete your profile.' 
            : 'Please enter your full name for DID registration.'}
        </p>

        <form onSubmit={handleRegister} className="registrationForm">
          <input
            type="text"
            className="nameInput"
            placeholder="Enter your full name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isRegistering}
            autoFocus
          />
          
          <button 
            type="submit" 
            className="registerBtn"
            disabled={isRegistering || !username.trim()}
          >
            {isRegistering ? 'Processing...' : (hasExistingDID ? 'Update Profile' : 'Register DID')}
          </button>
        </form>
      </div>
    </div>
  );
}
