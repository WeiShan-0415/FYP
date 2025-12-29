import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function History() {
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
          <h2 className="pageTitle">History</h2>
          <button className="avatarBtn" aria-label="Profile" onClick={() => navigate('/profile')}>
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
      </div>
      <main className="tallCards" style={{paddingTop: "20px"}}>
          <div className="historyCard">
          <div className="cardContent"style={{textAlign: "Left"}}>
            <h4 className="cardName">Credential ID</h4>
            <p className="cardIssued">did:key:z6MkjH6c...37hFxgniL29ra1G</p>
          </div>
          <span className="cardStatus active">Success</span>
        </div>

        <div className="historyCard">
          <div className="cardContent"style={{textAlign: "Left"}}>
            <h4 className="cardName">Credential ID</h4>
            <p className="cardIssued">did:key:z6MkjH6c...37hFxgniL29ra1G</p>
          </div>
          <span className="cardStatus active">Success</span>
        </div>

        <div className="historyCard">
          <div className="cardContent"style={{textAlign: "Left"}}>
            <h4 className="cardName">Credential ID</h4>
            <p className="cardIssued">did:key:z6MkjH6c...37hFxgniL29ra1G</p>
          </div>
          <span className="cardStatus revoke">Fail</span>
        </div>

        <div className="historyCard">
          <div className="cardContent"style={{textAlign: "Left"}}>
            <h4 className="cardName">Credential ID</h4>
            <p className="cardIssued">did:key:z6MkjH6c...37hFxgniL29ra1G</p>
          </div>
          <span className="cardStatus active">Success</span>
        </div>

      </main>
    </div>
  );
}
