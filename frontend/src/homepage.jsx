// HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

export default function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [didResult, setDidResult] = useState(null)
  const [error, setError] = useState(null)

  async function createDid() {
    setLoading(true)
    setError(null)
    setDidResult(null)
    try {
      const res = await fetch('/api/agent/create-did', { method: 'GET' })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || JSON.stringify(json))
      setDidResult(json)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="appShell">
      {/* Top hero header */}
      <div className="header">
        <div className="heroContent">
          <h2 className="greeting">Hello Foo !</h2>
          <button className="avatarBtn" aria-label="Profile">
            <span role="img" aria-label="user">👤</span>
          </button>
        </div>
      </div>

      {/* Main card area */}
      <main className="homeCards">
        <h3 className="homeTitle">Home</h3>

        <button className="menuCard" onClick={createDid} disabled={loading}>
           <img
              src='/DID.png'
              alt="DID"
              className="Icon"
            />
        </button>

        <button className="menuCard" onClick={() => navigate('/credential')}>
          <img
              src='/credential.png'
              alt="Credential"
              className="Icon"
            />
        </button>

        <button className="menuCard" disabled>
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

        {didResult && (
          <div className="card">
            <h4 className="cardTitle">Created DID</h4>
            <pre className="codeBlock">{JSON.stringify(didResult, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
