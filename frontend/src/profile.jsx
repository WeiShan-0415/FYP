import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import TabBar from './TabBar';


export default function Profile() {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState('');
  useEffect(() => {
    const user = localStorage.getItem('username');
    if (user) setUsername(user);
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
          <button className="backBtn" onClick={() => navigate('/homepage')} aria-label="Back">
            <span>‹</span>
            <span>Back</span>
          </button>
          <h2 className="pageTitle">My Profile</h2>
        </div>
      </div>
      <main className="tallCards">
        <div className="profileHeader">
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
          <div className="profileInfo">
            <h1 className="profileName">{username}</h1>
          </div>
        </div>
        <div className="profileDivider"></div>
        <div className="didCard">
        <div className="didInfoSection">
            <button className="profileButton" onClick={() => navigate('/profiledetails')}>
              <span className="didInfoIcon" style={{marginTop: "10px"}}>
                <img
                  src='/profile.png'
                  alt="Profile Icon"
                />
              </span>
              <div className="didInfoContent">
                <span className="didInfoLabel" style={{marginTop: "15px"}}>Profile</span>
              </div>
            </button>

            <button className="profileButton">
              <span className="didInfoIcon">
                <img
                  src='/summary.png'
                  alt="Summary"
                />
              </span>
              <div className="didInfoContent">
                <span className="didInfoLabel" style={{marginTop: "5px"}}>Activity Summary</span>
              </div>
            </button>

            <button className="profileButton">
              <span className="didInfoIcon">
                <img
                  src='/lock.png'
                  alt="DID Management"
                />
              </span>
              <div className="didInfoContent">
                <span className="didInfoLabel" style={{marginTop: "8px"}}>DID Management</span>
              </div>
            </button>

            <button className="profileButton">
              <span className="didInfoIcon">
                <img
                  src='/help.png'
                  alt="Help"
                />
              </span>
              <div className="didInfoContent">
                <span className="didInfoLabel" style={{marginTop: "7px"}}>Help</span>
              </div>
            </button>
          </div>
          <button className="profileButton" style={{margin: "25px", justifyContent: "center"}}>
              <div className="didInfoContent" style={{alignItems:"center", justifyContent: "center"}}>
                <span className="didInfoLabel" style={{margin: "10px",color:"red"}}>Log Out</span>
              </div>
            </button>
        </div>
      </main>
      <TabBar />
    </div>
  );
}
