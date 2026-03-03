import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { fmtMoney, fmtDate, statusColor, calcBalance, calcInvoiceTotal } from '../utils/format';

export default function InvoiceList() {
  const { invoices, clients } = useApp();
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">{invoices.length} Invoices</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0 z-10">
            <tr>
              <th className="px-5 py-3 text-left">Invoice #</th>
              <th className="px-5 py-3 text-left">Client</th>
              <th className="px-5 py-3 text-left">Vehicle</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-5 py-3 text-right">Balance Due</th>
              <th className="px-5 py-3 text-left">Date</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => {
              const client = clients.find(c => c.id === inv.clientId);
              const total = calcInvoiceTotal(inv);
              const balance = calcBalance(inv, inv.payments);
              return (
                <tr key={inv.id}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/invoices/${inv.id}`)}>
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-blue-600">{inv.id}</td>
                  <td className="px-5 py-3 font-medium">{client?.name}</td>
                  <td className="px-5 py-3 text-gray-600">{client ? `${client.vehicle.year} ${client.vehicle.make} ${client.vehicle.model}` : '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(inv.status)}`}>{inv.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-medium">{fmtMoney(total)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{fmtMoney(balance)}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{fmtDate(inv.date)}</td>
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => navigate(`/invoices/${inv.id}`)}
                        className="text-xs text-blue-600 hover:underline font-medium px-2 py-0.5 rounded hover:bg-blue-50">View</button>
                      <button onClick={() => navigate(`/invoices/${inv.id}/print`)}
                        className="text-gray-500 hover:text-gray-800 text-base" title="Print">🖨</button>
                      <button onClick={() => navigate(`/invoices/${inv.id}?email=1`)}
                        className="text-gray-500 hover:text-gray-800 text-base" title="Email">✉</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
