import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import {
    LayoutDashboard,
    Users,
    Truck,
    Package,
    Layers,
    CreditCard,
    FileText,
    Crown,
    ChevronRight,
    LogOut,
    Sparkles,
    Activity
} from 'lucide-react';

const Sidebar = () => {
    const { user, profile, logout, completionPercentage } = useAuth();
    const { isDarkMode } = useTheme();
    const location = useLocation();

    const sections = [
        {
            title: 'Management',
            items: [
                { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
                { name: 'Inventory', path: '/products', icon: Package },
                { name: 'Batches', path: '/batches', icon: Layers },
            ]
        },
        {
            title: 'Relations',
            items: [
                { name: 'Customers', path: '/customers', icon: Users },
                { name: 'Suppliers', path: '/suppliers', icon: Truck },
            ]
        },
        {
            title: 'Financials',
            items: [
                { name: 'Expenses', path: '/expenses', icon: CreditCard },
                { name: 'Invoices', path: '/invoices', icon: FileText },
            ]
        },
        {
            title: 'Intelligence',
            items: [
                { name: 'AI Intelligence', path: '/intelligence', icon: Sparkles },
                { name: 'Usage & Limits', path: '/usage', icon: Activity },
                { name: 'Subscription', path: '/subscription', icon: Crown },
            ]
        }
    ];

    const displayName = user?.username || user?.name || user?.fullName || 'Owner';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join('');

    return (
        <aside className={`w-72 border-r flex flex-col font-sans ${isDarkMode ? 'bg-[#0c0d10] border-white/5 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
            {/* Logo Section */}
            <div className="p-10 mb-2">
                <Link to="/profile" className="flex items-center gap-4 group cursor-pointer transition-all hover:opacity-80">
                    {profile?.logo ? (
                        <div className="w-14 h-14 rounded-[20px] overflow-hidden border border-white/10">
                            <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center font-black text-white text-2xl shadow-indigo-600/20 group-hover:bg-indigo-500 transition-colors">
                            {profile?.businessName?.[0] || 'SB'}
                        </div>
                    )}
                    <div>
                        <h1 className={`text-2xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {profile?.businessName || 'SmartBiz'}
                        </h1>
                        <p className={`text-[9px] font-black uppercase tracking-[0.3em] mt-1.5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Business Intelligence</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto px-6 pb-10">
                {sections.map((section, idx) => (
                    <div key={idx} className="mb-10 last:mb-0">
                        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 mb-6 opacity-60">
                            {section.title}
                        </p>
                        <nav className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => `
                                            flex items-center justify-between px-4 py-3.5 rounded-[18px] group
                                            ${isActive
                                                ? (isDarkMode ? 'bg-white/5 text-white' : 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-200/50')
                                                : (isDarkMode ? 'hover:bg-white/[0.02] hover:text-slate-300' : 'hover:bg-slate-50 hover:text-slate-900')}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon
                                                size={18}
                                                className={`${isActive ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-300'}`}
                                            />
                                            <span className={`text-[13px] font-black uppercase tracking-wide ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                                                {item.name}
                                            </span>
                                        </div>
                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                        )}
                                        {!isActive && (
                                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-40" />
                                        )}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                ))}
                {/* Profile Completion Banner */}
                {completionPercentage < 100 && (
                    <div className={`mt-6 p-4 rounded-[22px] border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Profile Progress</span>
                            <span className="text-[10px] font-black text-indigo-500">{completionPercentage}%</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full ${isDarkMode ? 'bg-white/5' : 'bg-white'}`}>
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                        <p className={`text-[9px] font-bold mt-3 leading-tight ${isDarkMode ? 'text-slate-500' : 'text-indigo-400'}`}>
                            Complete your profile to unlock full AI potential.
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom Section */}
            <div className="p-6 mt-auto">
                <div className={`border p-4 rounded-[28px] group ${isDarkMode ? 'bg-[#15161c] border-white/5 hover:bg-[#1a1b24]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-indigo-600/10 shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className={`text-xs font-black uppercase tracking-tight truncate leading-none mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{displayName}</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest leading-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Business Owner</p>
                        </div>
                        <button
                            onClick={logout}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:bg-rose-500 hover:text-white group-hover:shadow-rose-600/20' : 'bg-white border-slate-200 text-slate-400 hover:bg-rose-500 hover:text-white shadow-slate-200'}`}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
