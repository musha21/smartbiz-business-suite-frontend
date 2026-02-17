import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
    Logout,
    NotificationsActive,
    Search,
    BugReport,
    Language
} from '@mui/icons-material';
import { IconButton, Badge, Tooltip } from '@mui/material';

const AdminNavbar = () => {
    const { logout } = useAuth();

    return (
        <header className="h-24 bg-white border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-10 flex-1">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Platform Control
                </h2>
                <div className="relative max-w-xl w-full hidden xl:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search businesses, transactions, logs..."
                        className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-slate-700"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    System Status
                </div>

                <Tooltip title="Switch View">
                    <IconButton className="text-slate-400 hover:text-blue-600">
                        <Language />
                    </IconButton>
                </Tooltip>

                <Tooltip title="System Alerts">
                    <IconButton className="text-slate-400 hover:text-blue-600">
                        <Badge badgeContent={12} color="primary" overlap="circular">
                            <NotificationsActive />
                        </Badge>
                    </IconButton>
                </Tooltip>

                <div className="h-10 w-px bg-slate-100 mx-4" />

                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all active:scale-95 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20"
                >
                    <Logout fontSize="small" />
                    <span>Exit System</span>
                </button>
            </div>
        </header>
    );
};

export default AdminNavbar;
