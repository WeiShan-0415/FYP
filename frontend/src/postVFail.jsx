import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function PostVFail() {
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
      </div>
      <main className="tallCards">
        <div className="didCard">
        <div className="didHeader">
          <div className="VerifySuccess">
            <div className="didIcon">
            <img
              src='/redCircle.png'
              alt="Fail Icon"
              className='VerifySuccessImg'
            />
            </div>
          </div>
          <div className="VerifyText">
            <div className="circleNumber">✓</div>
            <div className="circleLabel">Verification<br/>Fail</div>
          </div>
          <h3 className="didTitle">Credential Not Found.</h3>
          <h3 className="didTitle">Please try again.</h3>
          </div>
          </div>
         
        
      </main>
    </div>
  );
}
