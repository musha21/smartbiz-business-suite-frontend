import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    LocalShipping as LocalShippingIcon,
    Inventory as InventoryIcon,
    BatchPrediction as BatchPredictionIcon,
    AccountBalanceWallet as AccountBalanceWalletIcon,
    Receipt as ReceiptIcon,
    Assessment as AssessmentIcon,
    SmartToy as SmartToyIcon,
    CardMembership as CardMembershipIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';

const Sidebar = () => {
    const { user } = useAuth();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
        { name: 'Customers', path: '/customers', icon: <PeopleIcon /> },
        { name: 'Suppliers', path: '/suppliers', icon: <LocalShippingIcon /> },
        { name: 'Products', path: '/products', icon: <InventoryIcon /> },
        { name: 'Batches', path: '/batches', icon: <BatchPredictionIcon /> },
        { name: 'Expenses', path: '/expenses', icon: <AccountBalanceWalletIcon /> },
        { name: 'Invoices', path: '/invoices', icon: <ReceiptIcon /> },
        { name: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
        { name: 'AI Tools', path: '/ai', icon: <SmartToyIcon /> },
        { name: 'Subscription', path: '/subscription', icon: <CardMembershipIcon /> },
        { name: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    ];

    // Build display name and initials from the logged-in user
    const displayName = user?.username || user?.name || user?.fullName || 'Owner';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join('');

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/50">SB</div>
                <span className="text-xl font-bold tracking-tight">SmartBiz</span>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
            `}
                    >
                        <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <div className="bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold truncate leading-none mb-1">{displayName}</p>
                        <p className="text-xs text-slate-400 truncate">Owner</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
