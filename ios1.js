// 1. Mobile-friendly Peer initialization with free TURN relay fallback
peer = new Peer(myPeerId, {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Free public OpenRelay TURN credentials for mobile cellular bypass
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  }
});

// 2. Mobile-safe getUserMedia constraints (front camera default)
async function getMobileMediaStream(isVideo) {
  const constraints = {
    audio: {
      echoCancellation: true,
      noiseSuppression: true
    },
    video: isVideo ? {
      facingMode: 'user', // Defaults to selfie/front camera on mobile
      width: { ideal: 640 },
      height: { ideal: 480 }
    } : false
  };
  return await navigator.mediaDevices.getUserMedia(constraints);
}

// 3. Mobile-safe Stream Player (prevents iOS autoplay silence)
function handleCallStream(call) {
  activeCall = call;

  call.on('stream', async (remoteStream) => {
    const remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = remoteStream;

    try {
      // Force play promise on iOS/Android
      await remoteVideo.play();
    } catch (err) {
      console.warn('Autoplay prevented. User interaction required:', err);
      // Fallback: tap overlay to resume audio/video
      document.getElementById('callOverlay').onclick = () => {
        remoteVideo.play();
      };
    }
  });

  call.on('close', () => endCall());
}