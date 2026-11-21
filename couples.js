// ==================== STEALTH AFTER-HOURS COUPLES VAULT (V2.1 — EXPANDED 60-CARD TOD DECK) ====================
window.afterHoursState = {
  localConsented: false,
  partnerConsented: false,
  unlocked: false,
  panicActive: false
};

// 1. Forgiving Stealth Command Interceptor (catches mobile autocorrect / spaces / typos)
document.addEventListener('submit', (e) => {
  if (!e.target || e.target.getAttribute('onsubmit') !== 'sendMessage(event)') return;
  const input = document.getElementById('messageInput');
  if (!input) return;
  const normalized = input.value.trim().toLowerCase().replace(/\s+/g, '');

  const triggers = ['/afterhours', '/afterhour', '/spicy', '/18+', '/vault', '/couples'];
  if (triggers.includes(normalized)) {
    e.preventDefault();
    e.stopImmediatePropagation();
    input.value = '';
    initiateAfterHoursHandshake();
  }
}, true);

// 2. Silence all notification sounds, toasts, and vibrations while Panic Shield is active
(function patchNotificationsForPanic() {
  const origToast = window.showToast;
  if (typeof origToast === 'function') {
    window.showToast = function(...args) {
      if (window.afterHoursState?.panicActive) return;
      return origToast.apply(this, args);
    };
  }
  const origTone = window.playMessageTone;
  if (typeof origTone === 'function') {
    window.playMessageTone = function(...args) {
      if (window.afterHoursState?.panicActive) return;
      return origTone.apply(this, args);
    };
  }
})();

// Keyboard shortcut: Press Escape twice quickly to trigger Panic Shield on desktop
let lastEscTime = 0;
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && window.afterHoursState?.unlocked && !window.afterHoursState?.panicActive) {
    const now = Date.now();
    if (now - lastEscTime < 600) activatePanicShield();
    lastEscTime = now;
  }
});

// 3. Inject Hidden Modals & Panic Decoy Screen
(function injectStealthVaultUI() {
  if (document.getElementById('afterHoursInjected')) return;
  const marker = document.createElement('div');
  marker.id = 'afterHoursInjected';
  document.body.appendChild(marker);

  const html = `
    <!-- PANIC SHIELD DECOY SCREEN (WEATHER FORECAST) -->
    <div id="panicShieldOverlay" class="fixed inset-0 z-[9999] bg-slate-900 text-white hidden flex flex-col justify-between p-6 select-none">
      <div class="flex justify-between items-center">
        <div onclick="handlePanicUnlockTap()" class="flex items-center gap-2.5 cursor-pointer p-2 -m-2 rounded-xl active:bg-slate-800">
          <span class="text-3xl">⛅</span>
          <div>
            <div class="text-sm font-bold">Local Weather • Live</div>
            <div class="text-[11px] text-slate-400">Updated just now</div>
          </div>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">29°C • Partly Cloudy</span>
      </div>
      <div class="my-auto text-center">
        <div class="text-6xl font-light mb-2">29°</div>
        <div class="text-sm text-slate-300 mb-6">Feels like 31° • Humidity 62% • Wind 11 km/h</div>
        <div class="grid grid-cols-4 gap-2 max-w-md mx-auto text-xs">
          <div class="p-3 rounded-xl bg-slate-800/80"><div class="text-slate-400 mb-1">2 PM</div><div class="text-lg">☀️</div><div class="font-bold mt-1">31°</div></div>
          <div class="p-3 rounded-xl bg-slate-800/80"><div class="text-slate-400 mb-1">5 PM</div><div class="text-lg">⛅</div><div class="font-bold mt-1">28°</div></div>
          <div class="p-3 rounded-xl bg-slate-800/80"><div class="text-slate-400 mb-1">8 PM</div><div class="text-lg">🌙</div><div class="font-bold mt-1">25°</div></div>
          <div class="p-3 rounded-xl bg-slate-800/80"><div class="text-slate-400 mb-1">11 PM</div><div class="text-lg">🌙</div><div class="font-bold mt-1">24°</div></div>
        </div>
      </div>
      <div class="text-center text-[10px] text-slate-500">Meteorological Data Service • Tap top-left weather icon 3× to return</div>
    </div>

    <!-- TRUTH OR DARE 3-TIER MODAL -->
    <div id="todVaultModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
      <div class="theme-panel border border-rose-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-bold text-rose-400">🔥 After-Hours Truth or Dare</h3>
          <button onclick="toggleModal('todVaultModal', false)" class="theme-muted"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <p class="text-[11px] theme-muted mb-2.5">60 curated couple prompts • Auto-shuffles without repeats</p>
        <select id="todHeatLevel" class="w-full theme-input border rounded-xl px-3 py-2 text-xs mb-3">
          <option value="flirty">Level 1: Flirty & Romantic (20 Cards)</option>
          <option value="spicy">Level 2: Spicy & Bold (20 Cards)</option>
          <option value="afterhours">Level 3: After-Hours 18+ (20 Cards)</option>
        </select>
        <div class="flex gap-2">
          <button onclick="drawAfterHoursTOD('TRUTH')" class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">Draw Truth</button>
          <button onclick="drawAfterHoursTOD('DARE')" class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">Draw Dare</button>
        </div>
      </div>
    </div>

    <!-- BLIND DESIRE MATCHER MODAL -->
    <div id="desireMatchModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
      <div class="theme-panel border border-rose-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-sm font-bold text-rose-400">❤️‍🔥 Blind Desire Matcher</h3>
          <button onclick="toggleModal('desireMatchModal', false)" class="theme-muted"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <p class="text-[11px] theme-muted mb-3">Swipe privately. Only mutual "YES" cards are revealed to both of you!</p>
        <div id="desireCardStage" class="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 min-h-[110px] flex flex-col items-center justify-center mb-3"></div>
        <div id="desireSwipeBtns" class="flex gap-2">
          <button onclick="swipeDesireCard(false)" class="flex-1 py-2.5 rounded-xl theme-input border text-xs font-bold">Pass</button>
          <button onclick="swipeDesireCard(true)" class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold">❤️‍🔥 Yes</button>
        </div>
      </div>
    </div>

    <!-- LOVE COUPON GENERATOR MODAL -->
    <div id="loveCouponModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
      <div class="theme-panel border border-amber-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-bold text-amber-400">🎟️ After-Hours Scratch Coupon</h3>
          <button onclick="toggleModal('loveCouponModal', false)" class="theme-muted"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <select id="couponPresetSelect" onchange="document.getElementById('couponCustomInput').value = this.value" class="w-full theme-input border rounded-xl px-3 py-2 text-xs mb-2">
          <option value="15-Minute Full Body Oil Massage">15-Minute Full Body Oil Massage</option>
          <option value="Midnight Drive & Your Playlist">Midnight Drive & Your Playlist</option>
          <option value="One Wish Tonight — No Questions Asked">One Wish Tonight — No Questions Asked</option>
          <option value="Blindfolded Slow Dance & Whisper Dare">Blindfolded Slow Dance & Whisper Dare</option>
        </select>
        <input id="couponCustomInput" type="text" value="15-Minute Full Body Oil Massage" class="w-full theme-input border rounded-xl px-3 py-2 text-xs mb-3" />
        <button onclick="sendAfterHoursCoupon()" class="w-full py-2.5 rounded-xl bg-amber-500 text-black text-xs font-bold">Send Scratch Coupon</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
})();

// 4. Mutual Dual-Consent Handshake
function initiateAfterHoursHandshake() {
  if (Object.keys(connections || {}).length === 0) {
    if (typeof showToast === 'function') showToast('🔒 Private Room Required', 'Invite your partner into the room before unlocking After-Hours');
    return;
  }
  window.afterHoursState.localConsented = true;
  if (typeof broadcastData === 'function') {
    broadcastData({ type: 'AH_CONSENT_REQ', sender: myName });
  }
  if (window.afterHoursState.partnerConsented) {
    unlockAfterHoursVault();
  } else {
    renderAfterHoursInviteCard(myName, true);
  }
}

function confirmAfterHoursConsent() {
  window.afterHoursState.localConsented = true;
  if (typeof broadcastData === 'function') {
    broadcastData({ type: 'AH_CONSENT_ACK', sender: myName });
  }
  if (window.afterHoursState.partnerConsented) {
    unlockAfterHoursVault();
  }
}

function renderAfterHoursInviteCard(sender, isOut) {
  const c = document.getElementById('messagesContainer');
  if (!c) return;
  const div = document.createElement('div');
  div.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  div.innerHTML = `
    <div class="w-72 theme-panel border border-rose-500/40 rounded-2xl p-4 text-center shadow-xl">
      <div class="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1">🔐 Private 18+ Vault Request</div>
      <p class="text-xs mb-3">${isOut ? 'Waiting for partner to confirm 18+ mutual consent...' : `<b>${escapeHTML(sender)}</b> invited you to unlock the hidden After-Hours Vault.`}</p>
      ${!isOut ? `<button onclick="confirmAfterHoursConsent(); this.disabled=true; this.textContent='Confirmed ✓';" class="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">Confirm 18+ & Enter Vault</button>` : ''}
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function unlockAfterHoursVault() {
  if (window.afterHoursState.unlocked) return;
  window.afterHoursState.unlocked = true;

  const headerControls = document.querySelector('header .flex.items-center.gap-1\\.5');
  if (headerControls && !document.getElementById('panicShieldBtn')) {
    const btn = document.createElement('button');
    btn.id = 'panicShieldBtn';
    btn.type = 'button';
    btn.title = 'Panic Shield (Instant Disguise)';
    btn.className = 'w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-xs';
    btn.innerHTML = '<i class="fa-solid fa-shield-cat"></i>';
    btn.onclick = activatePanicShield;
    headerControls.prepend(btn);
  }

  const tabBar = document.querySelector('#pickerPopover .flex.gap-1');
  const pop = document.getElementById('pickerPopover');
  if (tabBar && pop && !document.getElementById('tabAfterHours')) {
    const tabBtn = document.createElement('button');
    tabBtn.id = 'tabAfterHours';
    tabBtn.type = 'button';
    tabBtn.className = 'flex-1 py-1 text-[10px] font-bold rounded-lg text-rose-400';
    tabBtn.textContent = '🔥 18+';
    tabBtn.onclick = () => switchAfterHoursTab();
    tabBar.appendChild(tabBtn);

    const grid = document.createElement('div');
    grid.id = 'afterHoursGrid';
    grid.className = 'hidden grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pt-1';
    grid.innerHTML = `
      <button type="button" onclick="toggleModal('todVaultModal',true);togglePicker()" class="p-2 rounded-xl theme-input border border-rose-500/40 text-[10px] font-bold text-rose-300">🔥 Truth or Dare</button>
      <button type="button" onclick="rollIntimacyDice();togglePicker()" class="p-2 rounded-xl theme-input border border-rose-500/40 text-[10px] font-bold text-rose-300">🎲 Intimacy Dice</button>
      <button type="button" onclick="openDesireMatcher();togglePicker()" class="p-2 rounded-xl theme-input border border-rose-500/40 text-[10px] font-bold text-rose-300">❤️‍🔥 Desire Match</button>
      <button type="button" onclick="toggleModal('loveCouponModal',true);togglePicker()" class="p-2 rounded-xl theme-input border border-amber-500/40 text-[10px] font-bold text-amber-300">🎟️ Love Coupon</button>
      <button type="button" onclick="activatePanicShield();togglePicker()" class="col-span-2 p-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-[10px] font-bold text-rose-300">🛡️ Activate Panic Shield</button>
    `;
    pop.appendChild(grid);
  }

  if (typeof showToast === 'function') {
    showToast('🔥 After-Hours Vault Unlocked', 'Open 😊 → 🔥 18+ tab. Tap 🛡️ anytime for instant disguise.');
  }
}

function switchAfterHoursTab() {
  ['emojis', 'stickers', 'sounds', 'surprises'].forEach(k => {
    const g = document.getElementById(k + 'Grid');
    const b = document.getElementById('tab' + k[0].toUpperCase() + k.slice(1));
    if (g) g.classList.add('hidden');
    if (b) b.className = 'flex-1 py-1 text-[10px] font-semibold rounded-lg theme-muted';
  });
  const ahGrid = document.getElementById('afterHoursGrid');
  const ahBtn = document.getElementById('tabAfterHours');
  if (ahGrid) ahGrid.classList.remove('hidden');
  if (ahBtn) ahBtn.className = 'flex-1 py-1 text-[10px] font-bold rounded-lg bg-rose-600 text-white';
}

window.lockAfterHoursVault = function() {
  window.afterHoursState = { localConsented: false, partnerConsented: false, unlocked: false, panicActive: false };
  document.getElementById('panicShieldBtn')?.remove();
  document.getElementById('tabAfterHours')?.remove();
  document.getElementById('afterHoursGrid')?.remove();
  document.getElementById('panicShieldOverlay')?.classList.add('hidden');
};

// 5. Panic Shield Disguise & 3-Tap Recovery
let panicTapCount = 0, panicTapTimer = null;
function activatePanicShield() {
  window.afterHoursState.panicActive = true;
  document.getElementById('panicShieldOverlay')?.classList.remove('hidden');
}
function handlePanicUnlockTap() {
  panicTapCount++;
  clearTimeout(panicTapTimer);
  panicTapTimer = setTimeout(() => { panicTapCount = 0; }, 1200);
  if (panicTapCount >= 3) {
    panicTapCount = 0;
    window.afterHoursState.panicActive = false;
    document.getElementById('panicShieldOverlay')?.classList.add('hidden');
  }
}

// 6. Expanded 60-Card Truth or Dare Deck (No-Repeat Shuffle)
const todVaultBank = {
  flirty: {
    TRUTH: [
      "What was your very first impression of me when we met?",
      "Which outfit of mine makes it hardest for you to focus?",
      "What is your all-time favorite memory of just the two of us?",
      "When did you first realize you had serious feelings for me?",
      "What tiny habit of mine do you secretly find irresistible?",
      "What is the best kiss we have ever shared so far?",
      "If we could teleport anywhere tonight for a private date, where would we go?",
      "What song instantly reminds you of me when you hear it?",
      "What is something sweet I did that you still think about?",
      "What part of my face or smile do you love looking at the most?"
    ],
    DARE: [
      "Send a 5-second voice whisper saying what you want right now.",
      "Send a close-up selfie with your best romantic smile.",
      "Type a 1-sentence love confession without using backspace.",
      "Describe our dream weekend getaway in 3 emojis.",
      "Give me a brand-new romantic nickname I have to use tonight.",
      "Send a Dual-Camera Snap showing your face and what you're doing right now.",
      "Hum the chorus of a romantic song in a voice note for me to guess.",
      "Write a 2-line poem about my eyes right now.",
      "Send a Scratch Card with a sweet promise for our next meetup.",
      "Hold the Tactile Pulse Pad for 5 seconds in a heartbeat rhythm."
    ]
  },
  spicy: {
    TRUTH: [
      "What is one thing you've been shy to ask me to try together?",
      "Where on your body is your favorite spot to be kissed slowly?",
      "What is your wildest daydream involving the two of us?",
      "What did I wear recently that you couldn't stop thinking about?",
      "Do you prefer slow and teasing or fast and passionate?",
      "What is the most attractive thing I do without even realizing it?",
      "Have you ever had a dream about me you didn't tell me about? Describe it.",
      "What is one romantic or spicy movie scene you'd love to recreate with me?",
      "What kind of touch gives you instant goosebumps every time?",
      "When was the last time you were thinking about me at an inappropriate moment?"
    ],
    DARE: [
      "Describe in detail what you'd do if I walked into your room right now.",
      "Send a 10-second self-destructing secret message with a bold confession.",
      "Record a 6-second voice note saying my name in your deepest whisper.",
      "Send a photo of your collarbone, lips, or hand right now.",
      "Let me pick your lock-screen or chat nickname for the next 24 hours.",
      "Type out a 3-step plan for our next date night—no holding back.",
      "Roll the Intimacy Dice and promise to complete whatever it lands on next time.",
      "Send a 10-second secret message revealing your favorite physical feature of mine.",
      "Draw a hint of where you want to be kissed next on the Whiteboard.",
      "Owe me a 5-minute neck and shoulder massage—send a Love Coupon to make it official."
    ]
  },
  afterhours: {
    TRUTH: [
      "What is your #1 unspoken 18+ fantasy with me?",
      "What is one thing I do in bed that drives you completely wild?",
      "What is the boldest or riskiest place you've ever wanted us to hook up?",
      "What is a new position, roleplay, or kink you're curious to explore with me?",
      "Lights on, dim candlelight, or total darkness—which turns you on most and why?",
      "What is the fastest way for me to get you in the mood after a long day?",
      "If you could control me for 15 minutes with zero rules, what would you do first?",
      "What was the hottest moment we've ever had together so far?",
      "Do you prefer being in total control or letting me take charge?",
      "What is one word or phrase you love hearing whispered in your ear?"
    ],
    DARE: [
      "Record a 10-second sultry voice note describing tonight's after-hours plan.",
      "Send a 10-second self-destructing secret message telling me exactly what you want tonight.",
      "Draw a clue of your favorite fantasy on the Whiteboard in 30 seconds.",
      "Owe me one unconditional 'Yes' Love Coupon to redeem next time we meet.",
      "Type a 3-sentence spicy story starring the two of us.",
      "Send a secret message describing what you're wearing (or not wearing) right now.",
      "Let me ask you ANY one question—you must answer 100% honestly in secret mode.",
      "Complete two back-to-back rolls of the Intimacy Dice without skipping.",
      "Send a 5-second breathy voice whisper counting down from 5 to 1.",
      "Create and send a custom Love Coupon for something we've never tried before."
    ]
  }
};

const usedTodPrompts = new Set();

function drawAfterHoursTOD(kind) {
  const level = document.getElementById('todHeatLevel').value || 'flirty';
  const fullList = todVaultBank[level][kind];
  let available = fullList.filter(q => !usedTodPrompts.has(`${level}:${kind}:${q}`));

  // Reset pool for this category once all 10 cards have been drawn
  if (available.length === 0) {
    fullList.forEach(q => usedTodPrompts.delete(`${level}:${kind}:${q}`));
    available = fullList;
  }

  const prompt = available[Math.floor(Math.random() * available.length)];
  usedTodPrompts.add(`${level}:${kind}:${prompt}`);

  toggleModal('todVaultModal', false);
  const card = { id: 'tod_' + Date.now(), drawer: myName, level: level.toUpperCase(), kind, prompt };
  broadcastData({ type: 'AH_TOD_CARD', card });
  renderTODVaultCard(card, true);
}

function renderTODVaultCard(card, isOut) {
  const c = document.getElementById('messagesContainer'), div = document.createElement('div');
  div.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  div.innerHTML = `
    <div class="w-72 rounded-2xl p-4 border border-rose-500/50 bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 text-white shadow-xl">
      <div class="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-1">🔥 ${escapeHTML(card.level)} • ${escapeHTML(card.kind)} (${escapeHTML(card.drawer)})</div>
      <p class="text-xs font-semibold leading-relaxed my-2">${escapeHTML(card.prompt)}</p>
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function rollIntimacyDice() {
  const actions = ['Slow Kiss', 'Sensual Massage', 'Whisper Fantasy', 'Blindfold Tease', 'Neck Kisses', 'Undress 1 Item'];
  const targets = [
    { label: 'Lips • 30s', secs: 30 },
    { label: 'Neck & Shoulders • 60s', secs: 60 },
    { label: 'Hands & Wrists • 45s', secs: 45 },
    { label: 'Dealer’s Choice • 60s', secs: 60 },
    { label: 'Lower Back • 60s', secs: 60 },
    { label: 'Anywhere • 30s', secs: 30 }
  ];
  const pick = targets[Math.floor(Math.random() * targets.length)];
  const roll = {
    id: 'dice_' + Date.now(),
    action: actions[Math.floor(Math.random() * actions.length)],
    target: pick.label,
    secs: pick.secs,
    roller: myName
  };
  broadcastData({ type: 'AH_DICE_ROLL', roll });
  renderIntimacyDiceCard(roll, true);
}

function renderIntimacyDiceCard(roll, isOut) {
  if (navigator.vibrate && !window.afterHoursState?.panicActive) navigator.vibrate([120, 60, 120]);
  const c = document.getElementById('messagesContainer'), div = document.createElement('div');
  div.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  div.innerHTML = `
    <div class="w-64 theme-panel border border-rose-500/50 rounded-2xl p-3.5 text-center shadow-xl">
      <div class="text-[10px] font-bold text-rose-400 mb-2">🎲 Intimacy Dice • ${escapeHTML(roll.roller)}</div>
      <div class="grid grid-cols-2 gap-2 my-1">
        <div class="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-white">${escapeHTML(roll.action)}</div>
        <div class="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-amber-300">${escapeHTML(roll.target)}</div>
      </div>
      <button id="${roll.id}_btn" onclick="startDiceCountdown('${roll.id}', ${roll.secs || 30})" class="mt-2 w-full py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-[11px] font-bold text-rose-200">⏱️ Start ${roll.secs || 30}s Timer</button>
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

window.startDiceCountdown = function(id, secs) {
  const btn = document.getElementById(id + '_btn');
  if (!btn || btn.dataset.running) return;
  btn.dataset.running = '1';
  let rem = secs;
  btn.textContent = `⏳ ${rem}s remaining...`;
  const iv = setInterval(() => {
    rem--;
    if (rem > 0) {
      btn.textContent = `⏳ ${rem}s remaining...`;
    } else {
      clearInterval(iv);
      btn.textContent = '✅ Time Complete!';
      if (navigator.vibrate && !window.afterHoursState?.panicActive) navigator.vibrate([250, 100, 250]);
    }
  }, 1000);
};

// Race-free Desire Matcher with Round ID tracking
const desireDeck = [
  "Candlelit late-night massage with music",
  "Blindfolded sensory taste & touch game",
  "Roleplay meeting as strangers at a bar",
  "Shower together with zero phones",
  "Truth or Dare with drinks / forfeits",
  "Morning breakfast & stay-in-bed marathon"
];
let desireRoundId = null, desireIdx = 0, myDesireYes = new Set(), partnerDesireSubmission = null;

function openDesireMatcher(incomingRoundId = null) {
  const targetRound = incomingRoundId || ('round_' + Date.now());
  desireRoundId = targetRound;
  desireIdx = 0;
  myDesireYes = new Set();
  if (!incomingRoundId) {
    partnerDesireSubmission = null;
    broadcastData({ type: 'AH_DESIRE_INVITE', roundId: targetRound, sender: myName });
  }
  document.getElementById('desireSwipeBtns').classList.remove('hidden');
  renderCurrentDesireCard();
  toggleModal('desireMatchModal', true);
}

function renderCurrentDesireCard() {
  const stage = document.getElementById('desireCardStage');
  if (desireIdx < desireDeck.length) {
    stage.innerHTML = `<div class="text-[10px] text-rose-400 font-bold mb-1">Card ${desireIdx + 1} of ${desireDeck.length}</div><div class="text-sm font-bold text-white">${escapeHTML(desireDeck[desireIdx])}</div>`;
  } else {
    document.getElementById('desireSwipeBtns').classList.add('hidden');
    stage.innerHTML = `<div class="text-xs text-emerald-400 font-bold">✓ Swipes Locked! Waiting for partner...</div>`;
    broadcastData({ type: 'AH_DESIRE_DONE', roundId: desireRoundId, yesIndices: Array.from(myDesireYes) });
    checkDesireMatches();
  }
}

function swipeDesireCard(liked) {
  if (liked) myDesireYes.add(desireIdx);
  desireIdx++;
  renderCurrentDesireCard();
}

function checkDesireMatches() {
  if (!partnerDesireSubmission || partnerDesireSubmission.roundId !== desireRoundId) return;
  if (desireIdx < desireDeck.length) return;
  toggleModal('desireMatchModal', false);
  const mutual = Array.from(myDesireYes).filter(i => partnerDesireSubmission.yesIndices.includes(i)).map(i => desireDeck[i]);
  renderDesireResultsCard(mutual);
}

function renderDesireResultsCard(mutual) {
  const c = document.getElementById('messagesContainer'), div = document.createElement('div');
  div.className = 'flex flex-col items-center my-2';
  div.innerHTML = `
    <div class="w-72 theme-panel border border-rose-500/50 rounded-2xl p-4 text-center shadow-xl">
      <div class="text-[10px] font-bold text-rose-400 uppercase mb-1">❤️‍🔥 Mutual Desire Matches</div>
      ${mutual.length ? `<ul class="text-xs text-left space-y-1 mt-2">${mutual.map(m => `<li class="p-1.5 rounded-lg bg-rose-500/15 text-white">✨ ${escapeHTML(m)}</li>`).join('')}</ul>` : `<p class="text-xs theme-muted mt-1">No mutual matches this round—try another deck!</p>`}
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

function sendAfterHoursCoupon() {
  const text = document.getElementById('couponCustomInput').value.trim();
  if (!text) return;
  toggleModal('loveCouponModal', false);
  const ts = Date.now();
  const time = new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const msgId = 'msg_' + ts + '_' + Math.random().toString(36).substr(2, 4);
  broadcastData({ type: 'CHAT', msgId, msgMode: 'scratch', senderId: myPeerId, senderName: myName, content: `🎟️ LOVE COUPON: ${text}`, time, ts }, true);
  appendMessage(myName, `🎟️ LOVE COUPON: ${text}`, 'outgoing', time, 'scratch', msgId, { ts });
}

// 7. Packet Handler Hook for After-Hours Events
window.handleAfterHoursPacket = function(data) {
  switch (data.type) {
    case 'AH_CONSENT_REQ':
      window.afterHoursState.partnerConsented = true;
      if (window.afterHoursState.localConsented) {
        broadcastData({ type: 'AH_CONSENT_ACK', sender: myName });
        unlockAfterHoursVault();
      } else {
        renderAfterHoursInviteCard(data.sender, false);
      }
      return true;
    case 'AH_CONSENT_ACK':
      window.afterHoursState.partnerConsented = true;
      if (window.afterHoursState.localConsented) unlockAfterHoursVault();
      return true;
    case 'AH_TOD_CARD':
      renderTODVaultCard(data.card, false);
      return true;
    case 'AH_DICE_ROLL':
      renderIntimacyDiceCard(data.roll, false);
      return true;
    case 'AH_DESIRE_INVITE':
      partnerDesireSubmission = null;
      if (document.getElementById('desireMatchModal')?.classList.contains('hidden')) {
        openDesireMatcher(data.roundId);
      }
      return true;
    case 'AH_DESIRE_DONE':
      partnerDesireSubmission = { roundId: data.roundId, yesIndices: data.yesIndices || [] };
      checkDesireMatches();
      return true;
  }
  return false;
};
