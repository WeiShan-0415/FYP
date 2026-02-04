import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';


export default function PostVSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [credential] = useState(location.state?.credential || {
    name: 'User Name',
    did: 'did:ethr:sepolia:0x...'
  });

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
      </div>
      <main className="tallCards">
        <div className="didCard">
        <div className="didHeader">
          <div className="VerifySuccess">
            <div className="didIcon">
            <img
              src='/circle.png'
              alt="Success Icon"
              className='VerifySuccessImg'
            />
            </div>
          </div>
          <div className="VerifyText">
            <div className="circleNumber" style={{marginTop:"35px"}}>✓</div>
            <div className="circleLabel">Verification<br/>Sucessful</div>
          </div>
          </div>
          </div>
          <div className="credentialCard"style={{marginTop:"-50px",marginBottom:"0px"}}>
          <div className="cardContent"style={{textAlign: "Left"}}>
            <h4 className="cardName">Name</h4>
            <p className="cardIssued">{credential.name || 'User Name'}</p>
          </div>
        </div>

        <div className="credentialCard">
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">DID</h4>
            <p className="cardIssued" style={{fontSize: "12px"}}>
              did:ethr:sepolia:{credential.did}
            </p>
          </div>
        </div>

      </main>
      <TabBar />
    </div>
  );
}
