import React, { useState } from 'react';
import { KeyRound, User, Check, X, ShieldAlert } from 'lucide-react';
import { Locker, Member, AppSettings } from '../types';
import { getTranslation } from '../utils/translations';

interface LockersViewProps {
  lockers: Locker[];
  members: Member[];
  settings: AppSettings;
  onAssignLocker: (lockerNumber: number, memberId: string, memberName: string, depositAmount?: number) => void;
  onReleaseLocker: (lockerNumber: number) => void;
}

export const LockersView: React.FC<LockersViewProps> = ({
  lockers,
  members,
  settings,
  onAssignLocker,
  onReleaseLocker
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);

  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [assignMemberId, setAssignMemberId] = useState<string>('');
  const [deposit, setDeposit] = useState<number>(10);

  const availableCount = lockers.filter(l => l.status === 'available').length;
  const occupiedCount = lockers.filter(l => l.status === 'occupied').length;
  const maintenanceCount = lockers.filter(l => l.status === 'maintenance').length;

  const handleAssign = () => {
    if (!selectedLocker || !assignMemberId) return;
    const member = members.find(m => m.id === assignMemberId);
    if (!member) return;

    onAssignLocker(selectedLocker.number, member.id, member.name, deposit);
    setSelectedLocker(null);
    setAssignMemberId('');
  };

  const handleRelease = (lockerNum: number) => {
    onReleaseLocker(lockerNum);
    setSelectedLocker(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary stats */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">{t('lockerRoom')}</h1>
            <p className="text-xs text-neutral-400">Key Deposit, Assignment &amp; Maintenance</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
            {availableCount} {t('freeLockers')}
          </span>
          <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
            {occupiedCount} {t('occupiedLockers')}
          </span>
          {maintenanceCount > 0 && (
            <span className="px-3 py-1 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
              {maintenanceCount} {t('maintenanceLockers')}
            </span>
          )}
        </div>
      </div>

      {/* 24 Locker Interactive Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3.5">
        {lockers.map(l => {
          const isFree = l.status === 'available';
          const isOccupied = l.status === 'occupied';
          const isMaint = l.status === 'maintenance';

          return (
            <div
              key={l.number}
              onClick={() => setSelectedLocker(l)}
              className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col justify-between min-h-[110px] select-none ${
                isFree
                  ? 'bg-neutral-900/80 border-emerald-500/30 hover:border-emerald-400 hover:bg-neutral-850 text-neutral-200'
                  : isOccupied
                  ? 'bg-blue-950/40 border-blue-500/40 hover:border-blue-400 text-white'
                  : 'bg-red-950/30 border-red-500/30 text-red-300 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="font-bold text-sm">#{l.number}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isFree ? 'bg-emerald-400' : isOccupied ? 'bg-blue-400' : 'bg-red-400'
                  }`}
                />
              </div>

              <div className="my-auto py-1">
                {isOccupied ? (
                  <div className="text-[11px] font-bold truncate max-w-full">
                    {l.memberName}
                  </div>
                ) : isFree ? (
                  <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                    Free
                  </div>
                ) : (
                  <div className="text-[10px] text-red-400 font-semibold uppercase">
                    Locked
                  </div>
                )}
              </div>

              <div className="text-[9px] font-mono text-neutral-500">
                {isOccupied && l.depositAmount ? `Dep: ${settings.currency}${l.depositAmount}` : 'Locker'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Locker Action Modal */}
      {selectedLocker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Locker #{selectedLocker.number}</span>
              </h2>
              <button onClick={() => setSelectedLocker(null)} className="text-neutral-400 hover:text-white">
                &times;
              </button>
            </div>

            {selectedLocker.status === 'occupied' ? (
              <div className="space-y-4 text-xs">
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Assigned Member:</span>
                    <span className="font-bold text-white">{selectedLocker.memberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Assigned Date:</span>
                    <span className="font-mono text-neutral-300">{selectedLocker.assignedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">{t('keyDeposit')}:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {settings.currency}{selectedLocker.depositAmount || 0}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRelease(selectedLocker.number)}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition shadow-md shadow-red-500/20"
                >
                  {t('releaseLocker')} &amp; Refund Deposit
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Select Active Member *</label>
                  <select
                    value={assignMemberId}
                    onChange={e => setAssignMemberId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Choose member --</option>
                    {members
                      .filter(m => m.status === 'active' && !m.lockerNumber)
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.barcode})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">{t('keyDeposit')} ({settings.currency})</label>
                  <input
                    type="number"
                    value={deposit}
                    onChange={e => setDeposit(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setSelectedLocker(null)}
                    className="flex-1 py-2 text-neutral-400 hover:bg-neutral-800 rounded-xl"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={!assignMemberId}
                    className={`flex-1 py-2 rounded-xl font-bold transition ${
                      assignMemberId
                        ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {t('assignLocker')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
