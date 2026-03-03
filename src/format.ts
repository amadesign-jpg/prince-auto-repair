export const fmtMoney = (n: number) =>
  `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

export const fmtDate = (d?: string) =>
  d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const fmtDateShort = (d?: string) =>
  d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : '—';

export const calcSubtotal = (items: { qty: number; unit: number }[]) =>
  items.reduce((s, i) => s + i.qty * i.unit, 0);

export const calcTax = (sub: number) => sub * 0.07;

export const calcInvoiceSubtotal = (inv: { lineItems: { qty: number; unit: number }[]; shopSupplies: number; hazmat: number }) => {
  const itemsSub = calcSubtotal(inv.lineItems);
  return itemsSub + inv.shopSupplies + inv.hazmat;
};

export const calcInvoiceTotal = (inv: { lineItems: { qty: number; unit: number }[]; shopSupplies: number; hazmat: number }) => {
  const sub = calcInvoiceSubtotal(inv);
  return sub + calcTax(sub);
};

export const calcPaid = (payments: { amount: number }[]) =>
  payments.reduce((s, p) => s + p.amount, 0);

export const calcBalance = (inv: { lineItems: { qty: number; unit: number }[]; shopSupplies: number; hazmat: number }, payments: { amount: number }[]) =>
  Math.max(0, calcInvoiceTotal(inv) - calcPaid(payments));

export const calcLaborTotal = (items: { type: string; qty: number; unit: number }[]) =>
  items.filter(i => i.type === 'Labor').reduce((s, i) => s + i.qty * i.unit, 0);

export const calcPartsTotal = (items: { type: string; qty: number; unit: number }[]) =>
  items.filter(i => i.type === 'Part').reduce((s, i) => s + i.qty * i.unit, 0);

export const vehicleStr = (v?: { year: number; make: string; model: string }) =>
  v ? `${v.year} ${v.make} ${v.model}` : '—';

export const statusColor = (s: string) => {
  const m: Record<string, string> = {
    'Draft': 'bg-gray-100 text-gray-600',
    'Sent': 'bg-blue-100 text-blue-700',
    'Unpaid': 'bg-amber-100 text-amber-700',
    'Partially Paid': 'bg-orange-100 text-orange-700',
    'Paid': 'bg-green-100 text-green-700',
    'Overdue': 'bg-red-100 text-red-700',
    'Approved': 'bg-green-100 text-green-700',
    'Pending': 'bg-amber-100 text-amber-700',
    'Converted': 'bg-purple-100 text-purple-700',
    'Rejected': 'bg-red-100 text-red-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Waiting for Parts': 'bg-orange-100 text-orange-700',
    'Open': 'bg-sky-100 text-sky-700',
    'Cancelled': 'bg-gray-100 text-gray-500',
  };
  return m[s] || 'bg-gray-100 text-gray-600';
};
