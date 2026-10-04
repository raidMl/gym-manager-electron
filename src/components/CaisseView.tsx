import React, { useState } from 'react';
import {
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { CaisseSession, CaisseRecord, AppSettings } from '../types';
import { getTranslation } from '../utils/translations';
import { sound } from '../utils/audio';

interface CaisseViewProps {
  caisseSession: CaisseSession | null;
  caisseRecords: CaisseRecord[];
  settings: AppSettings;
  onOpenCaisse: (openingFloat: number, notes?: string) => void;
  onCloseCaisse: (countedCash: number, notes?: string) => void;
  onAddMovement: (record: Omit<CaisseRecord, 'id' | 'timestamp'>) => void;
}

export const CaisseView: React.FC<CaisseViewProps> = ({
  caisseSession,
  caisseRecords,
  settings,
  onOpenCaisse,
  onCloseCaisse,
  onAddMovement
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);

  const [isOpenModalActive, setIsOpenModalActive] = useState(false);
  const [openingFloatInput, setOpeningFloatInput] = useState<number>(150);

  const [isCloseModalActive, setIsCloseModalActive] = useState(false);
  const [countedCashInput, setCountedCashInput] = useState<number>(0);
  const [closureNotes, setClosureNotes] = useState('');

  const [isMovementModalActive, setIsMovementModalActive] = useState(false);
  const [movementForm, setMovementForm] = useState({
    type: 'expense' as 'expense' | 'cashIn',
    amount: 10,
    description: '',
    category: 'General',
    paymentMethod: 'cash' as 'cash' | 'card'
  });

  const isOpen = caisseSession && caisseSession.status === 'open';

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenCaisse(Number(openingFloatInput) || 0);
    sound.playCashRegister();
    setIsOpenModalActive(false);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseCaisse(Number(countedCashInput) || 0, closureNotes);
    sound.playCashRegister();
    setIsCloseModalActive(false);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementForm.description || !movementForm.amount) return;

    const amount = movementForm.type === 'expense'
      ? -Math.abs(Number(movementForm.amount))
      : Math.abs(Number(movementForm.amount));

    onAddMovement({
      type: movementForm.type === 'expense' ? 'expense' : 'deposit',
      amount,
      paymentMethod: movementForm.paymentMethod,
      description: movementForm.description,
      category: movementForm.category,
      operator: 'Cashier'
    });

    sound.playBarcodeBeep();
    setIsMovementModalActive(false);
    setMovementForm({
      type: 'expense',
      amount: 10,
      description: '',
      category: 'General',
      paymentMethod: 'cash'
    });
  };

  return (
    <div className="space-y-6">
      {/* Caisse Status Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Coins className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t('caisse')}</h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ml-2 ${
                isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isOpen ? 'REGISTER OPEN' : 'REGISTER CLOSED'}
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            {isOpen && caisseSession?.openedAt
              ? `Session active since ${new Date(caisseSession.openedAt).toLocaleTimeString()}`
              : 'Shift is closed. Open register to track cash drawer balance.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isOpen ? (
            <>
              <button
                onClick={() => setIsMovementModalActive(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>{t('addMovement')}</span>
              </button>
              <button
                onClick={() => {
                  setCountedCashInput(caisseSession.expectedCash);
                  setIsCloseModalActive(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-amber-500/20"
              >
                <Lock className="w-4 h-4" />
                <span>{t('closeRegister')}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpenModalActive(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
            >
              <Unlock className="w-4 h-4" />
              <span>{t('openRegister')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Shift Breakdown Cards */}
      {isOpen && caisseSession && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Float Initial */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-400">{t('openingFloat')}</span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {settings.currency}{caisseSession.openingFloat.toFixed(2)}
            </div>
            <span className="text-[10px] text-neutral-500">Starting drawer float</span>
          </div>

          {/* Cash Sales & Subs */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-400">Cash Received (Sales &amp; Subs)</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              +{settings.currency}{caisseSession.totalCashSales.toFixed(2)}
            </div>
            <span className="text-[10px] text-neutral-500">Cash revenue collected</span>
          </div>

          {/* Expenses / Cash Out */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl">
            <span className="text-xs font-medium text-neutral-400">Cash Expenses (Dépenses)</span>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">
              -{settings.currency}{caisseSession.totalExpenses.toFixed(2)}
            </div>
            <span className="text-[10px] text-neutral-500">Paid out from drawer</span>
          </div>

          {/* Theoretical Total in Drawer */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-emerald-950/20 border-emerald-500/30">
            <span className="text-xs font-semibold text-emerald-400">{t('expectedInDrawer')}</span>
            <div className="text-2xl font-black text-white font-mono mt-1">
              {settings.currency}{caisseSession.expectedCash.toFixed(2)}
            </div>
            <span className="text-[10px] text-neutral-400">Float + In - Out</span>
          </div>
        </div>
      )}

      {/* Cash Flow Movements Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">{t('cashMovements')}</h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {caisseRecords.length} recorded operations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-neutral-950 text-neutral-400 font-mono text-[10px] uppercase border-b border-neutral-800">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3 text-right rtl:text-left">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {caisseRecords.map(rec => {
                const isPositive = rec.amount > 0;
                const isExpense = rec.type === 'expense';

                return (
                  <tr key={rec.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-2.5 px-3 font-mono text-neutral-400">
                      {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          rec.type === 'sale'
                            ? 'bg-blue-500/20 text-blue-400'
                            : rec.type === 'subscription'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isExpense
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {rec.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-200 font-medium">
                      {rec.description}
                    </td>
                    <td className="py-2.5 px-3 uppercase font-mono text-neutral-400 text-[10px]">
                      {rec.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-400">
                      {rec.operator}
                    </td>
                    <td className="py-2.5 px-3 text-right rtl:text-left font-mono font-bold">
                      <span className={isExpense ? 'text-red-400' : isPositive ? 'text-emerald-400' : 'text-neutral-400'}>
                        {isExpense ? '-' : isPositive ? '+' : ''}
                        {settings.currency}{Math.abs(rec.amount).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Open Register Modal */}
      {isOpenModalActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" />
              <span>{t('openRegister')}</span>
            </h2>
            <form onSubmit={handleOpenSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">{t('openingFloat')} *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={openingFloatInput}
                  onChange={e => setOpeningFloatInput(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-lg font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Count the starting cash in your physical drawer before starting sales.
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenModalActive(false)}
                  className="flex-1 py-2 text-neutral-400 hover:bg-neutral-800 rounded-xl transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl transition shadow-md shadow-emerald-500/20"
                >
                  Start Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Register / Z-Report Modal */}
      {isCloseModalActive && caisseSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>{t('closeRegister')} (Z-Report)</span>
            </h2>

            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>Expected Drawer Total:</span>
                <span className="font-mono font-bold text-white">
                  {settings.currency}{caisseSession.expectedCash.toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleCloseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">{t('countedCash')} *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={countedCashInput}
                  onChange={e => setCountedCashInput(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xl font-mono font-bold text-emerald-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Calculated Discrepancy Preview */}
              <div className="flex justify-between items-center bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
                <span className="text-neutral-400 font-semibold">{t('discrepancy')}:</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    countedCashInput - caisseSession.expectedCash === 0
                      ? 'text-emerald-400'
                      : countedCashInput - caisseSession.expectedCash > 0
                      ? 'text-blue-400'
                      : 'text-red-400'
                  }`}
                >
                  {countedCashInput - caisseSession.expectedCash >= 0 ? '+' : ''}
                  {settings.currency}{(countedCashInput - caisseSession.expectedCash).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Shift Closure Notes</label>
                <textarea
                  rows={2}
                  value={closureNotes}
                  onChange={e => setClosureNotes(e.target.value)}
                  placeholder="Notes on discrepancy, cash hand-off, or bank deposit..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalActive(false)}
                  className="flex-1 py-2.5 text-neutral-400 hover:bg-neutral-800 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Confirm &amp; Print Z-Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Movement (Dépense / Apport) Modal */}
      {isMovementModalActive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>{t('addMovement')}</span>
            </h2>

            <form onSubmit={handleMovementSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementForm({ ...movementForm, type: 'expense' })}
                  className={`py-2 rounded-xl font-bold border transition ${
                    movementForm.type === 'expense'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  {t('expense')}
                </button>
                <button
                  type="button"
                  onClick={() => setMovementForm({ ...movementForm, type: 'cashIn' })}
                  className={`py-2 rounded-xl font-bold border transition ${
                    movementForm.type === 'cashIn'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  {t('cashIn')}
                </button>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Amount ({settings.currency}) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={movementForm.amount}
                  onChange={e => setMovementForm({ ...movementForm, amount: Number(e.target.value) })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-base font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Reason / Description *</label>
                <input
                  type="text"
                  required
                  value={movementForm.description}
                  onChange={e => setMovementForm({ ...movementForm, description: e.target.value })}
                  placeholder="e.g. Cleaning wipes, Water bottles deposit..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMovementModalActive(false)}
                  className="flex-1 py-2 text-neutral-400 hover:bg-neutral-800 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl"
                >
                  Save Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
