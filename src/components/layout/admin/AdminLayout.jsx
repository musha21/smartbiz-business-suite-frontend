import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './AdminSidebar';
import Navbar from './AdminNavbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#f8fafc] font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {/* Removed max-w constraint to allow full width as requested */}
                    <div className="w-full mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <Outlet />
                    </div>
                </main>
                <footer className="h-16 bg-white border-t border-slate-100 flex items-center justify-between px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <span>SmartBiz Administration v1.0.0</span>
                    <div className="flex gap-6">
                        <span className="cursor-pointer hover:text-slate-600">Privacy Control</span>
                        <span className="cursor-pointer hover:text-slate-600">Audit Documentation</span>
                    </div>
                </footer>
            </div>
            <ToastContainer position="bottom-right" theme="dark" autoClose={5000} />
        </div>
    );
};

export default AdminLayout;
