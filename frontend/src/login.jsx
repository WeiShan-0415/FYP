import { useNavigate } from 'react-router-dom';
import './App.css';

export default function Login() {
  const navigate = useNavigate();

  const handleMetaMaskLogin = async () => {
    try {
      // 1. Check if MetaMask is installed
      if (!window.ethereum) {
        alert("MetaMask is not installed");
        return;
      }

      // 2. Request wallet connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // 3. Get the first account
      const walletAddress = accounts[0];
      console.log("Connected wallet:", walletAddress);

      // 4. Store wallet address (example)
      localStorage.setItem("walletAddress", walletAddress);

      // 5. Navigate only after success
      navigate("/homepage");
    } catch (error) {
      console.error("MetaMask connection failed:", error);

      // Optional: handle user rejection
      if (error.code === 4001) {
        alert("User rejected MetaMask connection");
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
