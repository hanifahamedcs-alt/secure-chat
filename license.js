// ==================== CYPHERLINK PRO LICENSE MANAGER (OPTION 3: HOST-LAUNCH GATE) ====================
const LICENSE_STORAGE_KEY = 'cypherlink_pro_license';
const LICENSE_SALT = 'CYPHER-2026-TRICHY-PRO-SECRET';

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
  const parts = cleanKey.split('-');
  if (parts.length !== 4 || parts[0] !== 'CYPHER' || parts[1] !== 'PRO') return false;
  const expectedSig = await computeKeySignature(`CYPHER-PRO-${parts[2]}`);
  return parts[3] === expectedSig;
}

// Guard helper: wraps any Pro launch action so Basic users see the upgrade modal,
// while incoming WebRTC game packets from a Pro Host still execute normally!
window.requireProFeature = function(featureName, actionFn) {
  if (window.isProUnlocked) {
    return actionFn();
  }
  const msgEl = document.getElementById('licenseStatusMsg');
  if (msgEl) {
    msgEl.className = 'text-[11px] text-amber-300 font-medium mb-3';
    msgEl.textContent = `🔒 "${featureName}" requires an Advance Pro license to host/launch. (You can still join & play when a Pro Host starts it!)`;
    msgEl.classList.remove('hidden');
  }
  toggleModal('licenseModal', true);
};

function setProUIState(unlocked) {
  window.isProUnlocked = unlocked;

  // Pro-only launch triggers (visible with subtle lock badge in Basic so users see what Pro offers)
  const proLaunchSelectors = [
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

  document.querySelectorAll(proLaunchSelectors.join(',')).forEach(el => {
    if (unlocked) {
      el.classList.remove('opacity-60');
      el.removeAttribute('data-pro-locked');
    } else {
      el.classList.add('opacity-60');
      el.setAttribute('data-pro-locked', '1');
    }
  });

  const upgradeBtn = document.getElementById('openLicenseModalBtn');
  if (upgradeBtn) {
    upgradeBtn.innerHTML = unlocked
      ? '<i class="fa-solid fa-crown text-amber-400"></i> Advance Pro Active'
      : '<i class="fa-solid fa-key text-amber-400"></i> Unlock Advance Pro';
  }
}

// Intercept clicks on Pro launch buttons when running in Basic mode
document.addEventListener('click', (e) => {
  if (window.isProUnlocked) return;
  const lockedTarget = e.target.closest('[data-pro-locked="1"]');
  if (lockedTarget) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const label = lockedTarget.textContent.trim() || lockedTarget.title || 'This Pro Tool';
    window.requireProFeature(label, () => {});
  }
}, true); // Capture phase intercepts before inline onclick fires

function injectLicenseModalAndButton() {
  if (document.getElementById('licenseModal')) return;

  const modalHTML = `
    <div id="licenseModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
      <div class="theme-panel border rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mx-auto mb-3 border border-amber-500/30">
          <i class="fa-solid fa-crown"></i>
        </div>
        <h3 class="text-base font-bold mb-1">Advance Pro Host License</h3>
        <p class="text-[11px] theme-muted mb-4">Unlock launching all 26 live games, Beat Studio, Soundscape Mixer, Dual Snap, Screen Share, and Secret Messages. Invited guests play free!</p>
        <input id="licenseKeyInput" type="text" placeholder="CYPHER-PRO-XXXX-XXXXXXXX" class="w-full theme-input border rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase text-center tracking-wider mb-3 focus:outline-none focus:border-amber-400" />
        <p id="licenseStatusMsg" class="text-[11px] mb-3 hidden"></p>
        <div class="flex gap-2">
          <button type="button" onclick="toggleModal('licenseModal', false)" class="flex-1 py-2.5 rounded-xl theme-input border text-xs font-medium">Close</button>
          <button type="button" onclick="activateEnteredLicense()" class="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold">Activate Key</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const sidebarFooter = document.querySelector('#sidebar .border-t');
  if (sidebarFooter) {
    const proBtn = document.createElement('button');
    proBtn.id = 'openLicenseModalBtn';
    proBtn.type = 'button';
    proBtn.onclick = () => {
      document.getElementById('licenseStatusMsg').classList.add('hidden');
      document.getElementById('licenseKeyInput').value = localStorage.getItem(LICENSE_STORAGE_KEY) || '';
      toggleModal('licenseModal', true);
    };
    proBtn.className = 'w-full py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition mb-1.5';
    proBtn.innerHTML = '<i class="fa-solid fa-key text-amber-400"></i> Unlock Advance Pro';
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
    status.textContent = '✅ Advance Pro Unlocked! All host launch controls enabled.';
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
