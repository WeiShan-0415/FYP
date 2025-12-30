import './App.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  return (
    <nav className="tabBar" aria-label="Bottom navigation">
      <button className={`tabBtn ${isActive('/homepage') ? 'tabActive' : ''}`} aria-current={isActive('/homepage') ? 'page' : undefined} onClick={() => navigate('/homepage')}>
        <span role="img" aria-label="home">
          <img src={isActive('/homepage') ? '/home_white.png' : '/home.png'} alt="home icon" style={{width:'20px', marginTop:'4px'}}/>
          </span>
        <span className="tabLabel">Home</span>
      </button>
      <button className={`tabBtn ${isActive('/didpage') ? 'tabActive' : ''}`} onClick={() => navigate('/didpage')}>
        <img src={isActive('/didpage') ? '/Key_white.png' : '/Key.png'} alt="key icon" style={{width:'20px', marginTop:'4px'}}/>
        <span className="tabLabel">DID</span>
      </button>

      <button className={`tabBtn ${isActive('/credential') ? 'tabActive' : ''}`} onClick={() => navigate('/credential')}>
        <img src={isActive('/credential') ? '/Award_white.png' : '/Award.png'} alt="award icon" style={{width:'20px', marginTop:'4px'}}/>

        <span className="tabLabel">VC</span>
      </button>
      
      <button className={`tabBtn ${isActive('/verification') ? 'tabActive' : ''}`} onClick={() => navigate('/verification')}>
        <img src={isActive('/verification') ? '/Check_white.png' : '/Check.png'} alt="check icon" style={{width:'20px', marginTop:'4px'}}/>

        <span className="tabLabel">Verify</span>
      </button>
    </nav>
  );
}
