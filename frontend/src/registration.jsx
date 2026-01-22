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

  useEffect(() => {
    // Check if wallet is already connected
    const storedWallet = localStorage.getItem('walletAddress');
    if (storedWallet) {
      setWalletAddress(storedWallet);
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
      console.log('Registering DID on Sepolia blockchain...');
      
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

      // Navigate to homepage after successful registration
      navigate('/homepage');
      
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register DID: ' + error.message);
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
          Please enter your full name<br />for DID registration.
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
            {isRegistering ? 'Registering...' : 'Register DID'}
          </button>
        </form>
      </div>
    </div>
  );
}
