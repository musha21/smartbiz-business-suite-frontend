import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>
                <footer className="h-14 bg-white border-t border-slate-200 flex items-center justify-center text-xs text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} SmartBiz SaaS Platform. All rights reserved.
                </footer>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </div>
    );
};

export default MainLayout;
