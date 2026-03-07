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
    CreditCard as CreditCardIcon
} from '@mui/icons-material';
import AssignSubscriptionModal from '../../../pages/admin/AssignSubscriptionModal';

const AdminSidebar = () => {
    const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false);

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
        { name: 'Subscription Plans', path: '/admin/plans', icon: <PlansIcon sx={{ fontSize: 20 }} />, badge: 3 },
        { name: 'Businesses', path: '/admin/businesses', icon: <BusinessIcon sx={{ fontSize: 20 }} /> },
        { name: 'Usage Logs', path: '/admin/usage-logs', icon: <HistoryIcon sx={{ fontSize: 20 }} /> },
        { name: 'AI Analytics', path: '/admin/ai-usage', icon: <AIUsageIcon sx={{ fontSize: 20 }} /> },
        { name: 'Settings', path: '/admin/settings', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
    ];

    return (
        <aside className="w-64 bg-[#0c0d10] border-r border-white/5 text-slate-400 min-h-screen flex flex-col font-sans transition-all duration-300">
            {/* Logo Section */}
            <div className="p-8 pb-10 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30 text-white transform hover:rotate-12 transition-transform">
                    <CreditCardIcon />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tight text-white leading-tight">SMART<span className="text-indigo-500">BIZ</span></span>
                </div>
            </div>

            {/* Navigation */}
            <div className="px-6 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4 opacity-70">Overview</p>
                <nav className="space-y-1">
                    {menuItems.slice(0, 1).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                                    ? 'bg-white/5 text-white'
                                    : 'hover:text-white hover:bg-white/5'}
              `}
                        >
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                            <span className="font-bold text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="px-6 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4 opacity-70">Management</p>
                <nav className="space-y-1">
                    {menuItems.slice(1, 4).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                                    ? 'bg-white/5 text-white'
                                    : 'hover:text-white hover:bg-white/5'}
              `}
                        >
                            <div className="flex items-center gap-4">
                                <span className="opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                                <span className="font-bold text-sm text-[13px]">{item.name}</span>
                            </div>
                            {item.badge && (
                                <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="px-6 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4 opacity-70">Insights</p>
                <nav className="space-y-1">
                    {menuItems.slice(4, 5).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                                    ? 'bg-white/5 text-white'
                                    : 'hover:text-white hover:bg-white/5'}
              `}
                        >
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                            <span className="font-bold text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="px-6 mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4 opacity-70">System</p>
                <nav className="space-y-1">
                    {menuItems.slice(5).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                                    ? 'bg-white/5 text-white'
                                    : 'hover:text-white hover:bg-white/5'}
              `}
                        >
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
                            <span className="font-bold text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="mt-auto p-6 space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs">
                            AD
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Super Admin</p>
                            <p className="text-sm font-bold text-white truncate">Admin User</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                    <CreditCardIcon sx={{ fontSize: 16 }} />
                    <span>Provision Plan</span>
                </button>
            </div>

            <AssignSubscriptionModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
            />
        </aside>
    );
};

export default AdminSidebar;
