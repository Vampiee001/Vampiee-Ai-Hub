import React, { useState } from 'react';
import { Download, Monitor, CheckCircle, Smartphone, HelpCircle, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'banner' | 'pill';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed as standalone app, show small badge or hide
  if (isInstalled) {
    return (
      <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckCircle className="w-3 h-3" />
        Laptop App Active
      </span>
    );
  }

  // Desktop or Android Chrome / Edge 1-click install
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition-all cursor-pointer animate-pulse"
        title="Install Vampiee directly as an app on your laptop desktop"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install to Laptop</span>
      </button>
    );
  }

  // Fallback / Guidance for manual shortcut & iOS
  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Make Vampiee an app on your laptop desktop"
      >
        <Monitor className="w-3.5 h-3.5 text-rose-400" />
        <span>Install to Laptop</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">
                  Add Vampiee App to Laptop Desktop
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                To run Vampiee as a standalone windowed desktop app with its own moving icon on your laptop:
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <strong className="text-rose-400 font-mono block">Windows &amp; Mac (Chrome / Edge / Brave):</strong>
                <p>1. Look at the top right of your browser address bar for the <strong>Install (computer with down arrow)</strong> icon.</p>
                <p>2. Or click the browser menu (⋮) &gt; <strong>"Cast, save, and share" &gt; "Install page as app"</strong> or <strong>"Create shortcut..."</strong>.</p>
                <p>3. Check <strong>"Open as window"</strong> so it floats over your desktop without browser tabs.</p>
              </div>

              {isIOS && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <strong className="text-indigo-400 font-mono block">iOS / iPad:</strong>
                  <p>Tap <strong>Share</strong> in Safari &gt; <strong>Add to Home Screen</strong>.</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuide(false)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
