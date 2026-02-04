// App.jsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './homepage.jsx'
import Credential from './credential.jsx'
import DidPage from './didpage.jsx'
import Verification from './verification.jsx'
import Profile from './profile.jsx'
import ShareDid from './sharedid.jsx'
import PostVSuccess from './PostVSucess.jsx'
import PostVFail from './postVFail.jsx'
import CredentialDetails from './credentialDetails.jsx'
import VerificationManual from './verificationManual.jsx'
import History from './history.jsx'
import ProfileDetails from './profileDetail.jsx'
import Login from './login.jsx'
import Registration from './registration.jsx'
import QRScanner from './qrScanner.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/credential" element={<Credential />} />
        <Route path="/didpage" element={<DidPage />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/qrscanner" element={<QRScanner />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sharedid" element={<ShareDid />} />
        <Route path="/postvsuccess" element={<PostVSuccess />} />
        <Route path="/postvfail" element={<PostVFail />} />
        <Route path="/credentialdetails" element={<CredentialDetails />} />
        <Route path="/verificationmanual" element={<VerificationManual />} />
        <Route path="/history" element={<History />} />
        <Route path="/profiledetails" element={<ProfileDetails />} />
      </Routes>
    </>
  )
}

export default App
