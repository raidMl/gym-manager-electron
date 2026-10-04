export type Gender = 'male' | 'female';
export type MemberStatus = 'active' | 'expired' | 'pending' | 'suspended';
export type Language = 'en' | 'fr' | 'ar';
export type Theme = 'dark' | 'light';

export interface Member {
  id: string;
  name: string;
  gender: Gender;
  phone: string;
  email?: string;
  nationalId?: string;
  emergencyContact?: string;
  barcode: string; // RFID Tag or printed barcode
  photoUrl: string;
  planId: string;
  planName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: MemberStatus;
  balance: number; // 0 = settled, < 0 is debt owed, > 0 is credit
  joinedAt: string;
  notes?: string;
  lockerNumber?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  durationDays: number;
  price: number;
  description: string;
  features: string[];
  category: 'standard' | 'vip' | 'student' | 'classes' | 'daypass';
  badgeColor: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  barcode: string;
  planName: string;
  checkInTime: string;
  status: 'granted' | 'expired' | 'denied' | 'debt_warning';
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'gear' | 'services';
  barcode: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  image?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  receiptNumber: string;
  timestamp: string;
  memberId?: string;
  memberName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'debt' | 'mixed';
  cashReceived?: number;
  changeGiven?: number;
  cashierName: string;
}

export interface CaisseRecord {
  id: string;
  type: 'opening' | 'sale' | 'subscription' | 'expense' | 'deposit' | 'closure';
  amount: number; // positive for income, negative for expense
  paymentMethod: 'cash' | 'card';
  description: string;
  category?: string;
  timestamp: string;
  operator: string;
}

export interface CaisseSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  totalCashSales: number;
  totalCardSales: number;
  totalExpenses: number;
  expectedCash: number;
  actualCashCounted?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export interface Locker {
  number: number;
  status: 'available' | 'occupied' | 'maintenance';
  memberId?: string;
  memberName?: string;
  assignedDate?: string;
  depositAmount?: number;
}

export interface AppSettings {
  gymName: string;
  address: string;
  phone: string;
  currency: string;
  taxRate: number;
  language: Language;
  theme: Theme;
  receiptFooter: string;
  autoBackup: boolean;
  soundAlerts: boolean;
  scannerAutoSubmit: boolean;
  gateSimulationMode: boolean;
}

export interface DatabaseBackup {
  version: string;
  timestamp: string;
  data: {
    members: Member[];
    plans: SubscriptionPlan[];
    attendance: AttendanceRecord[];
    products: Product[];
    sales: Sale[];
    caisseRecords: CaisseRecord[];
    caisseSession: CaisseSession | null;
    lockers: Locker[];
    settings: AppSettings;
  };
}
