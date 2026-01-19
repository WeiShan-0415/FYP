import { useNavigate } from 'react-router-dom';
import './App.css';

export default function Login() {
  const navigate = useNavigate();

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
        console.log("DID already exists:", checkResult.did);
        localStorage.setItem("userDID", checkResult.did);
        if (checkResult.createdAt) {
          localStorage.setItem("didCreatedAt", checkResult.createdAt);
        }
        
        // Check if username exists, if not prompt for it
        if (!checkResult.username) {
          const username = prompt("Please enter your full name to complete your profile:");
          
          if (username && username.trim() !== "") {
            // Update DID with username
            const updateResponse = await fetch('/api/agent/update-did', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ walletAddress, username: username.trim() })
            });
            
            if (updateResponse.ok) {
              const updateResult = await updateResponse.json();
              localStorage.setItem("username", username.trim());
              console.log("Username updated successfully");
              
              // Show transaction confirmation
              if (updateResult.transactionHash) {
                alert(`Username saved to blockchain!\nTransaction: ${updateResult.transactionHash}`);
              }
            }
          }
        } else {
          localStorage.setItem("username", checkResult.username);
        }
      } else {
        // Prompt user to enter their full name
        const username = prompt("Please enter your full name:");
        
        if (!username || username.trim() === "") {
          alert("Name is required to register a DID");
          return;
        }

        console.log("Registering DID on Sepolia blockchain...");
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
        
        
        // Show success message with transaction hash
        if (result.transactionHash) {
          console.log("Transaction hash:", result.transactionHash);
          alert(`DID created and registered on Sepolia!\nTransaction: ${result.transactionHash}`);
        }
      }

      // 7. Navigate to homepage after DID setup
      navigate("/homepage");
    } catch (error) {
      console.error("MetaMask connection failed:", error);

      // Optional: handle user rejection
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
          <img
            src='/logo.png'
            alt="TrustID Logo"
            className="logoImage"
          />
        </div>
        
        <h1 className="loginTitle">Welcome to TrustID</h1>
        
        <p className="loginSubtitle">
          Start Your Digital Life with<br />Identity You Control
        </p>
        
        <button className="metamaskBtn" onClick={handleMetaMaskLogin}>
          <span className="metamaskIcon">
            <img
              src='/metamask.png'
              alt="MetaMask Icon"
              className="metamaskImage"
            />
          </span>
          <span className="metamaskText">Continue with MetaMask</span>
        </button>
      </div>
    </div>
  );
}
