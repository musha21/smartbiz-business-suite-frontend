import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './AdminSidebar';
import Navbar from './AdminNavbar';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-[#0c0d10] font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0c0d10]">
                    <div className="w-full mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <Outlet />
                    </div>
                </main>
               
            </div>
        </div>
    );
};

export default AdminLayout;
