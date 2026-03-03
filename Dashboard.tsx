import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { fmtMoney, fmtDate, statusColor, calcBalance } from '../utils/format';

export default function Dashboard() {
  const { clients, workOrders, estimates, invoices, activity } = useApp();
  const navigate = useNavigate();

  const openWOs = workOrders.filter(w => w.status !== 'Completed' && w.status !== 'Cancelled').length;
  const pendingEsts = estimates.filter(e => e.status === 'Pending').length;
  const unpaidInvs = invoices.filter(i => ['Unpaid', 'Partially Paid', 'Overdue'].includes(i.status)).length;
  const totalOutstanding = invoices
    .filter(i => ['Unpaid', 'Partially Paid', 'Overdue'].includes(i.status))
    .reduce((s, i) => s + calcBalance(i, i.payments), 0);

  const kpis = [
    { label: 'Open Work Orders', value: openWOs, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-100', nav: '/work-orders' },
    { label: 'Pending Estimates', value: pendingEsts, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100', nav: '/estimates' },
    { label: 'Unpaid / Overdue', value: unpaidInvs, color: 'text-red-700', bg: 'bg-red-50 border-red-100', nav: '/invoices' },
    { label: 'Outstanding Balance', value: fmtMoney(totalOutstanding), color: 'text-orange-700', bg: 'bg-orange-50 border-orange-100', nav: '/invoices' },
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map(k => (
          <button key={k.label} onClick={() => navigate(k.nav)}
            className={`${k.bg} border rounded-xl p-5 text-left hover:shadow-md transition-all`}>
            <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
            <div className="text-xs text-gray-600 mt-1.5 font-medium">{k.label}</div>
          </button>
        ))}
      </div>

      {/* Clients Quick View */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-sm text-gray-800">Clients</span>
            <button onClick={() => navigate('/clients')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {clients.map(c => (
            <button key={c.id} onClick={() => navigate(`/clients/${c.id}`)}
              className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50 text-left last:border-0">
              <div>
                <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-500">{c.vehicle.year} {c.vehicle.make} {c.vehicle.model}</div>
              </div>
              <div className="text-xs font-mono text-gray-400">{c.vehicle.vin.slice(-8)}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-sm text-gray-800">Recent Invoices</span>
            <button onClick={() => navigate('/invoices')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {invoices.slice(0, 4).map(i => {
            const c = clients.find(cl => cl.id === i.clientId);
            const balance = calcBalance(i, i.payments);
            return (
              <button key={i.id} onClick={() => navigate(`/invoices/${i.id}`)}
                className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-gray-50 last:border-0">
                <div>
                  <div className="text-xs font-mono text-blue-600 font-semibold">{i.id}</div>
                  <div className="text-sm text-gray-700">{c?.name}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(i.status)}`}>{i.status}</span>
                  {balance > 0 && <div className="text-xs text-red-600 font-semibold mt-0.5">{fmtMoney(balance)} due</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-sm text-gray-800">Recent Activity</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="px-5 py-2.5 text-left">Type</th>
              <th className="px-5 py-2.5 text-left">Reference</th>
              <th className="px-5 py-2.5 text-left">Description</th>
              <th className="px-5 py-2.5 text-left">Status</th>
              <th className="px-5 py-2.5 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {activity.slice(0, 8).map(a => (
              <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  if (a.type === 'Invoice' || a.type === 'Payment') navigate(`/invoices/${a.refId}`);
                  else if (a.type === 'WorkOrder') navigate(`/work-orders/${a.refId}`);
                  else if (a.type === 'Client') navigate(`/clients/${a.refId}`);
                  else if (a.type === 'Estimate') navigate(`/estimates/${a.refId}`);
                }}>
                <td className="px-5 py-3 text-xs text-gray-500 font-medium">{a.type}</td>
                <td className="px-5 py-3 font-mono text-xs text-blue-600 font-semibold">{a.refId}</td>
                <td className="px-5 py-3 text-gray-800">{a.desc}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(a.status)}`}>{a.status}</span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">{fmtDate(a.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
