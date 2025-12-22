// TabBar.jsx
import './App.css';

export default function TabBar() {
  return (
    <nav className="tabBar" aria-label="Bottom navigation">
      <button className="tabBtn tabActive" aria-current="page">
        <span role="img" aria-label="home">🏠</span>
        <span className="tabLabel">Home</span>
      </button>
      <button className="tabBtn" disabled>
        <span role="img" aria-label="credential">📜</span>
        <span className="tabLabel">VC</span>
      </button>
      <button className="tabBtn" disabled>
        <span role="img" aria-label="key">🔑</span>
        <span className="tabLabel">DID</span>
      </button>
      <button className="tabBtn" disabled>
        <span role="img" aria-label="profile">👤</span>
        <span className="tabLabel">Me</span>
      </button>
    </nav>
  );
}
