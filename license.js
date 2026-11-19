
// ==================== CYPHERLINK PRO LICENSE MANAGER (PER-GUEST HOST SELECTOR) ====================
const LICENSE_STORAGE_KEY = 'cypherlink_pro_license';
const LICENSE_SALT = 'CYPHER-2026-TRICHY-PRO-SECRET';

window.hasPermanentProLicense = false;
window.isProUnlocked = false;
window.approvedProGuests = new Set(); // Tracks specific peerIds approved by the licensed Host

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

window.requireProFeature = function(featureName) {
  if (window.isProUnlocked) return true;
  const msgEl = document.getElementById('licenseStatusMsg');
  if (msgEl) {
    msgEl.className = 'text-[11px] text-amber-300 font-medium mb-3';
    msgEl.textContent = `🔒 "${featureName}" requires an Advance Pro license—or ask your Room Host to enable Pro access for you.`;
    msgEl.classList.remove('hidden');
  }
  toggleModal('licenseModal', true);
  return false;
};

function setProUIState(unlocked, isGuestPass = false) {
  window.isProUnlocked = unlocked;

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
    if (window.hasPermanentProLicense) {
      upgradeBtn.innerHTML = '<i class="fa-solid fa-crown text-amber-400"></i> Advance Pro Owner';
    } else if (unlocked && isGuestPass) {
      upgradeBtn.innerHTML = '<i class="fa-solid fa-ticket text-emerald-400"></i> Guest Pro Pass Active';
    } else {
      upgradeBtn.innerHTML = '<i class="fa-solid fa-key text-amber-400"></i> Enter Pro License Key';
    }
  }

  // Re-render participant list so Host's per-guest Pro toggle buttons update immediately
  if (typeof renderGuestRoster === 'function' && Array.isArray(roomRoster)) {
    renderGuestRoster(roomRoster);
  }
}

// Host clicks the toggle button next to a specific guest in the sidebar
window.toggleSpecificGuestPro = function(targetPeerId) {
  if (!window.hasPermanentProLicense || typeof isHost === 'undefined' || !isHost) return;

  const willGrant = !window.approvedProGuests.has(targetPeerId);
  if (willGrant) {
    window.approvedProGuests.add(targetPeerId);
  } else {
    window.approvedProGuests.delete(targetPeerId);
  }

  // Send targeted grant/revoke packet to the room (only targetPeerId applies it)
  if (typeof broadcastData === 'function') {
    broadcastData({
      type: 'GRANT_GUEST_PRO',
      targetId: targetPeerId,
      granted: willGrant
    });
  }

  if (typeof renderGuestRoster === 'function' && Array.isArray(roomRoster)) {
    renderGuestRoster(roomRoster);
  }
};

// Applied on the Guest's device when the Host selects them
window.applyHostGuestPass = function(granted) {
  if (window.hasPermanentProLicense) return;
  if (granted) {
    setProUIState(true, true);
    if (typeof showToast === 'function') {
      showToast('👑 Host Unlocked Full Version!', 'You now have Advance Pro access for this room session');
    }
  } else {
    setProUIState(false, false);
    if (typeof showToast === 'function') {
      showToast('🔒 Switched to Basic Mode', 'Host revoked temporary Pro guest access');
    }
  }
};

// Automatically revokes temporary Guest pass on logout or Host disconnect
window.revokeSessionGuestPass = function() {
  window.approvedProGuests.clear();
  if (!window.hasPermanentProLicense) {
    setProUIState(false, false);
  }
};

// Intercept clicks on Pro tools when running in Basic mode (never auto-opens on login)
document.addEventListener('click', (e) => {
  if (window.isProUnlocked) return;

  const lockedTarget = e.target.closest('[data-pro-locked="1"]');
  const appGridBtn = e.target.closest('#surprisesGrid button, #soundsGrid button');

  if (lockedTarget || appGridBtn) {
    e.preventDefault();
    e.stopImmediatePropagation();
    const target = lockedTarget || appGridBtn;
    const label = target.textContent.trim() || target.title || 'This Pro Feature';
    window.requireProFeature(label);
  }
}, true);

function injectLicenseModalAndButton() {
  if (document.getElementById('licenseModal')) return;

  const modalHTML = `
    <div id="licenseModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
      <div class="theme-panel border rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl mx-auto mb-3 border border-amber-500/30">
          <i class="fa-solid fa-crown"></i>
        </div>
        <h3 class="text-base font-bold mb-1">Advance Pro License</h3>
        <p class="text-[11px] theme-muted mb-4">Guests can join any room free without a key. Enter a Pro License Key only if you want to host Pro rooms and grant access to your guests.</p>
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
    window.hasPermanentProLicense = true;
    status.className = 'text-[11px] text-emerald-400 font-semibold mb-3';
    status.textContent = '✅ Advance Pro Unlocked! Select any guest in the sidebar to grant them full access.';
    setProUIState(true, false);
    setTimeout(() => toggleModal('licenseModal', false), 900);
  } else {
    status.className = 'text-[11px] text-rose-400 font-semibold mb-3';
    status.textContent = '❌ Invalid license key. Check format and try again.';
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  injectLicenseModalAndButton();
  // Ensure modal stays strictly hidden on initial load / guest login
  toggleModal('licenseModal', false);

  const savedKey = localStorage.getItem(LICENSE_STORAGE_KEY);
  if (savedKey && await verifyLicenseKey(savedKey)) {
    window.hasPermanentProLicense = true;
    setProUIState(true, false);
  } else {
    window.hasPermanentProLicense = false;
    setProUIState(false, false);
  }
});
