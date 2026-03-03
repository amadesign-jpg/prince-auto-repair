import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { Client, WorkOrder, Estimate, Invoice, Payment, LineItem, ActivityEntry, AppToast } from '../types';

// ── Sample Data ──────────────────────────────────────────────────────────────
const CLIENTS: Client[] = [
  {
    id: 'C001', name: 'Marcus Thompson', email: 'marcus.t@email.com',
    phone: '(305) 555-0142', address: '123 NW 45th Ave', city: 'Pembroke Pines', state: 'FL', zip: '33025',
    vehicle: { id: 'V001', year: 2019, make: 'Ford', model: 'F-150', vin: '1FTFW1ET5KFA12345', engine: '5.0L V8', tireSize: 'LT275/65R18', prodDate: '2018-11-15', mileageIn: 78400, mileageOut: 78412, color: 'Agate Black', serviceTag: '0312' },
    mileageHistory: [{ date: '2024-11-10', prev: 72300, next: 78400, by: 'Lucy' }],
    notes: 'Prefers morning appointments. Fleet account.', authContact: 'Fleet Manager Bob', authPhone: '(305) 555-0143',
  },
  {
    id: 'C002', name: 'Sandra Rivera', email: 'srivera@gmail.com',
    phone: '(786) 555-0233', address: '456 SW 12th St', city: 'Pembroke Pines', state: 'FL', zip: '33025',
    vehicle: { id: 'V002', year: 2021, make: 'Toyota', model: 'Camry', vin: '4T1BZ1HK5MU040001', engine: '2.5L I4', tireSize: '235/45R18', prodDate: '2020-09-22', mileageIn: 34120, mileageOut: 34135, color: 'Midnight Black', serviceTag: '0318' },
    mileageHistory: [{ date: '2025-01-08', prev: 29800, next: 34120, by: 'Lucy' }],
    notes: 'Extended warranty active until 2026.',
  },
  {
    id: 'C003', name: 'Devon Okafor', email: 'devon.ok@workmail.com',
    phone: '(954) 555-0388', address: '789 E Hallandale Beach Blvd', city: 'Pembroke Pines', state: 'FL', zip: '33025',
    vehicle: { id: 'V003', year: 2017, make: 'BMW', model: '5 Series', vin: 'WBA5A5C5XHD123456', engine: '3.0L I6', tireSize: '245/40R18', prodDate: '2017-03-01', mileageIn: 91500, mileageOut: 91520, color: 'Alpine White', serviceTag: '0325' },
    mileageHistory: [{ date: '2025-02-14', prev: 88200, next: 91500, by: 'Lucy' }],
    notes: 'Uses synthetic oil only. BMW dealer reject — prefers us.',
  },
  {
    id: 'C004', name: 'Priya Nair', email: 'priya.nair@studio.com',
    phone: '(305) 555-0477', address: '22 Palm Ridge Blvd', city: 'Pembroke Pines', state: 'FL', zip: '33026',
    vehicle: { id: 'V004', year: 2022, make: 'Honda', model: 'CR-V', vin: '2HKRW2H85NH500001', engine: '1.5L Turbo I4', tireSize: '235/60R18', prodDate: '2022-01-10', mileageIn: 22300, mileageOut: 22310, color: 'Sonic Gray Pearl', serviceTag: '0330' },
    mileageHistory: [{ date: '2025-02-20', prev: 19800, next: 22300, by: 'Lucy' }],
    notes: 'New client. Referred by Marcus Thompson.',
  },
];

const WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-2025-001', clientId: 'C001', date: '2025-02-18', status: 'In Progress', description: 'Engine misfire diagnostic + tune-up', tasks: [{ id: 1, text: 'OBD-II scan', done: true }, { id: 2, text: 'Replace spark plugs', done: true }, { id: 3, text: 'Check ignition coils', done: false }, { id: 4, text: 'Road test', done: false }], labor: [{ desc: 'Diagnostic', hours: 1.5, rate: 125 }, { desc: 'Tune-up labor', hours: 2.0, rate: 125 }], notes: 'Customer reports rough idle at cold start.', serviceWriter: 'Lucy', technician: 'John' },
  { id: 'WO-2025-002', clientId: 'C002', date: '2025-02-22', status: 'Completed', description: 'Full brake service — front and rear', tasks: [{ id: 1, text: 'Inspect rotors', done: true }, { id: 2, text: 'Replace front pads', done: true }, { id: 3, text: 'Replace rear pads', done: true }, { id: 4, text: 'Bleed brake fluid', done: true }], labor: [{ desc: 'Brake service', hours: 3.0, rate: 125 }], notes: 'OEM pads used per customer request.', serviceWriter: 'Lucy', technician: 'Mike' },
  { id: 'WO-2025-003', clientId: 'C003', date: '2025-02-25', status: 'Waiting for Parts', description: 'Oil leak — valve cover gasket', tasks: [{ id: 1, text: 'Remove valve cover', done: true }, { id: 2, text: 'Replace gasket', done: false }, { id: 3, text: 'Torque to spec', done: false }], labor: [{ desc: 'Valve cover gasket R&R', hours: 2.5, rate: 140 }], notes: 'BMW OEM gasket on order. ETA 2 days.', serviceWriter: 'Lucy', technician: 'John' },
];

const ESTIMATES: Estimate[] = [
  { id: 'EST-2025-001', clientId: 'C001', date: '2025-02-17', status: 'Approved', validUntil: '2025-03-17', lineItems: [{ type: 'Labor', desc: 'OBD-II Diagnostic', qty: 1.5, unit: 125 }, { type: 'Part', desc: 'Spark Plugs (8)', partNumber: 'SP-12345', qty: 8, unit: 28 }, { type: 'Labor', desc: 'Engine Tune-up', qty: 2.0, unit: 125 }], notes: 'Approved verbally on 2/18.', convertedToInvoice: 'INV-2025-001' },
  { id: 'EST-2025-002', clientId: 'C004', date: '2025-02-28', status: 'Pending', validUntil: '2025-03-28', lineItems: [{ type: 'Labor', desc: '30k Mile Service', qty: 2.0, unit: 125 }, { type: 'Part', desc: 'Cabin Air Filter', partNumber: 'CAF-0044', qty: 1, unit: 45 }, { type: 'Fee', desc: 'Tire Rotation', qty: 1, unit: 35 }], notes: 'Awaiting customer approval.' },
];

const INVOICES: Invoice[] = [
  {
    id: 'INV-2025-001', clientId: 'C001', workOrderId: 'WO-2025-001',
    date: '2025-02-18', dueDate: '2025-03-04',
    status: 'Partially Paid', serviceWriter: 'Lucy', technician: 'John',
    shopSupplies: 12.50, hazmat: 3.50,
    lineItems: [
      { type: 'Labor', desc: 'OBD-II Diagnostic', qty: 1.5, unit: 125 },
      { type: 'Labor', desc: 'Engine Tune-up Labor', qty: 2.0, unit: 125 },
      { type: 'Part', desc: 'Spark Plugs (8x)', partNumber: 'NGK-7090', qty: 8, unit: 28 },
      { type: 'Part', desc: 'Air Filter', partNumber: 'AF-5501', qty: 1, unit: 24.99 },
    ],
    notes: 'Customer to return for ignition coil replacement.',
    payments: [{ id: 'PAY-001', date: '2025-02-18', method: 'Card', amount: 250.00, note: 'Deposit', by: 'Lucy' }],
  },
  {
    id: 'INV-2025-002', clientId: 'C002', workOrderId: 'WO-2025-002',
    date: '2025-02-22', dueDate: '2025-03-08', closedDate: '2025-02-22',
    status: 'Paid', serviceWriter: 'Lucy', technician: 'Mike',
    shopSupplies: 18.00, hazmat: 3.50,
    lineItems: [
      { type: 'Part', desc: 'Front Brake Pads OEM', partNumber: 'BP-F221', qty: 1, unit: 185 },
      { type: 'Part', desc: 'Rear Brake Pads OEM', partNumber: 'BP-R221', qty: 1, unit: 165 },
      { type: 'Labor', desc: 'Full Brake Service', qty: 3.0, unit: 125 },
    ],
    notes: 'Warranty: 12 months / 12,000 miles on parts and labor.',
    payments: [{ id: 'PAY-002', date: '2025-02-22', method: 'Check', referenceNumber: '4421', amount: 725.00, note: 'Check #4421', by: 'Lucy' }],
  },
  {
    id: 'INV-2025-003', clientId: 'C003', workOrderId: 'WO-2025-003',
    date: '2025-02-25', dueDate: '2025-03-11',
    status: 'Unpaid', serviceWriter: 'Lucy', technician: 'John',
    shopSupplies: 9.99, hazmat: 3.50,
    lineItems: [
      { type: 'Part', desc: 'Valve Cover Gasket BMW OEM', partNumber: '11120030925', qty: 1, unit: 220 },
      { type: 'Labor', desc: 'Valve Cover R&R', qty: 2.5, unit: 140 },
    ],
    notes: 'Parts on order. Invoice issued pending repair completion.',
    payments: [],
  },
];

const ACTIVITY: ActivityEntry[] = [
  { id: 'A001', type: 'Invoice', refId: 'INV-2025-003', clientId: 'C003', desc: 'Devon Okafor — Valve Cover Gasket', status: 'Unpaid', date: '2025-02-25' },
  { id: 'A002', type: 'WorkOrder', refId: 'WO-2025-003', clientId: 'C003', desc: 'BMW 5 Series — Oil Leak Repair', status: 'Waiting for Parts', date: '2025-02-25' },
  { id: 'A003', type: 'Invoice', refId: 'INV-2025-002', clientId: 'C002', desc: 'Sandra Rivera — Brake Service', status: 'Paid', date: '2025-02-22' },
  { id: 'A004', type: 'WorkOrder', refId: 'WO-2025-001', clientId: 'C001', desc: 'Ford F-150 — Engine Tune-up', status: 'In Progress', date: '2025-02-18' },
  { id: 'A005', type: 'Invoice', refId: 'INV-2025-001', clientId: 'C001', desc: 'Marcus Thompson — Partial Payment $250', status: 'Partially Paid', date: '2025-02-18' },
];

// ── State & Actions ───────────────────────────────────────────────────────────
interface AppState {
  clients: Client[];
  workOrders: WorkOrder[];
  estimates: Estimate[];
  invoices: Invoice[];
  activity: ActivityEntry[];
  toasts: AppToast[];
}

type Action =
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'UPDATE_MILEAGE'; payload: { clientId: string; mileage: number } }
  | { type: 'ADD_WORK_ORDER'; payload: WorkOrder }
  | { type: 'UPDATE_WORK_ORDER'; payload: WorkOrder }
  | { type: 'ADD_ESTIMATE'; payload: Estimate }
  | { type: 'UPDATE_ESTIMATE'; payload: Estimate }
  | { type: 'ADD_INVOICE'; payload: Invoice }
  | { type: 'UPDATE_INVOICE'; payload: Invoice }
  | { type: 'ADD_PAYMENT'; payload: { invoiceId: string; payment: Payment } }
  | { type: 'ADD_ACTIVITY'; payload: ActivityEntry }
  | { type: 'ADD_TOAST'; payload: AppToast }
  | { type: 'REMOVE_TOAST'; payload: number };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'UPDATE_CLIENT':
      return { ...state, clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'UPDATE_MILEAGE': {
      const { clientId, mileage } = action.payload;
      return {
        ...state, clients: state.clients.map(c => {
          if (c.id !== clientId) return c;
          const record = { date: new Date().toISOString().slice(0, 10), prev: c.vehicle.mileageIn, next: mileage, by: 'Lucy' };
          return { ...c, vehicle: { ...c.vehicle, mileageIn: mileage }, mileageHistory: [...c.mileageHistory, record] };
        })
      };
    }
    case 'ADD_WORK_ORDER':
      return { ...state, workOrders: [action.payload, ...state.workOrders] };
    case 'UPDATE_WORK_ORDER':
      return { ...state, workOrders: state.workOrders.map(w => w.id === action.payload.id ? action.payload : w) };
    case 'ADD_ESTIMATE':
      return { ...state, estimates: [action.payload, ...state.estimates] };
    case 'UPDATE_ESTIMATE':
      return { ...state, estimates: state.estimates.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'ADD_INVOICE':
      return { ...state, invoices: [action.payload, ...state.invoices] };
    case 'UPDATE_INVOICE':
      return { ...state, invoices: state.invoices.map(i => i.id === action.payload.id ? action.payload : i) };
    // PARTIAL PAYMENT LOGIC: calculate new status automatically
    case 'ADD_PAYMENT': {
      const { invoiceId, payment } = action.payload;
      return {
        ...state, invoices: state.invoices.map(inv => {
          if (inv.id !== invoiceId) return inv;
          const newPayments = [...inv.payments, payment];
          const totalPaid = newPayments.reduce((s, p) => s + p.amount, 0);
          const sub = inv.lineItems.reduce((s, i) => s + i.qty * i.unit, 0) + inv.shopSupplies + inv.hazmat;
          const total = sub * 1.07;
          const balance = total - totalPaid;
          const newStatus: Invoice['status'] = balance <= 0.005 ? 'Paid' : 'Partially Paid';
          return { ...inv, payments: newPayments, status: newStatus };
        })
      };
    }
    case 'ADD_ACTIVITY':
      return { ...state, activity: [action.payload, ...state.activity] };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AppContextValue extends AppState {
  addClient: (c: Client) => void;
  updateClient: (c: Client) => void;
  updateMileage: (clientId: string, mileage: number) => void;
  addWorkOrder: (w: WorkOrder) => void;
  updateWorkOrder: (w: WorkOrder) => void;
  addEstimate: (e: Estimate) => void;
  updateEstimate: (e: Estimate) => void;
  addInvoice: (i: Invoice) => void;
  updateInvoice: (i: Invoice) => void;
  addPayment: (invoiceId: string, payment: Payment) => void;
  addActivity: (a: ActivityEntry) => void;
  toast: (msg: string, type?: AppToast['type']) => void;
  getClient: (id: string) => Client | undefined;
  getInvoice: (id: string) => Invoice | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    clients: CLIENTS, workOrders: WORK_ORDERS,
    estimates: ESTIMATES, invoices: INVOICES,
    activity: ACTIVITY, toasts: [],
  });

  const toast = useCallback((message: string, type: AppToast['type'] = 'success') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3500);
  }, []);

  const value: AppContextValue = {
    ...state,
    addClient: (c) => dispatch({ type: 'ADD_CLIENT', payload: c }),
    updateClient: (c) => dispatch({ type: 'UPDATE_CLIENT', payload: c }),
    updateMileage: (clientId, mileage) => dispatch({ type: 'UPDATE_MILEAGE', payload: { clientId, mileage } }),
    addWorkOrder: (w) => dispatch({ type: 'ADD_WORK_ORDER', payload: w }),
    updateWorkOrder: (w) => dispatch({ type: 'UPDATE_WORK_ORDER', payload: w }),
    addEstimate: (e) => dispatch({ type: 'ADD_ESTIMATE', payload: e }),
    updateEstimate: (e) => dispatch({ type: 'UPDATE_ESTIMATE', payload: e }),
    addInvoice: (i) => dispatch({ type: 'ADD_INVOICE', payload: i }),
    updateInvoice: (i) => dispatch({ type: 'UPDATE_INVOICE', payload: i }),
    addPayment: (invoiceId, payment) => {
      dispatch({ type: 'ADD_PAYMENT', payload: { invoiceId, payment } });
      dispatch({ type: 'ADD_ACTIVITY', payload: { id: `A-${Date.now()}`, type: 'Payment', refId: invoiceId, desc: `Payment of $${payment.amount.toFixed(2)} via ${payment.method}`, status: 'Recorded', date: payment.date } });
    },
    addActivity: (a) => dispatch({ type: 'ADD_ACTIVITY', payload: a }),
    toast,
    getClient: (id) => state.clients.find(c => c.id === id),
    getInvoice: (id) => state.invoices.find(i => i.id === id),
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
