import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';


export default function VerificationManual() {
  const [verifyType, setVerifyType] = useState(null); // 'did' or 'credential'
  const [credentialId, setCredentialId] = useState('');
  const [username, setUsername] = useState('');
  const [did, setDid] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleVerifyDID = async () => {
    setError('');
    
    if (!username.trim()) {
      setError('Please enter username');
      return;
    }
    
    if (!did.trim()) {
      setError('Please enter DID');
      return;
    }

    try {
      // Extract wallet address from DID (did:ethr:sepolia:0x...)
      const didParts = did.split(':');
      const walletAddress = didParts[3];

      if (!walletAddress) {
        setError('Invalid DID format. Expected: did:ethr:sepolia:0x...');
        return;
      }

      const response = await fetch('/api/agent/check-did-with-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          username: username.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      if (data.exists && data.usernameMatch) {
        navigate('/postvsuccess', { state: { credential: { name: username, did: walletAddress } } });
      } else {
        setError('Verification failed. User or credential not found.');
        navigate('/postvfail');
      }
    } catch (err) {
      setError('Error verifying DID: ' + err.message);
      console.error('Verification error:', err);
    }
  };

  const handleVerifyCredential = async () => {
    setError('');
    
    if (!credentialId.trim()) {
      setError('Please enter credential ID');
      return;
    }

    try {
      const response = await fetch(`/api/agent/verify-credentials?credentialID=${encodeURIComponent(credentialId.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      if (data.success && Array.isArray(data.credentials) && data.credentials.length > 0) {
        navigate('/postvsuccess', { state: { credential: data.credentials[0] } });
      } else {
        setError('Verification failed. Credential not found.');
        navigate('/postvfail');
      }
    } catch (err) {
      setError('Error verifying credential: ' + err.message);
      console.error('Verification error:', err);
    }
  };

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
        <div className="circleContainer">
          <img
            src='/verificationcircle.png'
            alt="Verification Circle"
            className="circle"
          />
          <div className="circleText">
            <div className="circleLabel" style={{marginTop: "90px"}}>Scan to<br/>verify</div>
          </div>
        </div>
      </div>
      <main className="homeCards">
        {!verifyType ? (
          <>
            <div className="titleWithBadge">
              <h5 className="credentialTitle">Choose Verification Type</h5>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
              <button
                className="buttonContainer"
                onClick={() => {
                  setVerifyType('did');
                  setError('');
                  setCredentialId('');
                  setUsername('');
                  setDid('');
                }}
              >
                <img className="button" src="/button.png" alt="Verify DID background" />
                <span className="buttonText">Verify DID</span>
              </button>
              <button
                className="buttonContainer"
                onClick={() => {
                  setVerifyType('credential');
                  setError('');
                  setCredentialId('');
                  setUsername('');
                  setDid('');
                }}
              >
                <img className="button" src="/button.png" alt="Verify Credential background" />
                <span className="buttonText">Verify Credential</span>
              </button>
            </div>
          </>
        ) : verifyType === 'did' ? (
          <>
            <div className="titleWithBadge">
              <h5 className="credentialTitle">Verify DID</h5>
            </div>
            {error && (
              <div
                style={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  marginLeft: '20px',
                  marginRight: '20px',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}
            <div className="credentialInputSection">
              <h3 className="inputLabel">Name</h3>
              <input
                type="text"
                className="credentialInput"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="credentialInputSection">
              <h3 className="inputLabel">DID</h3>
              <input
                type="text"
                className="credentialInput"
                placeholder="Enter your DID (e.g., did:ethr:sepolia:0x...)"
                value={did}
                onChange={(e) => setDid(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              <button
                className="buttonContainer"
                onClick={handleVerifyDID}
              >
                <img className="button" src="/button.png" alt="verify" />
                <span className="buttonText">Verify</span>
              </button>
              <button
                className="buttonContainer"
                onClick={() => setVerifyType(null)}
                style={{ backgroundColor: '#999' }}
              >
                <img className="button" src="/button.png" alt="Share Icon" />
                <span className="buttonText">Back</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="titleWithBadge">
              <h5 className="credentialTitle">Verify Credential</h5>
            </div>
            {error && (
              <div
                style={{
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  marginLeft: '20px',
                  marginRight: '20px',
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}
            <div className="credentialInputSection">
              <h3 className="inputLabel">Enter Credential ID</h3>
              <input
                type="text"
                className="credentialInput"
                placeholder="Enter your credential ID"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              <button
                className="buttonContainer"
                onClick={handleVerifyCredential}
              >
                <img className="button" src="/button.png" alt="verify" />
                <span className="buttonText">Verify</span>
              </button>
              <button
                className="buttonContainer"
                onClick={() => setVerifyType(null)}
                style={{ backgroundColor: '#999' }}
              >
                <img className="button" src="/button.png" alt="Icon" />
                <span className="buttonText">Back</span>
              </button>
            </div>
          </>
        )}
      </main>
      <TabBar />
    </div>
  );
}
