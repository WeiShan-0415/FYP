// App.jsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './homepage.jsx'
import TabBar from './TabBar.jsx'
import Credential from './credential.jsx'
import DidPage from './didpage.jsx'
import Verification from './verification.jsx'
import Profile from './profile.jsx'
import ShareDid from './sharedid.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/credential" element={<Credential />} />
        <Route path="/didpage" element={<DidPage />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sharedid" element={<ShareDid />} />
      </Routes>
      <TabBar />
    </>
  )
}

export default App
