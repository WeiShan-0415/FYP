import { useNavigate } from 'react-router-dom';
import './App.css';
import { ethers } from "ethers";

// Your backend/server wallet address (safe to expose)
const AGENT_ADDRESS = "0xYOUR_SERVER_WALLET_ADDRESS";

export default function Login() {
  const navigate = useNavigate();

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

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const walletAddress = accounts[0];
      console.log("Connected wallet:", walletAddress);

      localStorage.setItem("walletAddress", walletAddress);

      console.log("Checking if DID exists...");
      const checkResponse = await fetch('/api/agent/check-did', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress })
      });

      const checkResult = await checkResponse.json();

      if (checkResult.exists) {
        if (!localStorage.getItem("agentAuthorized")) {
          await authorizeAgent(walletAddress);
          localStorage.setItem("agentAuthorized", "true");
        }
        console.log("DID already exists:", checkResult.did);
        localStorage.setItem("userDID", checkResult.did);
        if (checkResult.createdAt) {
          localStorage.setItem("didCreatedAt", checkResult.createdAt);
        }

        if (!checkResult.username) {
          const username = prompt("Please enter your full name to complete your profile:");
          if (username && username.trim() !== "") {
            try {
              const res = await fetch('/api/agent/update-did', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  walletAddress,
                  username: username.trim()
                })
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data.error);

              alert(`Username saved!\nTx: ${data.transactionHash}`);
            } catch (updateError) {
              console.error("Failed to update username:", updateError);
              alert("Failed to save username: " + updateError.message);
            }
          }
        } else {
          localStorage.setItem("username", checkResult.username);
        }
      } else {
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
          throw new Error(error.error || 'Failed to register DID on blockchain');
        }

        const result = await registerResponse.json();
        console.log("DID registered on blockchain:", result);

        localStorage.setItem("userDID", result.did);
        localStorage.setItem("username", username.trim());
        localStorage.setItem("didCreatedAt", result.createdAt);

        if (result.transactionHash) {
          alert(`DID created and registered on Sepolia!\nTransaction: ${result.transactionHash}`);
        }
      }

      navigate("/homepage");
    } catch (error) {
      console.error("MetaMask connection failed:", error);
      if (error.code === 4001) {
        alert("User rejected MetaMask connection");
      } else {
        alert("Failed to setup DID: " + error.message);
      }
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
