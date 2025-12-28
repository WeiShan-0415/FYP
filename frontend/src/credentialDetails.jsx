import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function credentialDetails() {
  const navigate = useNavigate();
  return (
    <div className="appShell">
      {/* Top header */}
      <div className="header">
        <div className="credentialContent">
          <button className="backBtn" onClick={() => navigate('/credential')} aria-label="Back">
            <span>‹</span>
            <span>Back</span>
          </button>
          <h2 className="pageTitle">My Credential</h2>
          <button className="avatarBtn" aria-label="Profile" onClick={() => navigate('/profile')}>
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
      </div>
      <main className="tallCards">
        <div className="credentialDetailsCard">
        <div className="didHeader">
          <div className="credentialDetails">
            <div className="didIcon">
            <img
              src='/qrcode.png'
              alt="Share Icon"
              className='shareDIDImage'
            />
            </div>
          </div>
          <h3 className="didTitle">Your Verifiable Credential</h3>
          </div>
          </div>
          <div className="credentialCard">
          <div className="cardContent"style={{textAlign: "Left"}}>
            <h4 className="cardName">Name</h4>
            <p className="cardIssued">Foo Wei Shan</p>
          </div>
        </div>

        <div className="credentialCard"style={{marginTop: "0px"}}>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">Credential Type </h4>
            <p className="cardIssued">University Certification</p>
          </div>
        </div>

        <div className="credentialCard" style={{marginTop: "0px"}}>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">Title </h4>
            <p className="cardIssued">Computing Science</p>
          </div>

        </div><div className="credentialCard" style={{marginTop: "0px"}}>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">Issuer</h4>
            <p className="cardIssued">Heriot-Watt Univeristy</p>
          </div>
        </div>

        
      </main>
    </div>
  );
}
