import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { fmtDate, fmtMoney, statusColor, calcBalance, calcInvoiceTotal } from '../utils/format';
import { Btn, Field, Input, Textarea } from '../components/UI';

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const { clients, workOrders, estimates, invoices, updateMileage, updateClient, toast } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'overview'|'workorders'|'estimates'|'invoices'|'mileage'|'notes'>('overview');
  const [editMileage, setEditMileage] = useState(false);
  const [newMileage, setNewMileage] = useState('');
  const [editNotes, setEditNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const client = clients.find(c => c.id === clientId);
  if (!client) return (
    <div className="text-center py-20">
      <div className="text-gray-400 text-lg mb-2">Client not found</div>
      <button onClick={() => navigate('/clients')} className="text-blue-600 text-sm hover:underline">← Back to Clients</button>
    </div>
  );

  const clientWOs = workOrders.filter(w => w.clientId === clientId);
  const clientEsts = estimates.filter(e => e.clientId === clientId);
  const clientInvs = invoices.filter(i => i.clientId === clientId);
  const v = client.vehicle;

  const handleMileageUpdate = () => {
    const val = parseInt(newMileage);
    if (!val || val <= client.vehicle.mileageIn) { toast('New mileage must exceed current mileage.', 'error'); return; }
    updateMileage(client.id, val);
    toast('Mileage updated and history recorded.', 'success');
    setEditMileage(false); setNewMileage('');
  };

  const handleSaveNotes = () => {
    updateClient({ ...client, notes });
    toast('Notes saved.', 'success');
    setEditNotes(false);
  };

  const TABS = ['overview','workorders','estimates','invoices','mileage','notes'] as const;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
        <Link to="/clients" className="hover:text-blue-600">Clients</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{client.name}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{client.name}</h2>
            <div className="text-sm text-gray-500 mt-0.5">{client.email} · {client.phone}</div>
            <div className="text-xs text-gray-400">{client.address}, {client.city}, {client.state} {client.zip}</div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div className="font-medium text-gray-700">{v.year} {v.make} {v.model}</div>
            <div className="font-mono">{v.vin}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${tab === t ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'workorders' ? 'Work Orders' : t === 'mileage' ? 'Mileage History' : t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                ['VIN', v.vin],
                ['Year / Make / Model', `${v.year} ${v.make} ${v.model}`],
                ['Engine', v.engine],
                ['Color', v.color],
                ['Tire Size', v.tireSize],
                ['Production Date', fmtDate(v.prodDate)],
                ['Service Tag', v.serviceTag || '—'],
              ].map(([l, val]) => (
                <div key={l} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-0.5">{l}</div>
                  <div className="text-sm font-semibold text-gray-900 break-all">{val}</div>
                </div>
              ))}
              <div className="bg-gray-50 rounded-lg p-3 flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Mileage In</div>
                  <div className="text-sm font-semibold text-gray-900">{v.mileageIn.toLocaleString()} mi</div>
                </div>
                <Btn size="sm" onClick={() => { setNewMileage(''); setEditMileage(true); }}>Update</Btn>
              </div>
            </div>
          )}

          {/* WORK ORDERS */}
          {tab === 'workorders' && (
            clientWOs.length === 0 ? <p className="text-sm text-gray-400">No work orders.</p> :
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Description</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Date</th>
              </tr></thead>
              <tbody>{clientWOs.map(w => (
                <tr key={w.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/work-orders/${w.id}`)}>
                  <td className="px-3 py-2.5 font-mono text-xs text-blue-600">{w.id}</td>
                  <td className="px-3 py-2.5">{w.description}</td>
                  <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(w.status)}`}>{w.status}</span></td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{fmtDate(w.date)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}

          {/* ESTIMATES */}
          {tab === 'estimates' && (
            clientEsts.length === 0 ? <p className="text-sm text-gray-400">No estimates.</p> :
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-left">Date</th>
              </tr></thead>
              <tbody>{clientEsts.map(e => (
                <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/estimates/${e.id}`)}>
                  <td className="px-3 py-2.5 font-mono text-xs text-blue-600">{e.id}</td>
                  <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(e.status)}`}>{e.status}</span></td>
                  <td className="px-3 py-2.5 text-right font-medium">{fmtMoney(e.lineItems.reduce((s,i)=>s+i.qty*i.unit,0)*1.07)}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{fmtDate(e.date)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}

          {/* INVOICES */}
          {tab === 'invoices' && (
            clientInvs.length === 0 ? <p className="text-sm text-gray-400">No invoices.</p> :
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-right">Total</th><th className="px-3 py-2 text-right">Balance</th><th className="px-3 py-2 text-left">Date</th>
              </tr></thead>
              <tbody>{clientInvs.map(i => (
                <tr key={i.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/invoices/${i.id}`)}>
                  <td className="px-3 py-2.5 font-mono text-xs text-blue-600">{i.id}</td>
                  <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(i.status)}`}>{i.status}</span></td>
                  <td className="px-3 py-2.5 text-right font-medium">{fmtMoney(calcInvoiceTotal(i))}</td>
                  <td className={`px-3 py-2.5 text-right font-semibold ${calcBalance(i,i.payments)>0?'text-red-600':'text-green-600'}`}>{fmtMoney(calcBalance(i,i.payments))}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{fmtDate(i.date)}</td>
                </tr>
              ))}</tbody>
            </table>
          )}

          {/* MILEAGE HISTORY */}
          {tab === 'mileage' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-sm">Mileage History</h3>
                <Btn size="sm" onClick={() => { setNewMileage(''); setEditMileage(true); }}>+ Update Mileage</Btn>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Previous</th><th className="px-3 py-2 text-right">New</th><th className="px-3 py-2 text-right">Δ Miles</th><th className="px-3 py-2 text-left">By</th>
                </tr></thead>
                <tbody>{[...client.mileageHistory].reverse().map((h, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2.5">{fmtDate(h.date)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-500">{h.prev.toLocaleString()} mi</td>
                    <td className="px-3 py-2.5 text-right font-medium">{h.next.toLocaleString()} mi</td>
                    <td className="px-3 py-2.5 text-right text-green-600">+{(h.next-h.prev).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-gray-500">{h.by}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* NOTES */}
          {tab === 'notes' && (
            <div>
              {editNotes ? (
                <div className="flex flex-col gap-2">
                  <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} />
                  <div className="flex gap-2">
                    <Btn onClick={handleSaveNotes}>Save</Btn>
                    <Btn variant="secondary" onClick={() => setEditNotes(false)}>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{client.notes || 'No notes.'}</p>
                  <Btn size="sm" variant="secondary" onClick={() => { setNotes(client.notes || ''); setEditNotes(true); }}>Edit Notes</Btn>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mileage update modal */}
      {editMileage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-96 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Update Mileage</h3>
            <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-800">
              Current: <strong>{client.vehicle.mileageIn.toLocaleString()} mi</strong>
            </div>
            <Field label="New Mileage">
              <Input type="number" value={newMileage} onChange={e => setNewMileage(e.target.value)} min={client.vehicle.mileageIn + 1} placeholder="Enter new mileage" />
            </Field>
            <div className="flex gap-2 mt-4">
              <Btn className="flex-1" onClick={handleMileageUpdate}>Save</Btn>
              <Btn className="flex-1" variant="secondary" onClick={() => setEditMileage(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
