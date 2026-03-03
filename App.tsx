import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { ToastContainer } from './components/UI';

import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import WorkOrders from './pages/WorkOrders';
import Estimates from './pages/Estimates';
import InvoiceList from './pages/InvoiceList';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoicePrint from './pages/InvoicePrint';

import { NewClientModal, NewWorkOrderModal, NewEstimateModal, NewInvoiceModal } from './modals/AllModals';

function AppShell() {
  const [newModal, setNewModal] = useState<string | null>(null);
  const location = useLocation();

  // Print route: full-page, no chrome
  const isPrint = location.pathname.endsWith('/print');

  if (isPrint) return (
    <div className="bg-white min-h-screen">
      <Outlet />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-56">
        <Topbar onNew={setNewModal} />
        <main className="pt-14 p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />

      {newModal === 'New Client' && <NewClientModal onClose={() => setNewModal(null)} />}
      {newModal === 'New Work Order' && <NewWorkOrderModal onClose={() => setNewModal(null)} />}
      {newModal === 'New Estimate' && <NewEstimateModal onClose={() => setNewModal(null)} />}
      {newModal === 'New Invoice' && <NewInvoiceModal onClose={() => setNewModal(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Clients */}
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:clientId" element={<ClientDetail />} />

            {/* Work Orders */}
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/work-orders/:woId" element={<WorkOrders />} />

            {/* Estimates */}
            <Route path="/estimates" element={<Estimates />} />
            <Route path="/estimates/:estId" element={<Estimates />} />

            {/* Invoices */}
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="/invoices/:invoiceId" element={<InvoiceDetail />} />

            {/* Print — full page, no sidebar */}
            <Route path="/invoices/:invoiceId/print" element={<InvoicePrint />} />

            {/* 404 */}
            <Route path="*" element={
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">404</div>
                <div>Page not found</div>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
