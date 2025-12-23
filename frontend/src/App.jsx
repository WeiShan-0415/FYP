// App.jsx
import { Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './homepage.jsx'
import TabBar from './TabBar.jsx'
import Credential from './credential.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/credential" element={<Credential />} />
      </Routes>
      <TabBar />
    </>
  )
}

export default App
