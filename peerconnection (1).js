// 1. Sanitize the email so it forms a valid Peer ID (letters and numbers only)
function emailToPeerId(email) {
  return 'user_' + btoa(email.trim().toLowerCase()).replace(/=/g, '').replace(/[^a-zA-Z0-9]/g, '');
}

let peer = null;
let activeConnection = null;
let currentCall = null;
let localStream = null;

// 2. Initialize PeerJS after email verification
function initializePeerSession(userEmail) {
  const myPeerId = emailToPeerId(userEmail);

  // Connect to the free public PeerJS cloud broker
  peer = new Peer(myPeerId, {
    debug: 2,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ]
    }
  });

  peer.on('open', (id) => {
    console.log('Registered on signaling server with ID:', id);
    alert('Connected! Your network ID is active.');
  });

  // Listen for incoming 1-on-1 data connections (chat)
  peer.on('connection', (conn) => {
    setupConnectionListeners(conn);
  });

  // Listen for incoming audio/video calls
  peer.on('call', async (call) => {
    const accept = confirm(`Incoming call from ${call.peer}. Accept?`);
    if (accept) {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      document.getElementById('localVideo').srcObject = localStream;
      call.answer(localStream);
      setupCallListeners(call);
    } else {
      call.close();
    }
  });

  peer.on('error', (err) => {
    console.error('Peer error:', err);
    if (err.type === 'peer-unavailable') {
      alert('The other user is offline or has not opened their browser yet.');
    } else if (err.type === 'unavailable-id') {
      alert('This ID is already active in another browser tab.');
    }
  });
}

// 3. Connect to a remote friend using their email
function connectToFriend(friendEmail) {
  const targetPeerId = emailToPeerId(friendEmail);
  const conn = peer.connect(targetPeerId, { reliable: true });
  setupConnectionListeners(conn);
}

// 4. Handle incoming and outgoing chat payloads
function setupConnectionListeners(conn) {
  activeConnection = conn;

  conn.on('open', () => {
    console.log('P2P data channel established with:', conn.peer);
    alert('Connected to peer! You can now send encrypted messages.');
  });

  conn.on('data', async (payload) => {
    // payload: { iv, ciphertext, sender }
    console.log('Received raw encrypted packet:', payload);
    
    // Decrypt using your existing SubtleCrypto AES-GCM function
    const decryptedText = await decryptMessage(payload.ciphertext, payload.iv);
    appendMessageToUI(decryptedText, 'incoming');
  });

  conn.on('close', () => {
    alert('Peer disconnected.');
    activeConnection = null;
  });
}

// 5. Send an encrypted message across the web
async function sendMessage(plainText) {
  if (!activeConnection || !activeConnection.open) {
    alert('No active peer connection. Add the peer first.');
    return;
  }

  // Encrypt with AES-GCM
  const { ciphertext, iv } = await encryptMessage(plainText);

  // Transmit over WebRTC DataChannel directly to peer
  activeConnection.send({
    ciphertext: ciphertext,
    iv: iv,
    sender: currentUserEmail
  });

  appendMessageToUI(plainText, 'outgoing');
}

// 6. Start an audio/video call
async function startCall(friendEmail) {
  const targetPeerId = emailToPeerId(friendEmail);
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  document.getElementById('localVideo').srcObject = localStream;

  const call = peer.call(targetPeerId, localStream);
  setupCallListeners(call);
}

function setupCallListeners(call) {
  currentCall = call;
  call.on('stream', (remoteStream) => {
    document.getElementById('remoteVideo').srcObject = remoteStream;
  });
  call.on('close', () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
  });
}