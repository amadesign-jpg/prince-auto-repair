import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { fmtDate, fmtMoney, statusColor } from '../utils/format';
import { Btn, StatusBadge } from '../components/UI';

function WODetail() {
  const { woId } = useParams<{ woId: string }>();
  const { workOrders, clients, updateWorkOrder, addInvoice, toast } = useApp();
  const navigate = useNavigate();
  const wo = workOrders.find(w => w.id === woId);
  const client = wo ? clients.find(c => c.id === wo.clientId) : null;

  if (!wo || !client) return <div className="text-gray-400 p-8 text-center">Work order not found.</div>;

  const toggleTask = (taskId: number) => {
    updateWorkOrder({ ...wo, tasks: wo.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) });
  };

  const changeStatus = (status: typeof wo.status) => {
    updateWorkOrder({ ...wo, status });
    toast(`Status updated to "${status}"`, 'success');
  };

  const createInvoice = () => {
    const id = `INV-${Date.now().toString().slice(-6)}`;
    addInvoice({
      id, clientId: wo.clientId, workOrderId: wo.id,
      date: new Date().toISOString().slice(0, 10),
      status: 'Draft',
      lineItems: wo.labor.map(l => ({ type: 'Labor' as const, desc: l.desc, qty: l.hours, unit: l.rate })),
      shopSupplies: 0, hazmat: 0, payments: [],
      serviceWriter: wo.serviceWriter, technician: wo.technician,
    });
    toast('Invoice created from work order.', 'success');
    navigate('/invoices');
  };

  return (
    <div className="flex gap-4">
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-black text-gray-900">{wo.id}</span>
              <StatusBadge status={wo.status} />
            </div>
            <div className="text-sm text-gray-600">{client.name} · {client.vehicle.year} {client.vehicle.make} {client.vehicle.model}</div>
            <div className="text-xs text-gray-400 mt-0.5">{fmtDate(wo.date)} · Writer: {wo.serviceWriter} · Tech: {wo.technician}</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Job Description</div>
            <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{wo.description}</p>
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Checklist</div>
            {wo.tasks.map(t => (
              <label key={t.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded">
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="w-4 h-4 rounded text-blue-600" />
                <span className={`text-sm ${t.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.text}</span>
              </label>
            ))}
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Labor</div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-right">Hrs</th><th className="px-3 py-2 text-right">Rate</th><th className="px-3 py-2 text-right">Total</th>
              </tr></thead>
              <tbody>{wo.labor.map((l, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-3 py-2.5">{l.desc}</td>
                  <td className="px-3 py-2.5 text-right">{l.hours}</td>
                  <td className="px-3 py-2.5 text-right">{fmtMoney(l.rate)}</td>
                  <td className="px-3 py-2.5 text-right font-semibold">{fmtMoney(l.hours * l.rate)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {wo.notes && <div>
            <div className="text-xs font-bold text-gray-400 uppercase mb-2">Notes</div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{wo.notes}</p>
          </div>}
        </div>
      </div>
      <div className="w-48 flex flex-col gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-1.5">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Change Status</div>
          {(['Open','In Progress','Waiting for Parts','Completed','Cancelled'] as const).map(s => (
            <button key={s} onClick={() => changeStatus(s)}
              className={`w-full text-xs py-1.5 px-3 rounded-lg border text-left transition-colors ${wo.status === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-gray-400 uppercase mb-1">Actions</div>
          <Btn variant="success" size="sm" className="w-full" onClick={createInvoice}>Create Invoice</Btn>
        </div>
      </div>
    </div>
  );
}

export default function WorkOrders() {
  const { woId } = useParams<{ woId?: string }>();
  const { workOrders, clients } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex gap-4">
      <div className="w-80 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">{workOrders.length} Work Orders</div>
        <div className="overflow-y-auto flex-1">
          {workOrders.map(w => {
            const c = clients.find(cl => cl.id === w.clientId);
            return (
              <button key={w.id} onClick={() => navigate(`/work-orders/${w.id}`)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${woId === w.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-xs text-blue-600 font-semibold">{w.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(w.status)}`}>{w.status}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 truncate">{w.description}</div>
                <div className="text-xs text-gray-500">{c?.name} · {fmtDate(w.date)}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        {woId ? <WODetail /> : (
          <div className="bg-white rounded-xl border border-gray-200 h-64 flex items-center justify-center text-gray-400 text-sm">
            Select a work order to view details
          </div>
        )}
      </div>
    </div>
  );
}
