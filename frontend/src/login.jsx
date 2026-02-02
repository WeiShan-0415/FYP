import { useNavigate } from 'react-router-dom';
import './App.css';
import { ethers } from "ethers";
import { useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clear localStorage on page refresh
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation && navigation.type === 'reload') {
      console.log("Page refreshed - clearing local storage");
      localStorage.clear();
    }
    
    // Handle MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          console.log("New account detected:", accounts[0]);
          // Wipe local data to prevent cross-account "leakage"
          localStorage.clear(); 
          // Force a reload to the login page or re-run login logic
          window.location.reload(); 
        } else {
          // Handle disconnection
          localStorage.clear();
          navigate("/");
        }
      });
    }
  }, [navigate]);

  const handleMetaMaskLogin = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed");
        return;
      }

      // 1. Connect Wallet
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      localStorage.setItem("walletAddress", walletAddress);

      // 2. Check backend for existing DID
      const checkResponse = await fetch('/api/agent/check-did', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });
      const checkResult = await checkResponse.json();

      if (checkResult.exists) {
        // HANDLE EXISTING USER
        localStorage.setItem("userDID", checkResult.did);
        if (checkResult.createdAt) localStorage.setItem("didCreatedAt", checkResult.createdAt);
        
        // Check if username exists
        if (!checkResult.username) {
          // DID exists but no username - redirect to registration to add username
          navigate("/registration");
          return;
        }
        
        localStorage.setItem("username", checkResult.username);
        alert(`Welcome back, ${checkResult.username}!`);

        // Navigate to homepage
        navigate("/homepage");
      } else {
        // NEW USER - Redirect to registration page
        navigate("/registration");
      }

    } catch (error) {
      console.error("Login process failed:", error);
      alert(error.code === 4001 ? "User rejected request" : "Login failed: " + error.message);
    }
  };
  return (
    <div className="loginContainer">
      <div className="loginContent">
        <div className="logoCircle">
          <img src='/logo.png' alt="TrustID Logo" className="logoImage" />
        </div>

        <h1 className="loginTitle">Welcome to TrustID</h1>

        <p className="loginSubtitle">
          Start Your Digital Life with<br />Identity You Control
        </p>

        <button className="metamaskBtn" onClick={handleMetaMaskLogin}>
          <span className="metamaskIcon">
            <img src='/metamask.png' alt="MetaMask Icon" className="metamaskImage" />
          </span>
          <span className="metamaskText">Continue with MetaMask</span>
        </button>
      </div>
    </div>
  );
}
