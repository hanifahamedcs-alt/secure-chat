let myName = "", myPeerId = "", room = "", isHost = false, peer = null, intentionalLogout = false;
let connections = {}, roomRoster = [], activeCall = null, pendingIncomingCall = null, localStream = null;
let isMicMuted = false, isCamDisabled = false, isScreenSharing = false, soundEnabled = true;
let ringtoneInterval = null, unreadCount = 0;
const originalTitle = document.title;

let incomingChunkBuffers = {}, pendingOutbox = [], activeBlobUrls = new Set();
let activeReplyContext = null, isSecretMode = false;
let typingTimeout = null, lastTypingSent = 0, mediaRecorder = null, audioChunks = [], isRecordingVoice = false;
let wakeLockSentinel = null, silentKeepAliveOsc = null, heartbeatTimer = null, hostCheckTimer = null, failoverTimer = null, audioCtx = null;

// Dedicated Metered TURN Servers
const iceServersConfig = [
  { urls: "stun:stun.relay.metered.ca:80" },
  { urls: "turn:global.relay.metered.ca:80", username: "8d48358ef1172e5a21330cc9", credential: "3YwSHB1bbUMRfcnJ" },
  { urls: "turn:global.relay.metered.ca:80?transport=tcp", username: "8d48358ef1172e5a21330cc9", credential: "3YwSHB1bbUMRfcnJ" },
  { urls: "turn:global.relay.metered.ca:443", username: "8d48358ef1172e5a21330cc9", credential: "3YwSHB1bbUMRfcnJ" },
  { urls: "turns:global.relay.metered.ca:443?transport=tcp", username: "8d48358ef1172e5a21330cc9", credential: "3YwSHB1bbUMRfcnJ" }
];

function toggleModal(id, show) {
  const el = document.getElementById(id);
  if (el) show ? el.classList.remove('hidden') : el.classList.add('hidden');
}

function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('-translate-x-full');
  document.getElementById('sidebarBackdrop').classList.toggle('hidden');
}

// ==================== FIX 1: BLOB URL CONVERTER FOR ZERO-LEAK IMAGES ====================
function dataUrlToBlobUrl(dataUrl) {
  try {
    if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    const blobUrl = URL.createObjectURL(new Blob([u8arr], { type: mime }));
    activeBlobUrls.add(blobUrl);
    return blobUrl;
  } catch (e) {
    return dataUrl;
  }
}

function revokeAllBlobUrls() {
  activeBlobUrls.forEach(url => { try { URL.revokeObjectURL(url); } catch (e) {} });
  activeBlobUrls.clear();
}

// ==================== FIX 2: AUDIO CONTEXT AUTOPLAY UNLOCKER ====================
function initAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

document.addEventListener('pointerdown', () => {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}, { passive: true });

function playMessageTone() {
  if (!soundEnabled) return;
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.26);
  } catch (e) {}
}

function playBuzzTone() {
  if (!soundEnabled) return;
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(140, audioCtx.currentTime); osc.frequency.linearRampToValueAtTime(90, audioCtx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.22, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.48);
    osc.connect(gain); gain.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.5);
  } catch (e) {}
}

function startRingtone() {
  stopRingtone();
  if (navigator.vibrate) navigator.vibrate([400, 200, 400, 1000]);
  const pulse = () => {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      const o1 = audioCtx.createOscillator(), o2 = audioCtx.createOscillator(), g = audioCtx.createGain();
      o1.type = 'triangle'; o2.type = 'sine'; o1.frequency.setValueAtTime(440, audioCtx.currentTime); o2.frequency.setValueAtTime(554.37, audioCtx.currentTime);
      g.gain.setValueAtTime(0.18, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      o1.connect(g); o2.connect(g); g.connect(audioCtx.destination); o1.start(); o2.start(); o1.stop(audioCtx.currentTime + 0.62); o2.stop(audioCtx.currentTime + 0.62);
    } catch (e) {}
  };
  pulse();
  ringtoneInterval = setInterval(pulse, 1800);
}

function stopRingtone() { if (ringtoneInterval) { clearInterval(ringtoneInterval); ringtoneInterval = null; } if (navigator.vibrate) navigator.vibrate(0); }

function toggleSoundAlerts() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('soundToggleBtn');
  btn.textContent = soundEnabled ? 'ON' : 'OFF';
  btn.className = soundEnabled ? 'px-2.5 py-0.5 rounded-lg theme-accent text-[11px] font-semibold' : 'px-2.5 py-0.5 rounded-lg bg-gray-700 text-gray-300 text-[11px] font-semibold';
}

let toastTimeout = null;
function showToast(title, body, onClickAction = null) {
  const toast = document.getElementById('toastBanner');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastBody').textContent = body;
  toast.onclick = () => {
    if (onClickAction) onClickAction();
    toast.classList.add('hidden');
  };
  toast.classList.remove('hidden');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add('hidden'), 3600);
}

function triggerIncomingNotification(title, body, isCall = false) {
  if (isCall) startRingtone(); else { playMessageTone(); showToast(title, body); }
  if (document.hidden) { unreadCount++; document.title = `(${unreadCount}) ${title}`; }
  if ('Notification' in window && Notification.permission === 'granted' && (document.hidden || isCall)) {
    const n = new Notification(title, { body, tag: isCall ? 'cypher-call' : 'cypher-msg', renotify: true });
    n.onclick = () => { window.focus(); n.close(); };
  }
}

// ==================== CONNECTION ENGINE & FIX 4: AUTO HOST FAILOVER ====================
function sanitize(str) { return str.trim().toLowerCase().replace(/[^a-z0-9]/g, ''); }

function enterRoom() {
  myName = document.getElementById('userNameInput').value.trim();
  const rawRoom = document.getElementById('roomNameInput').value.trim();
  if (!myName || !rawRoom) { alert('Enter both your name and room code.'); return; }
  room = sanitize(rawRoom);
  if (!room) { alert('Room code must contain letters or numbers.'); return; }

  intentionalLogout = false;
  initAudioContext();
  if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  enableBackgroundPersistence();

  const statusEl = document.getElementById('authStatus');
  statusEl.textContent = 'Connecting to TURN relay...';
  statusEl.classList.remove('hidden');
  tryHostRole();
}

function tryHostRole() {
  if (peer && !peer.destroyed) { try { peer.destroy(); } catch (e) {} }
  peer = new Peer(room + '-host', { debug: 1, config: { iceServers: iceServersConfig, iceCandidatePoolSize: 10 } });
  peer.on('open', (id) => {
    isHost = true; myPeerId = id; setupInterface(); updateParticipantsUI();
    peer.on('connection', (conn) => registerPeerConnection(conn));
  });
  peer.on('error', (err) => {
    if (err.type === 'unavailable-id') {
      try { peer.destroy(); } catch (e) {}
      joinAsGuest();
    }
  });
  setupCallHandler();
}

function joinAsGuest() {
  if (peer && !peer.destroyed) { try { peer.destroy(); } catch (e) {} }
  peer = new Peer(room + '-guest-' + Math.floor(1000 + Math.random() * 9000), { debug: 1, config: { iceServers: iceServersConfig, iceCandidatePoolSize: 10 } });
  peer.on('open', (id) => {
    isHost = false; myPeerId = id; setupInterface(); updateParticipantsUI();
    const conn = peer.connect(room + '-host', { reliable: true, metadata: { name: myName } });
    registerPeerConnection(conn);

    if (hostCheckTimer) clearTimeout(hostCheckTimer);
    hostCheckTimer = setTimeout(() => {
      if (!intentionalLogout && Object.keys(connections).length === 0) {
        tryHostRole();
      }
    }, 4500);
  });
  peer.on('connection', (conn) => registerPeerConnection(conn));
  setupCallHandler();
}

function setupInterface() {
  toggleModal('authOverlay', false);
  document.getElementById('myNameLabel').textContent = myName;
  document.getElementById('myAvatar').textContent = myName[0].toUpperCase();
  document.getElementById('roomLabel').textContent = room;
  document.getElementById('headerRoomTitle').textContent = `Room: #${room}`;
}

function registerPeerConnection(conn) {
  conn.on('open', () => {
    if (hostCheckTimer) { clearTimeout(hostCheckTimer); hostCheckTimer = null; }
    if (failoverTimer) { clearTimeout(failoverTimer); failoverTimer = null; }

    connections[conn.peer] = { conn, name: conn.metadata?.name || 'Host' };
    conn.send({ type: 'JOIN', peerId: myPeerId, name: myName });
    if (!isHost) conn.send({ type: 'REQ_ROSTER' });
    updateParticipantsUI();
    flushPendingOutbox();
  });

  conn.on('data', (data) => {
    if (data.type === 'JOIN') {
      connections[conn.peer] = { conn, name: data.name };
      appendSystemNotice(`${data.name} connected`);
      playMessageTone(); updateParticipantsUI();
      if (isHost) syncRosterToGuests();
      flushPendingOutbox();
    } else if (data.type === 'REQ_ROSTER') {
      if (isHost) syncRosterToGuests();
    } else if (data.type === 'ROSTER') {
      roomRoster = data.members; renderGuestRoster(data.members);
    } else if (data.type === 'TYPING') {
      showRemoteTyping(data.senderName);
      if (isHost) relayToOthers(conn.peer, data);
    } else if (data.type === 'CHUNK_START') {
      incomingChunkBuffers[data.transferId] = {
        chunks: new Array(data.totalChunks),
        received: 0,
        total: data.totalChunks,
        senderName: data.senderName,
        meta: data.meta,
        createdAt: Date.now()
      };
      showTransferProgress('Receiving media...', 5);
      if (isHost) relayToOthers(conn.peer, data);
    } else if (data.type === 'CHUNK_DATA') {
      const buf = incomingChunkBuffers[data.transferId];
      if (buf) {
        buf.chunks[data.index] = data.slice;
        buf.received++;
        const pct = Math.round((buf.received / buf.total) * 100);
        showTransferProgress(`Receiving (${pct}%)`, pct);
      }
      if (isHost) relayToOthers(conn.peer, data);
    } else if (data.type === 'CHUNK_END') {
      const buf = incomingChunkBuffers[data.transferId];
      if (buf) {
        const fullDataUrl = buf.chunks.join('');
        const m = buf.meta;
        const displaySrc = (m.msgMode === 'photo' || m.msgMode === 'image') ? dataUrlToBlobUrl(fullDataUrl) : fullDataUrl;
        appendMessage(buf.senderName, displaySrc, 'incoming', m.time, m.msgMode, m.msgId, m);
        triggerIncomingNotification(buf.senderName, m.isDual ? '📸 Split-Reality Dual Snap' : m.msgMode === 'photo' ? '🖼️ Photo' : '🎤 Voice Note', false);
        delete incomingChunkBuffers[data.transferId];
      }
      hideTransferProgress();
      if (isHost) relayToOthers(conn.peer, data);
    } else if (data.type === 'CHAT') {
      document.getElementById('typingIndicatorBar').classList.add('hidden');
      appendMessage(data.senderName, data.content, 'incoming', data.time, data.msgMode || 'text', data.msgId, { quote: data.quote });
      triggerIncomingNotification(data.senderName, data.msgMode === 'secret' ? '💣 Secret message' : data.content, false);
      if (isHost) relayToOthers(conn.peer, data);
    } else if (typeof handleGamePacket === 'function') {
      handleGamePacket(conn, data);
    }
  });

  conn.on('close', () => {
    const leftName = connections[conn.peer]?.name || 'Peer';
    const wasHostConn = conn.peer === room + '-host';
    if (typeof cleanupRemoteCursor === 'function') cleanupRemoteCursor(conn.peer);
    delete connections[conn.peer];
    appendSystemNotice(`${leftName} disconnected`);
    updateParticipantsUI();

    if (isHost) {
      syncRosterToGuests();
    } else if (wasHostConn && !intentionalLogout && room) {
      // Fix 4: Host dropped—elect new host automatically after randomized jitter
      appendSystemNotice('Host left—migrating room host...');
      const jitter = 1400 + Math.floor(Math.random() * 1000);
      failoverTimer = setTimeout(() => {
        if (!intentionalLogout && room && Object.keys(connections).length === 0) {
          tryHostRole();
        }
      }, jitter);
    }
  });
}

function relayToOthers(excludePeerId, data) {
  for (const [id, peerObj] of Object.entries(connections)) {
    if (id !== excludePeerId && peerObj.conn && peerObj.conn.open) peerObj.conn.send(data);
  }
}

// ==================== FIX 5: DELIVERY COUNT & OFFLINE OUTBOX QUEUE ====================
function broadcastData(payload, queueIfOffline = false) {
  let sentCount = 0;
  for (const peerObj of Object.values(connections)) {
    if (peerObj.conn && peerObj.conn.open) {
      peerObj.conn.send(payload);
      sentCount++;
    }
  }
  if (sentCount === 0 && queueIfOffline) {
    pendingOutbox.push(payload);
  }
  return sentCount;
}

function flushPendingOutbox() {
  if (pendingOutbox.length === 0) return;
  const openPeers = Object.values(connections).filter(p => p.conn && p.conn.open);
  if (openPeers.length === 0) return;

  while (pendingOutbox.length > 0) {
    const item = pendingOutbox.shift();
    openPeers.forEach(p => p.conn.send(item));
    if (item.msgId) {
      const statusEl = document.getElementById(item.msgId + '_status');
      if (statusEl) statusEl.innerHTML = '<i class="fa-solid fa-check-double text-[8px]"></i>';
    }
  }
}

function syncRosterToGuests() {
  const members = [{ id: myPeerId, name: myName }];
  for (const [id, peerObj] of Object.entries(connections)) members.push({ id, name: peerObj.name });
  roomRoster = members;
  for (const peerObj of Object.values(connections)) { if (peerObj.conn.open) peerObj.conn.send({ type: 'ROSTER', members }); }
  renderGuestRoster(members);
}

function updateParticipantsUI() {
  const badge = document.getElementById('connBadge'), countEl = document.getElementById('participantCount');
  const peers = Object.values(connections), total = peers.length + 1;
  countEl.textContent = total;
  if (peers.length === 0) { badge.textContent = 'Always-On • Waiting for peers...'; badge.className = 'text-[10px] text-amber-400 font-mono block truncate'; }
  else { badge.textContent = `${total} Active • TURN Connected`; badge.className = 'text-[10px] text-emerald-400 font-mono block truncate'; }

  if (isHost) syncRosterToGuests();
  else {
    roomRoster = [{ id: myPeerId, name: myName }];
    for (const [id, p] of Object.entries(connections)) roomRoster.push({ id, name: p.name });
    renderGuestRoster(roomRoster);
  }
}

function renderGuestRoster(members) {
  document.getElementById('participantCount').textContent = members.length;
  document.getElementById('participantsList').innerHTML = members.map(m => `
    <div class="flex items-center gap-2.5 p-2 rounded-xl theme-input border">
      <div class="w-7 h-7 rounded-lg ${m.id === myPeerId ? 'theme-accent' : 'bg-emerald-600 text-white'} flex items-center justify-center font-bold text-xs uppercase shrink-0">${m.name[0]}</div>
      <span class="text-xs font-medium truncate">${escapeHTML(m.name)} ${m.id === myPeerId ? '(You)' : ''}</span>
    </div>
  `).join('');
}

// ==================== 16 KB CHUNKED TRANSFER & FIX 6: BUFFER PURGE ====================
const CHUNK_SIZE = 16384;
async function sendChunkedPayload(dataUrl, meta) {
  const transferId = 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), totalChunks = Math.ceil(dataUrl.length / CHUNK_SIZE);
  showTransferProgress('Sending media...', 5);
  broadcastData({ type: 'CHUNK_START', transferId, totalChunks, senderId: myPeerId, senderName: myName, meta });
  for (let i = 0; i < totalChunks; i++) {
    const slice = dataUrl.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    for (const peerObj of Object.values(connections)) {
      if (peerObj.conn && peerObj.conn.dataChannel) { while (peerObj.conn.dataChannel.bufferedAmount > 262144) await new Promise(r => setTimeout(r, 25)); }
    }
    broadcastData({ type: 'CHUNK_DATA', transferId, index: i, slice });
    const pct = Math.round(((i + 1) / totalChunks) * 100);
    showTransferProgress(`Sending (${pct}%)`, pct);
    await new Promise(r => setTimeout(r, 10));
  }
  broadcastData({ type: 'CHUNK_END', transferId });
  hideTransferProgress();
}

function showTransferProgress(label, pct) {
  document.getElementById('transferStatusText').textContent = label;
  document.getElementById('transferProgressFill').style.width = pct + '%';
  document.getElementById('transferProgressBar').classList.remove('hidden');
}
function hideTransferProgress() { setTimeout(() => document.getElementById('transferProgressBar').classList.add('hidden'), 500); }

async function handleImageUpload(event) {
  const file = event.target.files[0]; if (!file) return; event.target.value = '';
  if (Object.keys(connections).length === 0) { alert('Wait for a partner to join first.'); return; }
  showTransferProgress('Compressing...', 15);
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = async () => {
      const c = document.createElement('canvas'), maxDim = 960; let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) { if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; } else { w = Math.round((w * maxDim) / h); h = maxDim; } }
      c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
      let q = 0.72, dataUrl = c.toDataURL('image/jpeg', q);
      while (Math.round((dataUrl.length * 3) / 4) > 220 * 1024 && q > 0.25) { q -= 0.1; dataUrl = c.toDataURL('image/jpeg', q); }
      const sizeKB = Math.max(1, Math.round((dataUrl.length * 3) / 4096)), time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msgId = 'msg_' + Date.now();
      const blobUrl = dataUrlToBlobUrl(dataUrl);
      appendMessage(myName, blobUrl, 'outgoing', time, 'photo', msgId, { sizeKB });
      await sendChunkedPayload(dataUrl, { msgId, msgMode: 'photo', sizeKB, time });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ==================== CHAT MESSAGING & MEMORY CLEANUP ====================
function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('messageInput'), text = input.value.trim(); if (!text) return;
  toggleModal('pickerPopover', false);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mode = isSecretMode ? 'secret' : 'text', msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const quoteData = activeReplyContext ? { ...activeReplyContext } : null;

  const sentCount = broadcastData({ type: 'CHAT', msgId, msgMode: mode, senderId: myPeerId, senderName: myName, content: text, quote: quoteData, time }, true);
  appendMessage(myName, text, 'outgoing', time, mode, msgId, { quote: quoteData, queued: sentCount === 0 });
  input.value = ''; cancelReply();
}

function appendMessage(sender, content, direction, time, mode = 'text', msgId = '', meta = {}) {
  const container = document.getElementById('messagesContainer'), isOut = direction === 'outgoing';
  if (!msgId) msgId = 'msg_' + Date.now();

  while (container.children.length > 120) {
    const oldest = container.firstChild;
    const oldImg = oldest.querySelector ? oldest.querySelector('img') : null;
    if (oldImg && oldImg.src && oldImg.src.startsWith('blob:')) {
      try { URL.revokeObjectURL(oldImg.src); activeBlobUrls.delete(oldImg.src); } catch (e) {}
    }
    container.removeChild(oldest);
  }

  const msgDiv = document.createElement('div'); msgDiv.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'} group`;
  const senderTag = !isOut ? `<span class="text-[10px] font-semibold theme-muted mb-1 ml-1">${escapeHTML(sender)}</span>` : '';
  const safeSnippet = mode === 'text' ? content.replace(/'/g, "\\'").replace(/"/g, '&quot;') : `[${mode}]`;
  const replyBtn = `<button onclick="setReplyQuote('${escapeHTML(sender)}', '${safeSnippet}')" class="opacity-0 group-hover:opacity-100 text-[10px] theme-muted hover:text-indigo-400 px-1.5"><i class="fa-solid fa-reply"></i></button>`;
  const quoteBlock = meta.quote ? `<div class="mb-1.5 px-2.5 py-1 rounded-lg bg-black/25 border-l-2 border-indigo-400 text-[10px] opacity-85"><div class="font-bold">${escapeHTML(meta.quote.sender)}</div><div class="truncate">${escapeHTML(meta.quote.text)}</div></div>` : '';
  const statusBadge = isOut ? `<span id="${msgId}_status" class="ml-1">${meta.queued ? '<span class="text-amber-300" title="Queued until peer connects">⏳</span>' : '<i class="fa-solid fa-check-double text-[8px]"></i>'}</span>` : '';

  if (mode === 'sticker') {
    msgDiv.innerHTML = `${senderTag}<div class="px-2 py-1"><span class="sticker-anim">${content}</span><div class="text-[9px] theme-muted mt-0.5">${time}${statusBadge}</div></div>`;
  } else if (mode === 'photo' || mode === 'image') {
    msgDiv.innerHTML = `${senderTag}<div class="max-w-[82%] md:max-w-[55%] p-2 rounded-2xl ${isOut ? 'theme-accent rounded-br-none' : 'theme-bubble-in border rounded-bl-none'} shadow">${meta.isDual ? `<div class="text-[10px] font-bold mb-1">📸 Split-Reality Dual Snap</div>` : ''}<img src="${content}" onclick="openLightbox(this.src)" class="rounded-xl max-h-64 w-full object-cover cursor-zoom-in" /><div class="text-[9px] opacity-80 text-right mt-1">${time}${statusBadge}</div></div>`;
  } else if (mode === 'scratch') {
    const scId = 'sc_' + Math.random().toString(36).substr(2, 7);
    msgDiv.innerHTML = `${senderTag}<div class="w-64 p-2.5 rounded-2xl theme-panel border shadow-lg"><div class="text-[10px] font-bold text-amber-400 mb-1.5">🎟️ Scratch Card</div><div class="relative h-20 rounded-xl overflow-hidden bg-indigo-950/60 flex items-center justify-center p-2 text-center"><span class="text-xs font-bold text-white">${escapeHTML(content)}</span><canvas id="${scId}" width="240" height="80" class="absolute inset-0 w-full h-full cursor-pointer touch-none"></canvas></div></div>`;
    container.appendChild(msgDiv); container.scrollTop = container.scrollHeight;
    if (typeof initScratchCanvas === 'function') initScratchCanvas(scId);
    return;
  } else if (mode === 'audio') {
    msgDiv.innerHTML = `${senderTag}<div class="max-w-[85%] px-3 py-2 rounded-2xl ${isOut ? 'theme-accent rounded-br-none' : 'theme-bubble-in border rounded-bl-none'} shadow"><div class="text-[10px] font-semibold mb-1">🎤 Voice Note</div><audio controls src="${content}" class="h-8 w-52"></audio><div class="text-[9px] opacity-75 text-right mt-1">${time}</div></div>`;
  } else if (mode === 'secret') {
    const uid = 'sec_' + Math.random().toString(36).substr(2, 7);
    msgDiv.innerHTML = `${senderTag}<div id="${uid}" onclick="revealSecret('${uid}')" class="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs border border-amber-500/50 bg-amber-950/40 text-amber-100 cursor-pointer"><div class="text-[10px] font-bold text-amber-400 mb-1">💣 <span id="${uid}_timer">Tap to reveal</span></div><p id="${uid}_text" class="${isOut ? '' : 'secret-blurred'}">${escapeHTML(content)}</p></div>`;
    if (isOut) setTimeout(() => startSelfDestruct(uid), 1000);
  } else {
    msgDiv.innerHTML = `${senderTag}<div class="flex items-center gap-1 ${isOut ? 'flex-row-reverse' : 'flex-row'} max-w-[88%] md:max-w-[72%]"><div class="px-3.5 py-2.5 rounded-2xl text-xs md:text-sm ${isOut ? 'theme-accent rounded-br-none' : 'theme-bubble-in border rounded-bl-none'} shadow">${quoteBlock}<p class="break-words">${escapeHTML(content)}</p><div class="text-[9px] opacity-75 text-right mt-1">${time}${statusBadge}</div></div>${replyBtn}</div>`;
  }
  container.appendChild(msgDiv); container.scrollTop = container.scrollHeight;
}

function clearChat() {
  incomingChunkBuffers = {};
  pendingOutbox = [];
  revokeAllBlobUrls();
  document.getElementById('messagesContainer').innerHTML = `<div class="text-center my-2"><span class="text-[10px] theme-muted bg-white/5 px-3 py-1 rounded-full">Chat, Blob URLs & RAM cleared</span></div>`;
}

function logoutRoom() {
  intentionalLogout = true;
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  if (hostCheckTimer) clearTimeout(hostCheckTimer);
  if (failoverTimer) clearTimeout(failoverTimer);
  if (wakeLockSentinel) { wakeLockSentinel.release().catch(() => {}); wakeLockSentinel = null; }
  if (silentKeepAliveOsc) { try { silentKeepAliveOsc.stop(); } catch (e) {} silentKeepAliveOsc = null; }
  if (typeof stopAllGamesAndLoops === 'function') stopAllGamesAndLoops();
  stopRingtone(); endCall();
  for (const p of Object.values(connections)) { if (p.conn) p.conn.close(); }
  connections = {}; roomRoster = []; incomingChunkBuffers = {}; pendingOutbox = [];
  if (peer) { peer.destroy(); peer = null; }
  room = ""; clearChat();
  toggleModal('authOverlay', true);
}

// ==================== HELPERS & FIX 3: SCREEN SHARE FALLBACK ====================
function setReplyQuote(sender, snippet) { activeReplyContext = { sender, text: snippet.slice(0, 80) }; document.getElementById('replyTargetSender').textContent = `Replying to ${sender}`; document.getElementById('replyTargetSnippet').textContent = activeReplyContext.text; toggleModal('replyPreviewBanner', true); }
function cancelReply() { activeReplyContext = null; toggleModal('replyPreviewBanner', false); }
function toggleSecretMode() { isSecretMode = !isSecretMode; toggleModal('secretModeBanner', isSecretMode); document.getElementById('secretBtn').classList.toggle('text-amber-400', isSecretMode); }
function notifyTyping() { const now = Date.now(); if (now - lastTypingSent > 1800) { lastTypingSent = now; broadcastData({ type: 'TYPING', senderName: myName }); } }
function showRemoteTyping(name) { document.getElementById('typingUserText').textContent = `${name} is typing...`; toggleModal('typingIndicatorBar', true); clearTimeout(typingTimeout); typingTimeout = setTimeout(() => toggleModal('typingIndicatorBar', false), 2200); }
function revealSecret(id) { const el = document.getElementById(id + '_text'); if (el && el.classList.contains('secret-blurred')) { el.classList.remove('secret-blurred'); startSelfDestruct(id); } }
function startSelfDestruct(id) { let s = 10; const t = document.getElementById(id + '_timer'), b = document.getElementById(id); const iv = setInterval(() => { s--; if (t) t.textContent = `${s}s...`; if (s <= 0) { clearInterval(iv); if (b) b.innerHTML = `<span class="text-[11px] italic opacity-60">💥 Burned</span>`; } }, 1000); }
function appendSystemNotice(text) { const c = document.getElementById('messagesContainer'), d = document.createElement('div'); d.className = 'text-center my-1.5'; d.innerHTML = `<span class="text-[10px] theme-muted bg-white/5 px-2.5 py-0.5 rounded-full">${text}</span>`; c.appendChild(d); c.scrollTop = c.scrollHeight; }
function escapeHTML(str) { return String(str).replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t])); }
function openLightbox(src) { document.getElementById('lightboxImg').src = src; toggleModal('imageLightbox', true); }

async function toggleVoiceRecording() {
  const btn = document.getElementById('voiceNoteBtn');
  if (!isRecordingVoice) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream); audioChunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const reader = new FileReader();
        reader.onloadend = async () => {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msgId = 'msg_' + Date.now();
          appendMessage(myName, reader.result, 'outgoing', time, 'audio', msgId);
          await sendChunkedPayload(reader.result, { msgId, msgMode: 'audio', time });
        };
        reader.readAsDataURL(new Blob(audioChunks, { type: 'audio/webm' }));
      };
      mediaRecorder.start(); isRecordingVoice = true; btn.classList.add('bg-rose-600', 'text-white', 'animate-pulse');
    } catch (err) { alert('Mic error: ' + err.message); }
  } else {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    isRecordingVoice = false; btn.classList.remove('bg-rose-600', 'text-white', 'animate-pulse');
  }
}

async function enableBackgroundPersistence() {
  if ('wakeLock' in navigator) { try { wakeLockSentinel = await navigator.wakeLock.request('screen'); } catch (e) {} }
  try {
    initAudioContext();
    if (!silentKeepAliveOsc) {
      silentKeepAliveOsc = audioCtx.createOscillator(); const g = audioCtx.createGain(); g.gain.value = 0.0001;
      silentKeepAliveOsc.frequency.value = 20; silentKeepAliveOsc.connect(g); g.connect(audioCtx.destination); silentKeepAliveOsc.start();
    }
  } catch (e) {}
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    if (intentionalLogout || !room) return;
    // Fix 6: Purge stalled chunk buffers older than 30 seconds
    const now = Date.now();
    for (const [txId, buf] of Object.entries(incomingChunkBuffers)) {
      if (now - buf.createdAt > 30000) delete incomingChunkBuffers[txId];
    }
    if (peer && !peer.destroyed && peer.socket && peer.socket._open) peer.socket.send({ type: 'HEARTBEAT' });
    if (peer && peer.disconnected && !peer.destroyed) peer.reconnect();
  }, 10000);
}

function setupCallHandler() {
  peer.on('call', (call) => {
    pendingIncomingCall = call;
    const isVideo = call.metadata?.video !== false;
    document.getElementById('incomingCallerName').textContent = call.metadata?.callerName || 'Peer';
    document.getElementById('incomingCallType').textContent = isVideo ? 'Incoming Video Call...' : 'Incoming Voice Call...';
    toggleModal('incomingCallModal', true);
    triggerIncomingNotification('Incoming Call', 'Tap to answer', true);
    call.on('close', () => { stopRingtone(); toggleModal('incomingCallModal', false); pendingIncomingCall = null; });
  });
}

async function acceptIncomingCall() {
  stopRingtone(); toggleModal('incomingCallModal', false); if (!pendingIncomingCall) return;
  const call = pendingIncomingCall; pendingIncomingCall = null; const isVideo = call.metadata?.video !== false;
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo ? { facingMode: 'user', width: { ideal: 640 } } : false });
    toggleModal('callOverlay', true); document.getElementById('localVideo').srcObject = localStream;
    toggleModal('localVideo', isVideo); toggleModal('remoteVideo', isVideo); toggleModal('audioIndicator', !isVideo);
    call.answer(localStream); handleStream(call);
  } catch (e) { call.close(); }
}

function rejectIncomingCall() { stopRingtone(); toggleModal('incomingCallModal', false); if (pendingIncomingCall) { pendingIncomingCall.close(); pendingIncomingCall = null; } }

async function startCall(isVideo) {
  const peerIds = Object.keys(connections); if (peerIds.length === 0) { alert('No peers in room yet.'); return; }
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo ? { facingMode: 'user', width: { ideal: 640 } } : false });
    toggleModal('callOverlay', true); document.getElementById('localVideo').srcObject = localStream;
    toggleModal('localVideo', isVideo); toggleModal('remoteVideo', isVideo); toggleModal('audioIndicator', !isVideo);
    handleStream(peer.call(peerIds[0], localStream, { metadata: { video: isVideo, callerName: myName } }));
  } catch (err) { alert('Media error: ' + err.message); }
}

function handleStream(call) {
  activeCall = call;
  call.on('stream', async (stream) => {
    const v = document.getElementById('remoteVideo');
    v.srcObject = stream;
    if (stream.getVideoTracks().length > 0) {
      toggleModal('remoteVideo', true);
      toggleModal('audioIndicator', false);
    }
    try { await v.play(); } catch (e) {}
  });
  call.on('close', () => endCall());
}

function toggleMic() { if (!localStream) return; isMicMuted = !isMicMuted; localStream.getAudioTracks().forEach(t => t.enabled = !isMicMuted); document.getElementById('micBtn').classList.toggle('bg-rose-600', isMicMuted); }
function toggleCam() { if (!localStream) return; isCamDisabled = !isCamDisabled; localStream.getVideoTracks().forEach(t => t.enabled = !isCamDisabled); document.getElementById('camBtn').classList.toggle('bg-rose-600', isCamDisabled); }

async function toggleScreenShare() {
  if (!activeCall) { alert('Start a Voice or Video call first.'); return; }
  const btn = document.getElementById('screenShareBtn');
  if (!isScreenSharing) {
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true }), track = s.getVideoTracks()[0];
      const sender = activeCall.peerConnection.getSenders().find(x => x.track && x.track.kind === 'video');
      if (sender) {
        await sender.replaceTrack(track);
      } else {
        // Fix 3: Support adding screen track during an audio-only call
        activeCall.peerConnection.addTrack(track, s);
      }
      document.getElementById('localVideo').srcObject = s;
      toggleModal('localVideo', true);
      toggleModal('remoteVideo', true);
      toggleModal('audioIndicator', false);
      isScreenSharing = true;
      btn.classList.add('bg-emerald-600');
      track.onended = () => { if (isScreenSharing) toggleScreenShare(); };
    } catch (e) {}
  } else {
    if (localStream && localStream.getVideoTracks()[0]) {
      const sender = activeCall.peerConnection.getSenders().find(x => x.track && x.track.kind === 'video');
      if (sender) await sender.replaceTrack(localStream.getVideoTracks()[0]);
      document.getElementById('localVideo').srcObject = localStream;
    }
    isScreenSharing = false;
    btn.classList.remove('bg-emerald-600');
  }
}

function endCall() {
  stopRingtone(); isScreenSharing = false;
  document.getElementById('screenShareBtn').classList.remove('bg-emerald-600');
  if (activeCall) activeCall.close();
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  toggleModal('callOverlay', false);
}
