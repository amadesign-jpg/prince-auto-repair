import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

const LOGGED_IN_USER = 'Lucy';

interface TopbarProps {
  onNew: (type: string) => void;
}

export default function Topbar({ onNew }: TopbarProps) {
  const { clients, invoices } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Global search: client name, invoice #, VIN ──
  const results = query.trim().length < 1 ? [] : [
    ...clients
      .filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.vehicle.vin.toLowerCase().includes(query.toLowerCase())
      )
      .map(c => ({ kind: 'client' as const, id: c.id, label: c.name, sub: `${c.vehicle.year} ${c.vehicle.make} ${c.vehicle.model} · VIN: ${c.vehicle.vin.slice(-8)}` })),
    ...invoices
      .filter(i => i.id.toLowerCase().includes(query.toLowerCase()))
      .map(i => {
        const c = clients.find(cl => cl.id === i.clientId);
        return { kind: 'invoice' as const, id: i.id, label: i.id, sub: `${c?.name || '—'} · ${i.status}` };
      }),
  ].slice(0, 8);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (r: typeof results[0]) => {
    setQuery('');
    setShowResults(false);
    if (r.kind === 'client') navigate(`/clients/${r.id}`);
    else navigate(`/invoices/${r.id}`);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 fixed top-0 left-56 right-0 z-30">
      {/* Global Search */}
      <div className="relative flex-1 max-w-sm" ref={searchRef}>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <span className="px-3 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search clients, invoices, VIN…"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            className="flex-1 py-2 pr-3 text-sm outline-none bg-transparent"
          />
        </div>
        {showResults && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {results.map(r => (
              <button key={`${r.kind}-${r.id}`} onClick={() => handleSelect(r)}
                className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-blue-50 text-left">
                <span className="text-xs mt-0.5 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono uppercase">
                  {r.kind === 'client' ? 'CLI' : 'INV'}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900">{r.label}</div>
                  <div className="text-xs text-gray-500">{r.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* + New Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowNew(v => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          + New ▾
        </button>
        {showNew && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {['New Client', 'New Work Order', 'New Estimate', 'New Invoice'].map(opt => (
              <button key={opt} onClick={() => { onNew(opt); setShowNew(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User badge */}
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm">
        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">L</div>
        <span className="font-medium text-gray-800">{LOGGED_IN_USER}</span>
        <span className="text-gray-400 text-xs">Service Advisor</span>
      </div>
    </header>
  );
}
