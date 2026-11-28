// ==================== ONE CHAT — AUTOMATED RAZORPAY / UPI CHECKOUT ====================
(function initOneChatCheckout() {
  const isTa = () => window.currentAppLang === 'ta';

  function loadRazorpaySdk() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  function getOrCreateDeviceId() {
    let id = localStorage.getItem('onechat_device_id');
    if (!id) {
      id = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem('onechat_device_id', id);
    }
    return id;
  }

  function activateVerifiedProKey(key, planId) {
    window.hasPermanentProLicense = true;
    localStorage.setItem('onechat_pro_key', key);
    localStorage.setItem('onechat_pro_plan', planId || 'pro_personal');
    localStorage.setItem('cypher_pro_unlocked', 'true');

    // Sync with existing license.js input/state if present
    const keyInput = document.getElementById('licenseKeyInput');
    if (keyInput) keyInput.value = key;
    if (typeof updateParticipantsUI === 'function') {
      try { updateParticipantsUI(); } catch (e) {}
    }

    document.getElementById('homeGoProBtn')?.remove();
    toggleModal('licenseModal', false);

    if (typeof showToast === 'function') {
      showToast('👑 One Chat Pro Activated!', `Key: ${key}`);
    } else {
      alert(`👑 One Chat Pro Activated!\n\nSave your backup key:\n${key}`);
    }
  }

  // Restore Pro state automatically on reload
  window.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('onechat_pro_key');
    if (savedKey && savedKey.startsWith('OCPRO-')) {
      window.hasPermanentProLicense = true;
    }

    injectCheckoutCards();
  });

  function injectCheckoutCards() {
    // 1. Add sleek "👑 Upgrade to Pro • ₹99" pill on Home Screen if not yet Pro
    const authCard = document.querySelector('#authOverlay > div');
    if (authCard && !window.hasPermanentProLicense && !document.getElementById('homeGoProBtn')) {
      const proPill = document.createElement('button');
      proPill.id = 'homeGoProBtn';
      proPill.type = 'button';
      proPill.onclick = () => startRazorpayCheckout('pro_personal');
      proPill.className =
        'mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-fuchsia-500/20 ' +
        'border border-amber-400/45 flex items-center justify-between text-left hover:border-amber-300 transition';
      proPill.innerHTML = `
        <div>
          <div class="text-[11px] font-extrabold text-amber-300">👑 ${isTa() ? 'Pro Host ஆகுங்கள் • ₹99' : 'Upgrade to Pro Host • ₹99'}</div>
          <div class="text-[10px] text-purple-200">${isTa() ? 'UPI / GPay மூலம் உடனடி Key • நண்பர்களுக்கு இலவச Pro Pass' : 'Instant UPI / GPay unlock • Grant free Pro to room guests'}</div>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-amber-400 text-black text-[10px] font-extrabold shrink-0">UPI ⚡</span>
      `;
      authCard.appendChild(proPill);
    }

    // 2. Inject Instant UPI Checkout Panel inside #licenseModal
    const licenseBox = document.querySelector('#licenseModal > div');
    if (licenseBox && !document.getElementById('instantUpiCheckoutBox')) {
      const box = document.createElement('div');
      box.id = 'instantUpiCheckoutBox';
      box.className = 'mt-3 pt-3 border-t border-white/15 text-left';
      box.innerHTML = `
        <div class="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 mb-2">
          ⚡ Instant Self-Serve Activation (UPI / GPay / Card)
        </div>
        <div class="grid grid-cols-2 gap-2 mb-2">
          <button type="button" onclick="startRazorpayCheckout('pro_personal')" class="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/25 to-rose-500/25 border border-amber-400/50 text-left hover:border-amber-300 transition">
            <div class="text-xs font-extrabold text-white">👑 Personal Pro</div>
            <div class="text-[11px] font-bold text-amber-300">₹99 <span class="text-[9px] opacity-75">Lifetime</span></div>
            <div class="text-[9px] text-purple-200 mt-0.5">Host + Guest Pro Passes</div>
          </button>
          <button type="button" onclick="startRazorpayCheckout('pro_cafe')" class="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 border border-cyan-400/45 text-left hover:border-cyan-300 transition">
            <div class="text-xs font-extrabold text-white">☕ Cafe / Venue</div>
            <div class="text-[11px] font-bold text-cyan-300">₹499 <span class="text-[9px] opacity-75">Venue Pass</span></div>
            <div class="text-[9px] text-purple-200 mt-0.5">25-Seat Table QR Hosting</div>
          </button>
        </div>
        <div id="rzpCheckoutStatus" class="text-[10px] text-emerald-300 min-h-[14px]"></div>
      `;
      licenseBox.appendChild(box);
    }
  }

  window.startRazorpayCheckout = async function(planId = 'pro_personal') {
    const statusEl = document.getElementById('rzpCheckoutStatus');
    if (statusEl) statusEl.textContent = '⏳ Initializing secure UPI checkout...';

    const sdkReady = await loadRazorpaySdk();
    if (!sdkReady) {
      alert('Unable to load Razorpay Checkout. Check your internet connection.');
      if (statusEl) statusEl.textContent = '';
      return;
    }

    const deviceId = getOrCreateDeviceId();

    try {
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, deviceId })
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || 'Could not start order');
      }

      if (statusEl) statusEl.textContent = '';

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'One Chat',
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: {
          name: (typeof myName !== 'undefined' && myName) ? myName : ''
        },
        notes: { deviceId, planId },
        theme: { color: '#ec4899' },
        handler: async function(response) {
          if (statusEl) statusEl.textContent = '🔐 Verifying payment & generating Pro key...';
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                deviceId,
                planId
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.verified && verifyData.licenseKey) {
              activateVerifiedProKey(verifyData.licenseKey, planId);
            } else {
              alert('Payment received, verification notice: ' + (verifyData.error || 'Contact support with Payment ID: ' + response.razorpay_payment_id));
            }
          } catch (err) {
            alert('Verification network error. Save your Payment ID: ' + response.razorpay_payment_id);
          } finally {
            if (statusEl) statusEl.textContent = '';
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(resp) {
        if (statusEl) statusEl.textContent = '❌ Payment cancelled or failed: ' + (resp.error?.description || '');
      });
      rzp.open();
    } catch (err) {
      if (statusEl) statusEl.textContent = '';
      alert('Checkout error: ' + err.message);
    }
  };
})();