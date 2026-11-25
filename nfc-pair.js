// ==================== ONE CHAT — TAP-TO-PAIR (WEB NFC + INSTANT QR HANDSHAKE) ====================
(function initOneChatTapToPair() {
  const isTa = () => window.currentAppLang === 'ta';

  // 1. Inject Tap-to-Pair Modal & Header Button
  window.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('tapPairModal')) {
      const modalHtml = `
        <div id="tapPairModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
          <div class="theme-panel border border-amber-400/45 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
            <div class="flex justify-between items-center mb-2">
              <h3 id="tpModalTitle" class="text-sm font-extrabold text-amber-300">📡 Tap Phones to Pair</h3>
              <button type="button" onclick="closeTapPairModal()" class="theme-muted"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <p id="tpSubtitle" class="text-[11px] theme-muted mb-3">
              Hold the back of your partner's phone (with NFC tag/Android Web NFC) or scan the instant room code below:
            </p>

            <!-- Live Animated QR Code for iPhone & Universal Instant Join -->
            <div class="p-3 rounded-2xl bg-white w-44 h-44 mx-auto mb-3 flex items-center justify-center shadow-lg">
              <img id="tpQrImage" src="" alt="Room Pair QR" class="w-full h-full object-contain" />
            </div>

            <div class="text-xs font-mono font-bold text-emerald-300 mb-3" id="tpRoomCodeDisplay"></div>

            <!-- Android Web NFC Write / Beam Button -->
            <button type="button" id="tpNfcBeamBtn" onclick="startNfcTagBeam()" class="w-full py-2.5 rounded-xl theme-accent text-xs font-extrabold shadow-lg mb-2 flex items-center justify-center gap-2">
              <i class="fa-solid fa-wifi rotate-90"></i>
              <span id="tpNfcBtnLabel">Write / Beam Room to NFC Tag</span>
            </button>

            <div id="tpNfcStatus" class="text-[11px] text-amber-200 min-h-[18px] mb-2"></div>

            <button type="button" onclick="copyRoomInviteLink()" class="w-full py-2 rounded-xl theme-input border text-[11px] font-bold hover:text-white">
              🔗 Copy Auto-Join Link
            </button>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Add 📡 Tap-to-Pair button to Chat Header
    const headerControls = document.querySelector('header .flex.items-center.gap-1\\.5');
    if (headerControls && !document.getElementById('tapPairHeaderBtn')) {
      const btn = document.createElement('button');
      btn.id = 'tapPairHeaderBtn';
      btn.type = 'button';
      btn.title = 'Tap Phones / QR Instant Pair';
      btn.className = 'w-9 h-9 rounded-xl theme-input border text-amber-300 hover:bg-amber-500/20 flex items-center justify-center text-xs transition';
      btn.innerHTML = '<i class="fa-solid fa-tower-broadcast"></i>';
      btn.onclick = openTapPairModal;
      headerControls.prepend(btn);
    }

    // 2. Auto-Join Handler when opened via NFC Tap or QR Scan (?room=...&auto=1)
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');
    const autoJoin = params.get('auto');
    if (urlRoom && autoJoin === '1') {
      const roomInp = document.getElementById('roomNameInput');
      const nameInp = document.getElementById('userNameInput');
      if (roomInp) roomInp.value = urlRoom;

      // If user already has a saved nickname, enter the private room automatically
      if (nameInp && nameInp.value.trim()) {
        setTimeout(() => {
          if (typeof enterRoom === 'function') enterRoom();
        }, 350);
      } else if (nameInp) {
        nameInp.focus();
        const statusEl = document.getElementById('authStatus');
        if (statusEl) {
          statusEl.textContent = isTa()
            ? `📡 அறை #${urlRoom} தயாராக உள்ளது! உங்கள் பெயரை உள்ளிட்டு இணையவும்.`
            : `📡 Room #${urlRoom} paired! Enter your display name to join.`;
          statusEl.classList.remove('hidden');
        }
      }
    }
  });

  window.openTapPairModal = function() {
    if (!room) return;
    const joinUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}&auto=1`;
    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=6&data=${encodeURIComponent(joinUrl)}`;

    const img = document.getElementById('tpQrImage');
    const codeEl = document.getElementById('tpRoomCodeDisplay');
    const titleEl = document.getElementById('tpModalTitle');
    const subEl = document.getElementById('tpSubtitle');
    const btnLbl = document.getElementById('tpNfcBtnLabel');
    const statusEl = document.getElementById('tpNfcStatus');

    if (img) img.src = qrApi;
    if (codeEl) codeEl.textContent = `ROOM: #${room.toUpperCase()}`;
    if (statusEl) statusEl.textContent = '';

    if (isTa()) {
      if (titleEl) titleEl.textContent = '📡 இரு போன்களையும் இணைக்கவும் (NFC / QR)';
      if (subEl) subEl.textContent = 'NFC ஸ்டிக்கர் மீது போனை வைக்கவும் அல்லது கீழே உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்:';
      if (btnLbl) btnLbl.textContent = 'NFC டேக்கில் அறையை பதிவு செய்';
    } else {
      if (titleEl) titleEl.textContent = '📡 Tap Phones to Pair (NFC / QR)';
      if (subEl) subEl.textContent = 'Hold the back of your phone to an NFC sticker/card or scan the instant QR code below:';
      if (btnLbl) btnLbl.textContent = 'Write / Beam Room to NFC Tag';
    }

    toggleModal('tapPairModal', true);
  };

  window.closeTapPairModal = function() {
    toggleModal('tapPairModal', false);
  };

  // 3. Web NFC Tag Writer (Android Chrome) — Writes Auto-Join URL to NFC Sticker/Card
  window.startNfcTagBeam = async function() {
    const statusEl = document.getElementById('tpNfcStatus');
    if (!('NDEFReader' in window)) {
      if (statusEl) {
        statusEl.textContent = isTa()
          ? 'ℹ️ இந்த பிரவுசரில் Web NFC இல்லை — மேலே உள்ள QR குறியீட்டை ஸ்கேன் செய்யவும்!'
          : 'ℹ️ Direct Web NFC is Android Chrome only — ask partner to scan the QR above!';
      }
      return;
    }

    try {
      const joinUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(room)}&auto=1`;
      if (statusEl) {
        statusEl.textContent = isTa()
          ? '📲 போனின் பின்புறத்தை NFC டேக் / கார்டு மீது 2 வினாடிகள் வைக்கவும்...'
          : '📲 Hold the back of your phone against the NFC tag/card for 2 seconds...';
      }
      const ndef = new NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: joinUrl }]
      });
      if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
      if (statusEl) {
        statusEl.textContent = isTa()
          ? '✅ NFC டேக் தயார்! இப்போது இரு போன்களையும் டேக் மீது தட்டினால் நேரடியாக அறையில் இணையலாம்.'
          : '✅ NFC Tag Encoded! Tapping either phone on this tag now auto-opens this room.';
      }
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = isTa()
          ? `⚠️ NFC பிழை: ${err.message}`
          : `⚠️ NFC notice: ${err.message}`;
      }
    }
  };
})();
