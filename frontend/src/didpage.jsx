import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function DidPage() {
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
            <p className="didLabel">did:key:z5MEj9RJqH6cVLvzH5RcVr1zmNzrzi7T2rAVAkKAiW29Xztn2zit2rsZo10</p>
            <p className="didLabel">Public Key : 47aff725733....36e5bb</p>


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
    </div>
  );
}
