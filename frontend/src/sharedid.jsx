import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function ShareDid() {
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
          <div className="shareDID">
            <div className="didIcon">
            <img
              src='/qrcode.png'
              alt="Share Icon"
              className='shareDIDImage'
            />
            </div>
          </div>
          <h3 className="didTitle">Your Decentralised ID</h3>
          </div>
          <div className="credentialCard"style={{gap: "20px"}}>
          <div className="cardContent"style={{textAlign: "Left"}}>
            <h4 className="cardName">Name</h4>
            <p className="cardIssued">Foo Wei Shan</p>
          </div>
        </div>

        <div className="credentialCard"style={{gap: "20px"}}>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">DID Key</h4>
            <p className="cardIssued">did:key:z6MkjH6civFfkrzmKe8Bi....37hFxgniL29ra1G</p>
          </div>
          
        </div>
        </div>
      </main>
    </div>
  );
}
