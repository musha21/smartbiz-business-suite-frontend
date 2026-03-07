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
        <header className="h-20 bg-[#0c0d10] border-b border-white/5 px-10 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-10 flex-1">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">
                    Platform Control
                </h2>
                <div className="relative max-w-md w-full hidden xl:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors sx={{ fontSize: 18 }}" />
                    <input
                        type="text"
                        placeholder="Search system resources..."
                        className="w-full pl-11 pr-6 py-2.5 bg-white/5 border border-white/5 rounded-xl text-sm font-medium focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/10 transition-all outline-none text-slate-300 placeholder:text-slate-600"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden lg:flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    System Healthy
                </div>

                <div className="flex items-center gap-2">
                    <Tooltip title="Global View">
                        <IconButton size="small" sx={{ color: '#475569', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                            <Language sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Notifications">
                        <IconButton size="small" sx={{ color: '#475569', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                            <Badge
                                badgeContent={12}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        bgcolor: '#f59e0b',
                                        color: '#000',
                                        fontSize: '10px',
                                        fontWeight: 900,
                                        minWidth: '16px',
                                        height: '16px'
                                    }
                                }}
                            >
                                <NotificationsActive sx={{ fontSize: 20 }} />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </div>

                <div className="h-8 w-px bg-white/5" />

                <button
                    onClick={logout}
                    className="flex items-center gap-2.5 px-5 py-2.5 bg-white/5 text-slate-400 border border-white/5 rounded-xl hover:bg-white/10 hover:text-white transition-all active:scale-95 font-bold text-[11px] uppercase tracking-widest"
                >
                    <Logout sx={{ fontSize: 16 }} />
                    <span>Exit System</span>
                </button>
            </div>
        </header>
    );
};

export default AdminNavbar;
