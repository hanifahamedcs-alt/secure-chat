// ==================== ONE CHAT — FULL 26-FEATURE MULTIPLAYER ENGINE (RESTORED) ====================
const EMOJI_BANK = [
  '😀','😂','🥰','😍','🤩','😘','😜','🤪','😎','🥳','🤯','🥺','😭','😡','😱','😴',
  '👍','👎','👏','🙌','🤝','🙏','💪','✌️','🤞','🤟','🫶','❤️','🧡','💛','💚','💙',
  '💜','🖤','🔥','✨','💫','🎉','🎊','🎁','🎈','🏆','🥇','🎯','🎲','🎮','🎵','☕',
  '🍕','🍔','🍟','🍦','🍩','🍫','🍿','🥂','🌹','🌸','🌈','⚡','❄️','🌙','☀️','🚀'
];

const STICKER_BANK = [
  { emoji: '🚀', label: 'Let’s Go!' },
  { emoji: '🔥', label: 'On Fire' },
  { emoji: '👑', label: 'Legend' },
  { emoji: '🫶', label: 'Love This' },
  { emoji: '😂', label: 'Hilarious' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '☕', label: 'Coffee Break' },
  { emoji: '🎮', label: 'Game On' },
  { emoji: '💣', label: 'Mind Blown' },
  { emoji: '👻', label: 'Zero Trace' },
  { emoji: '🥂', label: 'Cheers!' },
  { emoji: '😴', label: 'Sleepy' }
];

const SOUND_FX_BANK = [
  { id: 'airhorn', label: '📯 Airhorn', freq: 440, type: 'sawtooth', dur: 0.45 },
  { id: 'applause', label: '👏 Victory Chime', freq: 660, type: 'triangle', dur: 0.35 },
  { id: 'laser', label: '🔫 Sci-Fi Laser', freq: 980, type: 'sine', dur: 0.25 },
  { id: 'drum', label: '🥁 Ba-Dum-Tss', freq: 160, type: 'square', dur: 0.3 },
  { id: 'magic', label: '✨ Magic Sparkle', freq: 1120, type: 'sine', dur: 0.4 },
  { id: 'buzz', label: '⚡ Screen Buzz', freq: 130, type: 'sawtooth', dur: 0.5 }
];

const THEME_PRESETS = [
  { name: 'Aurora', accent: '#6366f1', bg: '#070b14' },
  { name: 'Emerald', accent: '#10b981', bg: '#04120e' },
  { name: 'Rose', accent: '#f43f5e', bg: '#14060b' },
  { name: 'Amber', accent: '#f59e0b', bg: '#140e04' },
  { name: 'Cyan', accent: '#06b6d4', bg: '#041116' },
  { name: 'Violet', accent: '#8b5cf6', bg: '#0d0717' },
  { name: 'Crimson', accent: '#ef4444', bg: '#140707' },
  { name: 'Slate', accent: '#64748b', bg: '#0b0f17' }
];

// ==================== 1. PICKERS, THEMES & ALL 26 LAUNCHERS ====================
function initPickersSafely() {
  const themeGrid = document.getElementById('themeGrid');
  if (themeGrid && themeGrid.children.length === 0) {
    themeGrid.innerHTML = THEME_PRESETS.map(t => `
      <button type="button" onclick="applyThemePreset('${t.accent}', '${t.bg}')"
        class="py-1.5 px-1 rounded-lg theme-input border text-[9px] font-bold truncate hover:brightness-110 transition"
        style="border-color: ${t.accent}66">${t.name}</button>
    `).join('');
  }

  const emojisGrid = document.getElementById('emojisGrid');
  if (emojisGrid && emojisGrid.children.length === 0) {
    emojisGrid.innerHTML = EMOJI_BANK.map(em => `
      <button type="button" onclick="insertEmojiToInput('${em}')" class="p-1.5 rounded-lg hover:bg-white/10 text-lg transition">${em}</button>
    `).join('');
  }

  const stickersGrid = document.getElementById('stickersGrid');
  if (stickersGrid && stickersGrid.children.length === 0) {
    stickersGrid.innerHTML = STICKER_BANK.map(s => `
      <button type="button" onclick="sendSticker('${s.emoji}')" class="p-2 rounded-xl theme-input border hover:border-indigo-400/50 flex flex-col items-center gap-1 transition">
        <span class="text-2xl">${s.emoji}</span>
        <span class="text-[9px] theme-muted truncate w-full text-center">${s.label}</span>
      </button>
    `).join('');
  }

  const soundsGrid = document.getElementById('soundsGrid');
  if (soundsGrid && soundsGrid.children.length === 0) {
    soundsGrid.innerHTML = SOUND_FX_BANK.map(fx => `
      <button type="button" onclick="triggerSoundFX('${fx.id}')" class="p-2.5 rounded-xl theme-input border hover:border-amber-400/50 text-[11px] font-semibold text-left truncate transition">${fx.label}</button>
    `).join('');
  }

  const surprisesGrid = document.getElementById('surprisesGrid');
  if (surprisesGrid && surprisesGrid.children.length === 0) {
    const all26Features = [
      ['✊ RPS Duel', "openRPSModal()"],
      ['❌⭕ Tic-Tac-Toe', "openTTTModal()"],
      ['🧠 Trivia Quiz', "openTriviaModal()"],
      ['🎡 Spin Wheel', "toggleModal('spinWheelModal',true);togglePicker()"],
      ['📖 Story Chain', "openStoryModal()"],
      ['📊 Live Poll', "toggleModal('pollModal',true);togglePicker()"],
      ['🎨 Whiteboard', "openWhiteboardModal()"],
      ['⏱️ Sync Timer', "toggleModal('timerModal',true);togglePicker()"],
      ['🎵 YT Jukebox', "toggleModal('jukeboxModal',true);togglePicker()"],
      ['💓 Pulse Pad', "toggleModal('pulsePadModal',true);togglePicker()"],
      ['🔮 Telepathy', "toggleModal('telepathyModal',true);togglePicker()"],
      ['🏓 Live Pong', "openPongModal()"],
      ['🕵️ 2 Truths 1 Lie', "toggleModal('bluffModal',true);togglePicker()"],
      ['📸 Dual Snap', "openDualSnapModal()"],
      ['🎧 Soundscape', "toggleModal('soundscapeModal',true);togglePicker()"],
      ['🎹 Beat Studio', "toggleBeatStudio()"],
      ['⏳ Time Capsule', "toggleModal('capsuleModal',true);togglePicker()"],
      ['👾 Pixel Art', "openPixelArtModal()"],
      ['🧊 3D Hologram', "toggleModal('hologramModal',true);togglePicker()"],
      ['🪄 Vibe Oracle', "toggleModal('oracleModal',true);togglePicker()"],
      ['🎟️ Scratch Card', "sendQuickScratchCard()"],
      ['🎉 Party Rain', "triggerPartyRain('🎉', true)"],
      ['🌸 Weather Aura', "cycleWeatherAura()"],
      ['🎙️ Voice Aura', "toggleVoiceAura()"],
      ['⚡ Screen Buzz', "triggerScreenBuzz(true);togglePicker()"],
      ['🚀 Zero-G Room', "triggerZeroGRoom()"]
    ];
    surprisesGrid.innerHTML = all26Features.map(([label, action]) => `
      <button type="button" onclick="${action}" class="p-2 rounded-xl theme-input border hover:border-indigo-400/50 text-[10px] font-semibold text-left truncate transition">${label}</button>
    `).join('');
  }

  buildTTTBoardUI();
  buildPixelGridUI();
  buildBeatStudioUI();
}

function applyThemePreset(accent, bg) {
  document.documentElement.style.setProperty('--accent', accent);
  document.documentElement.style.setProperty('--bg-main', bg);
  document.querySelectorAll('.theme-accent').forEach(el => {
    el.style.background = `linear-gradient(135deg, ${accent} 0%, #4f46e5 100%)`;
  });
}

function applyCustomAccent(hex) {
  applyThemePreset(hex, '#070b14');
}

function insertEmojiToInput(em) {
  const input = document.getElementById('messageInput');
  if (!input) return;
  input.value += em;
  input.focus();
}

function sendSticker(emoji) {
  toggleModal('pickerPopover', false);
  const ts = Date.now();
  const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = 'msg_' + ts + '_' + Math.random().toString(36).substr(2, 4);
  broadcastData({ type: 'CHAT', msgId, msgMode: 'sticker', senderId: myPeerId, senderName: myName, content: emoji, time, ts }, true);
  appendMessage(myName, emoji, 'outgoing', time, 'sticker', msgId, { ts });
}

function triggerSoundFX(fxId) {
  toggleModal('pickerPopover', false);
  if (fxId === 'buzz') {
    triggerScreenBuzz(true);
    return;
  }
  playSynthFX(fxId);
  broadcastData({ type: 'GAME_FX', fxId, sender: myName });
  appendSystemNotice(`🔊 You played ${fxId.toUpperCase()} sound effect`);
}

function playSynthFX(fxId) {
  const fx = SOUND_FX_BANK.find(x => x.id === fxId) || SOUND_FX_BANK[0];
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = fx.type;
    osc.frequency.setValueAtTime(fx.freq, audioCtx.currentTime);
    if (fxId === 'laser') osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + fx.dur);
    if (fxId === 'magic') osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + fx.dur);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + fx.dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + fx.dur + 0.02);
  } catch (e) {}
}

function triggerScreenBuzz(broadcast = true) {
  playBuzzTone();
  if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
  const stage = document.getElementById('mainAppStage');
  if (stage) {
    stage.classList.remove('buzz-shake');
    void stage.offsetWidth;
    stage.classList.add('buzz-shake');
  }
  if (broadcast) {
    broadcastData({ type: 'GAME_BUZZ', sender: myName });
    appendSystemNotice('⚡ You buzzed the room!');
  }
}

// ==================== 2. SCRATCH CARDS (RESTORED FOR CONNECTION.JS & COUPLES.JS) ====================
function sendQuickScratchCard() {
  toggleModal('pickerPopover', false);
  const text = prompt('Enter hidden Scratch Card message or reward:', '☕ Next Coffee Is On Me!');
  if (!text || !text.trim()) return;
  const ts = Date.now();
  const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = 'msg_' + ts + '_' + Math.random().toString(36).substr(2, 4);
  broadcastData({ type: 'CHAT', msgId, msgMode: 'scratch', senderId: myPeerId, senderName: myName, content: text.trim(), time, ts }, true);
  appendMessage(myName, text.trim(), 'outgoing', time, 'scratch', msgId, { ts });
}

window.initScratchCanvas = function(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#6366f1');
  grad.addColorStop(0.5, '#a855f7');
  grad.addColorStop(1, '#ec4899');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('✨ SCRATCH HERE TO REVEAL ✨', canvas.width / 2, canvas.height / 2);

  let scratching = false;
  const scratchAt = (e) => {
    if (!scratching) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((cx - rect.left) / rect.width) * canvas.width;
    const y = ((cy - rect.top) / rect.height) * canvas.height;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
  };

  canvas.addEventListener('mousedown', (e) => { scratching = true; scratchAt(e); });
  canvas.addEventListener('mousemove', scratchAt);
  window.addEventListener('mouseup', () => { scratching = false; });
  canvas.addEventListener('touchstart', (e) => { scratching = true; scratchAt(e); }, { passive: false });
  canvas.addEventListener('touchmove', scratchAt, { passive: false });
  canvas.addEventListener('touchend', () => { scratching = false; });
};

// ==================== 3. LIVE P2P CURSORS (RESTORED FOR HEADER & CONNECTION.JS) ====================
let liveCursorsEnabled = false, lastCursorSentAt = 0;
function toggleLiveCursors() {
  liveCursorsEnabled = !liveCursorsEnabled;
  const btn = document.getElementById('liveCursorBtn');
  if (btn) btn.classList.toggle('text-sky-400', liveCursorsEnabled);
  if (typeof showToast === 'function') {
    showToast(liveCursorsEnabled ? '🖱️ Live Cursors ON' : '🖱️ Live Cursors OFF', liveCursorsEnabled ? 'Partners can see your pointer in real time' : 'Pointer sharing paused');
  }
}

document.addEventListener('mousemove', (e) => {
  if (!liveCursorsEnabled || !room || Object.keys(connections || {}).length === 0) return;
  const now = Date.now();
  if (now - lastCursorSentAt < 65) return;
  lastCursorSentAt = now;
  const rx = +(e.clientX / window.innerWidth).toFixed(3);
  const ry = +(e.clientY / window.innerHeight).toFixed(3);
  broadcastData({ type: 'GAME_CURSOR', peerId: myPeerId, name: myName, rx, ry });
});

function renderRemoteCursor(peerId, name, rx, ry) {
  const layer = document.getElementById('liveCursorsLayer');
  if (!layer) return;
  let el = document.getElementById('cursor_' + peerId);
  if (!el) {
    el = document.createElement('div');
    el.id = 'cursor_' + peerId;
    el.className = 'fixed z-30 pointer-events-none transition-all duration-75 flex items-center gap-1';
    el.innerHTML = `<i class="fa-solid fa-arrow-pointer text-sky-400 text-sm drop-shadow"></i><span class="px-1.5 py-0.5 rounded bg-sky-500 text-white text-[9px] font-bold shadow">${escapeHTML(name || 'Peer')}</span>`;
    layer.appendChild(el);
  }
  el.style.left = Math.round(rx * window.innerWidth) + 'px';
  el.style.top = Math.round(ry * window.innerHeight) + 'px';
}

window.cleanupRemoteCursor = function(peerId) {
  document.getElementById('cursor_' + peerId)?.remove();
};

// ==================== 4. PARTY RAIN, WEATHER AURA & VOICE-TO-EMOJI AURA ====================
function triggerPartyRain(emoji = '🎉', broadcast = true) {
  toggleModal('pickerPopover', false);
  const overlay = document.getElementById('weatherAuraOverlay');
  if (overlay) {
    const icons = [emoji, '✨', '🎊', '💫', '🔥'];
    for (let i = 0; i < 26; i++) {
      const drop = document.createElement('div');
      drop.textContent = icons[i % icons.length];
      drop.style.cssText = `position:fixed; top:-30px; left:${Math.random() * 96}vw; font-size:${16 + Math.random() * 14}px; z-index:40; pointer-events:none; transition: transform ${2.2 + Math.random() * 1.5}s linear, opacity 2.8s ease;`;
      overlay.appendChild(drop);
      requestAnimationFrame(() => {
        drop.style.transform = `translateY(105vh) rotate(${Math.random() * 360}deg)`;
        drop.style.opacity = '0';
      });
      setTimeout(() => drop.remove(), 3800);
    }
  }
  if (broadcast) {
    broadcastData({ type: 'GAME_RAIN', emoji, sender: myName });
    appendSystemNotice('🎉 Party Rain launched across the room!');
  }
}

const AURA_MODES = ['off', 'petals', 'rain', 'snow', 'embers'];
let currentAuraIdx = 0, auraInterval = null;
function cycleWeatherAura() {
  toggleModal('pickerPopover', false);
  currentAuraIdx = (currentAuraIdx + 1) % AURA_MODES.length;
  const mode = AURA_MODES[currentAuraIdx];
  applyWeatherAura(mode);
  broadcastData({ type: 'GAME_AURA', mode, sender: myName });
}

function applyWeatherAura(mode) {
  if (auraInterval) { clearInterval(auraInterval); auraInterval = null; }
  const overlay = document.getElementById('weatherAuraOverlay');
  if (overlay) overlay.innerHTML = '';
  if (!mode || mode === 'off' || !overlay) return;

  const map = { petals: '🌸', rain: '💧', snow: '❄️', embers: '✨' };
  const char = map[mode] || '✨';
  auraInterval = setInterval(() => {
    const p = document.createElement('div');
    p.textContent = char;
    p.style.cssText = `position:fixed; top:-20px; left:${Math.random() * 98}vw; font-size:14px; opacity:0.75; pointer-events:none; transition: transform 4s linear, opacity 4s linear;`;
    overlay.appendChild(p);
    requestAnimationFrame(() => {
      p.style.transform = `translateY(105vh) translateX(${(Math.random() - 0.5) * 80}px)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 4100);
  }, 320);
  appendSystemNotice(`🌸 Ambient Weather Aura: ${mode.toUpperCase()}`);
}

let voiceAuraActive = false, voiceAuraStream = null, voiceAuraIv = null;
async function toggleVoiceAura() {
  toggleModal('pickerPopover', false);
  const overlay = document.getElementById('voiceAuraOverlay');
  if (voiceAuraActive) {
    voiceAuraActive = false;
    if (voiceAuraIv) clearInterval(voiceAuraIv);
    if (voiceAuraStream) voiceAuraStream.getTracks().forEach(t => t.stop());
    if (overlay) overlay.innerHTML = '';
    appendSystemNotice('🎙️ Voice-to-Emoji Aura turned OFF');
    return;
  }
  try {
    voiceAuraStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    initAudioContext();
    const src = audioCtx.createMediaStreamSource(voiceAuraStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    src.connect(analyser);
    const dataArr = new Uint8Array(analyser.frequencyBinCount);
    voiceAuraActive = true;
    appendSystemNotice('🎙️ Voice-to-Emoji Aura ON — speak to spawn floating emojis!');

    voiceAuraIv = setInterval(() => {
      analyser.getByteFrequencyData(dataArr);
      const avg = dataArr.reduce((a, b) => a + b, 0) / dataArr.length;
      if (avg > 28 && overlay) {
        const em = avg > 65 ? '🔥' : avg > 45 ? '✨' : '🎵';
        const b = document.createElement('div');
        b.textContent = em;
        b.style.cssText = `position:fixed; bottom:70px; left:${20 + Math.random() * 60}vw; font-size:${16 + Math.min(20, avg / 3)}px; pointer-events:none; transition: transform 1.8s ease-out, opacity 1.8s ease-out;`;
        overlay.appendChild(b);
        requestAnimationFrame(() => {
          b.style.transform = 'translateY(-45vh) scale(1.3)';
          b.style.opacity = '0';
        });
        setTimeout(() => b.remove(), 1850);
      }
    }, 260);
  } catch (e) {
    alert('Microphone permission needed for Voice Aura: ' + e.message);
  }
}

// ==================== 5. ROCK PAPER SCISSORS (RPS DUEL) ====================
let myRPSMove = null, partnerRPSMove = null, partnerRPSName = 'Partner';

function openRPSModal() {
  toggleModal('pickerPopover', false);
  myRPSMove = null;
  partnerRPSMove = null;
  const st = document.getElementById('rpsStatus');
  if (st) st.textContent = 'Pick your move! Result reveals when both lock in.';
  toggleModal('rpsModal', true);
}

function playRPS(move) {
  myRPSMove = move;
  const st = document.getElementById('rpsStatus');
  if (st) st.textContent = `You locked ${move}. Waiting for partner...`;
  broadcastData({ type: 'GAME_RPS_MOVE', move, sender: myName });
  evaluateRPSRound();
}

function evaluateRPSRound() {
  if (!myRPSMove || !partnerRPSMove) return;
  const m1 = myRPSMove, m2 = partnerRPSMove;
  myRPSMove = null;
  partnerRPSMove = null;

  let outcome = "It's a Draw! 🤝";
  if (
    (m1 === 'Rock' && m2 === 'Scissors') ||
    (m1 === 'Paper' && m2 === 'Rock') ||
    (m1 === 'Scissors' && m2 === 'Paper')
  ) {
    outcome = `${myName} Wins! 🏆`;
  } else if (m1 !== m2) {
    outcome = `${partnerRPSName} Wins! 🎉`;
  }

  const st = document.getElementById('rpsStatus');
  if (st) st.innerHTML = `You: <b>${m1}</b> vs ${escapeHTML(partnerRPSName)}: <b>${m2}</b><br><span class="text-amber-300 font-bold">${outcome}</span>`;
  appendSystemNotice(`✊✋✌️ RPS Duel: ${myName} (${m1}) vs ${partnerRPSName} (${m2}) → ${outcome}`);
}

// ==================== 6. TIC-TAC-TOE (SYNCED 3x3 BOARD) ====================
let tttCells = Array(9).fill(''), myTTTSymbol = 'X', tttTurn = 'X', tttGameOver = false;

function openTTTModal() {
  toggleModal('pickerPopover', false);
  buildTTTBoardUI();
  renderTTTBoard();
  toggleModal('tttModal', true);
}

function buildTTTBoardUI() {
  const board = document.getElementById('tttBoard');
  if (!board || board.children.length === 9) return;
  board.innerHTML = Array.from({ length: 9 }, (_, i) => `
    <button type="button" id="tttCell_${i}" onclick="makeTTTMove(${i})"
      class="h-16 rounded-xl theme-input border text-xl font-extrabold flex items-center justify-center hover:border-indigo-400 transition"></button>
  `).join('');
}

function makeTTTMove(idx) {
  if (tttGameOver || tttCells[idx] !== '') return;
  if (tttCells.every(c => c === '')) {
    myTTTSymbol = 'X';
    tttTurn = 'X';
  }
  if (tttTurn !== myTTTSymbol) {
    const st = document.getElementById('tttStatus');
    if (st) st.textContent = `Wait for opponent's move (${tttTurn})...`;
    return;
  }

  tttCells[idx] = myTTTSymbol;
  tttTurn = myTTTSymbol === 'X' ? 'O' : 'X';
  renderTTTBoard();
  broadcastData({ type: 'GAME_TTT_MOVE', idx, symbol: myTTTSymbol, sender: myName });
  checkTTTWinner();
}

function renderTTTBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = document.getElementById(`tttCell_${i}`);
    if (!cell) continue;
    cell.textContent = tttCells[i];
    cell.className = `h-16 rounded-xl theme-input border text-xl font-extrabold flex items-center justify-center transition ${
      tttCells[i] === 'X' ? 'text-indigo-400' : tttCells[i] === 'O' ? 'text-rose-400' : 'hover:border-indigo-400'
    }`;
  }
  if (!tttGameOver) {
    const st = document.getElementById('tttStatus');
    if (st) st.textContent = tttCells.every(c => c === '')
      ? 'Tap any square to start as X!'
      : (tttTurn === myTTTSymbol ? `Your turn (${myTTTSymbol})` : `Partner's turn (${tttTurn})`);
  }
}

function checkTTTWinner() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a, b, c] of lines) {
    if (tttCells[a] && tttCells[a] === tttCells[b] && tttCells[a] === tttCells[c]) {
      tttGameOver = true;
      const winSym = tttCells[a];
      const msg = winSym === myTTTSymbol ? `🎉 You (${winSym}) won Tic-Tac-Toe!` : `🏆 Partner (${winSym}) won Tic-Tac-Toe!`;
      const st = document.getElementById('tttStatus');
      if (st) st.innerHTML = `<span class="text-emerald-400 font-bold">${msg}</span>`;
      appendSystemNotice(`❌⭕ ${msg}`);
      return;
    }
  }
  if (tttCells.every(c => c !== '')) {
    tttGameOver = true;
    const st = document.getElementById('tttStatus');
    if (st) st.innerHTML = `<span class="text-amber-300 font-bold">🤝 Tic-Tac-Toe Draw!</span>`;
    appendSystemNotice('❌⭕ Tic-Tac-Toe ended in a Draw!');
  }
}

function resetTTT(broadcast = true) {
  tttCells = Array(9).fill('');
  myTTTSymbol = 'X';
  tttTurn = 'X';
  tttGameOver = false;
  renderTTTBoard();
  if (broadcast) broadcastData({ type: 'GAME_TTT_RESET', sender: myName });
}

// ==================== 7. BLIND STORY CHAIN ====================
let storyChainEntries = [];

function openStoryModal() {
  toggleModal('pickerPopover', false);
  updateStoryClueUI();
  toggleModal('storyModal', true);
}

function updateStoryClueUI() {
  const clueEl = document.getElementById('storyClueText');
  if (!clueEl) return;
  if (storyChainEntries.length === 0) {
    clueEl.textContent = 'Start the first line of the story!';
  } else {
    const last = storyChainEntries[storyChainEntries.length - 1];
    const words = last.text.split(/\s+/);
    const hint = words.slice(-3).join(' ');
    clueEl.innerHTML = `<b>${storyChainEntries.length} lines written.</b> Last clue: <i>"...${escapeHTML(hint)}"</i>`;
  }
}

function submitStoryLine() {
  const input = document.getElementById('storyLineInput');
  const line = (input?.value || '').trim();
  if (!line) return;
  input.value = '';
  const entry = { author: myName, text: line };
  storyChainEntries.push(entry);
  updateStoryClueUI();
  broadcastData({ type: 'GAME_STORY_ADD', entry });
  appendSystemNotice(`📖 ${myName} added a secret line to the Story Chain!`);
}

function revealFullStory() {
  if (storyChainEntries.length === 0) {
    alert('Add at least one line to the story first!');
    return;
  }
  const snapshot = [...storyChainEntries];
  storyChainEntries = [];
  updateStoryClueUI();
  toggleModal('storyModal', false);
  broadcastData({ type: 'GAME_STORY_REVEAL', entries: snapshot });
  renderStoryRevealCard(snapshot);
}

function renderStoryRevealCard(entries) {
  const c = document.getElementById('messagesContainer');
  if (!c) return;
  const div = document.createElement('div');
  div.className = 'flex flex-col items-center my-2';
  div.innerHTML = `
    <div class="w-80 theme-panel border border-indigo-400/40 rounded-2xl p-4 shadow-xl">
      <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-300 mb-2">📖 Blind Story Chain Reveal</div>
      <div class="space-y-1.5 text-xs leading-relaxed">
        ${entries.map(e => `<p><span class="text-indigo-300 font-bold">${escapeHTML(e.author)}:</span> ${escapeHTML(e.text)}</p>`).join('')}
      </div>
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

// ==================== 8. TRIVIA QUIZ, SPIN WHEEL, LIVE POLL ====================
const TRIVIA_BANK = [
  { q: 'Which planet has the most moons in our solar system?', opts: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], ans: 1 },
  { q: 'What is the chemical symbol for Gold?', opts: ['Go', 'Gd', 'Au', 'Ag'], ans: 2 },
  { q: 'Which country invented espresso coffee?', opts: ['France', 'Brazil', 'Italy', 'Spain'], ans: 2 },
  { q: 'How many bones are in an adult human body?', opts: ['186', '206', '226', '246'], ans: 1 },
  { q: 'Which ocean is the largest on Earth?', opts: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], ans: 3 },
  { q: 'What year was the first iPhone released?', opts: ['2005', '2007', '2008', '2010'], ans: 1 }
];

function openTriviaModal() {
  toggleModal('pickerPopover', false);
  startTriviaRound();
  toggleModal('triviaModal', true);
}

function startTriviaRound() {
  const item = TRIVIA_BANK[Math.floor(Math.random() * TRIVIA_BANK.length)];
  renderTriviaQuestion(item);
  broadcastData({ type: 'GAME_TRIVIA', item, sender: myName });
}

function renderTriviaQuestion(item) {
  const stage = document.getElementById('triviaStage');
  if (!stage) return;
  stage.innerHTML = `
    <div class="font-bold text-white mb-2.5">${escapeHTML(item.q)}</div>
    <div class="space-y-1.5">
      ${item.opts.map((opt, idx) => `
        <button type="button" onclick="answerTrivia(${idx}, ${item.ans}, '${escapeHTML(opt).replace(/'/g, "\\'")}')"
          class="w-full py-2 px-3 rounded-xl theme-input border hover:border-indigo-400 text-left text-xs transition">${escapeHTML(opt)}</button>
      `).join('')}
    </div>
  `;
}

function answerTrivia(chosen, correct, label) {
  const isRight = chosen === correct;
  const stage = document.getElementById('triviaStage');
  if (stage) {
    stage.innerHTML += `<div class="mt-2.5 font-bold ${isRight ? 'text-emerald-400' : 'text-rose-400'}">${isRight ? '✅ Correct!' : '❌ Wrong Answer!'}</div>`;
  }
  broadcastData({ type: 'GAME_TRIVIA_ANS', sender: myName, label, isRight });
  appendSystemNotice(`🧠 ${myName} answered "${label}" (${isRight ? 'Correct ✅' : 'Wrong ❌'})`);
}

function spinDecisionWheel() {
  const raw = document.getElementById('wheelOptionsInput')?.value || 'Coffee, Pizza, Movie';
  const items = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (items.length === 0) return;
  const resEl = document.getElementById('wheelResultText');
  let ticks = 0;
  const spinIv = setInterval(() => {
    ticks++;
    if (resEl) resEl.textContent = `🎡 ${items[ticks % items.length]}...`;
    if (ticks > 12) {
      clearInterval(spinIv);
      const winner = items[Math.floor(Math.random() * items.length)];
      if (resEl) resEl.textContent = `🎉 Winner: ${winner}`;
      broadcastData({ type: 'GAME_WHEEL', winner, sender: myName });
      appendSystemNotice(`🎡 Decision Wheel landed on: ${winner}`);
    }
  }, 75);
}

const activePolls = {};
function createLivePoll() {
  const q = document.getElementById('pollQuestionInput')?.value.trim();
  const optsRaw = document.getElementById('pollOptionsInput')?.value || '';
  const opts = optsRaw.split(',').map(s => s.trim()).filter(Boolean);
  if (!q || opts.length < 2) { alert('Enter a question and at least 2 comma-separated options.'); return; }
  toggleModal('pollModal', false);
  const poll = { id: 'poll_' + Date.now(), question: q, options: opts, votes: opts.map(() => 0), creator: myName };
  activePolls[poll.id] = poll;
  broadcastData({ type: 'GAME_POLL_NEW', poll });
  renderPollCard(poll);
}

function renderPollCard(poll) {
  const c = document.getElementById('messagesContainer');
  if (!c) return;
  const div = document.createElement('div');
  div.id = poll.id;
  div.className = 'flex flex-col items-center my-2';
  div.innerHTML = buildPollHTML(poll);
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function buildPollHTML(poll) {
  const total = poll.votes.reduce((a, b) => a + b, 0);
  return `
    <div class="w-72 theme-panel border border-indigo-400/40 rounded-2xl p-4 shadow-xl">
      <div class="text-[10px] font-bold text-indigo-300 uppercase mb-1">📊 Live Poll • ${escapeHTML(poll.creator)}</div>
      <div class="text-xs font-bold text-white mb-2.5">${escapeHTML(poll.question)}</div>
      <div class="space-y-1.5">
        ${poll.options.map((opt, idx) => {
          const pct = total ? Math.round((poll.votes[idx] / total) * 100) : 0;
          return `
            <button type="button" onclick="voteInPoll('${poll.id}', ${idx})"
              class="w-full p-2 rounded-xl theme-input border hover:border-indigo-400 text-left text-xs flex justify-between items-center transition">
              <span>${escapeHTML(opt)}</span>
              <span class="text-[10px] font-bold text-indigo-300">${poll.votes[idx]} (${pct}%)</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function voteInPoll(pollId, optIdx) {
  const poll = activePolls[pollId];
  if (!poll) return;
  poll.votes[optIdx]++;
  const el = document.getElementById(pollId);
  if (el) el.innerHTML = buildPollHTML(poll);
  broadcastData({ type: 'GAME_POLL_VOTE', pollId, optIdx });
}

// ==================== 9. WHITEBOARD, TIMER, JUKEBOX, PULSE, TELEPATHY ====================
let wbInitialized = false, wbDrawing = false, wbLastX = 0, wbLastY = 0;
function openWhiteboardModal() {
  toggleModal('pickerPopover', false);
  toggleModal('whiteboardModal', true);
  initWhiteboardCanvas();
}

function initWhiteboardCanvas() {
  if (wbInitialized) return;
  const canvas = document.getElementById('sharedCanvas');
  if (!canvas) return;
  wbInitialized = true;
  const ctx = canvas.getContext('2d');
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const start = (e) => { wbDrawing = true; const p = getPos(e); wbLastX = p.x; wbLastY = p.y; };
  const move = (e) => {
    if (!wbDrawing) return;
    e.preventDefault();
    const p = getPos(e);
    const color = document.getElementById('wbColorInput')?.value || '#38bdf8';
    drawWBSegment(wbLastX, wbLastY, p.x, p.y, color);
    broadcastData({ type: 'GAME_WB_DRAW', x1: wbLastX, y1: wbLastY, x2: p.x, y2: p.y, color });
    wbLastX = p.x; wbLastY = p.y;
  };
  const stop = () => { wbDrawing = false; };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', stop);
}

function drawWBSegment(x1, y1, x2, y2, color) {
  const canvas = document.getElementById('sharedCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function clearWhiteboard(broadcast = true) {
  const canvas = document.getElementById('sharedCanvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  if (broadcast) broadcastData({ type: 'GAME_WB_CLEAR' });
}

let syncTimerInterval = null;
function startSyncedTimer() {
  const mins = Math.max(1, parseInt(document.getElementById('timerMinutesInput')?.value || '5', 10));
  toggleModal('timerModal', false);
  const endAt = Date.now() + mins * 60000;
  runSyncedTimer(endAt);
  broadcastData({ type: 'GAME_TIMER', endAt, sender: myName });
}

function runSyncedTimer(endAt) {
  toggleModal('syncTimerBar', true);
  if (syncTimerInterval) clearInterval(syncTimerInterval);
  const update = () => {
    const rem = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    const m = String(Math.floor(rem / 60)).padStart(2, '0');
    const s = String(rem % 60).padStart(2, '0');
    const lbl = document.getElementById('syncTimerLabel');
    if (lbl) lbl.textContent = rem > 0 ? `⏳ Synced Timer: ${m}:${s}` : '🔔 Synced Timer Finished!';
    if (rem <= 0) {
      clearInterval(syncTimerInterval);
      playMessageTone();
    }
  };
  update();
  syncTimerInterval = setInterval(update, 1000);
}

function extractYouTubeId(url) {
  const m = String(url).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : (String(url).trim().length === 11 ? String(url).trim() : null);
}

function loadJukeboxVideo() {
  const raw = document.getElementById('ytUrlInput')?.value || '';
  const vid = extractYouTubeId(raw);
  if (!vid) { alert('Enter a valid YouTube video URL or 11-character ID.'); return; }
  embedJukeboxVideo(vid);
  broadcastData({ type: 'GAME_YT', vid, sender: myName });
}

function embedJukeboxVideo(vid) {
  toggleModal('jukeboxModal', true);
  const box = document.getElementById('jukeboxPlayerContainer');
  if (box) {
    box.innerHTML = `<iframe class="w-full h-full" src="https://www.youtube.com/embed/${vid}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
}

function sendTactilePulse() {
  if (navigator.vibrate) navigator.vibrate(90);
  broadcastData({ type: 'GAME_PULSE', sender: myName });
}

let myTelepathy = '', partnerTelepathy = '';
function submitTelepathyWord() {
  const inp = document.getElementById('telepathyWordInput');
  const word = (inp?.value || '').trim();
  if (!word) return;
  inp.value = '';
  toggleModal('telepathyModal', false);
  myTelepathy = word;
  broadcastData({ type: 'GAME_TELEPATHY', word, sender: myName });
  appendSystemNotice('🔮 You locked in your Telepathy word...');
  checkTelepathyMatch();
}

function checkTelepathyMatch() {
  if (!myTelepathy || !partnerTelepathy) return;
  const w1 = myTelepathy, w2 = partnerTelepathy;
  myTelepathy = ''; partnerTelepathy = '';
  const match = w1.toLowerCase() === w2.toLowerCase();
  appendSystemNotice(`🔮 Telepathy Reveal: "${w1}" vs "${w2}" → ${match ? '✨ EXACT TELEPATHY MATCH!' : 'Different wavelengths!'}`);
}

// ==================== 10. LIVE PONG, BLUFF, DUAL SNAP, SOUNDSCAPE, CAPSULE, PIXEL, HOLOGRAM, ORACLE ====================
let pongLoopId = null, pongBall = { x: 160, y: 110, vx: 2.5, vy: 2 }, pongMyY = 85, pongPeerY = 85;
function openPongModal() {
  toggleModal('pickerPopover', false);
  toggleModal('pongModal', true);
  const c = document.getElementById('pongCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const onMove = (e) => {
    const rect = c.getBoundingClientRect();
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    pongMyY = Math.max(0, Math.min(170, ((cy - rect.top) / rect.height) * 220 - 25));
    broadcastData({ type: 'GAME_PONG_Y', y: pongMyY });
  };
  c.onmousemove = onMove;
  c.ontouchmove = onMove;

  if (pongLoopId) clearInterval(pongLoopId);
  pongLoopId = setInterval(() => {
    pongBall.x += pongBall.vx;
    pongBall.y += pongBall.vy;
    if (pongBall.y <= 6 || pongBall.y >= 214) pongBall.vy *= -1;
    if (pongBall.x <= 18 && pongBall.y >= pongMyY && pongBall.y <= pongMyY + 50) pongBall.vx = Math.abs(pongBall.vx);
    if (pongBall.x >= 302 && pongBall.y >= pongPeerY && pongBall.y <= pongPeerY + 50) pongBall.vx = -Math.abs(pongBall.vx);
    if (pongBall.x < 0 || pongBall.x > 320) { pongBall.x = 160; pongBall.y = 110; }

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 320, 220);
    ctx.fillStyle = '#818cf8';
    ctx.fillRect(10, pongMyY, 8, 50);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(302, pongPeerY, 8, 50);
    ctx.beginPath();
    ctx.arc(pongBall.x, pongBall.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
  }, 25);
}

function closePongModal() {
  if (pongLoopId) { clearInterval(pongLoopId); pongLoopId = null; }
  toggleModal('pongModal', false);
}

function sendBluffRound() {
  const s1 = document.getElementById('bluff1')?.value.trim();
  const s2 = document.getElementById('bluff2')?.value.trim();
  const s3 = document.getElementById('bluff3')?.value.trim();
  const lieIdx = parseInt(document.getElementById('bluffLieIdx')?.value || '0', 10);
  if (!s1 || !s2 || !s3) { alert('Fill in all 3 statements.'); return; }
  toggleModal('bluffModal', false);
  const round = { id: 'bluff_' + Date.now(), sender: myName, items: [s1, s2, s3], lieIdx };
  broadcastData({ type: 'GAME_BLUFF', round });
  renderBluffCard(round, true);
}

function renderBluffCard(round, isOut) {
  const c = document.getElementById('messagesContainer');
  if (!c) return;
  const div = document.createElement('div');
  div.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  div.innerHTML = `
    <div class="w-72 theme-panel border border-indigo-400/40 rounded-2xl p-4 shadow-xl">
      <div class="text-[10px] font-bold text-indigo-300 uppercase mb-1.5">🕵️ Two Truths & A Lie (${escapeHTML(round.sender)})</div>
      <div class="space-y-1.5">
        ${round.items.map((txt, i) => `
          <button type="button" onclick="this.textContent = (${i} === ${round.lieIdx} ? '🎯 LIE: ' : '✅ TRUTH: ') + '${escapeHTML(txt).replace(/'/g, "\\'")}'"
            class="w-full p-2 rounded-xl theme-input border text-left text-xs hover:border-amber-400 transition">${escapeHTML(txt)}</button>
        `).join('')}
      </div>
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

let dualSnapStream = null;
async function openDualSnapModal() {
  toggleModal('pickerPopover', false);
  toggleModal('dualSnapModal', true);
  try {
    dualSnapStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 } }, audio: false });
    const v = document.getElementById('dualSnapPreview');
    if (v) v.srcObject = dualSnapStream;
  } catch (e) { alert('Camera unavailable: ' + e.message); }
}

async function captureDualSnap() {
  const v = document.getElementById('dualSnapPreview');
  if (!v || !v.videoWidth) return;
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  const dataUrl = c.toDataURL('image/jpeg', 0.72);
  closeDualSnapModal();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = 'msg_' + Date.now();
  appendMessage(myName, dataUrlToBlobUrl(dataUrl), 'outgoing', time, 'photo', msgId, { isDual: true, rawContent: dataUrl });
  await sendChunkedPayload(dataUrl, { msgId, msgMode: 'photo', isDual: true, time });
}

function closeDualSnapModal() {
  if (dualSnapStream) { dualSnapStream.getTracks().forEach(t => t.stop()); dualSnapStream = null; }
  toggleModal('dualSnapModal', false);
}

let ambientNode = null;
function toggleAmbientScape(mode) {
  toggleModal('soundscapeModal', false);
  if (ambientNode) { try { ambientNode.stop(); } catch (e) {} ambientNode = null; }
  if (mode === 'off') return;
  try {
    initAudioContext();
    const bufSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (mode === 'rain' ? 0.04 : 0.025);
    const src = audioCtx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    src.connect(audioCtx.destination);
    src.start();
    ambientNode = src;
    appendSystemNotice(`🎧 Ambient ${mode} soundscape started`);
  } catch (e) {}
}

function buildBeatStudioUI() {
  const grid = document.getElementById('beatPadsGrid');
  if (!grid || grid.children.length > 0) return;
  const notes = [
    ['Kick', 95], ['Snare', 220], ['Hi-Hat', 880], ['Bass', 130],
    ['Chord C', 261.6], ['Chord E', 329.6], ['Chord G', 392], ['Synth', 523.2]
  ];
  grid.innerHTML = notes.map(([label, freq]) => `
    <button type="button" onclick="playBeatPad(${freq}, '${label}', true)"
      class="py-2.5 rounded-xl theme-input border hover:border-indigo-400 text-[10px] font-bold active:scale-95 transition">${label}</button>
  `).join('');
}

function toggleBeatStudio() {
  toggleModal('pickerPopover', false);
  buildBeatStudioUI();
  const p = document.getElementById('beatStudioPanel');
  if (p) p.classList.toggle('hidden');
}

function playBeatPad(freq, label, broadcast = false) {
  try {
    initAudioContext();
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(0.2, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(g); g.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.26);
  } catch (e) {}
  if (broadcast) broadcastData({ type: 'GAME_BEAT', freq, label });
}

function sendTimeCapsule() {
  const text = document.getElementById('capsuleTextInput')?.value.trim();
  const secs = Math.max(5, parseInt(document.getElementById('capsuleDelayInput')?.value || '30', 10));
  if (!text) return;
  document.getElementById('capsuleTextInput').value = '';
  toggleModal('capsuleModal', false);
  const unlockAt = Date.now() + secs * 1000;
  const cap = { id: 'cap_' + Date.now(), sender: myName, text, unlockAt };
  broadcastData({ type: 'GAME_CAPSULE', cap });
  renderTimeCapsuleCard(cap, true);
}

function renderTimeCapsuleCard(cap, isOut) {
  const c = document.getElementById('messagesContainer');
  if (!c) return;
  const div = document.createElement('div');
  div.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  div.innerHTML = `
    <div class="w-64 theme-panel border border-amber-500/40 rounded-2xl p-3.5 shadow-xl">
      <div class="text-[10px] font-bold text-amber-300 mb-1">⏳ Time Capsule (${escapeHTML(cap.sender)})</div>
      <div id="${cap.id}_body" class="text-xs italic theme-muted">Locked until timer finishes...</div>
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
  const iv = setInterval(() => {
    const rem = Math.ceil((cap.unlockAt - Date.now()) / 1000);
    const el = document.getElementById(cap.id + '_body');
    if (!el) { clearInterval(iv); return; }
    if (rem > 0) el.textContent = `Unlocks in ${rem}s...`;
    else { clearInterval(iv); el.className = 'text-xs font-semibold text-white'; el.textContent = cap.text; }
  }, 1000);
}

function buildPixelGridUI() {
  const board = document.getElementById('pixelGridBoard');
  if (!board || board.children.length > 0) return;
  board.style.gridTemplateColumns = 'repeat(16, minmax(0, 1fr))';
  board.innerHTML = Array.from({ length: 256 }, (_, idx) => `
    <div id="px_${idx}" onclick="paintPixel(${idx}, true)" class="aspect-square bg-slate-900 hover:opacity-80 cursor-pointer"></div>
  `).join('');
}

function openPixelArtModal() {
  toggleModal('pickerPopover', false);
  buildPixelGridUI();
  toggleModal('pixelArtModal', true);
}

function paintPixel(idx, broadcast = false, forcedColor = null) {
  const cell = document.getElementById(`px_${idx}`);
  const color = forcedColor || document.getElementById('pixelColorInput')?.value || '#f43f5e';
  if (cell) cell.style.backgroundColor = color;
  if (broadcast) broadcastData({ type: 'GAME_PIXEL', idx, color });
}

function sharePixelArtToChat() {
  const board = document.getElementById('pixelGridBoard');
  if (!board) return;
  const colors = Array.from(board.children).map(el => el.style.backgroundColor || '#0f172a');
  toggleModal('pixelArtModal', false);
  broadcastData({ type: 'GAME_PIXEL_SHARE', sender: myName, colors });
  renderPixelMosaicCard(myName, colors, true);
}

function renderPixelMosaicCard(sender, colors, isOut) {
  const c = document.getElementById('messagesContainer');
  if (!c) return;
  const div = document.createElement('div');
  div.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  const gridCells = colors.map(col => `<div style="background:${col};aspect-ratio:1/1;"></div>`).join('');
  div.innerHTML = `
    <div class="w-52 theme-panel border border-indigo-400/40 rounded-2xl p-3 shadow-xl">
      <div class="text-[10px] font-bold text-indigo-300 mb-1.5">👾 Co-Op Pixel Mosaic (${escapeHTML(sender)})</div>
      <div style="display:grid;grid-template-columns:repeat(16,1fr);gap:1px;" class="rounded-lg overflow-hidden bg-slate-950 p-1">${gridCells}</div>
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function sendHologramCipher() {
  const text = document.getElementById('hologramTextInput')?.value.trim();
  if (!text) return;
  document.getElementById('hologramTextInput').value = '';
  toggleModal('hologramModal', false);
  const holo = { sender: myName, text };
  broadcastData({ type: 'GAME_HOLOGRAM', holo });
  renderHologramCard(holo, true);
}

function renderHologramCard(holo, isOut) {
  const c = document.getElementById('messagesContainer');
  if (!c) return;
  const div = document.createElement('div');
  div.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  div.innerHTML = `
    <div class="w-72 rounded-2xl p-4 border border-cyan-400/50 bg-gradient-to-br from-cyan-950 via-indigo-950 to-purple-950 shadow-2xl">
      <div class="text-[10px] font-bold uppercase tracking-widest text-cyan-300 mb-1">🧊 3D Hologram Cipher • ${escapeHTML(holo.sender)}</div>
      <p class="text-sm font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200 my-1.5">${escapeHTML(holo.text)}</p>
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function consultVibeOracle() {
  const q = document.getElementById('oracleQuestionInput')?.value.trim();
  if (!q) return;
  document.getElementById('oracleQuestionInput').value = '';
  toggleModal('oracleModal', false);
  const answers = ['✨ Definitely Yes!', '🔮 Signs point to Yes', '⏳ Ask again after coffee', '🌙 The stars say Maybe', '🔥 100% Guaranteed'];
  const ans = answers[Math.floor(Math.random() * answers.length)];
  const msg = `🪄 Vibe Oracle ("${q}") → ${ans}`;
  broadcastData({ type: 'GAME_ORACLE', msg });
  appendSystemNotice(msg);
}

function triggerZeroGRoom() {
  toggleModal('pickerPopover', false);
  document.querySelectorAll('#messagesContainer > div').forEach(el => el.classList.toggle('zero-g-float'));
  broadcastData({ type: 'GAME_ZEROG' });
  appendSystemNotice('🚀 Zero-Gravity float toggled!');
}

function stopAllGamesAndLoops() {
  if (pongLoopId) { clearInterval(pongLoopId); pongLoopId = null; }
  if (syncTimerInterval) { clearInterval(syncTimerInterval); syncTimerInterval = null; }
  if (auraInterval) { clearInterval(auraInterval); auraInterval = null; }
  if (voiceAuraIv) { clearInterval(voiceAuraIv); voiceAuraIv = null; }
  if (voiceAuraStream) { try { voiceAuraStream.getTracks().forEach(t => t.stop()); } catch (e) {} voiceAuraStream = null; }
  if (ambientNode) { try { ambientNode.stop(); } catch (e) {} ambientNode = null; }
  if (dualSnapStream) { try { dualSnapStream.getTracks().forEach(t => t.stop()); } catch (e) {} dualSnapStream = null; }
}

// ==================== 11. CENTRAL PACKET ROUTER + STAR-HUB HOST RELAY ====================
window.handleGamePacket = function(conn, data) {
  if (!data || !data.type) return;

  if (typeof isHost !== 'undefined' && isHost && data.type.startsWith('GAME_') && typeof relayToOthers === 'function') {
    relayToOthers(conn.peer, data);
  }

  switch (data.type) {
    case 'GAME_FX':
      playSynthFX(data.fxId);
      appendSystemNotice(`🔊 ${escapeHTML(data.sender || 'Peer')} played ${escapeHTML(data.fxId || 'FX')} effect`);
      break;
    case 'GAME_BUZZ':
      triggerScreenBuzz(false);
      appendSystemNotice(`⚡ ${escapeHTML(data.sender || 'Peer')} buzzed your screen!`);
      break;
    case 'GAME_CURSOR':
      renderRemoteCursor(data.peerId || conn.peer, data.name, data.rx, data.ry);
      break;
    case 'GAME_RAIN':
      triggerPartyRain(data.emoji || '🎉', false);
      break;
    case 'GAME_AURA':
      applyWeatherAura(data.mode);
      break;
    case 'GAME_RPS_MOVE':
      partnerRPSMove = data.move;
      partnerRPSName = data.sender || 'Partner';
      if (myRPSMove) evaluateRPSRound();
      else appendSystemNotice(`✊✋✌️ ${escapeHTML(partnerRPSName)} locked in an RPS Duel move! Open Play & Apps → RPS Duel to respond.`);
      break;
    case 'GAME_TTT_MOVE':
      tttCells[data.idx] = data.symbol;
      myTTTSymbol = data.symbol === 'X' ? 'O' : 'X';
      tttTurn = myTTTSymbol;
      buildTTTBoardUI();
      renderTTTBoard();
      checkTTTWinner();
      break;
    case 'GAME_TTT_RESET':
      resetTTT(false);
      break;
    case 'GAME_STORY_ADD':
      if (data.entry) {
        storyChainEntries.push(data.entry);
        updateStoryClueUI();
        appendSystemNotice(`📖 ${escapeHTML(data.entry.author || 'Partner')} added a line to the Story Chain!`);
      }
      break;
    case 'GAME_STORY_REVEAL':
      storyChainEntries = [];
      updateStoryClueUI();
      if (Array.isArray(data.entries)) renderStoryRevealCard(data.entries);
      break;
    case 'GAME_TRIVIA':
      if (data.item) {
        renderTriviaQuestion(data.item);
        toggleModal('triviaModal', true);
      }
      break;
    case 'GAME_TRIVIA_ANS':
      appendSystemNotice(`🧠 ${escapeHTML(data.sender || 'Partner')} answered "${escapeHTML(data.label)}" (${data.isRight ? 'Correct ✅' : 'Wrong ❌'})`);
      break;
    case 'GAME_WHEEL':
      appendSystemNotice(`🎡 ${escapeHTML(data.sender || 'Partner')} spun Decision Wheel → ${escapeHTML(data.winner)}`);
      break;
    case 'GAME_POLL_NEW':
      if (data.poll) {
        activePolls[data.poll.id] = data.poll;
        renderPollCard(data.poll);
      }
      break;
    case 'GAME_POLL_VOTE':
      if (activePolls[data.pollId]) {
        activePolls[data.pollId].votes[data.optIdx]++;
        const el = document.getElementById(data.pollId);
        if (el) el.innerHTML = buildPollHTML(activePolls[data.pollId]);
      }
      break;
    case 'GAME_WB_DRAW':
      drawWBSegment(data.x1, data.y1, data.x2, data.y2, data.color);
      break;
    case 'GAME_WB_CLEAR':
      clearWhiteboard(false);
      break;
    case 'GAME_TIMER':
      runSyncedTimer(data.endAt);
      break;
    case 'GAME_YT':
      embedJukeboxVideo(data.vid);
      break;
    case 'GAME_PULSE':
      if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
      showToast('💓 Tactile Pulse', `${data.sender || 'Partner'} sent a heartbeat pulse!`);
      break;
    case 'GAME_TELEPATHY':
      partnerTelepathy = data.word || '';
      if (myTelepathy) checkTelepathyMatch();
      else appendSystemNotice(`🔮 ${escapeHTML(data.sender || 'Partner')} locked in a Telepathy word! Open Telepathy Sync to match.`);
      break;
    case 'GAME_PONG_Y':
      pongPeerY = data.y;
      break;
    case 'GAME_BLUFF':
      if (data.round) renderBluffCard(data.round, false);
      break;
    case 'GAME_BEAT':
      playBeatPad(data.freq, data.label, false);
      break;
    case 'GAME_CAPSULE':
      if (data.cap) renderTimeCapsuleCard(data.cap, false);
      break;
    case 'GAME_PIXEL':
      buildPixelGridUI();
      paintPixel(data.idx, false, data.color);
      break;
    case 'GAME_PIXEL_SHARE':
      if (Array.isArray(data.colors)) renderPixelMosaicCard(data.sender || 'Partner', data.colors, false);
      break;
    case 'GAME_HOLOGRAM':
      if (data.holo) renderHologramCard(data.holo, false);
      break;
    case 'GAME_ORACLE':
      appendSystemNotice(escapeHTML(data.msg || ''));
      break;
    case 'GAME_ZEROG':
      document.querySelectorAll('#messagesContainer > div').forEach(el => el.classList.toggle('zero-g-float'));
      break;
  }
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initPickersSafely);
} else {
  initPickersSafely();
}
