import { useNavigate } from 'react-router-dom';
import './App.css';
import { ethers } from "ethers";
import { useEffect } from 'react';

export default function Login() {
  const AGENT_ADDRESS = "0x47aEc0f75CE06ce16dCB873894836CBB3E1cEaB0";
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

  // Add this inside your handleMetaMaskLogin function or as a helper
  const updateUsernameOnChain = async (walletAddress, username) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const DID_REGISTRY = "0x03d5003bf0e79c5f5223588f347eba39afbc3818";
    const ABI = [
      "function setAttribute(address identity, bytes32 name, bytes value, uint validity) external"
    ];

    const registry = new ethers.Contract(DID_REGISTRY, ABI, signer);

    // Encode the name "did/pub/username"
    const name = ethers.encodeBytes32String("did/pub/username");
    const value = ethers.toUtf8Bytes(username);
    const validity = 86400 * 365 * 10; // 10 years

    console.log("Requesting user to sign username update...");
    const tx = await registry.setAttribute(walletAddress, name, value, validity);
    
    alert("Transaction sent! Please wait for confirmation...");
    const receipt = await tx.wait();
    return receipt.hash;
  };
  async function checkAgentAuthorization(walletAddress) {
    if (!window.ethereum) return false;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const DID_REGISTRY = "0x03d5003bf0e79c5f5223588f347eba39afbc3818";
    const ABI = [
      "function validDelegate(address identity, bytes32 delegateType, address delegate) external view returns (bool)"
    ];

    const registry = new ethers.Contract(DID_REGISTRY, ABI, provider);
    const delegateType = ethers.encodeBytes32String("did/pub/agent");

    try {
      const isValid = await registry.validDelegate(walletAddress, delegateType, AGENT_ADDRESS);
      return isValid;
    } catch (error) {
      console.error("Error checking delegate:", error);
      return false;
    }
  }

  async function authorizeAgent(walletAddress) {
    if (!window.ethereum) {
      alert("MetaMask required");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const DID_REGISTRY = "0x03d5003bf0e79c5f5223588f347eba39afbc3818";
    const ABI = [
      "function addDelegate(address identity, bytes32 delegateType, address delegate, uint validity) external"
    ];

    const registry = new ethers.Contract(DID_REGISTRY, ABI, signer);

    const delegateType = ethers.encodeBytes32String("did/pub/agent");
    const validity = 86400 * 365 * 5; // 5 years

    const tx = await registry.addDelegate(
      walletAddress,
      delegateType,
      AGENT_ADDRESS, // user MetaMask authorizes your server
      validity
    );

    alert("Authorizing agent...");
    await tx.wait();

    alert("Agent authorized successfully!");
  }

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

        // Check blockchain to see if agent is already authorized
        const isAuthorized = await checkAgentAuthorization(walletAddress);
        if (!isAuthorized) {
          await authorizeAgent(walletAddress);
        }

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
