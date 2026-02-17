import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    History as HistoryIcon,
    Psychology as AIUsageIcon,
    Layers as PlansIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

const AdminSidebar = () => {
    const { logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
        { name: 'Businesses', path: '/admin/businesses', icon: <BusinessIcon /> },
        { name: 'Usage Logs', path: '/admin/usage-logs', icon: <HistoryIcon /> },
        { name: 'AI Analytics', path: '/admin/ai-usage', icon: <AIUsageIcon /> },
        { name: 'Subscription Plans', path: '/admin/plans', icon: <PlansIcon /> },
        { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
    ];

    return (
        <aside className="w-64 bg-black text-white min-h-screen flex flex-col shadow-2xl font-sans transition-all duration-300">
            {/* Logo Section */}
            <div className="p-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/40">
                    S
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">SMART<span className="text-blue-500">BIZ</span></span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group
              ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900'}
            `}
                    >
                        {({ isActive }) => (
                            <>
                                <span className={`transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`}>{item.icon}</span>
                                <span className="font-bold text-sm tracking-wide">{item.name}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-6">
                <div className="bg-slate-900/50 p-4 rounded-3xl border border-slate-800 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white truncate">Admin User</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Super Admin</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                    <LogoutIcon fontSize="small" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
