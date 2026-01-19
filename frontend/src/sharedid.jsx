import { useState,useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import './App.css';
import TabBar from './TabBar';


export default function ShareDid() {
  const navigate = useNavigate();
  const [userDID, setUserDID] = useState('');
  const qrRef = useRef();

  useEffect(() => {
    // Retrieve from localStorage
    const did = localStorage.getItem('userDID');  
    if (did) setUserDID(did);
  }, []);

  useEffect(() => {
    if (userDID && qrRef.current) {
      const qrCode = new QRCodeStyling({
        width: 200,
        height: 200,
        data: `DID: ${userDID}`,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'H'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 0
        }
      });
      qrCode.append(qrRef.current);
    }
  }, [userDID]);

  return (
    <div className="appShell">
      {/* Top header */}
      <div className="header">
        <div className="credentialContent">
          <button className="backBtn" onClick={() => navigate('/didpage')} aria-label="Back">
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
            <div className="didIcon" ref={qrRef}>
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
            <p className="cardIssued">{userDID ? userDID : 'Loading...'}</p>
          </div>
          
        </div>
        </div>
      </main>
      <TabBar />
    </div>
  );
}
