import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './routes/ProtectedRoute';

// Admin Pages
import AdminLayout from './components/layout/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Businesses from './pages/admin/Businesses';
import AdminLogs from './pages/admin/AdminLogs';
import AdminPlans from './pages/admin/AdminPlans';

// Owner Pages
import OwnerLayout from './components/layout/owner/MainLayout';
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerSubscription from './pages/owner/OwnerSubscription';
import Customers from './pages/owner/Customers';
import Suppliers from './pages/owner/Suppliers';
import Products from './pages/owner/Products';
import Batches from './pages/owner/Batches';
import Expenses from './pages/owner/Expenses';
import AnalyticsDashboard from './pages/owner/AnalyticsDashboard';
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import InvoiceCreatePage from './pages/invoices/InvoiceCreatePage';
import InvoiceDetailsPage from './pages/invoices/InvoiceDetailsPage';
import ProfileSetup from './pages/owner/ProfileSetup';
import ProfileEdit from './pages/owner/ProfileEdit';

// ... (rest of imports)

const queryClient = new QueryClient();

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <h1 className="text-2xl font-black italic uppercase tracking-widest text-slate-500 opacity-20">{title}</h1>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* login/register routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/plans" element={<AdminPlans />} />
                  <Route path="/admin/businesses" element={<Businesses />} />
                  <Route path="/admin/usage-logs" element={<AdminLogs />} />
                </Route>
              </Route>

              {/* Owner Routes */}
              <Route element={<ProtectedRoute allowedRoles={["OWNER", "USER"]} />}>
                {/* Standalone Setup Page (No Sidebar) */}
                <Route path="/setup-profile" element={<ProfileSetup />} />

                {/* Dashboard & Other Pages (With Layout) */}
                <Route element={<OwnerLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<OwnerDashboard />} />
                  <Route path="/profile" element={<ProfileEdit />} />
                  <Route path="/subscription" element={<OwnerSubscription />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/batches" element={<Batches />} />
                  <Route path="/expenses" element={<Expenses />} />

                  {/* Invoice Feature */}
                  <Route path="/invoices" element={<InvoiceListPage />} />
                  <Route path="/invoices/new" element={<InvoiceCreatePage />} />
                  <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />

                  <Route path="/intelligence" element={<AnalyticsDashboard />} />
                  <Route path="/settings" element={<Placeholder title="Settings" />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer position="bottom-right" autoClose={3000} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
