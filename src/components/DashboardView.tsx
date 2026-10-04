import React from 'react';
import {
  Users,
  ScanLine,
  AlertCircle,
  DollarSign,
  Coins,
  TrendingUp,
  UserPlus,
  ShoppingBag,
  CreditCard,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Member, AttendanceRecord, Sale, CaisseSession, AppSettings } from '../types';
import { getTranslation } from '../utils/translations';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  members: Member[];
  attendance: AttendanceRecord[];
  sales: Sale[];
  caisseSession: CaisseSession | null;
  settings: AppSettings;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddMember: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  attendance,
  sales,
  caisseSession,
  settings,
  setActiveTab,
  onOpenAddMember
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(settings.language, key);

  // Calculate live statistics
  const todayStr = new Date().toISOString().slice(0, 10);
  const activeMembers = members.filter(m => m.status === 'active').length;
  
  // Expiring in next 7 days
  const future7Days = new Date();
  future7Days.setDate(future7Days.getDate() + 7);
  const future7Str = future7Days.toISOString().slice(0, 10);
  const expiringSoon = members.filter(m => m.endDate >= todayStr && m.endDate <= future7Str).length;

  // Today's attendance count
  const todayAttendance = attendance.filter(a => a.checkInTime.slice(0, 10) === todayStr);

  // Today's revenue from Sales + Subscriptions in Caisse
  const todaySalesTotal = sales
    .filter(s => s.timestamp.slice(0, 10) === todayStr)
    .reduce((sum, s) => sum + s.total, 0);

  const cashInDrawer = caisseSession ? caisseSession.expectedCash : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {settings.gymName}
            </h1>
          </div>
          <p className="text-xs text-neutral-400">
            {t('offlineStatus')}
          </p>
        </div>

        {/* Quick Action Buttons for Cashier / Receptionist */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('checkin')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <ScanLine className="w-4 h-4" />
            <span>{t('checkin')} (F2)</span>
          </button>

          <button
            onClick={onOpenAddMember}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>{t('quickAddMember')}</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition"
          >
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <span>{t('quickSale')} (F4)</span>
          </button>

          <button
            onClick={() => setActiveTab('caisse')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 transition"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{t('caisse')} (F5)</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Active Members */}
        <div
          onClick={() => setActiveTab('members')}
          className="bg-neutral-900/90 border border-neutral-800/80 p-5 rounded-2xl hover:border-emerald-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">{t('activeMembers')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white tracking-tight">{activeMembers}</span>
            <span className="text-[11px] text-emerald-400 flex items-center">
              Total {members.length}
            </span>
          </div>
        </div>

        {/* Today's Checkins */}
        <div
          onClick={() => setActiveTab('checkin')}
          className="bg-neutral-900/90 border border-neutral-800/80 p-5 rounded-2xl hover:border-blue-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">{t('todayCheckins')}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white tracking-tight">{todayAttendance.length}</span>
            <span className="text-[11px] text-neutral-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-blue-400" /> Today
            </span>
          </div>
        </div>

        {/* Expiring in 7 Days */}
        <div
          onClick={() => setActiveTab('members')}
          className="bg-neutral-900/90 border border-neutral-800/80 p-5 rounded-2xl hover:border-amber-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">{t('expiringIn7Days')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-black tracking-tight ${expiringSoon > 0 ? 'text-amber-400' : 'text-white'}`}>
              {expiringSoon}
            </span>
            <span className="text-[11px] text-amber-400/80">Action needed</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div
          onClick={() => setActiveTab('caisse')}
          className="bg-neutral-900/90 border border-neutral-800/80 p-5 rounded-2xl hover:border-emerald-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">{t('todayRevenue')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 tracking-tight">
              {settings.currency}{todaySalesTotal.toFixed(2)}
            </span>
            <span className="text-[11px] text-neutral-400">Sales &amp; Subs</span>
          </div>
        </div>

        {/* Cash in Drawer */}
        <div
          onClick={() => setActiveTab('caisse')}
          className="bg-neutral-900/90 border border-neutral-800/80 p-5 rounded-2xl hover:border-amber-500/40 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-xs font-medium">{t('cashInDrawer')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white tracking-tight">
              {settings.currency}{cashInDrawer.toFixed(2)}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${caisseSession?.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {caisseSession?.status === 'open' ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Attendance Live Stream + Quick POS / Store Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Live Stream (2 cols) */}
        <div className="lg:col-span-2 bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-wide">
                {t('recentCheckins')}
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('checkin')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
            >
              <span>Full Terminal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {attendance.length === 0 ? (
            <div className="py-12 text-center text-neutral-500 text-xs">
              {t('noAttendanceToday')}
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/60">
              {attendance.slice(0, 6).map((rec) => {
                const isGranted = rec.status === 'granted';
                const isExpired = rec.status === 'expired';
                const isDebt = rec.status === 'debt_warning';

                return (
                  <div key={rec.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center font-bold text-xs text-neutral-200">
                        {rec.memberName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                          <span>{rec.memberName}</span>
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                            {rec.barcode}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {rec.planName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isGranted
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isExpired
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {isGranted && <CheckCircle className="w-3 h-3" />}
                          {isExpired && <XCircle className="w-3 h-3" />}
                          {isDebt && <AlertTriangle className="w-3 h-3" />}
                          {isGranted ? 'GRANTED' : isExpired ? 'EXPIRED' : 'DEBT'}
                        </span>
                        <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          {new Date(rec.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Gym Overview & Expiring Members Alerts */}
        <div className="space-y-6">
          {/* Expiring Members Card */}
          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <h3 className="text-sm font-bold text-white">Renewal Alerts</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                {expiringSoon}
              </span>
            </div>

            <div className="space-y-2.5">
              {members
                .filter(m => m.endDate >= todayStr && m.endDate <= future7Str)
                .slice(0, 4)
                .map(m => {
                  const daysLeft = Math.ceil(
                    (new Date(m.endDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24)
                  );
                  return (
                    <div
                      key={m.id}
                      onClick={() => setActiveTab('members')}
                      className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-amber-500/40 transition flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-neutral-200">{m.name}</div>
                        <div className="text-[11px] text-neutral-400">{m.planName}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-400 font-mono">
                          {daysLeft}d left
                        </span>
                        <div className="text-[10px] text-neutral-500">{m.endDate}</div>
                      </div>
                    </div>
                  );
                })}

              {expiringSoon === 0 && (
                <div className="text-xs text-neutral-500 text-center py-4">
                  No subscriptions expiring in the next 7 days.
                </div>
              )}
            </div>
          </div>

          {/* Windows Desktop Ready Card */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-5 text-neutral-300">
            <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline Ready Application</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-3">
              Your gym database is stored 100% locally on this computer. You can run POS sales, access control, and cash drawer without an active internet connection.
            </p>
            <button
              onClick={() => setActiveTab('database')}
              className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition border border-neutral-700 flex items-center justify-center gap-1.5"
            >
              <span>Manage DB &amp; Generate Win32/64 Exe</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
