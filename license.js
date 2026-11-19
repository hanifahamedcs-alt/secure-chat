// ==================== CYPHERLINK PRO LICENSE MANAGER (BULLETPROOF GUEST GRANT) ====================
const LICENSE_STORAGE_KEY = 'cypherlink_pro_license';
const LICENSE_SALT = 'CYPHER-2026-TRICHY-PRO-SECRET';

window.hasPermanentProLicense = false;
window.isProUnlocked = false;
window.approvedProGuests = new Set(); // Stores peerIds AND lowercase names

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
  if (window.isProUnlocked || window.hasPermanentProLicense) return true;
  const msgEl = document.getElementById('licenseStatusMsg');
  if (msgEl) {
    msgEl.className = 'text-[11px] text-amber-300 font-medium mb-3';
    msgEl.textContent = `🔒 "${featureName}" requires an Advance Pro license—or ask your Room Host to click "Grant Pro" next to your name.`;
    msgEl.classList.remove('hidden');
  }
  toggleModal('licenseModal', true);
  return false;
};

function setProUIState(unlocked, isGuestPass = false) {
  if (window.hasPermanentProLicense) {
    unlocked = true;
    isGuestPass = false;
  }
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

  if (typeof renderGuestRoster === 'function' && Array.isArray(roomRoster)) {
    renderGuestRoster(roomRoster);
  }
}

// Licensed Owner toggles Pro access for a specific guest (matches by peerId AND name)
window.toggleSpecificGuestPro = function(targetPeerId, targetName = '') {
  if (!window.hasPermanentProLicense) {
    toggleModal('licenseModal', true);
    return;
  }

  const nameKey = 'name:' + (targetName || '').trim().toLowerCase();
  const currentlyApproved = window.approvedProGuests.has(targetPeerId) || (targetName && window.approvedProGuests.has(nameKey));
  const willGrant = !currentlyApproved;

  if (willGrant) {
    window.approvedProGuests.add(targetPeerId);
    if (targetName) window.approvedProGuests.add(nameKey);
  } else {
    window.approvedProGuests.delete(targetPeerId);
    if (targetName) window.approvedProGuests.delete(nameKey);
  }

  const payload = {
    type: 'GRANT_GUEST_PRO',
    targetId: targetPeerId,
    targetName: targetName,
    granted: willGrant
  };

  // Send directly if connection exists, AND broadcast to room
  if (typeof connections !== 'undefined' && connections[targetPeerId]?.conn?.open) {
    connections[targetPeerId].conn.send(payload);
  }
  if (typeof broadcastData === 'function') {
    broadcastData(payload);
  }

  if (typeof showToast === 'function') {
    showToast(
      willGrant ? `👑 Granted Pro to ${targetName || 'Guest'}` : `🔒 Revoked Pro from ${targetName || 'Guest'}`,
      willGrant ? 'Guest now has full Advance Pro access!' : 'Guest returned to Basic mode'
    );
  }

  if (typeof renderGuestRoster === 'function' && Array.isArray(roomRoster)) {
    renderGuestRoster(roomRoster);
  }
};

window.applyHostGuestPass = function(granted) {
  if (window.hasPermanentProLicense) return;
  if (granted) {
    setProUIState(true, true);
    if (typeof showToast === 'function') {
      showToast('👑 Host Unlocked Full Version!', 'All 26 games & Pro tools are now active!');
    }
    if (typeof appendSystemNotice === 'function') {
      appendSystemNotice('👑 Host granted you Advance Pro access for this session!');
    }
  } else {
    setProUIState(false, false);
    if (typeof showToast === 'function') {
      showToast('🔒 Switched to Basic Mode', 'Host revoked temporary Pro guest access');
    }
  }
};

window.revokeSessionGuestPass = function() {
  window.approvedProGuests.clear();
  if (!window.hasPermanentProLicense) {
    setProUIState(false, false);
  }
};

// Capture-phase interceptor (only blocks unlicensed users)
document.addEventListener('click', (e) => {
  if (window.isProUnlocked || window.hasPermanentProLicense) return;
  if (e.target.closest('#participantsList, #licenseModal, #openLicenseModalBtn')) return;

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
        <p class="text-[11px] theme-muted mb-4">Guests join free without a key. Enter your Pro License Key to host Pro rooms and grant access to your guests.</p>
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
    status.textContent = '✅ Advance Pro Unlocked! Click "Grant Pro" next to any guest in the sidebar.';
    setProUIState(true, false);
    setTimeout(() => toggleModal('licenseModal', false), 900);
  } else {
    status.className = 'text-[11px] text-rose-400 font-semibold mb-3';
    status.textContent = '❌ Invalid license key. Check format and try again.';
  }
}

async function bootstrapLicenseState() {
  injectLicenseModalAndButton();
  toggleModal('licenseModal', false);

  const savedKey = localStorage.getItem(LICENSE_STORAGE_KEY);
  if (savedKey && await verifyLicenseKey(savedKey)) {
    window.hasPermanentProLicense = true;
    setProUIState(true, false);
  } else {
    window.hasPermanentProLicense = false;
    setProUIState(false, false);
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrapLicenseState);
} else {
  bootstrapLicenseState();
}
