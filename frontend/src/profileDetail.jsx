import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';


export default function ProfileDetails() {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState('');
  const [did, setDid] = useState(() => localStorage.getItem('userDID') || '');

  useEffect(() => {
    const storedDID = localStorage.getItem('userDID');
    const user= localStorage.getItem('username');
    if (user) {setUsername(user);}
    if (storedDID) {setDid(storedDID);}
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="appShell">
      {/* Top header */}
      <div className="header">
        <div className="credentialContent">
          <button className="backBtn" onClick={() => navigate('/profile')} aria-label="Back">
            <span>‹</span>
            <span>Back</span>
          </button>
          <h2 className="pageTitle">My Profile</h2>
        </div>
      </div>
      <main className="tallCards">
        <div className="profileDetailsHeader">
          <div className="profileImageContainer">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="profileImage"
              />
            ) : (
              <div className="profileImagePlaceholder">👤</div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="profileImageInput"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="credentialInputSection">
          <h3 className="inputLabel">Full Name:</h3>
          <input
            type="text"
            className="credentialInput"
            style={{color: "grey"}}
            value={username}
            readOnly
          />
        </div>

        <div className="credentialInputSection">
          <h3 className="inputLabel">Decentralized ID (DID):</h3>
          <input
            type="text"
            className="credentialInput"
            style={{color: "grey"}}
            value={did || 'Not available'}
            readOnly
          />
        </div>
      </main>
      <TabBar />
    </div>
  );
}
