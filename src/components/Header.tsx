import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Globe,
  Sun,
  Moon,
  Search,
  CheckCircle,
  AlertTriangle,
  Minus,
  Square,
  X,
  Laptop
} from 'lucide-react';
import { AppSettings, Language, CaisseSession } from '../types';
import { getTranslation } from '../utils/translations';
import { sound } from '../utils/audio';

interface HeaderProps {
  settings: AppSettings;
  caisseSession: CaisseSession | null;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onQuickScan: (barcode: string) => void;
  onOpenCaisseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  caisseSession,
  onUpdateSettings,
  onQuickScan,
  onOpenCaisseModal
}) => {
  const [scanQuery, setScanQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as { electronAPI?: { isElectron: boolean } }).electronAPI) {
      setIsElectron(true);
    }
  }, []);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanQuery.trim()) return;
    onQuickScan(scanQuery.trim());
    setScanQuery('');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const toggleSound = () => {
    const next = !settings.soundAlerts;
    sound.enabled = next;
    onUpdateSettings({ soundAlerts: next });
    if (next) sound.playBarcodeBeep();
  };

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: next });
  };

  const handleLangChange = (lang: Language) => {
    onUpdateSettings({ language: lang });
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  };

  // Electron IPC window control calls
  const handleElectronMinimize = () => {
    const api = (window as unknown as { electronAPI?: { minimizeWindow: () => void } }).electronAPI;
    if (api) api.minimizeWindow();
  };

  const handleElectronMaximize = () => {
    const api = (window as unknown as { electronAPI?: { maximizeWindow: () => void } }).electronAPI;
    if (api) api.maximizeWindow();
  };

  const handleElectronClose = () => {
    const api = (window as unknown as { electronAPI?: { closeWindow: () => void } }).electronAPI;
    if (api) api.closeWindow();
  };

  return (
    <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 text-neutral-100 px-4 py-2.5 flex items-center justify-between gap-3 select-none no-print">
      {/* Left side: System / Brand badge & Quick Scan input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Windows compatibility badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold whitespace-nowrap">
          <Laptop className="w-3.5 h-3.5" />
          <span>Local DB | Win 7/8/10/11 (32 & 64-bit)</span>
        </div>

        {/* Global Barcode / RFID Quick Scan Input */}
        <form onSubmit={handleScanSubmit} className="relative flex-1">
          <input
            type="text"
            value={scanQuery}
            onChange={(e) => setScanQuery(e.target.value)}
            placeholder={getTranslation(settings.language, 'scanInputPlaceholder')}
            className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none rtl:left-auto rtl:right-3" />
        </form>
      </div>

      {/* Right side controls: Caisse status, Language, Audio, Theme, Fullscreen & Electron controls */}
      <div className="flex items-center gap-2">
        {/* Cash Register status pill */}
        <button
          onClick={onOpenCaisseModal}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
            caisseSession && caisseSession.status === 'open'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-400 hover:bg-amber-900/40'
          }`}
          title="Click to view Cash Register (Caisse)"
        >
          {caisseSession && caisseSession.status === 'open' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Caisse Open: {settings.currency}{caisseSession.expectedCash.toFixed(2)}</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Caisse Closed</span>
            </>
          )}
        </button>

        {/* Language selector */}
        <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-xl p-0.5 text-xs">
          <Globe className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-0.5 rtl:mr-1.5 rtl:ml-0.5" />
          <button
            onClick={() => handleLangChange('en')}
            className={`px-2 py-0.5 rounded-lg transition font-medium ${
              settings.language === 'en'
                ? 'bg-emerald-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => handleLangChange('fr')}
            className={`px-2 py-0.5 rounded-lg transition font-medium ${
              settings.language === 'fr'
                ? 'bg-emerald-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => handleLangChange('ar')}
            className={`px-2 py-0.5 rounded-lg transition font-medium font-sans ${
              settings.language === 'ar'
                ? 'bg-emerald-500 text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            عربي
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
          title={settings.soundAlerts ? 'Mute sound effects' : 'Enable sound effects'}
        >
          {settings.soundAlerts ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
          title="Toggle Dark / Light Mode"
        >
          {settings.theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition"
          title="Toggle Fullscreen Mode (F11)"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Electron Window Controls (Only when running in desktop Electron) */}
        {isElectron && (
          <div className="flex items-center gap-1 pl-2 border-l border-neutral-800 ml-1">
            <button
              onClick={handleElectronMinimize}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
              title="Minimize Window"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleElectronMaximize}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
              title="Maximize Window"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleElectronClose}
              className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-950/60 rounded-lg transition"
              title="Close Application"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
