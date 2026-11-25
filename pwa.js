// ==================== ONE CHAT — PWA INSTALLER, SPLASH & FULLSCREEN MOBILE FIX ====================
(function initOneChatPWA() {
  let deferredInstallPrompt = null;
  const isTa = () => window.currentAppLang === 'ta';
  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    // Ensure viewport-fit=cover is active so env(safe-area-inset-top) works on Android & iPhone notches
    const vp = document.querySelector('meta[name="viewport"]');
    if (vp && !vp.content.includes('viewport-fit=cover')) {
      vp.content = vp.content + ', viewport-fit=cover';
    }

    if (!document.getElementById('pwaMobileFixStyle')) {
      const style = document.createElement('style');
      style.id = 'pwaMobileFixStyle';
      style.textContent = `
        header {
          padding-top: max(0.65rem, env(safe-area-inset-top)) !important;
          min-height: calc(3.5rem + env(safe-area-inset-top)) !important;
          position: relative;
          z-index: 30;
        }
        #sidebar {
          padding-top: max(1rem, env(safe-area-inset-top)) !important;
          padding-bottom: max(1rem, env(safe-area-inset-bottom)) !important;
          z-index: 60 !important;
        }
        #sidebarBackdrop {
          z-index: 55 !important;
        }
        header button[onclick*="toggleMobileSidebar"] {
          display: flex !important;
          align-items: center;
          justify-content: center;
          flex-shrink: 0 !important;
          min-width: 36px !important;
          min-height: 36px !important;
          position: relative;
          z-index: 35;
        }
        @media (max-width: 430px) {
          header .flex.items-center.gap-1\\.5 {
            gap: 0.25rem !important;
          }
          header .flex.items-center.gap-1\\.5 > button {
            width: 30px !important;
            height: 30px !important;
            font-size: 11px !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (!document.getElementById('oneChatBootSplash')) {
      const splash = document.createElement('div');
      splash.id = 'oneChatBootSplash';
      splash.style.cssText =
        'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'background:radial-gradient(circle at top,#230f48,#0c0618);transition:opacity 0.4s ease;';
      splash.innerHTML = `
        <div style="width:76px;height:76px;border-radius:22px;background:linear-gradient(135deg,#f43f5e,#d946ef,#f59e0b);
          display:flex;align-items:center;justify-content:center;box-shadow:0 16px 40px rgba(236,72,153,0.5);margin-bottom:14px;">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#fff;">One Chat</div>
        <div style="font-size:11px;color:#d8b4fe;margin-top:4px;">Private Rooms • Zero Trace</div>
      `;
      document.body.appendChild(splash);
      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 420);
      }, 650);
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS && !isStandalone()) {
      injectHomeInstallCard(true);
    }
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (!isStandalone()) {
      injectHomeInstallCard(false);
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    document.getElementById('pwaInstallBanner')?.remove();
  });

  function injectHomeInstallCard(isIOSMode) {
    const authCard = document.querySelector('#authOverlay > div');
    if (!authCard || document.getElementById('pwaInstallBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwaInstallBanner';
    banner.className =
      'mt-3 p-2.5 rounded-xl bg-gradient-to-r from-rose-500/15 via-fuchsia-500/15 to-amber-500/15 border border-amber-400/35 flex items-center justify-between gap-2 text-left';

    if (isIOSMode) {
      banner.innerHTML = `
        <div class="text-[10px] leading-snug text-purple-100">
          <div class="font-extrabold text-amber-300">${isTa() ? '📲 ஆப் ஆக நிறுவவும் (iPhone)' : '📲 Install One Chat App'}</div>
          <div>${isTa() ? 'கீழே உள்ள Share ⬆️ → "Add to Home Screen" அழுத்தவும்' : 'Tap Share ⬆️ below → "Add to Home Screen"'}</div>
        </div>
      `;
    } else {
      banner.innerHTML = `
        <div class="text-[10px] leading-snug text-purple-100">
          <div class="font-extrabold text-amber-300">${isTa() ? '📲 One Chat ஆப் நிறுவவும்' : '📲 Install One Chat App'}</div>
          <div>${isTa() ? 'முழுத்திரை அனுபவம் & வேகமான இணைப்பு' : 'Full-screen mode & instant home icon'}</div>
        </div>
        <button type="button" onclick="triggerOneChatInstall()" class="px-3 py-1.5 rounded-lg theme-accent text-[11px] font-extrabold shrink-0">
          ${isTa() ? 'நிறுவு' : 'Install'}
        </button>
      `;
    }
    authCard.appendChild(banner);
  }

  window.triggerOneChatInstall = async function() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      document.getElementById('pwaInstallBanner')?.remove();
    }
    deferredInstallPrompt = null;
  };
})();
