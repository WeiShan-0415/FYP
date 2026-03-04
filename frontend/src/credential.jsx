import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';

// Map credential types to appropriate icons
const getCredentialIcon = (type) => {
  const iconMap = {
    'degree': '🎓',
    'education': '🎓',
    'certificate': '📜',
    'professional': '📜',
    'license': '🪪',
    'passport': '📕',
    'identity': '📕',
    'work': '💼',
    'employment': '💼',
    'achievement': '🏅',
    'badge': '🏅',
    'health': '⚕️',
    'medical': '⚕️',
    'driver': '🚗',
    'travel': '✈️',
    'visa': '✈️',
    'default': '📜'
  };
  
  const normalizedType = type?.toLowerCase().trim() || 'default';
  return iconMap[normalizedType] || iconMap['default'];
};

export default function Credential() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRevokedOnly, setShowRevokedOnly] = useState(false);

  const isRevokedCredential = (cred) => String(cred?.status || '').toLowerCase() === 'revoked';

  const activeCredentialsCount = credentials.filter(cred => !isRevokedCredential(cred)).length;
  const revokedCredentialsCount = credentials.filter(cred => isRevokedCredential(cred)).length;
  const displayedCredentials = showRevokedOnly
    ? credentials.filter(cred => isRevokedCredential(cred))
    : credentials.filter(cred => !isRevokedCredential(cred));

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's DID from localStorage (set during login/registration)
        const userDID = localStorage.getItem('userDID');
        
        if (!userDID) {
          setError('User DID not found. Please login first.');
          setLoading(false);
          return;
        }

        // Call the API to fetch credentials for this subject DID
        const response = await fetch(
          `/api/agent/list-credentials?subjectDID=${encodeURIComponent(userDID)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch credentials: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setCredentials(data.credentials);
        } else {
          setError('Failed to load credentials');
        }
      } catch (err) {
        console.error('Error fetching credentials:', err);
        setError(err.message || 'Failed to load credentials');
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, []);
  return (
    <div className="appShell">
      {/* Top header */}
      <div className="header">
        <div className="credentialContent">
          <button className="backBtn" onClick={() => navigate('/homepage')} aria-label="Back">
            <span>‹</span>
            <span>Back</span>
          </button>
          <h2 className="pageTitle">Credentials</h2>
          <button className="avatarBtn" aria-label="Profile" onClick={() => navigate('/profile')}>
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
        <div className="circleContainer">
          <img
            src='/circle.png'
            alt="Credential Circle"
            className="VerifySuccessImg"
          />
          <div className="circleText">
            <div className="circleNumber">{activeCredentialsCount}</div>
            <div className="circleLabel">active<br/>credentials</div>
          </div>
        </div>
      </div>
      <main className="homeCards">
        <div className="titleWithBadge">
          <h5 className="credentialTitle">Total</h5>
          <span className="totalBadge">{showRevokedOnly ? revokedCredentialsCount : activeCredentialsCount}</span>
          <button
            type="button"
            className={`revokedToggleBtn ${showRevokedOnly ? 'active' : 'revoked'}`}
            onClick={() => setShowRevokedOnly(prev => !prev)}
            disabled={revokedCredentialsCount === 0}
          >
            {showRevokedOnly ? 'Show Active' : 'Show Revoked'}
          </button>
        </div>

        {loading && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Loading credentials from blockchain...</p>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#d32f2f',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            margin: '10px'
          }}>
            <p>{error}</p>
          </div>
        )}

        {!loading && displayedCredentials.length === 0 && !error && (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            color: '#666'
          }}>
            <p>{showRevokedOnly ? 'No revoked credentials found' : 'No credentials found on blockchain'}</p>
          </div>
        )}

        {!loading && displayedCredentials.map((credential, index) => (
          <div key={credential.id || index} className="credentialCard">
            <div className="cardIcon">
              <span role="img" aria-label={credential.type || 'credential'} style={{ fontSize: '32px' }}>
                {getCredentialIcon(credential.type)}
              </span>
            </div>
            <div
              className="cardContent"
              onClick={() => navigate('/credentialdetails', { state: { credential } })}
            >
              <h4 className="cardName">{credential.title || credential.name}</h4>
              <p className="cardIssued">Type: {credential.type}</p>
              {isRevokedCredential(credential) && credential.revokedAt && (
                <p className="cardRevoked">Revoked: {new Date(credential.revokedAt).toLocaleDateString()}</p>
              )}
            </div>
            <span className={`cardStatus ${isRevokedCredential(credential) ? 'revoked' : 'active'}`}>
              {isRevokedCredential(credential) ? 'Revoked' : 'Active'}
            </span>
          </div>
        ))}
      </main>
      <TabBar />
    </div>
  );
}
