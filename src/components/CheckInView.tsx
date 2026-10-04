import React, { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Download,
  Search,
  Sparkles,
  Calendar,
  Phone,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Member, AttendanceRecord, AppSettings } from '../types';
import { getTranslation } from '../utils/translations';
import { sound } from '../utils/audio';

interface CheckInViewProps {
  members: Member[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
  onCheckIn: (query: string) => {
    success: boolean;
    member?: Member;
    status: 'granted' | 'expired' | 'denied' | 'debt_warning';
    message: string;
    record?: AttendanceRecord;
  };
}

export const CheckInView: React.FC<CheckInViewProps> = ({
  members,
  attendance,
  settings,
  onCheckIn
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);
  const inputRef = useRef<HTMLInputElement>(null);

  const [scanQuery, setScanQuery] = useState('');
  const [lastResult, setLastResult] = useState<{
    member?: Member;
    status: 'idle' | 'granted' | 'expired' | 'denied' | 'debt_warning';
    message?: string;
    timestamp?: Date;
  }>({
    status: 'idle'
  });

  const [gateOpen, setGateOpen] = useState(false);

  // Auto-focus input on mount & periodically
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = (query: string) => {
    if (!query.trim()) return;
    const res = onCheckIn(query.trim());

    if (res.status === 'granted') {
      sound.playAccessGranted();
      setGateOpen(true);
      setTimeout(() => setGateOpen(false), 2500);
    } else if (res.status === 'debt_warning') {
      sound.playAccessGranted();
      setGateOpen(true);
      setTimeout(() => setGateOpen(false), 2500);
    } else {
      sound.playAccessDenied();
      setGateOpen(false);
    }

    setLastResult({
      member: res.member,
      status: res.status,
      message: res.message,
      timestamp: new Date()
    });

    setScanQuery('');
    inputRef.current?.focus();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(scanQuery);
  };

  // Export today's attendance to CSV
  const handleExportCSV = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayList = attendance.filter(a => a.checkInTime.slice(0, 10) === todayStr);
    if (todayList.length === 0) return;

    const headers = ['Time', 'Member ID', 'Member Name', 'RFID / Barcode', 'Plan', 'Status', 'Notes'];
    const rows = todayList.map(a => [
      new Date(a.checkInTime).toLocaleTimeString(),
      a.memberId,
      `"${a.memberName}"`,
      a.barcode,
      `"${a.planName}"`,
      a.status,
      `"${a.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendance.filter(a => a.checkInTime.slice(0, 10) === todayStr);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScanLine className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {t('terminalTitle')}
            </h1>
          </div>
          <p className="text-xs text-neutral-400">
            {t('terminalSubtitle')}
          </p>
        </div>

        {/* Fast Scanner Input Box */}
        <form onSubmit={handleFormSubmit} className="w-full md:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={scanQuery}
              onChange={(e) => setScanQuery(e.target.value)}
              placeholder="Scan RFID Tag or type name..."
              className="w-full bg-neutral-950 border-2 border-emerald-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 font-mono transition shadow-lg shadow-emerald-500/10"
            />
            <ScanLine className="w-5 h-5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none rtl:left-auto rtl:right-3 animate-pulse" />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition shadow-md whitespace-nowrap"
          >
            Check-In
          </button>
        </form>
      </div>

      {/* Main Terminal Screen: Big visual card with gate state */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Big Live Access Feedback Display (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between min-h-[440px] relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div
            className={`absolute inset-0 pointer-events-none transition-all duration-700 opacity-20 ${
              lastResult.status === 'granted'
                ? 'bg-emerald-500'
                : lastResult.status === 'expired'
                ? 'bg-red-500'
                : lastResult.status === 'debt_warning'
                ? 'bg-amber-500'
                : lastResult.status === 'denied'
                ? 'bg-red-600'
                : 'bg-neutral-800'
            }`}
          />

          {/* Top Status Banner */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Turnstile Gate: {gateOpen ? 'UNLOCKED / PASS' : 'LOCKED'}
              </span>
            </div>
            {lastResult.timestamp && (
              <span className="text-xs font-mono text-neutral-500">
                {lastResult.timestamp.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Center Card Result View */}
          <div className="my-auto py-6 flex flex-col items-center justify-center text-center z-10">
            {lastResult.status === 'idle' ? (
              <div className="space-y-4 max-w-sm">
                <div className="w-24 h-24 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-600">
                  <ScanLine className="w-10 h-10 animate-pulse text-emerald-500/70" />
                </div>
                <h3 className="text-lg font-bold text-white">Scanner Active &amp; Ready</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Hold RFID key fob, card, or barcode reader against the gate scanner to verify member subscription.
                </p>
              </div>
            ) : lastResult.status === 'denied' ? (
              <div className="space-y-4">
                <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center mx-auto text-red-400 animate-bounce">
                  <XCircle className="w-12 h-12" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-red-400 tracking-tight">
                    {t('accessDenied')}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">{lastResult.message}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 w-full">
                {/* Member Avatar with Status Ring */}
                <div className="relative">
                  <img
                    src={lastResult.member?.photoUrl}
                    alt={lastResult.member?.name}
                    className="w-28 h-28 rounded-full object-cover border-4 shadow-xl"
                    style={{
                      borderColor:
                        lastResult.status === 'granted'
                          ? '#10b981'
                          : lastResult.status === 'expired'
                          ? '#ef4444'
                          : '#f59e0b'
                    }}
                  />
                  <div
                    className={`absolute bottom-0 right-0 p-1.5 rounded-full text-neutral-950 shadow-md ${
                      lastResult.status === 'granted'
                        ? 'bg-emerald-400'
                        : lastResult.status === 'expired'
                        ? 'bg-red-400'
                        : 'bg-amber-400'
                    }`}
                  >
                    {lastResult.status === 'granted' && <CheckCircle className="w-5 h-5 text-neutral-950" />}
                    {lastResult.status === 'expired' && <XCircle className="w-5 h-5 text-neutral-950" />}
                    {lastResult.status === 'debt_warning' && <AlertTriangle className="w-5 h-5 text-neutral-950" />}
                  </div>
                </div>

                {/* Member Info & Access Status */}
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {lastResult.member?.name}
                  </h2>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{lastResult.member?.planName}</span>
                    <span className="font-mono text-neutral-500">({lastResult.member?.barcode})</span>
                  </p>
                </div>

                {/* Big Visual Badge */}
                <div
                  className={`px-6 py-2.5 rounded-2xl text-sm font-extrabold tracking-wider uppercase shadow-lg ${
                    lastResult.status === 'granted'
                      ? 'bg-emerald-500 text-neutral-950 shadow-emerald-500/30'
                      : lastResult.status === 'expired'
                      ? 'bg-red-500 text-white shadow-red-500/30 animate-pulse'
                      : 'bg-amber-500 text-neutral-950 shadow-amber-500/30'
                  }`}
                >
                  {lastResult.status === 'granted' && t('accessGranted')}
                  {lastResult.status === 'expired' && t('accessExpired')}
                  {lastResult.status === 'debt_warning' && t('debtNotice')}
                </div>

                {/* Expiry Countdown */}
                <div className="flex items-center gap-4 text-xs font-mono pt-1 text-neutral-300">
                  <div className="flex items-center gap-1 bg-neutral-950/80 px-3 py-1 rounded-lg border border-neutral-800">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Valid until: {lastResult.member?.endDate}</span>
                  </div>
                  {lastResult.member && (
                    <div className="flex items-center gap-1 bg-neutral-950/80 px-3 py-1 rounded-lg border border-neutral-800">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{lastResult.member.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Gate Indicator Simulator Bar */}
          <div className="border-t border-neutral-800/80 pt-3 flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-2 text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline Gate Hardware Interface</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${gateOpen ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
              <span className={gateOpen ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                {gateOpen ? 'RELAY TRIGGERED: OPEN' : 'STANDBY'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Manual Check-In List & Member Picker (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col min-h-[440px]">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">{t('manualCheckin')}</h3>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              Click name to check in
            </span>
          </div>

          {/* Quick list of active members */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px]">
            {members.slice(0, 10).map((m) => (
              <div
                key={m.id}
                onClick={() => handleScan(m.barcode)}
                className="p-2.5 rounded-xl bg-neutral-950/60 border border-neutral-800/70 hover:border-emerald-500/50 hover:bg-neutral-800/40 transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={m.photoUrl}
                    alt={m.name}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-neutral-200 group-hover:text-emerald-300 transition">
                      {m.name}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {m.planName} &bull; <span className="font-mono text-neutral-500">{m.barcode}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      m.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {m.status.toUpperCase()}
                  </span>
                  <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    {m.endDate}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Full Attendance Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {t('todayAttendance')} ({todayAttendance.length})
            </h3>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('exportCsv')}</span>
          </button>
        </div>

        {todayAttendance.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            {t('noAttendanceToday')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-neutral-950/60 text-neutral-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Time</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Barcode / Tag</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {todayAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-2.5 px-3 font-mono text-neutral-400">
                      {new Date(rec.checkInTime).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {rec.memberName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-400">
                      {rec.barcode}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300">
                      {rec.planName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'granted'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : rec.status === 'expired'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {rec.status === 'granted' ? 'GRANTED' : rec.status === 'expired' ? 'EXPIRED' : 'DEBT'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 text-[11px] truncate max-w-xs">
                      {rec.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
