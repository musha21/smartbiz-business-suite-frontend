import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Logout, Notifications, Search, Settings } from '@mui/icons-material';
import { IconButton, Badge, Tooltip } from '@mui/material';

const Navbar = () => {
    const { logout, business } = useAuth();

    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-6 flex-1">
                <h2 className="text-xl font-bold text-slate-800 hidden md:block">
                    {business?.name || 'SmartBiz Business'}
                </h2>
                <div className="relative max-w-md w-full hidden lg:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search everything..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Tooltip title="Notifications">
                    <IconButton className="bg-slate-100 hover:bg-slate-200 transition-colors p-2.5">
                        <Badge badgeContent={4} color="error">
                            <Notifications className="text-slate-600" />
                        </Badge>
                    </IconButton>
                </Tooltip>

                <Tooltip title="Settings">
                    <IconButton className="bg-slate-100 hover:bg-slate-200 transition-colors p-2.5">
                        <Settings className="text-slate-600" />
                    </IconButton>
                </Tooltip>

                <div className="h-8 w-px bg-slate-200 mx-2" />

                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all active:scale-95 font-semibold text-sm"
                >
                    <Logout fontSize="small" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
