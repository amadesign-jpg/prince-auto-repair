import React from 'react';
import { useApp } from '../store/AppContext';
import { statusColor } from '../utils/format';

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className={`bg-white rounded-xl shadow-2xl flex flex-col max-h-[92vh] ${wide ? 'w-[760px]' : 'w-[500px]'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none font-bold">×</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Toast Container ───────────────────────────────────────────────────────────
export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all
          ${t.type === 'error' ? 'bg-red-600' : t.type === 'info' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Form Components ───────────────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, type = 'text', placeholder, min, max, step, readOnly, required }: {
  value: string | number; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; min?: string | number; max?: string | number;
  step?: string | number; readOnly?: boolean; required?: boolean;
}) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      min={min} max={max} step={step} readOnly={readOnly} required={required}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
    />
  );
}

export function Select({ value, onChange, children }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={onChange}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
      {children}
    </select>
  );
}

export function Textarea({ value, onChange, rows = 3, placeholder, readOnly }: {
  value: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder} readOnly={readOnly}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? 'bg-gray-50' : ''}`} />
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor(status)}`}>
      {status}
    </span>
  );
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md'; disabled?: boolean; className?: string;
}) {
  const vars = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    ghost: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`border rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${vars[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}
