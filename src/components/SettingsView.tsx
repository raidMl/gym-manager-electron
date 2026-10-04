import React, { useState } from 'react';
import { Settings, Save, Building, Phone, DollarSign, Volume2, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { AppSettings, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { sound } from '../utils/audio';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);

  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    sound.playAccessGranted();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t('settings')}</h1>
            <p className="text-xs text-neutral-400">Gym Profile, Currency, Receipts &amp; Hardware Preferences</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-5 text-xs">
        {/* Gym Identity */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Gym Identity &amp; Receipt Header</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Gym / Fitness Center Name *</label>
              <input
                type="text"
                required
                value={formData.gymName}
                onChange={e => setFormData({ ...formData, gymName: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-neutral-300 font-semibold mb-1">Physical Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Financial & Regional Setup */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Currency &amp; Localization</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Currency Symbol *</label>
              <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="DZD">DZD (Algerian Dinar)</option>
                <option value="MAD">MAD (Moroccan Dirham)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="EGP">EGP (Egyptian Pound)</option>
                <option value="TND">TND (Tunisian Dinar)</option>
                <option value="CAD">CAD (Canadian Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Default UI Language</label>
              <select
                value={formData.language}
                onChange={e => {
                  const lang = e.target.value as Language;
                  setFormData({ ...formData, language: lang });
                  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية (RTL)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Thermal Receipt Customization */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Thermal Receipt (80mm) Footer</span>
          </h2>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Receipt Footer Note</label>
            <input
              type="text"
              value={formData.receiptFooter}
              onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Hardware & Sound Preferences */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-neutral-800 pb-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Hardware &amp; Audio Alerts</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.soundAlerts}
                onChange={e => {
                  setFormData({ ...formData, soundAlerts: e.target.checked });
                  sound.enabled = e.target.checked;
                }}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-950 border-neutral-800"
              />
              <div>
                <span className="font-semibold text-neutral-200">Synthesizer Sound Alerts</span>
                <span className="block text-[11px] text-neutral-500">
                  Plays audible chimes on RFID check-in approved, buzzers on expired/denied, and cash register tones
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.gateSimulationMode}
                onChange={e => setFormData({ ...formData, gateSimulationMode: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-neutral-950 border-neutral-800"
              />
              <div>
                <span className="font-semibold text-neutral-200">Show Turnstile Gate Relay Simulation</span>
                <span className="block text-[11px] text-neutral-500">
                  Displays gate open/close visual animations on the front desk access terminal
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition shadow-lg shadow-emerald-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
