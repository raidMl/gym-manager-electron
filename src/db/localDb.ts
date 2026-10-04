import {
  Member,
  SubscriptionPlan,
  AttendanceRecord,
  Product,
  Sale,
  CaisseRecord,
  CaisseSession,
  Locker,
  AppSettings,
  DatabaseBackup
} from '../types';

const DB_NAME = 'GymMaster_Local_DB_v1';
const DB_VERSION = 1;
const STORAGE_BACKUP_KEY = 'gymmaster_local_snapshot';

export const defaultSettings: AppSettings = {
  gymName: 'Titan Gym & Fitness Club',
  address: '104 Boulevard Central, Suite 2A',
  phone: '+1 (555) 789-2044',
  currency: '$',
  taxRate: 0,
  language: 'en',
  theme: 'dark',
  receiptFooter: 'Thank you for training with us! Push your limits every day.',
  autoBackup: true,
  soundAlerts: true,
  scannerAutoSubmit: true,
  gateSimulationMode: true
};

export const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'plan-day',
    name: 'Day Pass',
    durationDays: 1,
    price: 12,
    description: 'Full day access to weight room & cardio area',
    features: ['Weight room', 'Cardio machines', 'Locker access'],
    category: 'daypass',
    badgeColor: 'bg-zinc-700 text-zinc-200'
  },
  {
    id: 'plan-month',
    name: 'Monthly Standard',
    durationDays: 30,
    price: 45,
    description: 'Unlimited access for 30 days with locker room & sauna',
    features: ['Full gym equipment', 'Sauna & shower', 'Free Wi-Fi', 'Mobile check-in'],
    category: 'standard',
    badgeColor: 'bg-blue-600 text-white'
  },
  {
    id: 'plan-student',
    name: 'Student Special',
    durationDays: 30,
    price: 32,
    description: 'Discounted monthly membership with valid Student ID',
    features: ['Access 06:00 - 18:00', 'Full equipment', 'Cardio & Weights'],
    category: 'student',
    badgeColor: 'bg-indigo-600 text-white'
  },
  {
    id: 'plan-quarter',
    name: 'Quarterly Power (3 Months)',
    durationDays: 90,
    price: 115,
    description: '90 days complete access with 1 guest pass per month',
    features: ['Full access 7 days/wk', 'Sauna & Steam room', '3 Guest passes', 'Free fitness assessment'],
    category: 'standard',
    badgeColor: 'bg-emerald-600 text-white'
  },
  {
    id: 'plan-semi',
    name: 'Semi-Annual (6 Months)',
    durationDays: 180,
    price: 210,
    description: 'Best balance of value and consistency with towel service',
    features: ['Full access', 'Free towel service', 'Nutrition guide', '1 Personal trainer session'],
    category: 'vip',
    badgeColor: 'bg-purple-600 text-white'
  },
  {
    id: 'plan-annual',
    name: 'Annual VIP All-Inclusive',
    durationDays: 365,
    price: 380,
    description: '365 days unlimited access + VIP locker + 3 PT sessions',
    features: ['24/7 Access', 'Dedicated locker', '3 PT sessions', 'Free supplement shakes (5)', 'Towel & Laundry'],
    category: 'vip',
    badgeColor: 'bg-amber-500 text-neutral-950 font-bold'
  }
];

export const defaultProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Gold Whey Protein 2kg (Chocolate)',
    category: 'supplements',
    barcode: '7891001',
    costPrice: 42,
    salePrice: 65,
    stock: 18,
    minStockAlert: 5,
    unit: 'Tub'
  },
  {
    id: 'prod-2',
    name: 'BCAA Energy Drink 500ml',
    category: 'drinks',
    barcode: '7891002',
    costPrice: 1.5,
    salePrice: 3.5,
    stock: 46,
    minStockAlert: 12,
    unit: 'Can'
  },
  {
    id: 'prod-3',
    name: 'Electrolyte Mineral Water 1.5L',
    category: 'drinks',
    barcode: '7891003',
    costPrice: 0.4,
    salePrice: 1.5,
    stock: 80,
    minStockAlert: 20,
    unit: 'Bottle'
  },
  {
    id: 'prod-4',
    name: 'High Protein Peanut Bar 60g',
    category: 'snacks',
    barcode: '7891004',
    costPrice: 1.2,
    salePrice: 2.8,
    stock: 32,
    minStockAlert: 10,
    unit: 'Bar'
  },
  {
    id: 'prod-5',
    name: 'Creatine Monohydrate 300g Powder',
    category: 'supplements',
    barcode: '7891005',
    costPrice: 18,
    salePrice: 29,
    stock: 14,
    minStockAlert: 4,
    unit: 'Jar'
  },
  {
    id: 'prod-6',
    name: 'Titan Pro Lifting Straps',
    category: 'gear',
    barcode: '7891006',
    costPrice: 6,
    salePrice: 15,
    stock: 22,
    minStockAlert: 6,
    unit: 'Pair'
  },
  {
    id: 'prod-7',
    name: 'Gym Quick-Dry Microfiber Towel',
    category: 'gear',
    barcode: '7891007',
    costPrice: 4,
    salePrice: 10,
    stock: 15,
    minStockAlert: 5,
    unit: 'Piece'
  },
  {
    id: 'prod-8',
    name: 'Single Whey Shake (On-the-go)',
    category: 'drinks',
    barcode: '7891008',
    costPrice: 1.8,
    salePrice: 4.5,
    stock: 120,
    minStockAlert: 15,
    unit: 'Shaker'
  }
];

// Helper to calculate target ISO date
const getFutureDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const getPastDate = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

export const defaultMembers: Member[] = [
  {
    id: 'mem-101',
    name: 'Karim Mansouri',
    gender: 'male',
    phone: '+1 555-234-8891',
    email: 'karim.m@example.com',
    barcode: 'RFID-1001',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    planId: 'plan-month',
    planName: 'Monthly Standard',
    startDate: getPastDate(10),
    endDate: getFutureDate(20),
    status: 'active',
    balance: 0,
    joinedAt: getPastDate(70),
    lockerNumber: 4,
    notes: 'Prepares for half-marathon, prefers morning workouts'
  },
  {
    id: 'mem-102',
    name: 'Sarah Benali',
    gender: 'female',
    phone: '+1 555-442-1920',
    email: 'sarah.b@example.com',
    barcode: 'RFID-1002',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    planId: 'plan-annual',
    planName: 'Annual VIP All-Inclusive',
    startDate: getPastDate(60),
    endDate: getFutureDate(305),
    status: 'active',
    balance: 0,
    joinedAt: getPastDate(180),
    lockerNumber: 12,
    notes: 'VIP locker assigned, free shake allowance'
  },
  {
    id: 'mem-103',
    name: 'Alexander Novak',
    gender: 'male',
    phone: '+1 555-891-3411',
    email: 'alex.n@example.com',
    barcode: 'RFID-1003',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    planId: 'plan-quarter',
    planName: 'Quarterly Power (3 Months)',
    startDate: getPastDate(87),
    endDate: getFutureDate(3), // Expiring in 3 days!
    status: 'active',
    balance: 0,
    joinedAt: getPastDate(200),
    notes: 'Subscription expiring in 3 days. Send renewal reminder.'
  },
  {
    id: 'mem-104',
    name: 'Fatima Zahra',
    gender: 'female',
    phone: '+1 555-772-9012',
    email: 'fatima.z@example.com',
    barcode: 'RFID-1004',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    planId: 'plan-month',
    planName: 'Monthly Standard',
    startDate: getPastDate(45),
    endDate: getPastDate(15), // Expired 15 days ago
    status: 'expired',
    balance: 0,
    joinedAt: getPastDate(90),
    notes: 'Expired card. Requires renewal at counter.'
  },
  {
    id: 'mem-105',
    name: 'Youssef El Amrani',
    gender: 'male',
    phone: '+1 555-661-3990',
    email: 'youssef.e@example.com',
    barcode: 'RFID-1005',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    planId: 'plan-student',
    planName: 'Student Special',
    startDate: getPastDate(5),
    endDate: getFutureDate(25),
    status: 'active',
    balance: -15, // Has 15 debt
    joinedAt: getPastDate(30),
    notes: 'Owes $15 for locker deposit and supplement bar'
  },
  {
    id: 'mem-106',
    name: 'Elena Rostova',
    gender: 'female',
    phone: '+1 555-334-1188',
    email: 'elena.r@example.com',
    barcode: 'RFID-1006',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    planId: 'plan-semi',
    planName: 'Semi-Annual (6 Months)',
    startDate: getPastDate(30),
    endDate: getFutureDate(150),
    status: 'active',
    balance: 0,
    joinedAt: getPastDate(30),
    lockerNumber: 15
  }
];

export const defaultLockers: Locker[] = Array.from({ length: 24 }, (_, i) => {
  const num = i + 1;
  if (num === 4) {
    return { number: 4, status: 'occupied', memberId: 'mem-101', memberName: 'Karim Mansouri', assignedDate: getPastDate(10), depositAmount: 10 };
  }
  if (num === 12) {
    return { number: 12, status: 'occupied', memberId: 'mem-102', memberName: 'Sarah Benali', assignedDate: getPastDate(60), depositAmount: 10 };
  }
  if (num === 15) {
    return { number: 15, status: 'occupied', memberId: 'mem-106', memberName: 'Elena Rostova', assignedDate: getPastDate(30), depositAmount: 10 };
  }
  if (num === 7) {
    return { number: 7, status: 'maintenance' };
  }
  return { number: num, status: 'available' };
});

export const defaultAttendance: AttendanceRecord[] = [
  {
    id: 'att-1',
    memberId: 'mem-101',
    memberName: 'Karim Mansouri',
    barcode: 'RFID-1001',
    planName: 'Monthly Standard',
    checkInTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'granted'
  },
  {
    id: 'att-2',
    memberId: 'mem-102',
    memberName: 'Sarah Benali',
    barcode: 'RFID-1002',
    planName: 'Annual VIP All-Inclusive',
    checkInTime: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    status: 'granted'
  },
  {
    id: 'att-3',
    memberId: 'mem-105',
    memberName: 'Youssef El Amrani',
    barcode: 'RFID-1005',
    planName: 'Student Special',
    checkInTime: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    status: 'debt_warning',
    notes: 'Member owes $15'
  }
];

export const defaultCaisseSession: CaisseSession = {
  id: 'session-' + new Date().toISOString().slice(0, 10),
  openedAt: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
  openingFloat: 150,
  totalCashSales: 185,
  totalCardSales: 94,
  totalExpenses: 25,
  expectedCash: 310, // 150 + 185 - 25
  status: 'open'
};

export const defaultCaisseRecords: CaisseRecord[] = [
  {
    id: 'cr-1',
    type: 'opening',
    amount: 150,
    paymentMethod: 'cash',
    description: 'Initial Opening Float (Fond de Caisse)',
    timestamp: new Date(new Date().setHours(7, 0, 0, 0)).toISOString(),
    operator: 'Admin / Manager'
  },
  {
    id: 'cr-2',
    type: 'subscription',
    amount: 45,
    paymentMethod: 'cash',
    description: 'New Subscription: Karim Mansouri (Monthly Standard)',
    timestamp: new Date(new Date().setHours(8, 15, 0, 0)).toISOString(),
    operator: 'Front Desk'
  },
  {
    id: 'cr-3',
    type: 'sale',
    amount: 65,
    paymentMethod: 'cash',
    description: 'POS Sale: Gold Whey Protein 2kg',
    timestamp: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    operator: 'Front Desk'
  },
  {
    id: 'cr-4',
    type: 'expense',
    amount: -25,
    paymentMethod: 'cash',
    description: 'Gym Cleaning Supplies & Paper Towels refill',
    category: 'Maintenance',
    timestamp: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    operator: 'Admin'
  },
  {
    id: 'cr-5',
    type: 'subscription',
    amount: 75,
    paymentMethod: 'cash',
    description: 'Subscription Renewal (Cash payment)',
    timestamp: new Date(new Date().setHours(13, 20, 0, 0)).toISOString(),
    operator: 'Front Desk'
  }
];

// Reactive Database Class with IndexedDB and localStorage sync
class LocalDatabase {
  private db: IDBDatabase | null = null;
  private isReady = false;
  private listeners: Array<() => void> = [];

  // In-memory working copies for instant synchronous access
  public members: Member[] = [];
  public plans: SubscriptionPlan[] = [];
  public attendance: AttendanceRecord[] = [];
  public products: Product[] = [];
  public sales: Sale[] = [];
  public caisseRecords: CaisseRecord[] = [];
  public caisseSession: CaisseSession | null = null;
  public lockers: Locker[] = [];
  public settings: AppSettings = { ...defaultSettings };

  constructor() {
    this.init();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.persistSnapshot();
    this.listeners.forEach(fn => fn());
  }

  private init() {
    // 1. First load from LocalStorage snapshot for zero-latency instant display
    this.loadFromSnapshot();

    // 2. Open IndexedDB for high-volume structured storage
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        const stores = [
          'members',
          'plans',
          'attendance',
          'products',
          'sales',
          'caisseRecords',
          'caisseSession',
          'lockers',
          'settings'
        ];
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };

      request.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        this.isReady = true;
        this.loadFromIndexedDB();
      };

      request.onerror = (e) => {
        console.warn('IndexedDB unavailable, running on localStorage snapshot engine:', e);
        this.isReady = true;
      };
    } else {
      this.isReady = true;
    }
  }

  private loadFromSnapshot() {
    try {
      const saved = localStorage.getItem(STORAGE_BACKUP_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.members) this.members = parsed.members;
        if (parsed.plans) this.plans = parsed.plans;
        if (parsed.attendance) this.attendance = parsed.attendance;
        if (parsed.products) this.products = parsed.products;
        if (parsed.sales) this.sales = parsed.sales;
        if (parsed.caisseRecords) this.caisseRecords = parsed.caisseRecords;
        if (parsed.caisseSession) this.caisseSession = parsed.caisseSession;
        if (parsed.lockers) this.lockers = parsed.lockers;
        if (parsed.settings) this.settings = { ...defaultSettings, ...parsed.settings };
        return;
      }
    } catch (err) {
      console.error('Error loading localStorage snapshot:', err);
    }

    // Default Seed Data
    this.seedDemoDataSync();
  }

  public seedDemoDataSync() {
    this.members = [...defaultMembers];
    this.plans = [...defaultPlans];
    this.attendance = [...defaultAttendance];
    this.products = [...defaultProducts];
    this.sales = [];
    this.caisseRecords = [...defaultCaisseRecords];
    this.caisseSession = { ...defaultCaisseSession };
    this.lockers = [...defaultLockers];
    this.settings = { ...defaultSettings };
    this.persistSnapshot();
  }

  private persistSnapshot() {
    try {
      const snapshot: DatabaseBackup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {
          members: this.members,
          plans: this.plans,
          attendance: this.attendance,
          products: this.products,
          sales: this.sales,
          caisseRecords: this.caisseRecords,
          caisseSession: this.caisseSession,
          lockers: this.lockers,
          settings: this.settings
        }
      };
      localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(snapshot.data));

      // Also persist to IndexedDB asynchronously
      if (this.db) {
        this.writeToIndexedDB(snapshot.data);
      }
    } catch (err) {
      console.warn('Persistence error (storage limit reached?):', err);
    }
  }

  private writeToIndexedDB(data: DatabaseBackup['data']) {
    if (!this.db) return;
    try {
      const tx = this.db.transaction([
        'members', 'plans', 'attendance', 'products', 'sales', 'caisseRecords', 'lockers'
      ], 'readwrite');

      // Sync members
      const memberStore = tx.objectStore('members');
      data.members.forEach(m => memberStore.put(m));

      const prodStore = tx.objectStore('products');
      data.products.forEach(p => prodStore.put(p));

      const planStore = tx.objectStore('plans');
      data.plans.forEach(pl => planStore.put(pl));

      const attStore = tx.objectStore('attendance');
      data.attendance.slice(-100).forEach(a => attStore.put(a));
    } catch {
      // Non-fatal fallback
    }
  }

  private loadFromIndexedDB() {
    if (!this.db) return;
    // Data is already loaded from localStorage snapshot; IndexedDB acts as durable background backing
  }

  // --- MEMBER OPERATIONS ---
  public getMembers(): Member[] {
    // Auto-update statuses based on current date
    const today = new Date().toISOString().slice(0, 10);
    let hasChanged = false;

    this.members.forEach(m => {
      if (m.status !== 'suspended' && m.status !== 'pending') {
        const isExp = m.endDate < today;
        if (isExp && m.status !== 'expired') {
          m.status = 'expired';
          hasChanged = true;
        } else if (!isExp && m.status === 'expired') {
          m.status = 'active';
          hasChanged = true;
        }
      }
    });

    if (hasChanged) {
      this.persistSnapshot();
    }
    return [...this.members];
  }

  public getMemberById(id: string): Member | undefined {
    return this.members.find(m => m.id === id);
  }

  public getMemberByBarcode(barcode: string): Member | undefined {
    const clean = barcode.trim().toLowerCase();
    return this.members.find(m => 
      m.barcode.toLowerCase() === clean || 
      m.id.toLowerCase() === clean ||
      m.phone.replace(/\D/g, '') === clean.replace(/\D/g, '')
    );
  }

  public saveMember(member: Partial<Member> & { name: string; planId: string; barcode: string }): Member {
    const plan = this.plans.find(p => p.id === member.planId) || this.plans[0];
    const startDate = member.startDate || new Date().toISOString().slice(0, 10);
    
    // Compute endDate from plan duration
    const end = new Date(startDate);
    end.setDate(end.getDate() + (plan ? plan.durationDays : 30));
    const endDate = member.endDate || end.toISOString().slice(0, 10);

    const existingIdx = this.members.findIndex(m => m.id === member.id);

    if (existingIdx >= 0) {
      const updated: Member = {
        ...this.members[existingIdx],
        ...member,
        planName: plan ? plan.name : this.members[existingIdx].planName,
        endDate
      };
      this.members[existingIdx] = updated;
      this.notify();
      return updated;
    } else {
      const newMember: Member = {
        id: member.id || 'mem-' + Math.floor(1000 + Math.random() * 9000),
        name: member.name,
        gender: member.gender || 'male',
        phone: member.phone || '',
        email: member.email || '',
        nationalId: member.nationalId || '',
        emergencyContact: member.emergencyContact || '',
        barcode: member.barcode || 'RFID-' + Math.floor(1000 + Math.random() * 9000),
        photoUrl: member.photoUrl || (member.gender === 'female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'),
        planId: plan.id,
        planName: plan.name,
        startDate,
        endDate,
        status: 'active',
        balance: member.balance || 0,
        joinedAt: new Date().toISOString().slice(0, 10),
        notes: member.notes || '',
        lockerNumber: member.lockerNumber
      };

      this.members.unshift(newMember);

      // Record subscription income in Caisse
      if (plan && plan.price > 0) {
        this.addCaisseRecord({
          type: 'subscription',
          amount: plan.price,
          paymentMethod: 'cash',
          description: `Subscription: ${newMember.name} (${plan.name})`,
          operator: 'Reception'
        });
      }

      this.notify();
      return newMember;
    }
  }

  public deleteMember(id: string) {
    this.members = this.members.filter(m => m.id !== id);
    this.notify();
  }

  public renewMemberSubscription(memberId: string, planId: string, paymentMethod: 'cash' | 'card' = 'cash'): Member | null {
    const member = this.members.find(m => m.id === memberId);
    const plan = this.plans.find(p => p.id === planId);
    if (!member || !plan) return null;

    const today = new Date().toISOString().slice(0, 10);
    // If currently still active, extend from existing endDate; otherwise extend from today
    const baseDate = member.endDate > today ? new Date(member.endDate) : new Date();
    baseDate.setDate(baseDate.getDate() + plan.durationDays);

    member.planId = plan.id;
    member.planName = plan.name;
    member.startDate = today;
    member.endDate = baseDate.toISOString().slice(0, 10);
    member.status = 'active';

    // Record renewal payment
    this.addCaisseRecord({
      type: 'subscription',
      amount: plan.price,
      paymentMethod,
      description: `Renewal: ${member.name} (${plan.name} - ${plan.durationDays}d)`,
      operator: 'Reception'
    });

    this.notify();
    return member;
  }

  // --- CHECK-IN & ATTENDANCE ---
  public checkIn(barcodeOrSearch: string): {
    success: boolean;
    member?: Member;
    status: 'granted' | 'expired' | 'denied' | 'debt_warning';
    message: string;
    record?: AttendanceRecord;
  } {
    const member = this.getMemberByBarcode(barcodeOrSearch);

    if (!member) {
      return {
        success: false,
        status: 'denied',
        message: 'Member / RFID Card not found in local database.'
      };
    }

    const today = new Date().toISOString().slice(0, 10);
    const isExpired = member.endDate < today || member.status === 'expired';
    const hasDebt = member.balance < 0;

    let status: 'granted' | 'expired' | 'denied' | 'debt_warning' = 'granted';
    let message = 'Access Approved. Welcome back!';

    if (isExpired) {
      status = 'expired';
      message = `Subscription expired on ${member.endDate}. Please renew membership.`;
    } else if (hasDebt) {
      status = 'debt_warning';
      message = `Access approved with warning: Member owes ${this.settings.currency}${Math.abs(member.balance)}.`;
    }

    const record: AttendanceRecord = {
      id: 'att-' + Date.now(),
      memberId: member.id,
      memberName: member.name,
      barcode: member.barcode,
      planName: member.planName,
      checkInTime: new Date().toISOString(),
      status,
      notes: message
    };

    this.attendance.unshift(record);
    // Keep max 500 recent attendance records for performance
    if (this.attendance.length > 500) {
      this.attendance.pop();
    }

    this.notify();

    return {
      success: status === 'granted' || status === 'debt_warning',
      member,
      status,
      message,
      record
    };
  }

  // --- POS PRODUCTS & SALES ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public saveProduct(product: Partial<Product> & { name: string; salePrice: number; barcode: string }): Product {
    const existingIdx = this.products.findIndex(p => p.id === product.id);
    if (existingIdx >= 0) {
      const updated: Product = {
        ...this.products[existingIdx],
        ...product
      };
      this.products[existingIdx] = updated;
      this.notify();
      return updated;
    } else {
      const newProduct: Product = {
        id: product.id || 'prod-' + Date.now(),
        name: product.name,
        category: product.category || 'supplements',
        barcode: product.barcode,
        costPrice: product.costPrice || 0,
        salePrice: product.salePrice,
        stock: product.stock !== undefined ? product.stock : 10,
        minStockAlert: product.minStockAlert || 5,
        unit: product.unit || 'Piece'
      };
      this.products.unshift(newProduct);
      this.notify();
      return newProduct;
    }
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter(p => p.id !== id);
    this.notify();
  }

  public createSale(saleData: Omit<Sale, 'id' | 'receiptNumber' | 'timestamp'>): Sale {
    const receiptNumber = 'REC-' + (1000 + this.sales.length + 1);
    const sale: Sale = {
      ...saleData,
      id: 'sale-' + Date.now(),
      receiptNumber,
      timestamp: new Date().toISOString()
    };

    // Deduct inventory stock
    sale.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    this.sales.unshift(sale);

    // Register caisse record
    if (sale.paymentMethod === 'cash' || sale.paymentMethod === 'card') {
      this.addCaisseRecord({
        type: 'sale',
        amount: sale.total,
        paymentMethod: sale.paymentMethod,
        description: `POS Sale #${receiptNumber} (${sale.items.length} items)`,
        operator: sale.cashierName || 'Cashier'
      });
    } else if (sale.paymentMethod === 'debt' && sale.memberId) {
      // Add debt to member
      const mem = this.members.find(m => m.id === sale.memberId);
      if (mem) {
        mem.balance -= sale.total;
      }
    }

    this.notify();
    return sale;
  }

  // --- CAISSE & CASH REGISTER ---
  public openCaisse(openingFloat: number, notes?: string): CaisseSession {
    const session: CaisseSession = {
      id: 'session-' + Date.now(),
      openedAt: new Date().toISOString(),
      openingFloat,
      totalCashSales: 0,
      totalCardSales: 0,
      totalExpenses: 0,
      expectedCash: openingFloat,
      status: 'open',
      notes
    };

    this.caisseSession = session;
    this.addCaisseRecord({
      type: 'opening',
      amount: openingFloat,
      paymentMethod: 'cash',
      description: `Shift Opened with Float: ${this.settings.currency}${openingFloat}`,
      operator: 'Manager'
    });

    this.notify();
    return session;
  }

  public closeCaisse(countedCash: number, notes?: string): CaisseSession | null {
    if (!this.caisseSession) return null;

    const diff = countedCash - this.caisseSession.expectedCash;
    this.caisseSession.closedAt = new Date().toISOString();
    this.caisseSession.actualCashCounted = countedCash;
    this.caisseSession.difference = diff;
    this.caisseSession.status = 'closed';
    this.caisseSession.notes = notes;

    this.addCaisseRecord({
      type: 'closure',
      amount: 0,
      paymentMethod: 'cash',
      description: `Shift Closed. Counted: ${this.settings.currency}${countedCash} (Diff: ${diff >= 0 ? '+' : ''}${diff})`,
      operator: 'Manager'
    });

    const closedSession = { ...this.caisseSession };
    this.notify();
    return closedSession;
  }

  public addCaisseRecord(record: Omit<CaisseRecord, 'id' | 'timestamp'>) {
    const newRecord: CaisseRecord = {
      ...record,
      id: 'cr-' + Date.now(),
      timestamp: new Date().toISOString()
    };

    this.caisseRecords.unshift(newRecord);

    // Update active caisse session calculations
    if (this.caisseSession && this.caisseSession.status === 'open') {
      if (record.paymentMethod === 'cash') {
        if (record.type === 'sale' || record.type === 'subscription' || record.type === 'deposit') {
          this.caisseSession.totalCashSales += record.amount;
          this.caisseSession.expectedCash += record.amount;
        } else if (record.type === 'expense') {
          this.caisseSession.totalExpenses += Math.abs(record.amount);
          this.caisseSession.expectedCash += record.amount; // amount is negative
        }
      } else if (record.paymentMethod === 'card') {
        this.caisseSession.totalCardSales += record.amount;
      }
    }

    this.notify();
  }

  // --- LOCKERS ---
  public assignLocker(lockerNumber: number, memberId: string, memberName: string, depositAmount: number = 10) {
    const locker = this.lockers.find(l => l.number === lockerNumber);
    if (locker) {
      locker.status = 'occupied';
      locker.memberId = memberId;
      locker.memberName = memberName;
      locker.assignedDate = new Date().toISOString().slice(0, 10);
      locker.depositAmount = depositAmount;

      const mem = this.members.find(m => m.id === memberId);
      if (mem) {
        mem.lockerNumber = lockerNumber;
      }

      this.notify();
    }
  }

  public releaseLocker(lockerNumber: number) {
    const locker = this.lockers.find(l => l.number === lockerNumber);
    if (locker) {
      if (locker.memberId) {
        const mem = this.members.find(m => m.id === locker.memberId);
        if (mem && mem.lockerNumber === lockerNumber) {
          delete mem.lockerNumber;
        }
      }
      locker.status = 'available';
      delete locker.memberId;
      delete locker.memberName;
      delete locker.assignedDate;
      this.notify();
    }
  }

  // --- SETTINGS ---
  public updateSettings(newSettings: Partial<AppSettings>) {
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    this.notify();
  }

  // --- PLANS ---
  public savePlan(plan: SubscriptionPlan) {
    const idx = this.plans.findIndex(p => p.id === plan.id);
    if (idx >= 0) {
      this.plans[idx] = plan;
    } else {
      this.plans.push(plan);
    }
    this.notify();
  }

  public deletePlan(id: string) {
    this.plans = this.plans.filter(p => p.id !== id);
    this.notify();
  }

  // --- BACKUP & RESTORE ---
  public exportFullBackup(): DatabaseBackup {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      data: {
        members: this.members,
        plans: this.plans,
        attendance: this.attendance,
        products: this.products,
        sales: this.sales,
        caisseRecords: this.caisseRecords,
        caisseSession: this.caisseSession,
        lockers: this.lockers,
        settings: this.settings
      }
    };
  }

  public importFullBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed;
      if (!data.members && !data.plans && !data.products) {
        throw new Error('Invalid GymMaster backup format');
      }

      if (Array.isArray(data.members)) this.members = data.members;
      if (Array.isArray(data.plans)) this.plans = data.plans;
      if (Array.isArray(data.attendance)) this.attendance = data.attendance;
      if (Array.isArray(data.products)) this.products = data.products;
      if (Array.isArray(data.sales)) this.sales = data.sales;
      if (Array.isArray(data.caisseRecords)) this.caisseRecords = data.caisseRecords;
      if (data.caisseSession !== undefined) this.caisseSession = data.caisseSession;
      if (Array.isArray(data.lockers)) this.lockers = data.lockers;
      if (data.settings) this.settings = { ...defaultSettings, ...data.settings };

      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to import backup JSON:', err);
      return false;
    }
  }

  public wipeDatabase() {
    this.members = [];
    this.attendance = [];
    this.products = [];
    this.sales = [];
    this.caisseRecords = [];
    this.caisseSession = null;
    this.lockers = Array.from({ length: 24 }, (_, i) => ({ number: i + 1, status: 'available' }));
    this.notify();
  }
}

// Global database singleton
export const db = new LocalDatabase();
