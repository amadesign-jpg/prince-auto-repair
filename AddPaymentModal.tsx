import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { fmtMoney, calcBalance, calcInvoiceTotal } from '../utils/format';
import { Modal, Field, Input, Select, Textarea, Btn } from '../components/UI';
import type { Invoice } from '../types';

interface Props { invoice: Invoice; onClose: () => void; }

export default function AddPaymentModal({ invoice, onClose }: Props) {
  const { addPayment, toast } = useApp();
  const total = calcInvoiceTotal(invoice);
  const remaining = calcBalance(invoice, invoice.payments);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    method: 'Card' as const,
    referenceNumber: '',
    amount: '',
    note: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = () => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) { toast('Enter a valid payment amount.', 'error'); return; }
    if (amt > remaining + 0.005) { toast(`Amount exceeds remaining balance of ${fmtMoney(remaining)}.`, 'error'); return; }

    addPayment(invoice.id, {
      id: `PAY-${Date.now()}`,
      date: form.date,
      method: form.method,
      referenceNumber: form.referenceNumber || undefined,
      amount: amt,
      note: form.note || undefined,
      by: 'Lucy',
    });

    const newBalance = remaining - amt;
    if (newBalance <= 0.005) toast(`Invoice fully paid. Status updated to Paid.`, 'success');
    else toast(`Payment of ${fmtMoney(amt)} recorded. Remaining: ${fmtMoney(newBalance)}`, 'success');
    onClose();
  };

  return (
    <Modal title={`Add Payment — ${invoice.id}`} onClose={onClose}>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-amber-700">Invoice Total</span>
          <span className="font-semibold">{fmtMoney(total)}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-amber-700">Remaining Balance</span>
          <span className="font-bold text-amber-800">{fmtMoney(remaining)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Field label="Payment Date">
          <Input type="date" value={form.date} onChange={set('date')} />
        </Field>
        <Field label="Payment Method">
          <Select value={form.method} onChange={set('method') as any}>
            {(['Cash', 'Card', 'Check', 'Bank Transfer', 'Other'] as const).map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </Field>
        <Field label="Reference # (Check #, Transaction ID, etc.)">
          <Input value={form.referenceNumber} onChange={set('referenceNumber')} placeholder="Optional" />
        </Field>
        <Field label={`Amount (max ${fmtMoney(remaining)})`}>
          <Input
            type="number" min={0.01} max={remaining} step="0.01"
            value={form.amount} onChange={set('amount')}
            placeholder={`Max: ${fmtMoney(remaining)}`}
          />
        </Field>
        <Field label="Notes (optional)">
          <Textarea value={form.note} onChange={set('note')} rows={2} placeholder="Any additional notes" />
        </Field>
      </div>

      <div className="flex gap-2 mt-5">
        <Btn variant="success" className="flex-1" onClick={handleSubmit}>Record Payment</Btn>
        <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}
