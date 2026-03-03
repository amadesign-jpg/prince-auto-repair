import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/clients', label: 'Clients & Vehicles', icon: '👥' },
  { to: '/work-orders', label: 'Work Orders', icon: '🔧' },
  { to: '/estimates', label: 'Estimates', icon: '📋' },
  { to: '/invoices', label: 'Invoices', icon: '💳' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-900 text-gray-100 flex flex-col h-screen fixed top-0 left-0 z-20">
      <div className="px-5 py-5 border-b border-gray-700">
        <div className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-0.5">Prince</div>
        <div className="text-lg font-black tracking-tight text-white">Auto Repair</div>
        <div className="text-xs text-gray-500 mt-0.5">MV112559</div>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
            }>
            <span>{item.icon}</span>{item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-gray-700 text-xs text-gray-600">
        Pembroke Pines, FL 33441
      </div>
    </aside>
  );
}
