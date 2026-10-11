import React, { useState, useEffect } from 'react';
import { Download, Share, X, SquarePlus } from 'lucide-react';

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIOSDevice() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandaloneAlready() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    if (!isMobileDevice() || isStandaloneAlready()) return;
    if (sessionStorage.getItem('cvmaker_install_dismissed') === '1') return;

    // Android/Chrome: browser fires this when the app is installable
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS Safari never fires beforeinstallprompt, so show our own banner
    if (isIOSDevice()) {
      setShow(true);
    }

    const installedHandler = () => {
      setShow(false);
      setShowIOSSteps(false);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    setShowIOSSteps(false);
    sessionStorage.setItem('cvmaker_install_dismissed', '1');
  };

  const handleInstall = async () => {
    if (isIOSDevice()) {
      setShowIOSSteps(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl z-50 md:max-w-md md:mx-auto">
      {!showIOSSteps ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm">Install CV Maker App</h4>
            <p className="text-xs text-blue-100">Add to Home Screen for fast access!</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow hover:bg-blue-50 transition"
            >
              <Download size={14} /> Install
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="text-blue-100 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-sm">Add to Home Screen</h4>
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="text-blue-100 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-blue-100 flex items-center gap-1.5 mb-1">
            1. Tap the <Share size={14} className="inline" /> Share button below
          </p>
          <p className="text-xs text-blue-100 flex items-center gap-1.5">
            2. Tap <SquarePlus size={14} className="inline" /> "Add to Home Screen"
          </p>
        </div>
      )}
    </div>
  );
}