import { useNavigate } from 'react-router-dom';
import './App.css';

export default function Login() {
  const navigate = useNavigate();

  const handleMetaMaskLogin = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // await window.ethereum.request({ method: 'eth_requestAccounts' });
        navigate('/homepage');
      } catch (error) {
        console.error('MetaMask connection failed:', error);
      }
    } else {
      // alert('Please install MetaMask to continue');
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
