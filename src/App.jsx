import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './routes/ProtectedRoute';

// Owner Pages
import OwnerLayout from './components/layout/owner/MainLayout';
import OwnerDashboard from './pages/owner/Dashboard';
import Customers from './pages/owner/Customers';
import Suppliers from './pages/owner/Suppliers';
import Products from './pages/owner/Products';
import Batches from './pages/owner/Batches';
import Expenses from './pages/owner/Expenses';

// Admin Pages
import AdminLayout from './components/layout/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Businesses from './pages/admin/Businesses';
import AdminPlans from './pages/admin/AdminPlans';
import AdminLogs from './pages/admin/AdminLogs';

// placeholder components for other pages
const Placeholder = ({ title }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <h1 className="text-2xl font-bold text-slate-800 mb-2">{title} Page</h1>
    <p className="text-slate-500 max-w-md">This feature is currently being implemented. Check back shortly for updates!</p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/businesses" element={<Businesses />} />
                <Route path="/admin/usage-logs" element={<AdminLogs />} />
                <Route path="/admin/ai-usage" element={<Placeholder title="Admin AI Analytics" />} />
                <Route path="/admin/plans" element={<AdminPlans />} />
                <Route path="/admin/settings" element={<Placeholder title="Admin Settings" />} />
              </Route>
            </Route>

            {/* Owner Routes */}
            <Route element={<ProtectedRoute allowedRole="OWNER" />}>
              <Route element={<OwnerLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<OwnerDashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/products" element={<Products />} />
                <Route path="/batches" element={<Batches />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/reports" element={<Placeholder title="Reports" />} />
                <Route path="/ai" element={<Placeholder title="AI Tools" />} />
                <Route path="/settings" element={<Placeholder title="Settings" />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
