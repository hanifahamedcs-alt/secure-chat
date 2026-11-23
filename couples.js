// ==================== STEALTH AFTER-HOURS COUPLES VAULT (V3 — EXPANDED & CUSTOM PROMPTS) ====================
window.afterHoursState = {
  localConsented: false,
  partnerConsented: false,
  unlocked: false,
  panicActive: false
};

// 1. Forgiving Stealth Command Interceptor
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

// Press Escape twice quickly to trigger Panic Shield on desktop
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

    <!-- TRUTH OR DARE MODAL (DECK + CUSTOM USER-TO-USER PROMPT) -->
    <div id="todVaultModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
      <div class="theme-panel border border-rose-500/40 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-sm font-bold text-rose-400">🔥 After-Hours Truth or Dare</h3>
          <button onclick="toggleModal('todVaultModal', false)" class="theme-muted"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <label class="block text-left text-[10px] font-bold uppercase tracking-wider theme-muted mb-1">Draw Random Card</label>
        <select id="todHeatLevel" class="w-full theme-input border rounded-xl px-3 py-2 text-xs mb-2.5">
          <option value="flirty">Flirty & Romantic</option>
          <option value="spicy">Spicy & Bold</option>
          <option value="afterhours">After-Hours 18+</option>
        </select>
        <div class="flex gap-2 mb-4">
          <button onclick="drawAfterHoursTOD('TRUTH')" class="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">Draw Truth</button>
          <button onclick="drawAfterHoursTOD('DARE')" class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">Draw Dare</button>
        </div>

        <div class="border-t border-white/10 pt-3">
          <label class="block text-left text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1.5">✍️ Ask Your Own Custom Question / Dare</label>
          <textarea id="customTodInput" rows="2" placeholder="Type a custom Truth or Dare for your partner..." class="w-full theme-input border rounded-xl px-3 py-2 text-xs mb-2 focus:outline-none focus:border-rose-400"></textarea>
          <div class="flex gap-2">
            <button onclick="sendCustomAfterHoursTOD('TRUTH')" class="flex-1 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/40 text-indigo-200 text-xs font-bold">Send as Truth</button>
            <button onclick="sendCustomAfterHoursTOD('DARE')" class="flex-1 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-200 text-xs font-bold">Send as Dare</button>
          </div>
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
        <div id="desireCardStage" class="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 min-h-[115px] flex flex-col items-center justify-center mb-3"></div>
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
          <option value="Full Body Oil Massage — No Rush">Full Body Oil Massage — No Rush</option>
          <option value="Midnight Drive & Your Playlist">Midnight Drive & Your Playlist</option>
          <option value="One Wish Tonight — No Questions Asked">One Wish Tonight — No Questions Asked</option>
          <option value="Blindfolded Slow Dance & Whisper Dare">Blindfolded Slow Dance & Whisper Dare</option>
          <option value="Breakfast in Bed & Lazy Morning">Breakfast in Bed & Lazy Morning</option>
        </select>
        <input id="couponCustomInput" type="text" value="Full Body Oil Massage — No Rush" class="w-full theme-input border rounded-xl px-3 py-2 text-xs mb-3" />
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

// 6. Expanded Truth or Dare Deck (No Numbers Shown + Custom User-to-User Prompts)
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
      "What part of my face or smile do you love looking at the most?",
      "What was the exact moment you knew you wanted to kiss me for the first time?",
      "If we had an entire weekend locked indoors with zero phones, what would we do first?"
    ],
    DARE: [
      "Send a voice whisper saying what you want right now.",
      "Send a close-up selfie with your best romantic smile.",
      "Type a love confession without using backspace.",
      "Describe our dream weekend getaway using only emojis.",
      "Give me a brand-new romantic nickname I have to use tonight.",
      "Send a Dual-Camera Snap showing your face and what you're doing right now.",
      "Hum the chorus of a romantic song in a voice note for me to guess.",
      "Write a short two-line poem about my eyes right now.",
      "Send a Scratch Card with a sweet promise for our next meetup.",
      "Hold the Tactile Pulse Pad in a steady heartbeat rhythm.",
      "Record a voice note telling me the three things you adore most about me.",
      "Change your chat theme color to match the mood you want tonight."
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
      "When was the last time you were thinking about me at an inappropriate moment?",
      "What is your favorite way for me to initiate physical closeness?",
      "Which part of my body do you love touching the most?"
    ],
    DARE: [
      "Describe in detail what you'd do if I walked into your room right now.",
      "Send a self-destructing secret message with a bold confession.",
      "Record a voice note saying my name in your deepest whisper.",
      "Send a photo of your collarbone, lips, or hand right now.",
      "Let me pick your chat nickname for the rest of tonight.",
      "Type out a step-by-step plan for our next private date night.",
      "Roll the Intimacy Dice and promise to complete whatever it lands on next time.",
      "Send a secret message revealing your favorite physical feature of mine.",
      "Draw a hint of where you want to be kissed next on the Whiteboard.",
      "Send a Love Coupon promising a slow neck and shoulder massage.",
      "Send a voice note describing the exact kiss you want next time we meet.",
      "Ask me one bold question using the Custom Truth button right now."
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
      "If you could control me with zero rules tonight, what would you do first?",
      "What was the hottest moment we've ever had together so far?",
      "Do you prefer being in total control or letting me take charge?",
      "What is one word or phrase you love hearing whispered in your ear?",
      "What is something you've seen or read that made you immediately want me?",
      "If we played strip poker or strip trivia tonight, how confident are you?",
      "What is the longest foreplay session you've ever craved?",
      "Which sense turns you on fastest—whispered words, blindfolded touch, or eye contact?",
      "What is one secret turn-on you've never admitted out loud before?",
      "If we booked a private hotel suite tonight, what happens the second the door locks?"
    ],
    DARE: [
      "Record a sultry voice note describing tonight's after-hours plan.",
      "Send a self-destructing secret message telling me exactly what you want tonight.",
      "Draw a clue of your favorite fantasy on the Whiteboard before the timer runs out.",
      "Send an unconditional 'Yes' Love Coupon to redeem next time we meet.",
      "Type a spicy short story starring the two of us.",
      "Send a secret message describing what you're wearing (or not wearing) right now.",
      "Let me ask you ANY custom question—you must answer honestly in secret mode.",
      "Complete back-to-back rolls of the Intimacy Dice without skipping.",
      "Send a breathy voice whisper counting down slowly.",
      "Create and send a custom Love Coupon for something we've never tried before.",
      "Send a close-up photo teasing just a hint of skin in secret mode.",
      "Describe your favorite move in bed using only metaphors.",
      "Use the Custom Dare box to challenge me to something bold right now.",
      "Record a voice note telling me where you want my hands right now."
    ]
  }
};

const usedTodPrompts = new Set();

function drawAfterHoursTOD(kind) {
  const level = document.getElementById('todHeatLevel').value || 'flirty';
  const fullList = todVaultBank[level][kind];
  let available = fullList.filter(q => !usedTodPrompts.has(`${level}:${kind}:${q}`));

  if (available.length === 0) {
    fullList.forEach(q => usedTodPrompts.delete(`${level}:${kind}:${q}`));
    available = fullList;
  }

  const prompt = available[Math.floor(Math.random() * available.length)];
  usedTodPrompts.add(`${level}:${kind}:${prompt}`);

  toggleModal('todVaultModal', false);
  const labelMap = { flirty: 'FLIRTY', spicy: 'SPICY', afterhours: 'AFTER-HOURS' };
  const card = {
    id: 'tod_' + Date.now(),
    drawer: myName,
    level: labelMap[level] || 'AFTER-HOURS',
    kind,
    prompt,
    isCustom: false
  };
  broadcastData({ type: 'AH_TOD_CARD', card });
  renderTODVaultCard(card, true);
}

// User-to-User Custom Truth or Dare Sender
window.sendCustomAfterHoursTOD = function(kind) {
  const input = document.getElementById('customTodInput');
  const text = (input?.value || '').trim();
  if (!text) {
    input?.focus();
    return;
  }
  input.value = '';
  toggleModal('todVaultModal', false);
  const card = {
    id: 'tod_custom_' + Date.now(),
    drawer: myName,
    level: 'CUSTOM CHALLENGE',
    kind,
    prompt: text,
    isCustom: true
  };
  broadcastData({ type: 'AH_TOD_CARD', card });
  renderTODVaultCard(card, true);
};

function renderTODVaultCard(card, isOut) {
  const c = document.getElementById('messagesContainer'), div = document.createElement('div');
  div.className = `flex flex-col ${isOut ? 'items-end' : 'items-start'}`;
  const badgeText = card.isCustom
    ? `✍️ ${escapeHTML(card.drawer)} ASKED YOU A ${escapeHTML(card.kind)}`
    : `🔥 ${escapeHTML(card.level)} • ${escapeHTML(card.kind)} (${escapeHTML(card.drawer)})`;

  div.innerHTML = `
    <div class="w-72 rounded-2xl p-4 border ${card.isCustom ? 'border-amber-400/60' : 'border-rose-500/50'} bg-gradient-to-br from-rose-950 via-slate-900 to-purple-950 text-white shadow-xl">
      <div class="text-[10px] font-bold uppercase tracking-widest ${card.isCustom ? 'text-amber-300' : 'text-rose-400'} mb-1">${badgeText}</div>
      <p class="text-xs font-semibold leading-relaxed my-2">${escapeHTML(card.prompt)}</p>
      ${!isOut ? `<button onclick="setReplyQuote('${escapeHTML(card.drawer)}', '${escapeHTML(card.prompt).replace(/'/g, "\\'")}'); document.getElementById('messageInput')?.focus();" class="mt-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-rose-200">↩ Reply to ${escapeHTML(card.kind)}</button>` : ''}
    </div>
  `;
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
}

// 7. Expanded Intimacy Dice (More Actions, Targets & Timers)
function rollIntimacyDice() {
  const actions = [
    'Slow Kiss',
    'Sensual Massage',
    'Whisper Fantasy',
    'Blindfold Tease',
    'Soft Neck Kisses',
    'Undress One Item',
    'Body Trace with Fingertips',
    'Eye-Contact Staredown',
    'Ear & Jawline Nibbles',
    'Slow Dance Hold',
    'Ice Cube or Warm Breath Tease',
    'Guided Hand Placement',
    'Lap Sit & Close Whisper',
    'Dealer’s Secret Move'
  ];
  const targets = [
    { label: 'Lips • 30s', secs: 30 },
    { label: 'Neck & Shoulders • 60s', secs: 60 },
    { label: 'Hands & Wrists • 45s', secs: 45 },
    { label: 'Lower Back & Waist • 60s', secs: 60 },
    { label: 'Collarbone & Chest • 45s', secs: 45 },
    { label: 'Inner Thighs • 45s', secs: 45 },
    { label: 'Ears & Jawline • 30s', secs: 30 },
    { label: 'Full Back • 90s', secs: 90 },
    { label: 'Dealer’s Choice • 60s', secs: 60 },
    { label: 'Partner’s Favorite Spot • 60s', secs: 60 }
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
        <div class="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-white flex items-center justify-center">${escapeHTML(roll.action)}</div>
        <div class="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-amber-300 flex items-center justify-center">${escapeHTML(roll.target)}</div>
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

// 8. Expanded Blind Desire Matcher Deck (14 Fantasy & Date Cards)
const desireDeck = [
  "Candlelit late-night oil massage with slow music",
  "Blindfolded sensory taste & touch session",
  "Roleplay meeting as strangers at a hotel bar",
  "Steamy shower together with zero phones",
  "Strip Truth or Dare with custom forfeits",
  "Morning breakfast & stay-in-bed marathon",
  "Late-night drive with a secret detour",
  "Silk tie or soft restraint tease",
  "Taking private Polaroid / Dual-Snap photos together",
  "Whispering every fantasy before touching",
  "Ice cube & warm candle-wax sensory play",
  "Spontaneous weekend staycation in a private suite",
  "One partner gets full control for the entire night",
  "Slow midnight dance in the living room"
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
    stage.innerHTML = `<div class="text-[10px] text-rose-400 uppercase tracking-wider font-bold mb-1.5">Desire Card</div><div class="text-sm font-bold text-white leading-snug">${escapeHTML(desireDeck[desireIdx])}</div>`;
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
      ${mutual.length ? `<ul class="text-xs text-left space-y-1.5 mt-2">${mutual.map(m => `<li class="p-2 rounded-lg bg-rose-500/15 border border-rose-500/20 text-white">✨ ${escapeHTML(m)}</li>`).join('')}</ul>` : `<p class="text-xs theme-muted mt-1">No mutual matches this round—try another deck!</p>`}
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

// 9. Packet Handler Hook for After-Hours Events
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
