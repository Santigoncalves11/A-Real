/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Wallet, 
  Package, 
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  X,
  Bell,
  Download,
  MoreVertical,
  Check,
  AlertTriangle,
  Info,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Tab, Transaction, InventoryItem, Employee, Notification } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: 1200, category: 'Ventas', date: '2026-04-10', note: 'Venta matutina', paymentMethod: 'Efectivo' },
  { id: '2', type: 'expense', amount: 450, category: 'Proveedores', date: '2026-04-11', note: 'Compra de tela', paymentMethod: 'Transferencia' },
  { id: '3', type: 'income', amount: 2100, category: 'Ventas', date: '2026-04-12', note: 'Pedido mayorista', paymentMethod: 'Efectivo' },
  { id: '4', type: 'expense', amount: 150, category: 'Servicios', date: '2026-04-13', note: 'Luz local', paymentMethod: 'Débito' },
  { id: '5', type: 'income', amount: 800, category: 'Ventas', date: '2026-04-14', note: 'Venta mostrador', paymentMethod: 'Efectivo' },
  { id: '6', type: 'income', amount: 3200, category: 'Ventas', date: '2026-04-15', note: 'Venta especial', paymentMethod: 'Transferencia' },
  { id: '7', type: 'expense', amount: 900, category: 'Alquiler', date: '2026-04-16', note: 'Mes de Abril', paymentMethod: 'Transferencia' },
  { id: '8', type: 'income', amount: 1500, category: 'Ventas', date: '2026-04-17', note: 'Cierre hoy', paymentMethod: 'Efectivo' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Tela de Algodón', category: 'Textil', quantity: 50, unit: 'm', minStock: 20, pricePerUnit: 15 },
  { id: '2', name: 'Hilos Negros', category: 'Insumos', quantity: 5, unit: 'un', minStock: 20, pricePerUnit: 2 },
  { id: '3', name: 'Botones Metálicos', category: 'Insumos', quantity: 150, unit: 'un', minStock: 50, pricePerUnit: 0.5 },
  { id: '4', name: 'Cremalleras 20cm', category: 'Insumos', quantity: 12, unit: 'un', minStock: 25, pricePerUnit: 1.2 },
  { id: '5', name: 'Cuero Sintético', category: 'Textil', quantity: 30, unit: 'm', minStock: 10, pricePerUnit: 45 },
];

const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Juan Perez', role: 'Vendedor', isPresent: true, lastAttendance: '08:00', email: 'juan@biz.com', phone: '+123456789' },
  { id: '2', name: 'Maria Lopez', role: 'Costurera', isPresent: false, email: 'maria@biz.com', phone: '+123456788' },
  { id: '3', name: 'Carlos Ruiz', role: 'Logística', isPresent: true, lastAttendance: '08:15', email: 'carlos@biz.com', phone: '+123456787' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // State with LocalStorage Initialization
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('bt_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('bt_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('bt_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bt_darkmode');
    return saved ? JSON.parse(saved) : false;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'transaction' | 'inventory' | 'employee'>('transaction');

  // Persistence Effects
  React.useEffect(() => {
    localStorage.setItem('bt_transactions', JSON.stringify(transactions));
  }, [transactions]);

  React.useEffect(() => {
    localStorage.setItem('bt_inventory', JSON.stringify(inventory));
  }, [inventory]);

  React.useEffect(() => {
    localStorage.setItem('bt_employees', JSON.stringify(employees));
  }, [employees]);

  React.useEffect(() => {
    localStorage.setItem('bt_darkmode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Rest of state...
  const [notifications] = useState<Notification[]>([
    { id: '1', message: 'Sistema sincronizado localmente', type: 'info', date: 'Ahora' },
    { id: '2', message: 'Stock de Hilos Negros por debajo del mínimo', type: 'warning', date: 'Hace 2h' },
  ]);

  const chartData = useMemo(() => {
    // Show last 7 unique days from transactions
    const dailyMap: Record<string, { income: number, expense: number }> = {};
    const today = new Date();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dailyMap[format(date, 'yyyy-MM-dd')] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      if (dailyMap[t.date]) {
        if (t.type === 'income') dailyMap[t.date].income += t.amount;
        else dailyMap[t.date].expense += t.amount;
      }
    });

    return Object.entries(dailyMap).map(([date, data]) => ({
      name: format(new Date(date + 'T12:00:00'), 'dd/MM'),
      ...data
    }));
  }, [transactions]);

  const handleAddData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = Math.random().toString(36).substr(2, 9);

    if (modalType === 'transaction') {
      const newTx: Transaction = {
        id,
        type: formData.get('type') as 'income' | 'expense',
        amount: Number(formData.get('amount')),
        category: formData.get('category') as string,
        date: formData.get('date') as string,
        note: formData.get('note') as string,
        paymentMethod: formData.get('method') as string,
      };
      setTransactions([...transactions, newTx]);
    } else if (modalType === 'inventory') {
      const newItem: InventoryItem = {
        id,
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        quantity: Number(formData.get('quantity')),
        unit: formData.get('unit') as string,
        minStock: Number(formData.get('minStock')),
        pricePerUnit: Number(formData.get('price')),
      };
      setInventory([...inventory, newItem]);
    } else if (modalType === 'employee') {
      const newEmp: Employee = {
        id,
        name: formData.get('name') as string,
        role: formData.get('role') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        isPresent: false,
      };
      setEmployees([...employees, newEmp]);
    }

    setIsModalOpen(false);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(tx => 
    tx.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tx.note.toLowerCase().includes(searchQuery.toLowerCase())
  ).reverse();

  const toggleAttendance = (id: string) => {
    setEmployees(prev => prev.map(e => 
      e.id === id ? { ...e, isPresent: !e.isPresent, lastAttendance: !e.isPresent ? format(new Date(), 'HH:mm') : undefined } : e
    ));
  };

  const exportData = () => {
    const data = { transactions, inventory, employees };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biztotal_respaldo_${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  const resetSystem = () => {
    if (window.confirm('¿Estás seguro de que deseas borrar TODOS los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen w-full bg-app-bg text-main overflow-hidden font-sans uppercase-none">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col shrink-0">
        <div className="p-8 pb-10">
          <div className="text-2xl font-black tracking-tighter flex items-center gap-2">
            BIZ<span className="text-accent">TOTAL</span>
          </div>
          <div className="flex items-center gap-2 mt-2 opacity-50">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Sistema Activo</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard />} label="Dashboard" />
          <SidebarItem active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet />} label="Finanzas" />
          <SidebarItem active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package />} label="Inventario" />
          <SidebarItem active={activeTab === 'personnel'} onClick={() => setActiveTab('personnel')} icon={<Users />} label="Personal" />
          <div className="h-px bg-white/5 my-4" />
          <SidebarItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<BarChart3 />} label="Reportes" />
          <SidebarItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings />} label="Ajustes" />
        </nav>

        <div className="p-8">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-2 font-mono">Plan Premium</p>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold">Cloud Sync</span>
              <div className="w-8 h-4 bg-accent rounded-full flex items-center px-1">
                <div className="w-2 h-2 bg-white rounded-full translate-x-4" />
              </div>
            </div>
          </div>
          <p className="text-[9px] mt-4 opacity-20 font-bold uppercase tracking-widest text-center">v2.0.0 - Geometric Balance</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-app-bg">
        {/* Top Header */}
        <header className="h-20 bg-card border-b border-border flex items-center justify-between px-10 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input 
                type="text" 
                placeholder="Buscar en el sistema..." 
                className="w-full h-10 bg-app-bg border border-border rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:border-accent transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-app-bg rounded-lg transition-colors group flex items-center justify-center"
              title={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-secondary group-hover:text-main" />}
            </button>
            <button className="relative p-2 hover:bg-app-bg rounded-lg transition-colors group">
              <Bell className="w-5 h-5 text-secondary group-hover:text-main" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger border-2 border-white rounded-full" />
            </button>
            <div className="h-10 w-px bg-border mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold leading-none">Admin Usuario</p>
                <p className="text-[10px] text-secondary font-bold uppercase mt-1 tracking-wider italic">Propietario</p>
              </div>
              <div className="w-10 h-10 bg-sidebar text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6">
                  <StatCard label="Balance Total" value={`$${balance.toLocaleString()}`} icon={<Wallet className="text-accent" />} trend="+12.5%" />
                  <StatCard label="Ingresos (Mes)" value={`$${totalIncome.toLocaleString()}`} icon={<TrendingUp className="text-success" />} trend="+8.2%" />
                  <StatCard label="Gastos (Mes)" value={`$${totalExpense.toLocaleString()}`} icon={<TrendingDown className="text-danger" />} trend="+2.4%" />
                  <StatCard label="Stock Crítico" value={inventory.filter(i => i.quantity < i.minStock).length.toString()} icon={<Package className="text-amber-500" />} subtitle="Reponer pronto" />
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-12 gap-8">
                  {/* Revenue Chart */}
                  <div className="col-span-8 bg-card p-8 border border-border rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h3 className="text-lg font-bold text-main">Flujo de Caja</h3>
                        <p className="text-sm text-secondary">Últimos 7 días de actividad</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-accent rounded-full" />
                          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Ingresos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-danger rounded-full opacity-30" />
                          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Gastos</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                          />
                          <Line type="monotone" dataKey="income" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="expense" stroke="var(--danger)" strokeWidth={2} strokeDasharray="5 5" opacity={0.3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Notifications / Alerts */}
                  <div className="col-span-4 space-y-6">
                    <div className="bg-card p-6 border border-border rounded-2xl shadow-sm">
                      <h3 className="text-base font-bold text-main mb-6">Notificaciones</h3>
                      <div className="space-y-4">
                        {notifications.map(n => (
                          <div key={n.id} className="flex gap-4 group">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                              n.type === 'warning' ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                            )}>
                              {n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold leading-tight line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-secondary font-bold uppercase mt-1 tracking-widest">{n.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-6 text-xs font-bold text-accent py-2 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors">Marcar todas como leídas</button>
                    </div>

                    <div className="bg-sidebar p-6 rounded-2xl text-white">
                      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        Staff Presente
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                          {employees.filter(e => e.isPresent).map((e, i) => (
                            <div key={e.id} className="w-8 h-8 rounded-full bg-accent border-2 border-sidebar flex items-center justify-center text-[10px] font-bold" style={{ zIndex: 10 - i }}>
                              {e.name[0]}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs font-bold opacity-60">
                          {employees.filter(e => e.isPresent).length} trabajadores en sitio
                        </span>
                      </div>
                      <button onClick={() => setActiveTab('personnel')} className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">Detalles del Personal</button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="bg-card p-8 border border-border rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold">Actividad Reciente</h3>
                      <button onClick={() => setActiveTab('finance')} className="text-xs font-bold text-accent">Ver Finanzas</button>
                    </div>
                    <div className="space-y-2">
                      {transactions.slice(0, 5).reverse().map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-app-bg rounded-xl transition-colors border border-transparent hover:border-border">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tx.type === 'income' ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-600")}>
                              {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-main">{tx.category}</p>
                              <p className="text-xs text-secondary">{tx.note}</p>
                            </div>
                          </div>
                          <p className={cn("text-sm font-bold", tx.type === 'income' ? "text-success" : "text-danger")}>
                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card p-8 border border-border rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold">Resumen de Inventario</h3>
                      <button onClick={() => setActiveTab('inventory')} className="text-xs font-bold text-accent">Ver Stock</button>
                    </div>
                    <div className="space-y-4">
                      {inventory.slice(0, 4).map(item => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-main">{item.name}</span>
                            <span className="text-secondary tracking-widest uppercase">{item.quantity} {item.unit} / {item.minStock * 2}</span>
                          </div>
                          <div className="h-2 w-full bg-app-bg rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((item.quantity / (item.minStock * 2)) * 100, 100)}%` }}
                              className={cn("h-full transition-colors", item.quantity < item.minStock ? "bg-danger" : "bg-accent")}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 p-4 bg-app-bg rounded-xl border border-secondary/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Valor total de stock: $4,250.00</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-secondary" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div key="finance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex justify-between items-center bg-card p-8 rounded-2xl border border-border">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold">Registro Contable</h2>
                      <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Filtros Activos</span>
                    </div>
                    <p className="text-secondary text-sm">Administre todos los movimientos de efectivo y bancos</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-app-bg border border-border text-xs font-bold rounded-xl hover:bg-border transition-all">
                      <Download className="w-4 h-4" /> Exportar CSV
                    </button>
                    <button onClick={() => { setModalType('transaction'); setIsModalOpen(true); }} className="flex items-center gap-2 px-8 py-3 bg-accent text-white text-xs font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-all">
                      <Plus className="w-4 h-4" /> Registrar Operación
                    </button>
                  </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-app-bg text-[10px] uppercase font-black tracking-[0.2em] text-secondary border-b border-border">
                        <th className="py-5 px-8">Categoría / Concepto</th>
                        <th className="py-5 px-8">Método</th>
                        <th className="py-5 px-8">Fecha</th>
                        <th className="py-5 px-8">Referencia / Nota</th>
                        <th className="py-5 px-8 text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredTransactions.map(tx => (
                        <tr key={tx.id} className="border-b border-app-bg hover:bg-app-bg transition-colors group">
                          <td className="py-5 px-8">
                            <div className="flex items-center gap-4">
                              <div className={cn("w-2 h-2 rounded-full", tx.type === 'income' ? "bg-success" : "bg-danger")} />
                              <span className="font-bold text-main">{tx.category}</span>
                            </div>
                          </td>
                          <td className="py-5 px-8">
                            <span className="text-[10px] font-black uppercase tracking-wider text-secondary bg-app-bg px-2 py-1 rounded-md border border-border">{tx.paymentMethod}</span>
                          </td>
                          <td className="py-5 px-8 text-secondary font-medium">{tx.date}</td>
                          <td className="py-5 px-8 italic text-secondary">{tx.note || '--'}</td>
                          <td className={cn("py-5 px-8 text-right font-black text-base tabular-nums", tx.type === 'income' ? "text-success" : "text-danger")}>
                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredTransactions.length === 0 && (
                    <div className="p-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-app-bg rounded-2xl flex items-center justify-center mx-auto">
                        <Search className="w-8 h-8 text-secondary/30" />
                      </div>
                      <p className="text-secondary font-bold text-sm uppercase tracking-widest">No se encontraron movimientos registrados</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div key="inventory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex justify-between items-center bg-card p-8 rounded-2xl border border-border">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold">Inventario de Materiales</h2>
                    <p className="text-secondary text-sm font-medium">Contabilice insumos y productos finales</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="p-3 bg-app-bg border border-border rounded-xl text-secondary hover:text-main transition-all">
                      <Filter className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setModalType('inventory'); setIsModalOpen(true); }} className="px-8 py-3 bg-main text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Añadir Insumo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  {filteredInventory.map(item => (
                    <div key={item.id} className="bg-card p-6 rounded-2xl border border-border group hover:border-accent/40 transition-all flex flex-col gap-5">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-accent bg-accent/5 px-2 py-0.5 rounded-md self-start">{item.category}</span>
                          <span className="text-lg font-black text-main leading-tight group-hover:text-accent transition-colors">{item.name}</span>
                        </div>
                        <MoreVertical className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                      </div>

                      <div className="flex justify-between items-end border-t border-app-bg pt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-tighter">Stock</span>
                          <span className={cn("text-2xl font-black", item.quantity < item.minStock ? "text-danger" : "text-main")}>{item.quantity}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-tighter">Unidad</span>
                          <span className="text-lg font-bold text-secondary italic lowercase">{item.unit}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-secondary">
                          <span>Nivel Crítico</span>
                          <span>{item.minStock} unidades</span>
                        </div>
                        <div className="h-1.5 w-full bg-app-bg rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-700", item.quantity < item.minStock ? "bg-danger" : "bg-accent")}
                            style={{ width: `${Math.min((item.quantity / (item.minStock * 2)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'personnel' && (
              <motion.div key="personnel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex justify-between items-center bg-card p-8 rounded-2xl border border-border shadow-sm">
                  <div>
                    <h2 className="text-2xl font-bold">Gestión de RRHH</h2>
                    <p className="text-secondary text-sm font-medium mt-1">Control de asistencia y datos del personal</p>
                  </div>
                  <button onClick={() => { setModalType('employee'); setIsModalOpen(true); }} className="px-8 py-3 bg-accent text-white text-xs font-bold rounded-xl shadow-lg shadow-accent/20">
                    Nuevo Colaborador
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  {employees.map(emp => (
                    <div key={emp.id} className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-xl transition-all">
                      <div className="p-8 pb-4 flex flex-col items-center text-center">
                        <div className={cn(
                          "w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-2xl shadow-inner transition-transform group-hover:rotate-12",
                          emp.isPresent ? "bg-accent text-white" : "bg-app-bg text-secondary"
                        )}>
                          {emp.name[0]} {emp.name.split(' ')[1]?.[0]}
                        </div>
                        <h3 className="text-lg font-black text-main mt-6">{emp.name}</h3>
                        <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em]">{emp.role}</p>
                      </div>

                      <div className="px-8 py-6 space-y-3">
                        <div className="flex items-center gap-3 text-xs text-secondary font-medium">
                          <Bell className="w-4 h-4" /> {emp.email}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-secondary font-medium">
                          <Info className="w-4 h-4" /> {emp.phone}
                        </div>
                      </div>

                      <div className="p-6 bg-app-bg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", emp.isPresent ? "bg-success scale-125 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-danger")} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{emp.isPresent ? 'Activo' : 'Ausente'}</span>
                        </div>
                        <button 
                          onClick={() => toggleAttendance(emp.id)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all",
                            emp.isPresent ? "bg-card text-danger border border-danger/20" : "bg-accent text-white"
                          )}
                        >
                          {emp.isPresent ? 'Check-Out' : 'Check-In'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
                <div className="grid grid-cols-12 gap-8">
                  <div className="col-span-12 bg-card p-10 border border-border rounded-2xl shadow-sm">
                    <h3 className="text-2xl font-black mb-10 flex items-center gap-4 border-b border-app-bg pb-6 uppercase tracking-tighter">
                      <BarChart3 className="text-accent" /> Análisis de Crecimiento
                    </h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 'bold', fill: '#64748B' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontWeight: 'bold', fill: '#64748B' }} />
                          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="income" radius={[4, 4, 0, 0]} fill="var(--accent)">
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'var(--accent)' : 'var(--accent)'} fillOpacity={0.8 + (index * 0.03)} />
                            ))}
                          </Bar>
                          <Bar dataKey="expense" radius={[4, 4, 0, 0]} fill="var(--danger)" fillOpacity={0.3} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div key="settings" className="max-w-4xl space-y-8">
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-8 border-b border-border bg-app-bg">
                    <h2 className="text-xl font-black">Ajustes del Sistema</h2>
                  </div>
                  <div className="p-8 space-y-10">
                    <section className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                        <div className="w-1 h-3 bg-accent" /> Perfil de Empresa
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-tighter text-secondary">Nombre del Negocio</label>
                          <input type="text" defaultValue="BizTotal Corp" className="w-full h-11 bg-app-bg border border-border rounded-lg px-4 text-sm font-bold autofill-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-tighter text-secondary">Moneda</label>
                          <select className="w-full h-11 bg-app-bg border border-border rounded-lg px-4 text-sm font-bold">
                            <option>Dólar Estadounidense (USD)</option>
                            <option>Peso Mexicano (MXN)</option>
                            <option>Euro (EUR)</option>
                          </select>
                        </div>
                      </div>
                    </section>
                    
                    <section className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                        <div className="w-1 h-3 bg-success" /> Seguridad y Datos
                      </h3>
                      <div className="flex items-center justify-between p-4 border border-border rounded-xl">
                        <div className="flex gap-4 items-center">
                          <div className="bg-success/10 p-3 rounded-lg text-success"><Check className="w-5 h-5" /></div>
                          <div>
                            <p className="text-sm font-black">Copias de Seguridad Automáticas</p>
                            <p className="text-xs text-secondary italic">Última hace 5 minutos</p>
                          </div>
                        </div>
                        <div className="w-10 h-5 bg-success rounded-full flex items-center px-1">
                          <div className="w-3 h-3 bg-white rounded-full translate-x-5" />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                        <div className="w-1 h-3 bg-danger" /> Acciones de Datos
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={exportData} className="flex items-center justify-center gap-2 py-3 bg-app-bg border border-border rounded-xl text-xs font-bold hover:bg-border transition-all">
                          <Download className="w-4 h-4" /> Exportar Respaldo
                        </button>
                        <button onClick={resetSystem} className="flex items-center justify-center gap-2 py-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-danger hover:bg-rose-100 transition-all">
                          <AlertTriangle className="w-4 h-4" /> Reiniciar Empresa
                        </button>
                      </div>
                    </section>

                    <button className="w-full py-4 bg-sidebar text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all">Guardar Cambios</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Action Button (Floating on Mobile/Compact) */}
        <button 
          onClick={() => { setModalType('transaction'); setIsModalOpen(true); }}
          className="absolute bottom-10 right-10 w-16 h-16 bg-accent text-white rounded-[2rem] shadow-2xl shadow-accent/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-90 z-20"
        >
          <Plus className="w-8 h-8" />
        </button>

        {/* Modal System */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-sidebar/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-10">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black capitalize tracking-tight">Nueva {modalType === 'transaction' ? 'Operación' : modalType === 'inventory' ? 'Insumo' : 'Colaborador'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-app-bg rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                  </div>

                  <form onSubmit={handleAddData} className="space-y-6">
                    {modalType === 'transaction' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Tipo</label>
                            <select name="type" className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold">
                              <option value="income">Ingreso (+)</option>
                              <option value="expense">Gasto (-)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Monto</label>
                            <input name="amount" type="number" step="0.01" required className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" placeholder="0.00" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-secondary">Categoría</label>
                          <input name="category" type="text" required placeholder="Ej: Ventas, Proveedores, Alquiler" className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Método</label>
                            <select name="method" className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold">
                              <option>Efectivo</option>
                              <option>Transferencia</option>
                              <option>Tarjeta</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Fecha</label>
                            <input type="date" className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" defaultValue={new Date().toISOString().split('T')[0]} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-secondary">Nota</label>
                          <textarea name="note" className="w-full h-24 bg-app-bg border border-border rounded-xl p-4 font-bold text-sm resize-none"></textarea>
                        </div>
                      </>
                    )}
                    {modalType === 'inventory' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-secondary">Nombre del Material</label>
                          <input name="name" type="text" required className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Categoría</label>
                            <input name="category" type="text" placeholder="Ej: Textil, Insumos" className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Unidad</label>
                            <input name="unit" type="text" placeholder="m, un, kg" className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Cant. Inicial</label>
                            <input name="quantity" type="number" required className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Mínimo</label>
                            <input name="minStock" type="number" required className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Precio Unit.</label>
                            <input name="price" type="number" step="0.01" required className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                          </div>
                        </div>
                      </>
                    )}
                    {modalType === 'employee' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-secondary">Nombre Completo</label>
                          <input name="name" type="text" required className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-secondary">Cargo / Rol</label>
                          <input name="role" type="text" required className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Email</label>
                            <input name="email" type="email" className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-secondary">Teléfono</label>
                            <input name="phone" type="tel" className="w-full h-12 bg-app-bg border border-border rounded-xl px-4 font-bold" />
                          </div>
                        </div>
                      </>
                    )}
                    <button type="submit" className="w-full py-4 bg-accent text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">Confirmar Registro</button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all relative group",
        active ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-white/40 hover:text-white"
      )}
    >
      <div className={cn("transition-colors", active ? "text-white" : "group-hover:text-white")}>{icon}</div>
      <span className="tracking-tight">{label}</span>
      {active && (
        <motion.div layoutId="nav-bg" className="absolute left-[-4px] w-1 h-6 bg-white rounded-full" />
      )}
    </button>
  );
}

function StatCard({ label, value, icon, trend, subtitle }: { label: string, value: string, icon: React.ReactNode, trend?: string, subtitle?: string }) {
  return (
    <div className="bg-card p-6 border border-border rounded-[2rem] shadow-sm flex flex-col gap-4 group hover:border-accent/20 transition-all">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-2xl bg-app-bg flex items-center justify-center text-main group-hover:bg-accent/5 group-hover:text-accent transition-colors">
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
            trend.startsWith('+') ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] uppercase font-black tracking-widest text-secondary">{label}</p>
        <p className="text-2xl font-black text-main mt-1 tabular-nums">{value}</p>
        {subtitle && <p className="text-[10px] text-secondary font-bold uppercase mt-1 tracking-wider italic">{subtitle}</p>}
      </div>
    </div>
  );
}
