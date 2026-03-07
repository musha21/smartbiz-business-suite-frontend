import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '../../../context/ThemeContext';
const MainLayout = () => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`flex min-h-screen font-sans ${isDarkMode ? 'bg-[#0c0d10] text-[#e2e8f0]' : 'bg-slate-50 text-slate-900'}`}>
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className={`flex-1 p-8 ${isDarkMode ? 'bg-[#0c0d10]' : 'bg-slate-50'}`}>
                    <div className="w-full mx-auto">
                        <Outlet />
                    </div>
                </main>

                
            </div>
        </div>
    );
};

export default MainLayout;
