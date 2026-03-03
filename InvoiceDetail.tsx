import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  fmtMoney, fmtDate, statusColor,
  calcInvoiceTotal, calcInvoiceSubtotal, calcPaid, calcBalance,
  calcLaborTotal, calcPartsTotal, calcTax, vehicleStr,
} from '../utils/format';
import { Btn, StatusBadge } from '../components/UI';
import AddPaymentModal from '../modals/AddPaymentModal';
import EmailModal from '../modals/EmailModal';

export default function InvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [searchParams] = useSearchParams();
  const { invoices, clients } = useApp();
  const navigate = useNavigate();
  const [showPayModal, setShowPayModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const invoice = invoices.find(i => i.id === invoiceId);
  const client = invoice ? clients.find(c => c.id === invoice.clientId) : null;

  // Open email modal if navigated with ?email=1
  useEffect(() => {
    if (searchParams.get('email') === '1') setShowEmailModal(true);
  }, [searchParams]);

  if (!invoice) return (
    <div className="text-center py-20">
      <div className="text-gray-400 text-lg mb-2">Invoice not found</div>
      <button onClick={() => navigate('/invoices')} className="text-blue-600 text-sm hover:underline">← Back to Invoices</button>
    </div>
  );

  const sub = calcInvoiceSubtotal(invoice);
  const tax = calcTax(sub);
  const total = sub + tax;
  const paid = calcPaid(invoice.payments);
  const balance = Math.max(0, total - paid);
  const laborTotal = calcLaborTotal(invoice.lineItems);
  const partsTotal = calcPartsTotal(invoice.lineItems);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Link to="/invoices" className="hover:text-blue-600">Invoices</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">{invoice.id}</span>
      </div>

      <div className="flex gap-5 items-start">
        {/* ── LEFT: Invoice Detail ── */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Invoice Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl font-black text-gray-900">{invoice.id}</span>
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>Date: {fmtDate(invoice.date)}{invoice.dueDate ? ` · Due: ${fmtDate(invoice.dueDate)}` : ''}</div>
                  {invoice.serviceWriter && <div>Service Writer: {invoice.serviceWriter} · Technician: {invoice.technician}</div>}
                  {invoice.workOrderId && <div>Work Order: <Link to={`/work-orders/${invoice.workOrderId}`} className="text-blue-600 hover:underline">{invoice.workOrderId}</Link></div>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Btn size="sm" variant="ghost" onClick={() => navigate(`/invoices/${invoice.id}/print`)}>🖨 Print</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setShowEmailModal(true)}>✉ Email</Btn>
              </div>
            </div>

            {/* Customer + Vehicle */}
            <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
              <div className="px-6 py-4 border-r border-gray-100">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer</div>
                <div className="font-bold text-gray-900">{client?.name}</div>
                <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                  <div>{client?.address}</div>
                  <div>{client?.city}, {client?.state} {client?.zip}</div>
                  <div>{client?.phone}</div>
                  <div className="text-blue-600">{client?.email}</div>
                </div>
              </div>
              <div className="px-6 py-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vehicle</div>
                <div className="font-bold text-gray-900">{vehicleStr(client?.vehicle)}</div>
                <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                  <div>VIN: <span className="font-mono text-xs">{client?.vehicle.vin}</span></div>
                  <div>Engine: {client?.vehicle.engine}</div>
                  <div>Mileage In: {client?.vehicle.mileageIn?.toLocaleString()} mi{client?.vehicle.mileageOut ? ` / Out: ${client.vehicle.mileageOut.toLocaleString()} mi` : ''}</div>
                  {client?.vehicle.serviceTag && <div>Service Tag: {client.vehicle.serviceTag}</div>}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="px-6 py-5">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Line Items</div>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-800 text-white text-xs uppercase">
                    <th className="px-3 py-2.5 text-left">Type</th>
                    <th className="px-3 py-2.5 text-left">Description</th>
                    <th className="px-3 py-2.5 text-center">Part #</th>
                    <th className="px-3 py-2.5 text-right">Qty/Hrs</th>
                    <th className="px-3 py-2.5 text-right">Rate</th>
                    <th className="px-3 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((li, i) => (
                    <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${li.type === 'Labor' ? 'bg-blue-100 text-blue-700' : li.type === 'Part' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                          {li.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-800">{li.desc}</td>
                      <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-500">{li.partNumber || '—'}</td>
                      <td className="px-3 py-2.5 text-right">{li.qty}</td>
                      <td className="px-3 py-2.5 text-right">{fmtMoney(li.unit)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{fmtMoney(li.qty * li.unit)}</td>
                    </tr>
                  ))}
                  {invoice.shopSupplies > 0 && (
                    <tr className="border-t border-gray-100 bg-gray-50">
                      <td className="px-3 py-2.5"><span className="text-xs px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600">Fee</span></td>
                      <td className="px-3 py-2.5 text-gray-600 italic">Shop Supplies</td>
                      <td className="px-3 py-2.5" /><td className="px-3 py-2.5" />
                      <td className="px-3 py-2.5 text-right">—</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{fmtMoney(invoice.shopSupplies)}</td>
                    </tr>
                  )}
                  {invoice.hazmat > 0 && (
                    <tr className="border-t border-gray-100 bg-gray-50">
                      <td className="px-3 py-2.5"><span className="text-xs px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600">Fee</span></td>
                      <td className="px-3 py-2.5 text-gray-600 italic">HazMat</td>
                      <td className="px-3 py-2.5" /><td className="px-3 py-2.5" />
                      <td className="px-3 py-2.5 text-right">—</td>
                      <td className="px-3 py-2.5 text-right font-semibold">{fmtMoney(invoice.hazmat)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Subtotals */}
              <div className="flex justify-end mt-4">
                <div className="w-64 text-sm">
                  {[['Parts', fmtMoney(partsTotal)], ['Labor', fmtMoney(laborTotal)], ['Shop Supplies', fmtMoney(invoice.shopSupplies)], ['HazMat', fmtMoney(invoice.hazmat)]].map(([l,v]) => (
                    <div key={l} className="flex justify-between py-1 text-gray-500 border-b border-gray-100">
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1 text-gray-700 font-medium border-b border-gray-200">
                    <span>Subtotal</span><span>{fmtMoney(sub)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-600 border-b border-gray-200">
                    <span>Tax (7%)</span><span>{fmtMoney(tax)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-gray-900 text-base">
                    <span>Invoice Total</span><span>{fmtMoney(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="px-6 pb-5">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</div>
                <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg p-3">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Payment History (below main card) */}
          {invoice.payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 mt-4 overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">Payment History</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <th className="px-5 py-2.5 text-left">Date</th>
                    <th className="px-5 py-2.5 text-left">Method</th>
                    <th className="px-5 py-2.5 text-left">Reference #</th>
                    <th className="px-5 py-2.5 text-right">Amount</th>
                    <th className="px-5 py-2.5 text-left">Note</th>
                    <th className="px-5 py-2.5 text-left">Processed By</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map(p => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="px-5 py-2.5">{fmtDate(p.date)}</td>
                      <td className="px-5 py-2.5">{p.method}</td>
                      <td className="px-5 py-2.5 font-mono text-xs text-gray-500">{p.referenceNumber || '—'}</td>
                      <td className="px-5 py-2.5 text-right font-semibold text-emerald-600">{fmtMoney(p.amount)}</td>
                      <td className="px-5 py-2.5 text-gray-500 text-xs">{p.note || '—'}</td>
                      <td className="px-5 py-2.5 text-gray-600">{p.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky Payment Panel ── */}
        <div className="w-56 flex-shrink-0 sticky top-20 flex flex-col gap-3">
          {/* Payment Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Details</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 py-1.5 border-b border-gray-100">
                <span>Invoice Total</span><span className="font-semibold">{fmtMoney(total)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 py-1.5 border-b border-gray-100">
                <span>Amount Paid</span><span className="font-semibold">{fmtMoney(paid)}</span>
              </div>
              <div className={`flex justify-between py-2 font-bold text-base ${balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                <span>Balance Due</span><span>{fmtMoney(balance)}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xs text-gray-500">Status</span>
              <StatusBadge status={invoice.status} />
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Actions</div>
            {balance > 0 && (
              <Btn variant="success" size="sm" className="w-full" onClick={() => setShowPayModal(true)}>
                + Add Payment
              </Btn>
            )}
            {balance <= 0 && (
              <div className="text-xs text-center text-emerald-600 font-semibold py-1.5 bg-emerald-50 rounded-lg">✓ Paid in Full</div>
            )}
            <Btn variant="ghost" size="sm" className="w-full" onClick={() => navigate(`/invoices/${invoice.id}/print`)}>
              🖨 Print Preview
            </Btn>
            <Btn variant="ghost" size="sm" className="w-full" onClick={() => setShowEmailModal(true)}>
              ✉ Email Invoice
            </Btn>
          </div>
        </div>
      </div>

      {showPayModal && <AddPaymentModal invoice={invoice} onClose={() => setShowPayModal(false)} />}
      {showEmailModal && <EmailModal invoice={invoice} onClose={() => setShowEmailModal(false)} />}
    </div>
  );
}
