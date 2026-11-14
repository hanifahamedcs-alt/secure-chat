// ==================== THEMES ====================
const themes = {
  indigo: { '--bg-main': '#0b0e14', '--bg-panel': '#0f172a', '--bg-header': '#0e131f', '--bg-input': '#1a2333', '--bg-bubble-in': '#1e293b', '--border-color': '#1f2937', '--text-main': '#f3f4f6', '--text-muted': '#9ca3af', '--accent': '#4f46e5', '--accent-hover': '#4338ca' },
  emerald: { '--bg-main': '#06110d', '--bg-panel': '#0a1c16', '--bg-header': '#081712', '--bg-input': '#112921', '--bg-bubble-in': '#133127', '--border-color': '#1b4335', '--text-main': '#ecfdf5', '--text-muted': '#6ee7b7', '--accent': '#059669', '--accent-hover': '#047857' },
  rose: { '--bg-main': '#13080c', '--bg-panel': '#1f0d14', '--bg-header': '#190a10', '--bg-input': '#2d131d', '--bg-bubble-in': '#361723', '--border-color': '#4c1d2e', '--text-main': '#fff1f2', '--text-muted': '#fda4af', '--accent': '#e11d48', '--accent-hover': '#be123c' },
  amber: { '--bg-main': '#120e06', '--bg-panel': '#1c160a', '--bg-header': '#171208', '--bg-input': '#29200e', '--bg-bubble-in': '#332712', '--border-color': '#453518', '--text-main': '#fffbeb', '--text-muted': '#fcd34d', '--accent': '#d97706', '--accent-hover': '#b45309' },
  violet: { '--bg-main': '#0f071a', '--bg-panel': '#180c29', '--bg-header': '#140a22', '--bg-input': '#24133d', '--bg-bubble-in': '#2e184d', '--border-color': '#3f2269', '--text-main': '#f5f3ff', '--text-muted': '#c4b5fd', '--accent': '#7c3aed', '--accent-hover': '#6d28d9' },
  cyan: { '--bg-main': '#061217', '--bg-panel': '#0a1e26', '--bg-header': '#08181f', '--bg-input': '#102d38', '--bg-bubble-in': '#153947', '--border-color': '#1d4e61', '--text-main': '#ecfeff', '--text-muted': '#67e8f9', '--accent': '#0891b2', '--accent-hover': '#0e7490' },
  obsidian: { '--bg-main': '#09090b', '--bg-panel': '#121215', '--bg-header': '#0e0e11', '--bg-input': '#1c1c21', '--bg-bubble-in': '#24242b', '--border-color': '#2e2e38', '--text-main': '#fafafa', '--text-muted': '#a1a1aa', '--accent': '#52525b', '--accent-hover': '#3f3f46' },
  light: { '--bg-main': '#f1f5f9', '--bg-panel': '#ffffff', '--bg-header': '#ffffff', '--bg-input': '#f8fafc', '--bg-bubble-in': '#e2e8f0', '--border-color': '#cbd5e1', '--text-main': '#0f172a', '--text-muted': '#475569', '--accent': '#2563eb', '--accent-hover': '#1d4ed8' }
};
function applyTheme(k) { const t = themes[k]; if (!t) return; for (const [p, v] of Object.entries(t)) document.documentElement.style.setProperty(p, v); }
function applyCustomAccent(hex) { document.documentElement.style.setProperty('--accent', hex); document.documentElement.style.setProperty('--accent-hover', hex); }

// ==================== PACKET ROUTER FROM CONNECTION.JS ====================
function handleGamePacket(conn, data) {
  switch (data.type) {
    case 'TELEPATHY_START': telepathyGames[data.game.id] = data.game; renderTelepathyCard(data.game, false); break;
    case 'TELEPATHY_GUESS': if (telepathyGames[data.gameId]) { telepathyGames[data.gameId].guesses[data.peerId] = { name: data.name, word: data.word }; updateTelepathyUI(data.gameId); } break;
    case 'PONG_OPEN': openPongModal(false); break;
    case 'PONG_CLOSE': closePongModal(false); break;
    case 'PONG_PADDLE': if (data.isHostPaddle) pongState.p1X = data.x; else pongState.p2X = data.x; break;
    case 'PONG_SYNC': pongState.ballX = data.bx; pongState.ballY = data.by; pongState.s1 = data.s1; pongState.s2 = data.s2; break;
    case 'JUKEBOX_SYNC': jukeboxQueue = data.queue; currentJukeboxTrack = data.current; renderJukeboxUI(); break;
    case 'BLUFF_START': bluffGames[data.game.id] = data.game; renderBluffCard(data.game, false); break;
    case 'BLUFF_GUESS': if (bluffGames[data.gameId]) { bluffGames[data.gameId].guesses[data.peerId] = { name: data.name, idx: data.idx }; updateBluffUI(data.gameId); } break;
    case 'TACTILE_PULSE': triggerTactilePulseEffect(data.senderName, false); break;
    case 'SOUNDSCAPE_SYNC': updateSoundscapeChannel(data.channel, data.val, false); break;
    case 'SOUNDSCAPE_MUTE': muteAllSoundscapes(false); break;
    case 'BEAT_CELL': beatMatrix[data.r][data.c] = data.val; if (data.val) playBeatTrackSound(data.r); renderSequencerGrid(); break;
    case 'BEAT_CLEAR': clearBeatGrid(false); break;
    case 'BEAT_STATE': if (beatPlaying !== data.playing) toggleBeatPlayback(false); break;
    case 'CURSOR_MOVE': updateRemoteCursor(data.peerId, data.name, data.nx, data.ny); break;
    case 'LASER_PING': spawnLaserRing(data.nx * window.innerWidth, data.ny * window.innerHeight); break;
    case 'TIME_CAPSULE': renderTimeCapsuleCard(data.capsule, false); break;
    case 'ROOM_AURA': setRoomAura(data.mode, false); break;
    case 'STORY_CHAIN_UPDATE': { const ex = !!storyChains[data.chain.id]; storyChains[data.chain.id] = data.chain; ex ? updateStoryChainUI(data.chain.id) : renderStoryChainCard(data.chain, false); break; }
    case 'SOUNDBOARD': triggerSoundboard(data.soundId, false); break;
    case 'SYNC_TIMER': renderTimerCard(data.timer, false); break;
    case 'DRAW_STROKE': drawSegment(data.x0, data.y0, data.x1, data.y1, data.color); break;
    case 'DRAW_CLEAR': clearWhiteboard(false); break;
    case 'NEW_POLL': activePolls[data.poll.id] = data.poll; renderPollCard(data.poll, false); break;
    case 'POLL_VOTE': if (activePolls[data.pollId]) { activePolls[data.pollId].options.forEach(o => o.voters = o.voters.filter(v => v !== data.voterId)); activePolls[data.pollId].options[data.optIdx].voters.push(data.voterId); updatePollCardUI(data.pollId); } break;
    case 'RPS_START': rpsGames[data.game.id] = data.game; renderRPSCard(data.game, false); break;
    case 'RPS_MOVE': if (rpsGames[data.gameId]) { rpsGames[data.gameId].moves[data.peerId] = { name: data.name, move: data.move }; updateRPSCardUI(data.gameId); } break;
    case 'TTT_START': tttGames[data.game.id] = data.game; renderTTTCard(data.game, false); break;
    case 'TTT_MOVE': if (tttGames[data.gameId]) { Object.assign(tttGames[data.gameId], { board: data.board, turnId: data.turnId, winnerText: data.winnerText }); updateTTTCardUI(data.gameId); } break;
    case 'TRIVIA_START': triviaGames[data.quiz.id] = data.quiz; renderTriviaCard(data.quiz, false); break;
    case 'TRIVIA_ANSWER': if (triviaGames[data.qId]) { triviaGames[data.qId].answers[data.peerId] = { name: data.name, idx: data.idx }; updateTriviaUI(data.qId); } break;
    case 'SPIN_WHEEL': renderSpinWheelCard(data.wheel, false); break;
  }
  if (isHost) relayToOthers(conn.peer, data);
}

// ==================== CLEANUP ON LOGOUT ====================
function stopAllGamesAndLoops() {
  if (beatTimer) { clearInterval(beatTimer); beatTimer = null; beatPlaying = false; }
  if (pongLoopId) { cancelAnimationFrame(pongLoopId); pongLoopId = null; pongActive = false; }
  if (auraAnimId) { cancelAnimationFrame(auraAnimId); auraAnimId = null; }
  closeDualSnapModal(); muteAllSoundscapes(false);
  liveCursorsEnabled = false; document.getElementById('cursorsLayer').innerHTML = ''; remoteCursorEls = {};
}

// ==================== TELEPATHY, BLUFF, JUKEBOX & PULSE PAD ====================
let telepathyGames = {}, bluffGames = {}, jukeboxQueue = [], currentJukeboxTrack = null;

function launchTelepathyGame() {
  const topic = document.getElementById('telepathyTopicInput').value.trim() || 'Anything';
  toggleModal('telepathyModal', false);
  const game = { id: 'tele_' + Date.now(), topic, guesses: {} };
  telepathyGames[game.id] = game; broadcastData({ type: 'TELEPATHY_START', game }); renderTelepathyCard(game, true);
}
function submitTelepathyWord(id) {
  const w = document.getElementById(id + '_input')?.value.trim(); if (!w || !telepathyGames[id]) return;
  telepathyGames[id].guesses[myPeerId] = { name: myName, word: w }; updateTelepathyUI(id);
  broadcastData({ type: 'TELEPATHY_GUESS', gameId: id, peerId: myPeerId, name: myName, word: w });
}
function renderTelepathyCard(game, isOut) {
  const c = document.getElementById('messagesContainer'), d = document.createElement('div');
  d.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  d.innerHTML = `<div class="w-72 theme-panel border border-purple-500/40 rounded-2xl p-3.5 text-center"><div class="text-[10px] font-bold text-purple-400">🔮 Telepathy Sync</div><p class="text-xs font-bold mb-2">Topic: ${escapeHTML(game.topic)}</p><div id="${game.id}_body"></div></div>`;
  c.appendChild(d); updateTelepathyUI(game.id); c.scrollTop = c.scrollHeight;
}
function updateTelepathyUI(id) {
  const g = telepathyGames[id], b = document.getElementById(id + '_body'); if (!g || !b) return;
  const entries = Object.entries(g.guesses);
  if (entries.length < 2) {
    b.innerHTML = g.guesses[myPeerId] ? `<p class="text-xs text-emerald-400">Locked "${escapeHTML(g.guesses[myPeerId].word)}"...</p>` : `<div class="flex gap-1"><input id="${id}_input" class="flex-1 theme-input border rounded-lg px-2 py-1 text-xs" placeholder="1 word..." /><button onclick="submitTelepathyWord('${id}')" class="px-2.5 py-1 rounded-lg theme-accent text-xs">Lock</button></div>`;
  } else {
    const [p1, p2] = [entries[0][1], entries[1][1]], match = p1.word.toLowerCase() === p2.word.toLowerCase();
    b.innerHTML = `<div class="flex justify-around py-2 bg-white/5 rounded-xl mb-1"><div><b>${escapeHTML(p1.word)}</b><div class="text-[10px]">${escapeHTML(p1.name)}</div></div><div><b>${escapeHTML(p2.word)}</b><div class="text-[10px]">${escapeHTML(p2.name)}</div></div></div><div class="text-xs font-bold ${match ? 'text-emerald-400' : 'text-amber-400'}">${match ? '🎉 MATCH!' : 'Try another round!'}</div>`;
  }
}

function launchBluffCard() {
  const s0 = document.getElementById('bluffStmt0').value.trim(), s1 = document.getElementById('bluffStmt1').value.trim(), s2 = document.getElementById('bluffStmt2').value.trim();
  if (!s0 || !s1 || !s2) return;
  const lieIdx = parseInt(document.querySelector('input[name="lieIndex"]:checked').value, 10);
  toggleModal('bluffModal', false);
  const game = { id: 'bluff_' + Date.now(), author: myName, statements: [s0, s1, s2], lieIdx, guesses: {} };
  bluffGames[game.id] = game; broadcastData({ type: 'BLUFF_START', game }); renderBluffCard(game, true);
}
function guessBluffLie(id, idx) {
  if (!bluffGames[id] || bluffGames[id].guesses[myPeerId] !== undefined) return;
  bluffGames[id].guesses[myPeerId] = { name: myName, idx }; updateBluffUI(id);
  broadcastData({ type: 'BLUFF_GUESS', gameId: id, peerId: myPeerId, name: myName, idx });
}
function renderBluffCard(game, isOut) {
  const c = document.getElementById('messagesContainer'), d = document.createElement('div');
  d.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  d.innerHTML = `<div class="w-72 theme-panel border rounded-2xl p-3.5"><div class="text-[10px] font-bold text-amber-400 mb-1">🎭 Two Truths & A Lie • ${escapeHTML(game.author)}</div><div id="${game.id}_opts" class="space-y-1.5"></div><div id="${game.id}_res" class="text-[10px] theme-muted mt-2"></div></div>`;
  c.appendChild(d); updateBluffUI(game.id); c.scrollTop = c.scrollHeight;
}
function updateBluffUI(id) {
  const g = bluffGames[id], opts = document.getElementById(id + '_opts'), res = document.getElementById(id + '_res'); if (!g || !opts) return;
  const myG = g.guesses[myPeerId];
  opts.innerHTML = g.statements.map((st, i) => `<button onclick="guessBluffLie('${id}', ${i})" class="w-full text-left p-2 rounded-xl border text-xs ${myG !== undefined ? (i === g.lieIdx ? 'bg-rose-600/30 border-rose-500' : 'bg-emerald-600/20 border-emerald-500') : 'theme-input theme-border'}">${escapeHTML(st)}</button>`).join('');
  res.innerHTML = Object.values(g.guesses).map(x => `${escapeHTML(x.name)}: ${x.idx === g.lieIdx ? '🎯 Caught!' : '❌ Fooled!'}`).join(' • ');
}

function addJukeboxTrack() {
  const inp = document.getElementById('jukeboxUrlInput'), m = inp.value.trim().match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^"&?\/\s]{11})/);
  if (!m) { alert('Invalid YouTube URL'); return; }
  inp.value = ''; jukeboxQueue.push({ id: 'trk_' + Date.now(), videoId: m[1], addedBy: myName, votes: 1 });
  if (!currentJukeboxTrack) playNextJukeboxTrack(true);
  else { renderJukeboxUI(); broadcastData({ type: 'JUKEBOX_SYNC', queue: jukeboxQueue, current: currentJukeboxTrack }); }
}
function playNextJukeboxTrack(b = true) { currentJukeboxTrack = jukeboxQueue.shift() || null; renderJukeboxUI(); if (b) broadcastData({ type: 'JUKEBOX_SYNC', queue: jukeboxQueue, current: currentJukeboxTrack }); }
function renderJukeboxUI() {
  const box = document.getElementById('jukeboxPlayerBox'), ifr = document.getElementById('jukeboxIframe');
  document.getElementById('jukeboxCount').textContent = jukeboxQueue.length;
  if (currentJukeboxTrack) { box.classList.remove('hidden'); const u = `https://www.youtube.com/embed/${currentJukeboxTrack.videoId}?autoplay=1`; if (ifr.src !== u) ifr.src = u; document.getElementById('jukeboxNowPlaying').textContent = `By ${currentJukeboxTrack.addedBy}`; }
  else { box.classList.add('hidden'); ifr.src = ''; }
  document.getElementById('jukeboxQueueList').innerHTML = jukeboxQueue.map((t, i) => `<div class="p-2 rounded-xl theme-input border text-xs flex justify-between"><span>#${i+1} ${t.videoId} (${escapeHTML(t.addedBy)})</span></div>`).join('');
}

function sendTactilePulse() { triggerTactilePulseEffect(myName, true); broadcastData({ type: 'TACTILE_PULSE', senderName: myName }); }
function triggerTactilePulseEffect(sender, local) {
  const b = document.getElementById('tactileHeartBtn'); if (b) { b.classList.remove('pulse-beat'); void b.offsetWidth; b.classList.add('pulse-beat'); }
  document.getElementById('pulseStatusLabel').textContent = local ? '💓 Sent!' : `💓 From ${sender}`;
  if (navigator.vibrate) navigator.vibrate(140); playBeatTrackSound(0);
}

// ==================== PONG ARCADE ====================
let pongActive = false, pongLoopId = null, pongState = { ballX: 160, ballY: 210, vx: 3.2, vy: 3.6, p1X: 120, p2X: 120, paddleW: 80, paddleH: 10, s1: 0, s2: 0 };
const pongCanvas = document.getElementById('pongCanvas'), pongCtx = pongCanvas.getContext('2d');
function openPongModal(b = true) {
  toggleModal('pongModal', true);
  pongState = { ballX: 160, ballY: 210, vx: 3.2, vy: 3.6, p1X: 120, p2X: 120, paddleW: 80, paddleH: 10, s1: 0, s2: 0 };
  pongActive = true; if (b) broadcastData({ type: 'PONG_OPEN' });
  const loop = () => {
    if (!pongActive) return;
    if (isHost) {
      pongState.ballX += pongState.vx; pongState.ballY += pongState.vy;
      if (pongState.ballX <= 8 || pongState.ballX >= 312) pongState.vx *= -1;
      if (pongState.ballY >= 394 && pongState.ballX >= pongState.p1X && pongState.ballX <= pongState.p1X + 80) pongState.vy = -Math.abs(pongState.vy);
      if (pongState.ballY <= 26 && pongState.ballX >= pongState.p2X && pongState.ballX <= pongState.p2X + 80) pongState.vy = Math.abs(pongState.vy);
      if (pongState.ballY > 420) { pongState.s2++; pongState.ballX = 160; pongState.ballY = 210; }
      if (pongState.ballY < 0) { pongState.s1++; pongState.ballX = 160; pongState.ballY = 210; }
      broadcastData({ type: 'PONG_SYNC', bx: pongState.ballX, by: pongState.ballY, s1: pongState.s1, s2: pongState.s2 });
    }
    pongCtx.fillStyle = '#050811'; pongCtx.fillRect(0, 0, 320, 420);
    pongCtx.fillStyle = '#f43f5e'; pongCtx.fillRect(pongState.p2X, 14, 80, 10);
    pongCtx.fillStyle = '#6366f1'; pongCtx.fillRect(pongState.p1X, 396, 80, 10);
    pongCtx.fillStyle = '#34d399'; pongCtx.beginPath(); pongCtx.arc(pongState.ballX, pongState.ballY, 7, 0, Math.PI * 2); pongCtx.fill();
    document.getElementById('pongScoreBadge').textContent = `${pongState.s1} : ${pongState.s2}`;
    pongLoopId = requestAnimationFrame(loop);
  };
  pongLoopId = requestAnimationFrame(loop);
}
function closePongModal(b = true) { toggleModal('pongModal', false); pongActive = false; if (pongLoopId) cancelAnimationFrame(pongLoopId); if (b) broadcastData({ type: 'PONG_CLOSE' }); }
pongCanvas.addEventListener('pointermove', (e) => {
  if (!pongActive) return;
  const r = pongCanvas.getBoundingClientRect(), x = Math.max(0, Math.min(240, ((e.clientX - r.left) / r.width) * 320 - 40));
  if (isHost) pongState.p1X = x; else pongState.p2X = x;
  broadcastData({ type: 'PONG_PADDLE', isHostPaddle: isHost, x });
});

// ==================== SOUNDSCAPE MIXER & BEAT STUDIO ====================
const soundscapeNodes = {};
function updateSoundscapeChannel(ch, val, b = true) {
  const num = parseInt(val, 10) || 0;
  document.getElementById('slider_' + ch).value = num; document.getElementById('volLabel_' + ch).textContent = `${num}%`;
  if (num > 0 || soundscapeNodes.ready) {
    initAudioContext();
    if (!soundscapeNodes.ready) {
      const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const mk = (type, f) => { const s = audioCtx.createBufferSource(); s.buffer = buf; s.loop = true; const fl = audioCtx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; const g = audioCtx.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(audioCtx.destination); s.start(); return g; };
      soundscapeNodes.rain = mk('bandpass', 1100); soundscapeNodes.fire = mk('lowpass', 320); soundscapeNodes.ocean = mk('lowpass', 180); soundscapeNodes.vinyl = mk('highpass', 3800);
      soundscapeNodes.ready = true;
    }
    soundscapeNodes[ch].gain.setTargetAtTime((num / 100) * 0.2, audioCtx.currentTime, 0.08);
  }
  if (b) broadcastData({ type: 'SOUNDSCAPE_SYNC', channel: ch, val: num });
}
function muteAllSoundscapes(b = true) { ['rain', 'fire', 'ocean', 'vinyl'].forEach(c => updateSoundscapeChannel(c, 0, false)); if (b) broadcastData({ type: 'SOUNDSCAPE_MUTE' }); }

let beatMatrix = Array.from({ length: 4 }, () => Array(8).fill(false)), beatPlaying = false, beatStep = 0, beatTimer = null;
function toggleBeatStudio(s) { toggleModal('beatStudioModal', s); if (s) renderSequencerGrid(); }
function renderSequencerGrid() {
  const names = ['Kick', 'Snare', 'Hat', 'Synth'];
  document.getElementById('sequencerGrid').innerHTML = beatMatrix.map((row, r) => `<div class="flex items-center gap-2"><span class="w-10 text-[11px] font-bold">${names[r]}</span><div class="flex-1 grid grid-cols-8 gap-1">${row.map((on, c) => `<button onclick="toggleBeatCell(${r},${c},true)" class="h-7 rounded border ${on ? 'bg-indigo-500 border-white' : 'theme-input theme-border'}"></button>`).join('')}</div></div>`).join('');
}
function toggleBeatCell(r, c, b) { beatMatrix[r][c] = !beatMatrix[r][c]; if (beatMatrix[r][c]) playBeatTrackSound(r); renderSequencerGrid(); if (b) broadcastData({ type: 'BEAT_CELL', r, c, val: beatMatrix[r][c] }); }
function clearBeatGrid(b) { beatMatrix = Array.from({ length: 4 }, () => Array(8).fill(false)); renderSequencerGrid(); if (b) broadcastData({ type: 'BEAT_CLEAR' }); }
function toggleBeatPlayback(b) {
  beatPlaying = !beatPlaying;
  if (beatPlaying) { beatStep = 0; beatTimer = setInterval(() => { for (let r = 0; r < 4; r++) if (beatMatrix[r][beatStep]) playBeatTrackSound(r); beatStep = (beatStep + 1) % 8; }, 260); }
  else clearInterval(beatTimer);
  if (b) broadcastData({ type: 'BEAT_STATE', playing: beatPlaying });
}
function playBeatTrackSound(r) {
  if (!soundEnabled) return;
  try {
    initAudioContext(); const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = [65, 220, 1200, 440][r]; g.gain.setValueAtTime(0.18, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + 0.16);
  } catch (e) {}
}

// ==================== DUAL SNAP, CURSORS, CAPSULES & PICKER INIT ====================
let dualPreviewStream = null;
async function openDualSnapModal() {
  if (Object.keys(connections).length === 0) { alert('Wait for a partner to join first.'); return; }
  toggleModal('dualSnapModal', true);
  try {
    dualPreviewStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
    document.getElementById('dualSnapPreview').srcObject = dualPreviewStream;
  } catch (e) { closeDualSnapModal(); }
}
function closeDualSnapModal() { toggleModal('dualSnapModal', false); if (dualPreviewStream) { dualPreviewStream.getTracks().forEach(t => t.stop()); dualPreviewStream = null; } }
async function executeDualSnapSequence() {
  const v = document.getElementById('dualSnapPreview'); if (!dualPreviewStream) return;
  const c = document.createElement('canvas'); c.width = 720; c.height = 540; const ctx = c.getContext('2d');
  ctx.drawImage(v, 0, 0, 720, 540); dualPreviewStream.getTracks().forEach(t => t.stop());
  try {
    dualPreviewStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); v.srcObject = dualPreviewStream;
    await new Promise(r => setTimeout(r, 1000));
    ctx.save(); ctx.beginPath(); ctx.arc(115, 115, 80, 0, Math.PI * 2); ctx.clip(); ctx.drawImage(v, 35, 35, 160, 160); ctx.restore();
    closeDualSnapModal();
    const dataUrl = c.toDataURL('image/jpeg', 0.7), time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), msgId = 'msg_' + Date.now();
    appendMessage(myName, dataUrl, 'outgoing', time, 'photo', msgId, { isDual: true });
    await sendChunkedPayload(dataUrl, { msgId, msgMode: 'photo', isDual: true, time });
  } catch (e) { closeDualSnapModal(); }
}

let liveCursorsEnabled = false, remoteCursorEls = {};
function toggleLiveCursors() { liveCursorsEnabled = !liveCursorsEnabled; document.getElementById('cursorStatusBadge').textContent = liveCursorsEnabled ? 'ON' : 'OFF'; if (!liveCursorsEnabled) { document.getElementById('cursorsLayer').innerHTML = ''; remoteCursorEls = {}; } }
function cleanupRemoteCursor(id) { if (remoteCursorEls[id]) { remoteCursorEls[id].remove(); delete remoteCursorEls[id]; } }
window.addEventListener('pointermove', (e) => { if (liveCursorsEnabled && Object.keys(connections).length) broadcastData({ type: 'CURSOR_MOVE', peerId: myPeerId, name: myName, nx: e.clientX / window.innerWidth, ny: e.clientY / window.innerHeight }); });
function updateRemoteCursor(id, name, nx, ny) {
  if (!liveCursorsEnabled) return;
  let el = remoteCursorEls[id];
  if (!el) { el = document.createElement('div'); el.className = 'remote-cursor px-2 py-0.5 rounded-full bg-rose-600 text-white text-[9px] font-bold'; el.textContent = name; document.getElementById('cursorsLayer').appendChild(el); remoteCursorEls[id] = el; }
  el.style.left = (nx * window.innerWidth) + 'px'; el.style.top = (ny * window.innerHeight) + 'px';
}

// Remaining Mini-Games & Pickers
let activePolls = {}, rpsGames = {}, tttGames = {}, triviaGames = {}, storyChains = {}, auraAnimId = null;
function sendTimeCapsule(s) { const t = document.getElementById('capsuleTextInput').value.trim(); if (!t) return; toggleModal('capsuleModal', false); const cap = { id: 'cap_' + Date.now(), sender: myName, text: t, seconds: s }; broadcastData({ type: 'TIME_CAPSULE', capsule: cap }); renderTimeCapsuleCard(cap, true); }
function renderTimeCapsuleCard(cap, isOut) {
  const d = document.createElement('div'); d.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  d.innerHTML = `<div class="w-64 theme-panel border border-amber-500/40 rounded-2xl p-3 text-center"><div class="text-[10px] font-bold text-amber-400">⏳ Capsule (${cap.seconds}s)</div><div id="${cap.id}_v" class="text-xs font-bold my-2">Locked...</div></div>`;
  document.getElementById('messagesContainer').appendChild(d);
  let r = cap.seconds; const iv = setInterval(() => { r--; const v = document.getElementById(cap.id + '_v'); if (r > 0 && v) v.textContent = `${r}s remaining`; else { clearInterval(iv); if (v) v.textContent = cap.text; } }, 1000);
}

function togglePicker() { document.getElementById('pickerPopover').classList.toggle('hidden'); }
function switchPickerTab(tab) {
  ['emojis', 'stickers', 'sounds', 'surprises'].forEach(k => {
    document.getElementById(k + 'Grid').classList.toggle('hidden', k !== tab);
    document.getElementById('tab' + k[0].toUpperCase() + k.slice(1)).className = k === tab ? 'flex-1 py-1 text-[10px] font-semibold rounded-lg theme-accent' : 'flex-1 py-1 text-[10px] font-semibold rounded-lg theme-muted';
  });
}
function insertEmoji(e) { document.getElementById('messageInput').value += e; }
function sendSticker(s) { togglePicker(); const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); broadcastData({ type: 'CHAT', msgMode: 'sticker', senderName: myName, content: s, time }); appendMessage(myName, s, 'outgoing', time, 'sticker'); }
function triggerSoundboard(id, b = true) { playBeatTrackSound(1); if (b) { togglePicker(); broadcastData({ type: 'SOUNDBOARD', soundId: id, senderName: myName }); } }
function sendScratchCard() { const t = document.getElementById('scratchSecretInput').value.trim(); if (!t) return; toggleModal('scratchModal', false); const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); broadcastData({ type: 'CHAT', msgMode: 'scratch', senderName: myName, content: t, time }); appendMessage(myName, t, 'outgoing', time, 'scratch'); }
function initScratchCanvas(id) { const sc = document.getElementById(id); if (!sc) return; const c = sc.getContext('2d'); c.fillStyle = '#94a3b8'; c.fillRect(0, 0, 240, 80); sc.addEventListener('pointermove', (e) => { const r = sc.getBoundingClientRect(); c.clearRect(((e.clientX - r.left) / r.width) * 240 - 15, ((e.clientY - r.top) / r.height) * 80 - 15, 30, 30); }); }

// Populate Pickers on Load
document.getElementById('emojisGrid').innerHTML = ['😀','😂','🥰','😎','🥳','😭','🔥','💯','❤️','👍','🎉','🚀','⚡','👀'].map(e => `<button type="button" onclick="insertEmoji('${e}')" class="p-1.5 hover:bg-white/10 rounded">${e}</button>`).join('');
document.getElementById('stickersGrid').innerHTML = ['🚀','🔥','🎉','❤️','😂','👑','💎','⚡','🏆','🎯','💯','🌟'].map(s => `<button type="button" onclick="sendSticker('${s}')" class="p-2 hover:bg-white/10 rounded">${s}</button>`).join('');
document.getElementById('soundsGrid').innerHTML = ['Drumroll', 'Airhorn', 'Laser', 'Power-Up'].map(s => `<button type="button" onclick="triggerSoundboard('${s}')" class="p-2 rounded-xl theme-input border text-xs">${s}</button>`).join('');
document.getElementById('surprisesGrid').innerHTML = `
  <button type="button" onclick="toggleModal('telepathyModal',true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">🔮 Telepathy</button>
  <button type="button" onclick="openPongModal(true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">🏓 Live Pong</button>
  <button type="button" onclick="toggleModal('jukeboxModal',true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">📻 Jukebox</button>
  <button type="button" onclick="toggleModal('bluffModal',true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">🎭 2 Truths</button>
  <button type="button" onclick="toggleModal('pulsePadModal',true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">💓 Pulse Pad</button>
  <button type="button" onclick="openDualSnapModal();togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">📸 Dual Snap</button>
  <button type="button" onclick="toggleModal('soundscapeModal',true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">🎧 Soundscape</button>
  <button type="button" onclick="toggleBeatStudio(true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">🎹 Beat Studio</button>
  <button type="button" onclick="toggleModal('capsuleModal',true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">⏳ Capsule</button>
  <button type="button" onclick="toggleModal('scratchModal',true);togglePicker()" class="p-2 rounded-xl theme-input border text-[10px]">🎟️ Scratch</button>
`;
