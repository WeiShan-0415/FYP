import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
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
    <div className="App" style={{ padding: 20 }}>
      <div style={{ marginTop: 24 }}>
        <button onClick={createDid} disabled={loading}>
          {loading ? 'Creating DID…' : 'Create DID'}
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {error && (
          <div style={{ color: 'crimson' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {didResult && (
          <div>
            <h3>Created DID</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(didResult, null, 2)}
            </pre>
          </div>
        )}

        {!didResult && !error && (
          <div style={{ color: '#666' }}>Click the button to create a DID via the serverless Veramo agent.</div>
        )}
      </div>
    </div>
  )
}

export default App
