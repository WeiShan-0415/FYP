import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';


export default function DidPage() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState('');
  const [userDID, setUserDID] = useState('');

  useEffect(() => {
    // Retrieve from localStorage
    const wallet = localStorage.getItem('walletAddress');
    const did = localStorage.getItem('userDID');
    
    if (wallet) setWalletAddress(wallet);
    if (did) setUserDID(did);
  }, []);

  return (
    <div className="appShell">
      {/* Top header */}
      <div className="header">
        <div className="credentialContent">
          <button className="backBtn" onClick={() => navigate('/homepage')} aria-label="Back">
            <span>‹</span>
            <span>Back</span>
          </button>
          <h2 className="pageTitle">My DID</h2>
          <button className="avatarBtn" aria-label="Profile" onClick={() => navigate('/profile')}>
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
      </div>
       <main className="tallCards">
        <div className="didCard">
          <div className="didHeader">
            <div className="didIcon">
              <img
                src='/DIDIcon.png'
                alt="DID Icon"
              />
            </div>
            <h3 className="didTitle">Your Decentralised ID</h3>
          </div>
          <div>
            <p className="didLabel"><span style={{color:"black"}}>DID:</span> {userDID || 'Loading DID...'}</p>
            <p className="didLabel"><span style={{color:"black"}}>Wallet Address:</span> {walletAddress ? `${walletAddress}` : 'Loading...'}</p>
          </div>

          <div className="didInfoSection">
            <div className="didInfoItem">
              <span className="didInfoIcon" style={{marginTop: "10px"}}>
                <img
                  src='/status.png'
                  alt="Status Icon"
                />
              </span>
              <div className="didInfoContent">
                <span className="didInfoLabel">Status</span>
                <span className="statusBadge">Active</span>
              </div>
            </div>

            <div className="didInfoItem">
              <span className="didInfoIcon">
                <img
                  src='/internet.png'
                  alt="Ethereum Sepolia"
                />
              </span>
              <div className="didInfoContent">
                <span className="didInfoLabel" style={{marginTop: "-5px"}}>Ethereum Sepolia</span>
              </div>
            </div>

            <div className="didInfoItem">
              <span className="didInfoIcon">
                <img
                  src='/services.png'
                  alt="Services"
                />
              </span>
              <div className="didInfoContent">
                <span className="didInfoLabel" style={{marginTop: "-5px"}}>Services</span>
              </div>
            </div>

            <div className="didInfoItem">
              <span className="didInfoIcon">
                <img
                  src='/calendar.png'
                  alt="Calendar"
                />
              </span>
              <div className="didInfoContent">
                <span className="didInfoLabel" style={{marginTop: "-5px"}}>Created On 15 Jan 2023</span>
              </div>
            </div>
          </div>
          <button className="buttonContainer" onClick={() => navigate('/sharedid')}>
            <img className="button" src="/button.png" alt="Share Icon" />
            <span className="buttonText">Share My DID</span>
          </button>
        </div>
      </main>
    <TabBar />
    </div>
  );
}
