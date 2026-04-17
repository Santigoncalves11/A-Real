export type Tab = 'dashboard' | 'finance' | 'inventory' | 'personnel' | 'reports' | 'settings';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note: string;
  paymentMethod: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  pricePerUnit: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  isPresent: boolean;
  lastAttendance?: string;
  email: string;
  phone: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: string;
}
