import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  HardDrive,
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ShieldCheck,
  FileCode,
  Terminal,
  Cpu,
  Boxes,
  Users,
  Receipt,
  Clock,
  Coins
} from 'lucide-react';
import { AppSettings, DatabaseBackup } from '../types';
import { getTranslation } from '../utils/translations';
import { sound } from '../utils/audio';

interface DatabaseCenterViewProps {
  settings: AppSettings;
  stats: {
    membersCount: number;
    plansCount: number;
    productsCount: number;
    salesCount: number;
    attendanceCount: number;
    caisseRecordsCount: number;
  };
  onExportBackup: () => DatabaseBackup;
  onImportBackup: (jsonString: string) => boolean;
  onSeedDemo: () => void;
  onWipeDb: () => void;
}

export const DatabaseCenterView: React.FC<DatabaseCenterViewProps> = ({
  settings,
  stats,
  onExportBackup,
  onImportBackup,
  onSeedDemo,
  onWipeDb
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    sound.playBarcodeBeep();
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleExportDownload = async () => {
    const backup = onExportBackup();
    const dataStr = JSON.stringify(backup, null, 2);
    const filename = `gymmaster_backup_${new Date().toISOString().slice(0, 10)}.json`;

    // If in Electron, check for native file dialog
    const electronAPI = (window as unknown as { electronAPI?: { saveBackupFile: (data: string, name: string) => Promise<{ success: boolean; canceled?: boolean }> } }).electronAPI;

    if (electronAPI && typeof electronAPI.saveBackupFile === 'function') {
      const res = await electronAPI.saveBackupFile(dataStr, filename);
      if (res.success) {
        sound.playAccessGranted();
        return;
      }
    }

    // Browser download fallback
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sound.playAccessGranted();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ok = onImportBackup(content);
        if (ok) {
          setImportStatus('success');
          sound.playAccessGranted();
        } else {
          setImportStatus('error');
          sound.playAccessDenied();
        }
        setTimeout(() => setImportStatus('idle'), 3000);
      };
      reader.readAsText(file);
    } catch {
      setImportStatus('error');
      sound.playAccessDenied();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-neutral-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t('databaseCenter')}</h1>
            <p className="text-xs text-neutral-400">100% Local Storage Engine &amp; Electron Desktop Packaging</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportJson')}</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{t('importJson')}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importStatus === 'success' && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Local database restored and synchronized successfully!</span>
        </div>
      )}

      {importStatus === 'error' && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs flex items-center gap-2">
          <span>Failed to import JSON backup. Please check file format.</span>
        </div>
      )}

      {/* Local Storage Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Members', value: stats.membersCount, icon: Users, color: 'text-emerald-400' },
          { label: 'Gym Plans', value: stats.plansCount, icon: FileCode, color: 'text-purple-400' },
          { label: 'Products', value: stats.productsCount, icon: Boxes, color: 'text-blue-400' },
          { label: 'POS Sales', value: stats.salesCount, icon: Receipt, color: 'text-amber-400' },
          { label: 'Attendance', value: stats.attendanceCount, icon: Clock, color: 'text-teal-400' },
          { label: 'Caisse Journal', value: stats.caisseRecordsCount, icon: Coins, color: 'text-orange-400' }
        ].map((item, idx) => (
          <div key={idx} className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl">
            <span className="text-[11px] text-neutral-400 block">{item.label}</span>
            <div className={`text-2xl font-black font-mono mt-1 ${item.color}`}>
              {item.value}
            </div>
            <span className="text-[10px] text-neutral-500">Local records</span>
          </div>
        ))}
      </div>

      {/* Windows 7, 8, 10 & 11 (32-bit & 64-bit) Executable Center */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {t('winCompTitle')}
            </h2>
            <p className="text-xs text-neutral-400">
              Native NSIS Windows Installers &amp; Portable Executables (ia32 &amp; x64)
            </p>
          </div>
        </div>

        {/* Technical compatibility note */}
        <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2 leading-relaxed">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Why this application works on Windows 7 SP1 AND modern Windows 10/11:</span>
          </div>
          <p className="text-neutral-400">
            Chromium permanently dropped Windows 7 support in Chromium 110 (Electron 23+). Therefore, this project is pinned to <strong className="text-white">Electron 22.3.27</strong>, the last official release supporting Windows 7 SP1 &amp; Windows 8.1 32-bit (ia32) and 64-bit (x64), while running flawlessly on Windows 10 and Windows 11.
          </p>
        </div>

        {/* Copyable Build Commands */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{t('howToBuild')}</span>
          </h3>

          {/* Command 1: Win32 (32-bit for Windows 7 & modern PCs) */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="overflow-x-auto">
              <span className="text-neutral-500 mr-2">$</span>
              <span className="text-emerald-400 font-bold">npm run desktop:build:win32</span>
              <span className="text-neutral-500 text-[11px] block mt-1">
                Generates: <span className="text-neutral-300">release/GymMaster POS-1.0.0-win-ia32-Setup.exe</span> (Works on Win 7 32-bit &amp; 64-bit)
              </span>
            </div>
            <button
              onClick={() => handleCopy('npm run desktop:build:win32', 'cmd1')}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-900 shrink-0 transition"
              title="Copy Command"
            >
              {copiedCmd === 'cmd1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Command 2: Win64 (64-bit for modern Windows 7/8/10/11 64-bit) */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="overflow-x-auto">
              <span className="text-neutral-500 mr-2">$</span>
              <span className="text-blue-400 font-bold">npm run desktop:build:win64</span>
              <span className="text-neutral-500 text-[11px] block mt-1">
                Generates: <span className="text-neutral-300">release/GymMaster POS-1.0.0-win-x64-Setup.exe</span> (Works on 64-bit Windows)
              </span>
            </div>
            <button
              onClick={() => handleCopy('npm run desktop:build:win64', 'cmd2')}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-900 shrink-0 transition"
              title="Copy Command"
            >
              {copiedCmd === 'cmd2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Command 3: Both 32-bit & 64-bit at once */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="overflow-x-auto">
              <span className="text-neutral-500 mr-2">$</span>
              <span className="text-purple-400 font-bold">npm run desktop:build:all</span>
              <span className="text-neutral-500 text-[11px] block mt-1">
                Generates both 32-bit &amp; 64-bit NSIS installers + portable executables
              </span>
            </div>
            <button
              onClick={() => handleCopy('npm run desktop:build:all', 'cmd3')}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-900 shrink-0 transition"
              title="Copy Command"
            >
              {copiedCmd === 'cmd3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Command 4: Run locally in electron dev */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-4 font-mono text-xs">
            <div className="overflow-x-auto">
              <span className="text-neutral-500 mr-2">$</span>
              <span className="text-amber-400 font-bold">npm run desktop:start</span>
              <span className="text-neutral-500 text-[11px] block mt-1">
                Launches the application directly in Electron desktop window
              </span>
            </div>
            <button
              onClick={() => handleCopy('npm run desktop:start', 'cmd4')}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-900 shrink-0 transition"
              title="Copy Command"
            >
              {copiedCmd === 'cmd4' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Database Reset & Demo Data Controls */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Database Management</h4>
          <p className="text-xs text-neutral-400">Load sample gym data for testing or reset to empty database</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('Reset database to demo gym records?')) {
                onSeedDemo();
                sound.playAccessGranted();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 border border-neutral-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('seedDataBtn')}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to wipe all records and start with an empty database?')) {
                onWipeDb();
                sound.playAccessDenied();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-xs font-semibold text-red-400 border border-red-500/30 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('wipeDbBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
