import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function Verification() {
  const navigate = useNavigate();
  return (
    <div className="appShell">
      {/* Top header */}
      <div className="header">
        <div className="credentialContent">
          <button className="backBtn" onClick={() => navigate('/')} aria-label="Back">
            <span>‹</span>
            <span>Back</span>
          </button>
          <h2 className="pageTitle">Verification</h2>
          <button className="avatarBtn" aria-label="Profile" onClick={() => navigate('/profile')}>
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
        <div className="circleContainer" onClick={() => navigate('/postvfail')}>
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
          <h5 className="credentialTitle">Method</h5>
        </div>
        <div className="credentialCard"style={{gap: "20px"}}>
          <div className="cardIcon">
            <img
                  src='/qrcode.png'
                  alt="QR Code"
                />
          </div>
          <div className="cardContent"style={{textAlign: "Left"}} onClick={() => navigate('/postvsuccess')}>
            <h4 className="cardName">QR Code Scan</h4>
            <p className="cardIssued">Use Camera to scan</p>
          </div>
        </div>

        <div className="credentialCard"style={{gap: "20px"}}>
          <div className="cardIcon">
            <img
                  src='/keyboard.png'
                  alt="keyboard"
                />
          </div>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">Manual Entry</h4>
            <p className="cardIssued">Enter Credential ID</p>
          </div>
          
        </div>
        <button className="buttonContainer" style={{marginTop: "90px",width: "90%"}}>
            <img className="button" src="/button.png" alt="Share Icon" />
            <span className="buttonText">Verification History</span>
          </button>
      </main>
    </div>
  );
}
