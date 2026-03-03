export interface Vehicle {
  id: string; year: number; make: string; model: string;
  vin: string; engine: string; tireSize: string; prodDate: string;
  mileageIn: number; mileageOut?: number; color: string; serviceTag?: string;
}
export interface MileageRecord { date: string; prev: number; next: number; by: string; }
export interface Client {
  id: string; name: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string;
  vehicle: Vehicle; mileageHistory: MileageRecord[]; notes: string;
  authContact?: string; authPhone?: string;
}
export interface WorkOrderTask { id: number; text: string; done: boolean; }
export interface LaborEntry { desc: string; hours: number; rate: number; }
export interface WorkOrder {
  id: string; clientId: string; date: string;
  status: 'Open'|'In Progress'|'Waiting for Parts'|'Completed'|'Cancelled';
  description: string; tasks: WorkOrderTask[]; labor: LaborEntry[];
  notes: string; technician?: string; serviceWriter?: string;
}
export interface LineItem {
  type: 'Labor'|'Part'|'Fee'|'Other'; desc: string;
  partNumber?: string; qty: number; unit: number; discount?: number;
}
export interface Payment {
  id: string; date: string;
  method: 'Cash'|'Card'|'Check'|'Bank Transfer'|'Other';
  referenceNumber?: string; amount: number; note?: string; by: string;
}
export interface Invoice {
  id: string; clientId: string; workOrderId?: string;
  date: string; dueDate?: string; closedDate?: string;
  status: 'Draft'|'Sent'|'Unpaid'|'Partially Paid'|'Paid'|'Overdue';
  lineItems: LineItem[]; shopSupplies: number; hazmat: number;
  notes?: string; payments: Payment[];
  serviceWriter?: string; technician?: string;
}
export interface Estimate {
  id: string; clientId: string; date: string; validUntil?: string;
  status: 'Pending'|'Approved'|'Rejected'|'Converted';
  lineItems: LineItem[]; notes?: string; convertedToInvoice?: string;
}
export interface ActivityEntry {
  id: string; type: 'Invoice'|'WorkOrder'|'Estimate'|'Client'|'Payment';
  refId: string; clientId?: string; desc: string; status: string; date: string;
}
export interface AppToast { id: number; message: string; type: 'success'|'error'|'info'; }
