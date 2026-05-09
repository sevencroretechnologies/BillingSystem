import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PwaInstallPrompt
//
// Shows a beautiful slide-up install banner when the browser fires the
// `beforeinstallprompt` event (Chrome / Edge on Android & desktop).
// The banner remembers dismissal so it doesn't nag the user repeatedly.
// On iOS it automatically shows a "Add to Home Screen" guide instead.
// ─────────────────────────────────────────────────────────────────────────────

const DISMISSED_KEY = 'pwa_install_dismissed';

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIosGuide, setIsIosGuide] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // controls CSS animation

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // iOS: show a manual "Add to Home Screen" guide
    if (isIos()) {
      setIsIosGuide(true);
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 80);
      return;
    }

    // Chrome / Edge / Android: listen for the native prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
      setTimeout(() => setIsVisible(true), 80);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowBanner(false);
      localStorage.setItem(DISMISSED_KEY, '1');
    }, 350);
  };

  if (!showBanner) return null;

  return (
    <div className={`pwa-install-banner ${isVisible ? 'pwa-install-banner--visible' : ''}`}>
      <div className="pwa-install-banner__inner">
        {/* App Icon */}
        <div className="pwa-install-banner__icon" aria-hidden="true">
          <img src="/favicon-96x96.png" alt="Billing System icon" width="44" height="44" />
        </div>

        {/* Text */}
        <div className="pwa-install-banner__text">
          <span className="pwa-install-banner__title">Install Billing System</span>
          {isIosGuide ? (
            <span className="pwa-install-banner__sub">
              Tap&nbsp;
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ verticalAlign: 'middle', display: 'inline-block' }}>
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              &nbsp;then "Add to Home Screen"
            </span>
          ) : (
            <span className="pwa-install-banner__sub">Fast, offline-ready app experience</span>
          )}
        </div>

        {/* Actions */}
        <div className="pwa-install-banner__actions">
          {!isIosGuide && (
            <button
              id="pwa-install-btn"
              className="pwa-install-banner__btn pwa-install-banner__btn--install"
              onClick={handleInstall}
            >
              Install
            </button>
          )}
          <button
            id="pwa-dismiss-btn"
            className="pwa-install-banner__btn pwa-install-banner__btn--dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
