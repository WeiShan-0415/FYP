import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';


export default function VerificationManual() {
  const [credentialId, setCredentialId] = useState('');
  const navigate = useNavigate();
  return (
    <div className="appShell">
      {/* Top header */}
      <div className="header">
        <div className="credentialContent">
          <button className="backBtn" onClick={() => navigate('/verification')} aria-label="Back">
            <span>‹</span>
            <span>Back</span>
          </button>
          <h2 className="pageTitle">Verification</h2>
          <button className="avatarBtn" aria-label="Profile" onClick={() => navigate('/profile')}>
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
        <div className="circleContainer">
          <img
            src='/verificationcircle.png'
            alt="Verification Circle"
            className="circle"
          />
          <div className="circleText">
            <div className="circleLabel" style={{marginTop: "90px"}}>Scan to<br/>verify</div>
          </div>
        </div>
      </div>
      <main className="homeCards">
        <div className="titleWithBadge">
          <h5 className="credentialTitle">Manual Entry</h5>
        </div>
        <div className="credentialInputSection">
          <h3 className="inputLabel">Enter Credential ID</h3>
          <input
            type="text"
            className="credentialInput"
            placeholder="Enter your credential ID"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
          />
        </div>
      </main>
      <TabBar />
    </div>
  );
}
