// ==================== CYPHERLINK PRO LICENSE MANAGER ====================
const LICENSE_STORAGE_KEY = 'cypherlink_pro_license';
const LICENSE_SALT = 'CYPHER-2026-TRICHY-PRO-SECRET'; // Keep consistent with your generator

window.isProUnlocked = false;

async function computeKeySignature(payload) {
  const enc = new TextEncoder();
  const data = enc.encode(payload + '|' + LICENSE_SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 8).toUpperCase();
}

async function verifyLicenseKey(rawKey) {
  const cleanKey = (rawKey || '').trim().toUpperCase();
  // Format: CYPHER-PRO-<CLIENT_CODE>-<8_CHAR_SIGNATURE>
  const parts = cleanKey.split('-');
  if (parts.length !== 4 || parts[0] !== 'CYPHER' || parts[1] !== 'PRO') {
    return false;
  }
  const clientCode = parts[2];
  const providedSig = parts[3];
  const expectedSig = await computeKeySignature(`CYPHER-PRO-${clientCode}`);
  return providedSig === expectedSig;
}

function setProUIState(unlocked) {
  window.isProUnlocked = unlocked;

  // Toggle Pro-only controls in Header & Sidebar
  const proSelectors = [
    '[onclick*="jukeboxModal"]',
    '[onclick*="pulsePadModal"]',
    '[onclick*="telepathyModal"]',
    '[onclick*="openPongModal"]',
    '[onclick*="bluffModal"]',
    '[onclick*="openDualSnapModal"]',
    '[onclick*="soundscapeModal"]',
    '[onclick*="toggleBeatStudio"]',
    '[onclick*="capsuleModal"]',
    '[onclick*="toggleLiveCursors"]',
    '#screenShareBtn',
    '#secretBtn',
    '#voiceNoteBtn',
    '#tabSurprises',
    '#tabSounds'
  ];

  document.querySelectorAll(proSelectors.join(',')).forEach(el => {
    if (unlocked) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  const badge = document.getElementById('editionBadgeLabel');
  const upgradeBtn = document.getElementById('openLicenseModalBtn');
  if (badge) {
    badge.textContent = unlocked ? 'ADVANCE PRO' : 'BASIC EDITION';
    badge.className = unlocked
      ? 'text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40'
      : 'text-[10px] font-bold px-2 py-0.5 rounded bg-gray-700 text-gray-300';
  }
  if (upgradeBtn) {
    upgradeBtn.innerHTML = unlocked
      ? '<i class="fa-solid fa-crown text-amber-400"></i> Pro License Active'
      : '<i class="fa-solid fa-key text-amber-400"></i> Enter Pro License Key';
  }

  // Dynamically load games.js ONLY when Advance Pro is unlocked
  if (unlocked && !document.getElementById('proGamesScript')) {
    const script = document.createElement('script');
    script.id = 'proGamesScript';
    script.src = './games.js';
    document.body.appendChild(script);
  }
}

function injectLicenseModalAndButton() {
  if (document.getElementById('licenseModal')) return;

  const modalHTML = `
    <div id="licenseModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
      <div class="theme-panel border rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mx-auto mb-3 border border-amber-500/30">
          <i class="fa-solid fa-crown"></i>
        </div>
        <h3 class="text-base font-bold mb-1">Activate Advance Pro</h3>
        <p class="text-[11px] theme-muted mb-4">Unlock all 26 live games, Beat Studio, Soundscape Mixer, Dual-Camera Snap, Screen Share, and Secret Messages.</p>
        <input id="licenseKeyInput" type="text" placeholder="CYPHER-PRO-XXXX-XXXXXXXX" class="w-full theme-input border rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-center tracking-wider mb-3 focus:outline-none focus:border-amber-400" />
        <p id="licenseStatusMsg" class="text-[11px] mb-3 hidden"></p>
        <div class="flex gap-2">
          <button type="button" onclick="toggleModal('licenseModal', false)" class="flex-1 py-2.5 rounded-xl theme-input border text-xs font-medium">Cancel</button>
          <button type="button" onclick="activateEnteredLicense()" class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold">Unlock Pro</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add Edition Badge & License Button to Sidebar
  const sidebarFooter = document.querySelector('#sidebar .border-t');
  if (sidebarFooter) {
    const proBtn = document.createElement('button');
    proBtn.id = 'openLicenseModalBtn';
    proBtn.type = 'button';
    proBtn.onclick = () => {
      document.getElementById('licenseKeyInput').value = localStorage.getItem(LICENSE_STORAGE_KEY) || '';
      toggleModal('licenseModal', true);
    };
    proBtn.className = 'w-full py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition mb-1.5';
    proBtn.innerHTML = '<i class="fa-solid fa-key text-amber-400"></i> Enter Pro License Key';
    sidebarFooter.prepend(proBtn);
  }
}

async function activateEnteredLicense() {
  const input = document.getElementById('licenseKeyInput').value.trim().toUpperCase();
  const status = document.getElementById('licenseStatusMsg');
  status.classList.remove('hidden');

  if (await verifyLicenseKey(input)) {
    localStorage.setItem(LICENSE_STORAGE_KEY, input);
    status.className = 'text-[11px] text-emerald-400 font-semibold mb-3';
    status.textContent = '✅ Advance Pro Unlocked! Loading full suite...';
    setProUIState(true);
    setTimeout(() => toggleModal('licenseModal', false), 900);
  } else {
    status.className = 'text-[11px] text-rose-400 font-semibold mb-3';
    status.textContent = '❌ Invalid license key. Check format and try again.';
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  injectLicenseModalAndButton();
  const savedKey = localStorage.getItem(LICENSE_STORAGE_KEY);
  if (savedKey && await verifyLicenseKey(savedKey)) {
    setProUIState(true);
  } else {
    setProUIState(false);
  }
});