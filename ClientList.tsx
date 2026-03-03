import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

export default function ClientList() {
  const { clients } = useApp();
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 text-sm font-semibold text-gray-700">{clients.length} Clients</div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
          <tr>
            <th className="px-5 py-3 text-left">Client</th>
            <th className="px-5 py-3 text-left">Vehicle</th>
            <th className="px-5 py-3 text-left">VIN</th>
            <th className="px-5 py-3 text-left">Phone</th>
            <th className="px-5 py-3 text-left">City</th>
            <th className="px-5 py-3 text-left">Mileage</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id} className="border-t border-gray-100 hover:bg-blue-50 cursor-pointer"
              onClick={() => navigate(`/clients/${c.id}`)}>
              <td className="px-5 py-3 font-semibold text-gray-900">{c.name}</td>
              <td className="px-5 py-3 text-gray-700">{c.vehicle.year} {c.vehicle.make} {c.vehicle.model}</td>
              <td className="px-5 py-3 font-mono text-xs text-gray-500">{c.vehicle.vin}</td>
              <td className="px-5 py-3 text-gray-600">{c.phone}</td>
              <td className="px-5 py-3 text-gray-600">{c.city}, {c.state}</td>
              <td className="px-5 py-3 text-gray-600">{c.vehicle.mileageIn.toLocaleString()} mi</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
