import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { fmtDate, fmtMoney, statusColor, calcSubtotal, calcTax } from '../utils/format';
import { Btn, StatusBadge, Modal } from '../components/UI';

function EstDetail() {
  const { estId } = useParams<{ estId: string }>();
  const { estimates, clients, updateEstimate, addInvoice, toast } = useApp();
  const navigate = useNavigate();
  const [showConvert, setShowConvert] = useState(false);

  const est = estimates.find(e => e.id === estId);
  const client = est ? clients.find(c => c.id === est.clientId) : null;
  if (!est || !client) return <div className="text-gray-400 p-8 text-center">Estimate not found.</div>;

  const sub = calcSubtotal(est.lineItems);
  const total = sub + calcTax(sub);

  const convertToInvoice = () => {
    const id = `INV-${Date.now().toString().slice(-6)}`;
    addInvoice({ id, clientId: est.clientId, date: new Date().toISOString().slice(0, 10), status: 'Draft', lineItems: [...est.lineItems], shopSupplies: 0, hazmat: 0, notes: `Created from estimate ${est.id}.`, payments: [] });
    updateEstimate({ ...est, status: 'Converted', convertedToInvoice: id });
    toast(`Invoice ${id} created.`, 'success');
    setShowConvert(false);
    navigate('/invoices');
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-black text-gray-900">{est.id}</span>
              <StatusBadge status={est.status} />
            </div>
            <div className="text-sm text-gray-600">{client.name} · {client.vehicle.year} {client.vehicle.make} {client.vehicle.model}</div>
            <div className="text-xs text-gray-400 mt-0.5">Created: {fmtDate(est.date)}{est.validUntil ? ` · Valid until: ${fmtDate(est.validUntil)}` : ''}</div>
          </div>
        </div>
        <div className="p-6">
          <table className="w-full text-sm mb-4">
            <thead><tr className="bg-gray-800 text-white text-xs">
              <th className="px-3 py-2.5 text-left">Type</th><th className="px-3 py-2.5 text-left">Description</th><th className="px-3 py-2.5 text-center">Part #</th><th className="px-3 py-2.5 text-right">Qty</th><th className="px-3 py-2.5 text-right">Unit</th><th className="px-3 py-2.5 text-right">Total</th>
            </tr></thead>
            <tbody>{est.lineItems.map((li, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-3 py-2.5"><span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{li.type}</span></td>
                <td className="px-3 py-2.5">{li.desc}</td>
                <td className="px-3 py-2.5 text-center font-mono text-xs text-gray-500">{li.partNumber || '—'}</td>
                <td className="px-3 py-2.5 text-right">{li.qty}</td>
                <td className="px-3 py-2.5 text-right">{fmtMoney(li.unit)}</td>
                <td className="px-3 py-2.5 text-right font-semibold">{fmtMoney(li.qty * li.unit)}</td>
              </tr>
            ))}</tbody>
          </table>
          <div className="flex justify-end">
            <div className="w-56 text-sm">
              {[['Subtotal', fmtMoney(sub)], ['Tax (7%)', fmtMoney(calcTax(sub))], ['Total', fmtMoney(total)]].map(([l, v]) => (
                <div key={l} className={`flex justify-between py-1.5 ${l === 'Total' ? 'font-bold border-t border-gray-300 pt-2 text-gray-900' : 'text-gray-600'}`}>
                  <span>{l}</span><span>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {est.notes && <p className="mt-4 text-xs text-gray-500 italic border-t border-gray-100 pt-3">{est.notes}</p>}
          {est.convertedToInvoice && <div className="mt-3 text-xs bg-purple-50 text-purple-700 rounded-lg px-3 py-2">Converted to: <button onClick={() => navigate(`/invoices/${est.convertedToInvoice}`)} className="underline font-medium">{est.convertedToInvoice}</button></div>}
        </div>
      </div>
      <div className="w-44 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Actions</div>
          <Btn variant="success" size="sm" className="w-full" onClick={() => setShowConvert(true)} disabled={est.status === 'Converted'}>
            Convert to Invoice
          </Btn>
        </div>
      </div>
      {showConvert && (
        <Modal title="Convert to Invoice" onClose={() => setShowConvert(false)}>
          <p className="text-sm text-gray-700 mb-4">Create a new <strong>Draft Invoice</strong> from <strong>{est.id}</strong> for <strong>{client.name}</strong>.</p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm font-semibold">Total: {fmtMoney(total)}</div>
          <div className="flex gap-2">
            <Btn variant="success" className="flex-1" onClick={convertToInvoice}>Confirm</Btn>
            <Btn variant="secondary" className="flex-1" onClick={() => setShowConvert(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function Estimates() {
  const { estId } = useParams<{ estId?: string }>();
  const { estimates, clients } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex gap-4">
      <div className="w-72 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">{estimates.length} Estimates</div>
        <div className="overflow-y-auto flex-1">
          {estimates.map(e => {
            const c = clients.find(cl => cl.id === e.clientId);
            const sub = calcSubtotal(e.lineItems);
            return (
              <button key={e.id} onClick={() => navigate(`/estimates/${e.id}`)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${estId === e.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}>
                <div className="flex justify-between mb-1">
                  <span className="font-mono text-xs text-blue-600 font-semibold">{e.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(e.status)}`}>{e.status}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">{c?.name}</div>
                <div className="text-xs text-gray-500">{fmtMoney((sub + calcTax(sub)))} · {fmtDate(e.date)}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {estId ? <EstDetail /> : (
          <div className="bg-white rounded-xl border border-gray-200 h-64 flex items-center justify-center text-gray-400 text-sm">
            Select an estimate to view details
          </div>
        )}
      </div>
    </div>
  );
}
