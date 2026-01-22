import { useNavigate } from 'react-router-dom';
import './App.css';
import { ethers } from "ethers";

// Your backend/server wallet address (safe to expose)
const AGENT_ADDRESS = "0x47aEc0f75CE06ce16dCB873894836CBB3E1cEaB0";

export default function Login() {
  const navigate = useNavigate();

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

        // Check if they need to authorize the agent (your backend wallet)
        if (!localStorage.getItem("agentAuthorized")) {
          await authorizeAgent(walletAddress); // User signs delegation
          localStorage.setItem("agentAuthorized", "true");
        }

        // If they exist but have no name, prompt and update blockchain
        if (!checkResult.username) {
          const username = prompt("Please enter your full name:");
          if (username) {
            try {
              // A. User signs and pays gas for the name update
              const txHash = await updateUsernameOnChain(walletAddress, username);
              
              // B. Sync with backend
              await fetch('/api/agent/update-did', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress, username, txHash })
              });
              
              localStorage.setItem("username", username);
              alert("Profile updated successfully!");
            } catch (err) {
              console.error("Blockchain update failed:", err);
              alert("Transaction failed. Profile not updated.");
              return; // Stop navigation if blockchain update fails
            }
          }
        } else {
          localStorage.setItem("username", checkResult.username);
        }
      } else {
        // HANDLE NEW USER (Registration)
        const username = prompt("Please enter your full name:");
        if (!username || username.trim() === "") {
          alert("Name is required to register a DID");
          return;
        }

        const registerResponse = await fetch('/api/agent/register-did-onchain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress, username: username.trim() })
        });

        if (!registerResponse.ok) {
          const error = await registerResponse.json();
          throw new Error(error.error || 'Failed to register DID');
        }

        const result = await registerResponse.json();
        localStorage.setItem("userDID", result.did);
        localStorage.setItem("username", username.trim());
        localStorage.setItem("didCreatedAt", result.createdAt);
        
        if (result.transactionHash) {
          alert("DID created and registered on Sepolia!");
        }
      }

      // 3. Final Step: Go to Homepage
      navigate("/homepage");

    } catch (error) {
      console.error("Login process failed:", error);
      alert(error.code === 4001 ? "User rejected request" : "Setup failed: " + error.message);
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
