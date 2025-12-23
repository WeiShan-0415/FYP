import './App.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  return (
    <nav className="tabBar" aria-label="Bottom navigation">
      <button className={`tabBtn ${isActive('/') ? 'tabActive' : ''}`} aria-current={isActive('/') ? 'page' : undefined} onClick={() => navigate('/')}>
        <span role="img" aria-label="home">🏠</span>
        <span className="tabLabel">Home</span>
      </button>
      <button className={`tabBtn ${isActive('/credential') ? 'tabActive' : ''}`} onClick={() => navigate('/credential')}>
        <span role="img" aria-label="credential">📜</span>
        <span className="tabLabel">VC</span>
      </button>
      <button className="tabBtn">
        <span role="img" aria-label="key">🔑</span>
        <span className="tabLabel">DID</span>
      </button>
      <button className="tabBtn" >
        <span role="img" aria-label="profile">👤</span>
        <span className="tabLabel">Me</span>
      </button>
    </nav>
  );
}
