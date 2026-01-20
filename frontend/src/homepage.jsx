import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';

export default function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [username, setUsername] = useState('')
  useEffect(() => {
    const user = localStorage.getItem('username') 
    if (user) {setUsername(user)}  
  }, [])

  return (
    <div className="appShell">
      {/* Top hero header */}
      <div className="header">
        <div className="heroContent">
          <h2 className="greeting">Hello {username} !</h2>
          <button className="avatarBtn" aria-label="Profile" onClick={() => navigate('/profile')}>
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
      </div>

      {/* Main card area */}
      <main className="homeCards">
        <h3 className="homeTitle">Home</h3>

        <button className="menuCard" onClick={() => navigate('/didpage')}>
           <img
              src='/DID.png'
              alt="DID"
              className="Icon"
            />
        </button>

        <button className="menuCard center" onClick={() => navigate('/credential')}>
          <img
              src='/credential.png'
              alt="Credential"
              className="Icon"
            />
        </button>

        <button className="menuCard center" onClick={() => navigate('/verification')}>
          <img
              src='/verification.png'
              alt="Verification"
              className="Icon"
            />
        </button>

        {error && (
          <div className="card error">
            <strong>Error:</strong> {error}
          </div>
        )}
      </main>
      <TabBar />
    </div>
  );
}
