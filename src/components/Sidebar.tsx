import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Users,
  ShoppingBag,
  Coins,
  CreditCard,
  KeyRound,
  Database,
  Settings,
  Dumbbell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

export type ActiveTab =
  | 'dashboard'
  | 'checkin'
  | 'members'
  | 'pos'
  | 'caisse'
  | 'plans'
  | 'lockers'
  | 'database'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeMembersCount: number;
  expiringCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  language,
  collapsed,
  setCollapsed,
  activeMembersCount,
  expiringCount
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      labelKey: 'dashboard' as const,
      icon: LayoutDashboard,
      shortcut: 'F1',
      badge: null
    },
    {
      id: 'checkin' as ActiveTab,
      labelKey: 'checkin' as const,
      icon: ScanLine,
      shortcut: 'F2',
      badge: 'RFID'
    },
    {
      id: 'members' as ActiveTab,
      labelKey: 'members' as const,
      icon: Users,
      shortcut: 'F3',
      badge: activeMembersCount > 0 ? activeMembersCount : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      id: 'pos' as ActiveTab,
      labelKey: 'pos' as const,
      icon: ShoppingBag,
      shortcut: 'F4',
      badge: null
    },
    {
      id: 'caisse' as ActiveTab,
      labelKey: 'caisse' as const,
      icon: Coins,
      shortcut: 'F5',
      badge: null
    },
    {
      id: 'plans' as ActiveTab,
      labelKey: 'plans' as const,
      icon: CreditCard,
      shortcut: 'F6',
      badge: null
    },
    {
      id: 'lockers' as ActiveTab,
      labelKey: 'lockers' as const,
      icon: KeyRound,
      shortcut: 'F7',
      badge: null
    },
    {
      id: 'database' as ActiveTab,
      labelKey: 'database' as const,
      icon: Database,
      shortcut: 'F8',
      badge: 'Win32/64',
      badgeColor: 'bg-blue-500/20 text-blue-400'
    },
    {
      id: 'settings' as ActiveTab,
      labelKey: 'settings' as const,
      icon: Settings,
      shortcut: 'F9',
      badge: null
    }
  ];

  return (
    <aside
      className={`bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between transition-all duration-300 select-none z-20 no-print ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand & Logo Header */}
      <div>
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-neutral-950 font-black shrink-0 shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-5 h-5 text-neutral-950" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                  GymMaster <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">PRO</span>
                </h1>
                <p className="text-[11px] text-neutral-400 truncate">
                  {getTranslation(language, 'appSubtitle')}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group relative ${
                  isActive
                    ? 'bg-emerald-500 text-neutral-950 font-bold shadow-lg shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70'
                }`}
                title={collapsed ? `${getTranslation(language, item.labelKey)} (${item.shortcut})` : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-emerald-400'
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left rtl:text-right truncate">
                      {getTranslation(language, item.labelKey)}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== null && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                            isActive
                              ? 'bg-neutral-950/20 text-neutral-950 font-bold'
                              : item.badgeColor || 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-mono px-1 rounded ${
                          isActive
                            ? 'bg-neutral-950/20 text-neutral-950'
                            : 'text-neutral-500 group-hover:text-neutral-400'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      {!collapsed && (
        <div className="p-3 m-2 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-[11px]">
          <div className="flex justify-between items-center text-neutral-400 mb-1">
            <span>Offline Local DB</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          {expiringCount > 0 ? (
            <div className="text-amber-400 font-medium">
              ⚠️ {expiringCount} {getTranslation(language, 'expiringIn7Days')}
            </div>
          ) : (
            <div className="text-neutral-500 font-mono text-[10px]">
              Ready for Win 7 &amp; 10/11
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
