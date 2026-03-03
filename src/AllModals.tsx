import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Modal, Field, Input, Select, Textarea, Btn } from '../components/UI';
import { calcSubtotal, calcTax } from '../utils/format';
import type { LineItem } from '../types';

const LOGGED_IN_USER = 'Lucy';

// ── New Client ──────────────────────────────────────────────────────────────
export function NewClientModal({ onClose }: { onClose: () => void }) {
  const { addClient, toast } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', address: '', city: '', state: 'FL', zip: '', year: '', make: '', model: '', vin: '', engine: '', tireSize: '', mileage: '', color: '' });
  const s = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  const save = () => {
    if (!f.name || !f.make) { toast('Name and vehicle make are required.', 'error'); return; }
    const id = `C${Date.now().toString().slice(-5)}`;
    addClient({
      id, name: f.name, email: f.email, phone: f.phone,
      address: f.address, city: f.city, state: f.state, zip: f.zip,
      notes: '',
      vehicle: { id: `V${id}`, year: parseInt(f.year) || 2024, make: f.make, model: f.model, vin: f.vin || '—', engine: f.engine, tireSize: f.tireSize, prodDate: '', mileageIn: parseInt(f.mileage) || 0, color: f.color, serviceTag: '' },
      mileageHistory: f.mileage ? [{ date: new Date().toISOString().slice(0, 10), prev: 0, next: parseInt(f.mileage), by: LOGGED_IN_USER }] : [],
    });
    toast(`Client ${f.name} added.`, 'success');
    onClose();
    navigate('/clients');
  };

  return (
    <Modal title="New Client" onClose={onClose} wide>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Full Name *"><Input value={f.name} onChange={s('name')} placeholder="John Smith" /></Field>
        <Field label="Email"><Input type="email" value={f.email} onChange={s('email')} /></Field>
        <Field label="Phone"><Input value={f.phone} onChange={s('phone')} /></Field>
        <Field label="Address"><Input value={f.address} onChange={s('address')} /></Field>
        <Field label="City"><Input value={f.city} onChange={s('city')} /></Field>
        <Field label="State / ZIP">
          <div className="flex gap-2">
            <Input value={f.state} onChange={s('state')} placeholder="FL" />
            <Input value={f.zip} onChange={s('zip')} placeholder="33025" />
          </div>
        </Field>
        <div className="col-span-2 border-t border-gray-100 pt-3 text-xs font-bold text-gray-400 uppercase">Vehicle</div>
        <Field label="Year"><Input value={f.year} onChange={s('year')} placeholder="2024" /></Field>
        <Field label="Make *"><Input value={f.make} onChange={s('make')} placeholder="Ford" /></Field>
        <Field label="Model"><Input value={f.model} onChange={s('model')} /></Field>
        <Field label="VIN"><Input value={f.vin} onChange={s('vin')} /></Field>
        <Field label="Engine"><Input value={f.engine} onChange={s('engine')} /></Field>
        <Field label="Tire Size"><Input value={f.tireSize} onChange={s('tireSize')} /></Field>
        <Field label="Color"><Input value={f.color} onChange={s('color')} /></Field>
        <Field label="Mileage In"><Input type="number" value={f.mileage} onChange={s('mileage')} /></Field>
      </div>
      <div className="flex gap-2">
        <Btn className="flex-1" onClick={save}>Save Client</Btn>
        <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

// ── New Work Order ───────────────────────────────────────────────────────────
export function NewWorkOrderModal({ onClose }: { onClose: () => void }) {
  const { clients, addWorkOrder, addActivity, toast } = useApp();
  const navigate = useNavigate();
  const [f, setF] = useState({ clientId: clients[0]?.id || '', description: '', notes: '', technician: 'John' });
  const s = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: e.target.value }));

  const save = () => {
    if (!f.description) { toast('Job description is required.', 'error'); return; }
    const id = `WO-${Date.now().toString().slice(-7)}`;
    addWorkOrder({ id, clientId: f.clientId, date: new Date().toISOString().slice(0, 10), status: 'Open', description: f.description, tasks: [], labor: [], notes: f.notes, serviceWriter: LOGGED_IN_USER, technician: f.technician });
    addActivity({ id: `A-${Date.now()}`, type: 'WorkOrder', refId: id, clientId: f.clientId, desc: f.description, status: 'Open', date: new Date().toISOString().slice(0, 10) });
    toast(`Work Order ${id} created.`, 'success');
    onClose(); navigate(`/work-orders/${id}`);
  };

  return (
    <Modal title="New Work Order" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <Field label="Client">
          <Select value={f.clientId} onChange={s('clientId') as any}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.vehicle.year} {c.vehicle.make} {c.vehicle.model}</option>)}
          </Select>
        </Field>
        <Field label="Job Description *"><Input value={f.description} onChange={s('description')} placeholder="Describe the work to be done" /></Field>
        <Field label="Technician"><Input value={f.technician} onChange={s('technician')} /></Field>
        <Field label="Notes"><Textarea value={f.notes} onChange={s('notes')} /></Field>
        <div className="flex gap-2 pt-1">
          <Btn className="flex-1" onClick={save}>Create Work Order</Btn>
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── New Estimate ─────────────────────────────────────────────────────────────
export function NewEstimateModal({ onClose }: { onClose: () => void }) {
  const { clients, addEstimate, toast } = useApp();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ type: 'Labor', desc: '', qty: 1, unit: 0 }]);

  const addItem = () => setItems(p => [...p, { type: 'Part', desc: '', qty: 1, unit: 0 }]);
  const updateItem = (i: number, k: keyof LineItem, v: string | number) =>
    setItems(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

  const sub = calcSubtotal(items);
  const total = sub + calcTax(sub);

  const save = () => {
    const id = `EST-${Date.now().toString().slice(-7)}`;
    addEstimate({ id, clientId, date: new Date().toISOString().slice(0, 10), status: 'Pending', lineItems: items.filter(i => i.desc), notes });
    toast(`Estimate ${id} created.`, 'success');
    onClose(); navigate(`/estimates/${id}`);
  };

  return (
    <Modal title="New Estimate" onClose={onClose} wide>
      <div className="flex flex-col gap-3">
        <Field label="Client">
          <Select value={clientId} onChange={e => setClientId(e.target.value)}>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Line Items</div>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <div className="col-span-2">
                <Select value={item.type} onChange={e => updateItem(i, 'type', e.target.value)}>
                  {['Labor','Part','Fee','Other'].map(t => <option key={t}>{t}</option>)}
                </Select>
              </div>
              <div className="col-span-5"><Input value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)} placeholder="Description" /></div>
              <div className="col-span-2"><Input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', parseFloat(e.target.value))} placeholder="Qty" /></div>
              <div className="col-span-2"><Input type="number" value={item.unit} onChange={e => updateItem(i, 'unit', parseFloat(e.target.value))} placeholder="$" step="0.01" /></div>
              <div className="col-span-1 text-xs text-right text-gray-400">${((item.qty||0)*(item.unit||0)).toFixed(0)}</div>
            </div>
          ))}
          <button onClick={addItem} className="text-xs text-blue-600 hover:underline">+ Add Line Item</button>
          <div className="text-right text-sm font-bold mt-2 text-gray-800">Total: ${total.toFixed(2)}</div>
        </div>
        <Field label="Notes"><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></Field>
        <div className="flex gap-2">
          <Btn className="flex-1" onClick={save}>Create Estimate</Btn>
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── New Invoice ──────────────────────────────────────────────────────────────
export function NewInvoiceModal({ onClose }: { onClose: () => void }) {
  const { clients, addInvoice, addActivity, toast } = useApp();
  const navigate = useNavigate();
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [shopSupplies, setShopSupplies] = useState('0');
  const [hazmat, setHazmat] = useState('0');
  const [items, setItems] = useState<LineItem[]>([{ type: 'Labor', desc: '', qty: 1, unit: 0 }]);

  const addItem = () => setItems(p => [...p, { type: 'Part', desc: '', qty: 1, unit: 0 }]);
  const updateItem = (i: number, k: keyof LineItem, v: string | number) =>
    setItems(p => p.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

  const sub = calcSubtotal(items) + parseFloat(shopSupplies || '0') + parseFloat(hazmat || '0');
  const total = sub + calcTax(sub);

  const save = () => {
    const id = `INV-${Date.now().toString().slice(-6)}`;
    const c = clients.find(c => c.id === clientId);
    addInvoice({ id, clientId, date: new Date().toISOString().slice(0, 10), dueDate: dueDate || undefined, status: 'Draft', lineItems: items.filter(i => i.desc), shopSupplies: parseFloat(shopSupplies) || 0, hazmat: parseFloat(hazmat) || 0, notes, payments: [], serviceWriter: LOGGED_IN_USER });
    addActivity({ id: `A-${Date.now()}`, type: 'Invoice', refId: id, clientId, desc: `New invoice for ${c?.name}`, status: 'Draft', date: new Date().toISOString().slice(0, 10) });
    toast(`Invoice ${id} created.`, 'success');
    onClose(); navigate(`/invoices/${id}`);
  };

  return (
    <Modal title="New Invoice" onClose={onClose} wide>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client">
            <Select value={clientId} onChange={e => setClientId(e.target.value)}>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Due Date"><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></Field>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase mb-2">Line Items</div>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <div className="col-span-2">
                <Select value={item.type} onChange={e => updateItem(i, 'type', e.target.value)}>
                  {['Labor','Part','Fee','Other'].map(t => <option key={t}>{t}</option>)}
                </Select>
              </div>
              <div className="col-span-5"><Input value={item.desc} onChange={e => updateItem(i, 'desc', e.target.value)} placeholder="Description" /></div>
              <div className="col-span-2"><Input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', parseFloat(e.target.value))} placeholder="Qty" /></div>
              <div className="col-span-2"><Input type="number" value={item.unit} onChange={e => updateItem(i, 'unit', parseFloat(e.target.value))} placeholder="$" step="0.01" /></div>
              <div className="col-span-1 text-xs text-right text-gray-400">${((item.qty||0)*(item.unit||0)).toFixed(0)}</div>
            </div>
          ))}
          <button onClick={addItem} className="text-xs text-blue-600 hover:underline">+ Add Line Item</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Shop Supplies ($)"><Input type="number" value={shopSupplies} onChange={e => setShopSupplies(e.target.value)} step="0.01" /></Field>
          <Field label="HazMat ($)"><Input type="number" value={hazmat} onChange={e => setHazmat(e.target.value)} step="0.01" /></Field>
        </div>
        <div className="text-right text-sm font-bold text-gray-800">Total: ${total.toFixed(2)}</div>
        <Field label="Notes"><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></Field>
        <div className="flex gap-2">
          <Btn className="flex-1" onClick={save}>Create Invoice</Btn>
          <Btn variant="secondary" className="flex-1" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </Modal>
  );
}
