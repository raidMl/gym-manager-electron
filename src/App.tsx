import React, { useState, useEffect } from 'react';
import { db } from './db/localDb';
import {
  Member,
  SubscriptionPlan,
  AttendanceRecord,
  Product,
  Sale,
  CaisseRecord,
  CaisseSession,
  Locker,
  AppSettings
} from './types';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CheckInView } from './components/CheckInView';
import { MembersView } from './components/MembersView';
import { POSView } from './components/POSView';
import { CaisseView } from './components/CaisseView';
import { PlansView } from './components/PlansView';
import { LockersView } from './components/LockersView';
import { DatabaseCenterView } from './components/DatabaseCenterView';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { sound } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Reactive DB State
  const [members, setMembers] = useState<Member[]>(() => db.getMembers());
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => db.plans);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => db.attendance);
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [sales, setSales] = useState<Sale[]>(() => db.sales);
  const [caisseRecords, setCaisseRecords] = useState<CaisseRecord[]>(() => db.caisseRecords);
  const [caisseSession, setCaisseSession] = useState<CaisseSession | null>(() => db.caisseSession);
  const [lockers, setLockers] = useState<Locker[]>(() => db.lockers);
  const [settings, setSettings] = useState<AppSettings>(() => db.settings);

  // Active Receipt Modal
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  // Trigger quick add member modal from anywhere
  const [openAddMemberSignal, setOpenAddMemberSignal] = useState(false);

  // Subscribe to DB updates
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setMembers(db.getMembers());
      setPlans([...db.plans]);
      setAttendance([...db.attendance]);
      setProducts(db.getProducts());
      setSales([...db.sales]);
      setCaisseRecords([...db.caisseRecords]);
      setCaisseSession(db.caisseSession ? { ...db.caisseSession } : null);
      setLockers([...db.lockers]);
      setSettings({ ...db.settings });
    });
    return unsubscribe;
  }, []);

  // Sync Language RTL & Audio preference
  useEffect(() => {
    document.documentElement.setAttribute('dir', settings.language === 'ar' ? 'rtl' : 'ltr');
    sound.enabled = settings.soundAlerts;
  }, [settings.language, settings.soundAlerts]);

  // Global Keyboard Shortcuts (F1 - F9, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('dashboard');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('checkin');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('members');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F5') {
        e.preventDefault();
        setActiveTab('caisse');
      } else if (e.key === 'F6') {
        e.preventDefault();
        setActiveTab('plans');
      } else if (e.key === 'F7') {
        e.preventDefault();
        setActiveTab('lockers');
      } else if (e.key === 'F8') {
        e.preventDefault();
        setActiveTab('database');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setActiveTab('settings');
      } else if (e.key === 'Escape') {
        if (receiptSale) setReceiptSale(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [receiptSale]);

  // Quick Global Scan (from Header barcode/RFID input)
  const handleGlobalScan = (query: string) => {
    // If currently on POS tab, try to find a retail product first
    if (activeTab === 'pos') {
      const prod = products.find(p => p.barcode.toLowerCase() === query.toLowerCase());
      if (prod) {
        sound.playBarcodeBeep();
        // Handled in POS view
        return;
      }
    }

    // Default: Check In member
    setActiveTab('checkin');
    const result = db.checkIn(query);
    if (result.status === 'granted' || result.status === 'debt_warning') {
      sound.playAccessGranted();
    } else {
      sound.playAccessDenied();
    }
  };

  // Expiring in 7 days count for sidebar badge
  const todayStr = new Date().toISOString().slice(0, 10);
  const future7Days = new Date();
  future7Days.setDate(future7Days.getDate() + 7);
  const future7Str = future7Days.toISOString().slice(0, 10);
  const expiringCount = members.filter(m => m.endDate >= todayStr && m.endDate <= future7Str).length;

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme === 'light' ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-950 text-neutral-100'}`}>
      {/* Top Application Header / Windows Desktop Titlebar */}
      <Header
        settings={settings}
        caisseSession={caisseSession}
        onUpdateSettings={(newSettings) => db.updateSettings(newSettings)}
        onQuickScan={handleGlobalScan}
        onOpenCaisseModal={() => setActiveTab('caisse')}
      />

      {/* Main Workspace Body with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          language={settings.language}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          activeMembersCount={members.filter(m => m.status === 'active').length}
          expiringCount={expiringCount}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                members={members}
                attendance={attendance}
                sales={sales}
                caisseSession={caisseSession}
                settings={settings}
                setActiveTab={setActiveTab}
                onOpenAddMember={() => {
                  setActiveTab('members');
                  setOpenAddMemberSignal(true);
                }}
              />
            )}

            {activeTab === 'checkin' && (
              <CheckInView
                members={members}
                attendance={attendance}
                settings={settings}
                onCheckIn={(query) => db.checkIn(query)}
              />
            )}

            {activeTab === 'members' && (
              <MembersView
                members={members}
                plans={plans}
                settings={settings}
                onSaveMember={(mem) => db.saveMember(mem)}
                onDeleteMember={(id) => db.deleteMember(id)}
                onRenewMember={(id, planId, method) => db.renewMemberSubscription(id, planId, method)}
                initialOpenAdd={openAddMemberSignal}
              />
            )}

            {activeTab === 'pos' && (
              <POSView
                products={products}
                members={members}
                settings={settings}
                onSaveProduct={(prod) => db.saveProduct(prod)}
                onCompleteSale={(saleData) => db.createSale(saleData)}
                onShowReceipt={(sale) => setReceiptSale(sale)}
              />
            )}

            {activeTab === 'caisse' && (
              <CaisseView
                caisseSession={caisseSession}
                caisseRecords={caisseRecords}
                settings={settings}
                onOpenCaisse={(amount, notes) => db.openCaisse(amount, notes)}
                onCloseCaisse={(amount, notes) => db.closeCaisse(amount, notes)}
                onAddMovement={(rec) => db.addCaisseRecord(rec)}
              />
            )}

            {activeTab === 'plans' && (
              <PlansView
                plans={plans}
                members={members}
                settings={settings}
                onSavePlan={(plan) => db.savePlan(plan)}
                onDeletePlan={(id) => db.deletePlan(id)}
              />
            )}

            {activeTab === 'lockers' && (
              <LockersView
                lockers={lockers}
                members={members}
                settings={settings}
                onAssignLocker={(num, mId, mName, dep) => db.assignLocker(num, mId, mName, dep)}
                onReleaseLocker={(num) => db.releaseLocker(num)}
              />
            )}

            {activeTab === 'database' && (
              <DatabaseCenterView
                settings={settings}
                stats={{
                  membersCount: members.length,
                  plansCount: plans.length,
                  productsCount: products.length,
                  salesCount: sales.length,
                  attendanceCount: attendance.length,
                  caisseRecordsCount: caisseRecords.length
                }}
                onExportBackup={() => db.exportFullBackup()}
                onImportBackup={(jsonStr) => db.importFullBackup(jsonStr)}
                onSeedDemo={() => db.seedDemoDataSync()}
                onWipeDb={() => db.wipeDatabase()}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={(newSettings) => db.updateSettings(newSettings)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Printable 80mm Thermal Receipt Modal */}
      {receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          settings={settings}
          onClose={() => setReceiptSale(null)}
        />
      )}
    </div>
  );
}
