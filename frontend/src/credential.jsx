// Credential.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function Credential() {
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
          <h2 className="pageTitle">Credentials</h2>
          <button className="avatarBtn" aria-label="Profile">
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
        <div className="circleContainer">
          <img
            src='/credentialcircle.png'
            alt="Credential Circle"
            className="circle"
          />
          <div className="circleText">
            <div className="circleNumber">5</div>
            <div className="circleLabel">active<br/>credentials</div>
          </div>
        </div>
      </div>
      <main className="homeCards">
        <div className="titleWithBadge">
          <h5 className="credentialTitle">Total</h5>
          <span className="totalBadge">5</span>
        </div>
        <div className="credentialCard">
          <div className="cardIcon">🚗</div>
          <div className="cardContent">
            <h4 className="cardName">Driver License</h4>
            <p className="cardIssued">Issued: Jan 2023</p>
          </div>
          <span className="cardStatus active">Active</span>
        </div>

        <div className="credentialCard">
          <div className="cardIcon">🎓</div>
          <div className="cardContent">
            <h4 className="cardName">University Degree</h4>
            <p className="cardIssued">Issued: Jan 2023</p>
          </div>
          <span className="cardStatus active">Active</span>
        </div>

        <div className="credentialCard">
          <div className="cardIcon">🛂</div>
          <div className="cardContent">
            <h4 className="cardName">Passport</h4>
            <p className="cardIssued">Issued: Jan 2023</p>
          </div>
          <span className="cardStatus expiring">Expiring Soon</span>
        </div>

        <div className="credentialCard">
          <div className="cardIcon">👨‍🍳</div>
          <div className="cardContent">
            <h4 className="cardName">Cooking Certificate</h4>
            <p className="cardIssued">Issued: Jan 2023</p>
          </div>
          <span className="cardStatus active">Active</span>
        </div>
      </main>
    </div>
  );
}
