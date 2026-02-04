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

  // Check if this is a credential verification (has id and type fields)
  const isCredentialVerification = credential.id && credential.type;

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
            <div className="circleNumber" style={{marginTop:"50px"}}>✓</div>
            <div className="circleLabel">Verification<br/>Sucessful</div>
          </div>
          </div>
          </div>

          {isCredentialVerification ? (
            <>
              <div className="credentialCard"style={{marginTop:"-50px",marginBottom:"0px"}}>
                <div className="cardContent"style={{textAlign: "Left"}}>
                  <h4 className="cardName">Name</h4>
                  <p className="cardIssued">{credential.name || 'N/A'}</p>
                </div>
              </div>

              <div className="credentialCard">
                <div className="cardContent" style={{textAlign: "Left"}}>
                  <h4 className="cardName">Credential ID</h4>
                  <p className="cardIssued" style={{fontSize: "12px"}}>
                    {credential.id ? (`${credential.id.substring(0, 40)}...${credential.id.substring(credential.id.length - 4)}`) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="credentialCard">
                <div className="cardContent" style={{textAlign: "Left"}}>
                  <h4 className="cardName">Credential Type</h4>
                  <p className="cardIssued">{credential.type || 'N/A'}</p>
                </div>
              </div>

              <div className="credentialCard">
                <div className="cardContent" style={{textAlign: "Left"}}>
                  <h4 className="cardName">Title</h4>
                  <p className="cardIssued">{credential.title || 'N/A'}</p>
                </div>
              </div>

              <div className="credentialCard">
                <div className="cardContent" style={{textAlign: "Left"}}>
                  <h4 className="cardName">Issuer</h4>
                  <p className="cardIssued" style={{fontSize: "12px"}}>
                    {credential.issuerAddress || 'N/A'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}

      </main>
      <TabBar />
    </div>
  );
}
