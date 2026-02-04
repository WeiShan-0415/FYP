import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import './App.css';
import TabBar from './TabBar';

export default function QRScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Unable to access camera. Please check permissions.');
        console.error('Camera access error:', err);
      }
    };

    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isScanning || !videoRef.current) return;

    const scanQRCode = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        // Only proceed if video has valid dimensions
        if (videoWidth > 0 && videoHeight > 0) {
          canvas.width = videoWidth;
          canvas.height = videoHeight;

          ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

          try {
            const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
            const code = jsQR(imageData.data, videoWidth, videoHeight);

            if (code) {
              try {
                // Parse QR code data - format is "Name: USERNAME\nDID: DID_VALUE"
                const lines = code.data.split('\n');
                let name = null;
                let did = null;

                lines.forEach(line => {
                  if (line.startsWith('Name:')) {
                    name = line.replace('Name:', '').trim();
                  } else if (line.startsWith('DID:')) {
                    did = line.replace('DID:', '').trim();
                  }
                });

                if (!name || !did) {
                  setError('Invalid QR code format. Missing name or DID.');
                  return;
                }

                // Extract wallet address from DID (did:ethr:sepolia:0x...)
                const walletAddress = did.split(':')[3];

                if (!walletAddress) {
                  setError('Invalid DID format.');
                  return;
                }

                // Stop scanning and camera stream
                setIsScanning(false);
                stopCamera();

                // Call the check-did-with-username endpoint
                verifyUserWithDID(walletAddress, name);
              } catch (parseError) {
                setError('Invalid QR code data format.');
                console.error('QR code parse error:', parseError);
              }
            }
          } catch (err) {
            console.error('Canvas error:', err);
          }
        }
      }

      if (isScanning) {
        requestAnimationFrame(scanQRCode);
      }
    };

    const frameId = requestAnimationFrame(scanQRCode);

    return () => cancelAnimationFrame(frameId);
  }, [isScanning]);

  const verifyUserWithDID = async (walletAddress, username) => {
    try {
      const response = await fetch('/api/agent/check-did-with-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          username: username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      // Check if DID exists and username matches
      if (data.exists && data.usernameMatch) {
        // Verification successful - navigate to success page
        navigate('/postvsuccess', { state: { credential: { name: username, did: walletAddress } } });
      } else {
        // Verification failed
        setError('Verification failed. User or credential not found.');
        navigate('/postvfail');
      }
    } catch (err) {
      setError('Error verifying credential: ' + err.message);
      console.error('Verification error:', err);
    }
  };

  return (
    <div className="appShell">
      {/* Top header */}
      <div className="header">
        <div className="credentialContent">
          <button
            className="backBtn"
            onClick={() => navigate('/verification')}
            aria-label="Back"
          >
            <span>‹</span>
            <span>Back</span>
          </button>
          <h2 className="pageTitle">Scan QR Code</h2>
          <button
            className="avatarBtn"
            aria-label="Profile"
            onClick={() => navigate('/profile')}
          >
            <span role="img" aria-label="user">
              👤
            </span>
          </button>
        </div>
      </div>

      <main className="qrScannerContainer" style={{ padding: '20px' }}>
        {error && (
          <div
            style={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #4a90e2',
            backgroundColor: '#000',
            aspectRatio: '1 / 1',
          }}
        >
          <video
            ref={videoRef}
            autoPlay={true}
            playsInline={true}
            muted={true}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              objectFit: 'cover',
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              display: 'none',
            }}
          />
        </div>

        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
          }}
        >
          <p>Point your camera at a QR code to scan</p>
        </div>

        <button
          className="buttonContainer"
          style={{
            marginTop: '30px',
            width: '90%',
          }}
          onClick={() => navigate('/verification')}
        >
          <span className="buttonText">Cancel Scan</span>
        </button>
      </main>

      <TabBar />
    </div>
  );
}
