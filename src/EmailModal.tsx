import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { fmtMoney, fmtDate, calcInvoiceTotal, calcPaid, calcBalance, vehicleStr } from '../utils/format';
import { Modal, Field, Input, Textarea, Btn } from '../components/UI';
import type { Invoice } from '../types';

interface Props { invoice: Invoice; onClose: () => void; }

export default function EmailModal({ invoice, onClose }: Props) {
  const { clients, addActivity, toast } = useApp();
  const client = clients.find(c => c.id === invoice.clientId);
  const total = calcInvoiceTotal(invoice);
  const paid = calcPaid(invoice.payments);
  const balance = calcBalance(invoice, invoice.payments);
  const firstName = client?.name.split(' ')[0] || 'Customer';

  const defaultSubject = balance > 0
    ? `Invoice ${invoice.id} — ${fmtMoney(balance)} Balance Due`
    : `Invoice ${invoice.id} — Paid in Full`;

  const defaultBody = `Hi ${firstName},

Please find your invoice details below for ${vehicleStr(client?.vehicle)} service at Prince Auto Repair.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Invoice #: ${invoice.id}
Date: ${fmtDate(invoice.date)}
${invoice.dueDate ? `Due Date: ${fmtDate(invoice.dueDate)}\n` : ''}
Invoice Total: ${fmtMoney(total)}
Amount Paid: ${fmtMoney(paid)}
${balance > 0 ? `⚠️  Balance Due: ${fmtMoney(balance)}` : '✅  Paid in Full'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${balance > 0 ? 'Please remit payment at your earliest convenience. We accept cash, check, and all major credit cards.\n\n' : ''}Thank you for choosing Prince Auto Repair!

Best regards,
Lucy — Service Advisor
Prince Auto Repair
54 SW 9th Street · Deerfield Beach, FL 33441
(954) 421-7117 | service@princeautorepairs.com`;

  const [to, setTo] = useState(client?.email || '');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);

  const handleSend = () => {
    addActivity({
      id: `A-${Date.now()}`,
      type: 'Invoice',
      refId: invoice.id,
      clientId: invoice.clientId,
      desc: `Invoice ${invoice.id} emailed to ${to}`,
      status: 'Sent',
      date: new Date().toISOString().slice(0, 10),
    });
    toast(`Invoice emailed to ${to}`, 'success');
    onClose();
  };

  return (
    <Modal title={`Email Invoice — ${invoice.id}`} onClose={onClose} wide>
      <div className="flex flex-col gap-3">
        <Field label="To">
          <Input value={to} onChange={e => setTo(e.target.value)} type="email" />
        </Field>
        <Field label="Subject">
          <Input value={subject} onChange={e => setSubject(e.target.value)} />
        </Field>
        <Field label="Message">
          <Textarea value={body} onChange={e => setBody(e.target.value)} rows={16} />
        </Field>
        {balance > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 text-sm text-orange-800 font-medium">
            ⚠️ Invoice has outstanding balance of {fmtMoney(balance)}
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Btn variant="primary" className="flex-1" onClick={handleSend}>Send Email</Btn>
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </Modal>
  );
}
