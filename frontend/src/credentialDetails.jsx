import { useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';


export default function credentialDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const credential = state?.credential;
  const formatMiddleEllipsis = (value, start = 40, end = 4) => {
    if (!value || typeof value !== 'string') return 'N/A';
    if (value.length <= start + end + 3) return value;
    return `${value.slice(0, start)}...${value.slice(-end)}`;
  };
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
              <p className="cardIssued">{credential?.name || 'N/A'}</p>
            </div>
          </div>

        <div className="credentialCard"style={{marginTop: "0px"}}>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">Credential ID </h4>
            <p className="cardIssued">{formatMiddleEllipsis(credential?.id)}</p>
          </div>
        </div>

        <div className="credentialCard"style={{marginTop: "0px"}}>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">Credential Type </h4>
            <p className="cardIssued">{credential?.type || 'N/A'}</p>
          </div>
        </div>

        <div className="credentialCard" style={{marginTop: "0px"}}>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">Title </h4>
            <p className="cardIssued">{credential?.title|| 'N/A'}</p>
          </div>

        </div><div className="credentialCard" style={{marginTop: "0px"}}>
          <div className="cardContent" style={{textAlign: "Left"}}>
            <h4 className="cardName">Issuer</h4>
            <p className="cardIssued">did:ethr:sepolia:{formatMiddleEllipsis(credential?.issuerAddress) || 'N/A'}</p>
          </div>
        </div>
      </main>
      <TabBar />
    </div>
  );
}
