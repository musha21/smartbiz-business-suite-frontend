import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    Search,
    Bell,
    LogOut,
    ShieldCheck,
    Cpu,
    Activity,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { IconButton, Badge, Tooltip } from '@mui/material';

const Navbar = () => {
    const { logout, profile } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className={`h-24 border-b px-12 flex items-center justify-between gap-12 sticky top-0 z-20 ${isDarkMode ? 'bg-[#0c0d10] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            {/* Left Section: Business Identity */}
            <div className="flex items-center gap-10 flex-1">
                <Link to="/profile" className={`hidden lg:flex items-center gap-4 py-2.5 px-6 border rounded-[20px] group transition-all hover:opacity-80 ${isDarkMode ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Activity size={18} />
                    </div>
                    <div>
                        <h2 className={`text-xs font-black uppercase tracking-wider leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {profile?.businessName || 'SmartBiz'}
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Status</span>
                        </div>
                    </div>
                </Link>

                <div className="relative max-w-xl w-full hidden xl:block group">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-600 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Search for customers, products, or invoices..."
                        className={`w-full pl-14 pr-6 py-4 border rounded-[22px] text-sm font-bold outline-none ${isDarkMode ? 'bg-white/5 border-white/5 text-white placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500/30 focus:bg-white/[0.08]' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500/30 focus:bg-white'}`}
                    />
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-6">
                <div className={`hidden md:flex items-center gap-3 pr-6 border-r ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                    <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                        <IconButton
                            onClick={toggleTheme}
                            className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-white/5 text-amber-500 hover:bg-white/10' : 'bg-slate-50 text-indigo-600 hover:bg-slate-100'}`}
                            sx={{
                                border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                                borderRadius: '16px',
                            }}
                        >
                            {isDarkMode
                                ? <Sun size={20} color="#f59e0b" />
                                : <Moon size={20} color="#1f2937" />
                            }
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Notifications">
                        <button className={`w-12 h-12 rounded-2xl border flex items-center justify-center relative ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}>
                            <Bell size={20} />
                            <span className={`absolute top-3.4 right-3.4 w-2 h-2 bg-indigo-500 rounded-full border-2 ${isDarkMode ? 'border-[#0c0d10]' : 'border-white'}`} />
                        </button>
                    </Tooltip>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Status</span>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            <span className={`text-[9px] font-black uppercase tracking-widest italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Secure</span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className={`flex items-center gap-3 px-8 py-3.5 border rounded-[20px] font-black uppercase tracking-widest text-[10px] group ${isDarkMode ? 'bg-[#15161c] border-white/5 text-slate-300 hover:bg-rose-500 hover:text-white hover:border-rose-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-rose-500 hover:text-white hover:border-rose-500'}`}
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header >
    );
};

export default Navbar;
