import React from 'react';

const Badge = ({ children, variant = 'default', className = '', dark = false }) => {
    const variants = {
        default: dark ? 'bg-white/5 text-slate-400 border-white/5' : 'bg-slate-100 text-slate-600',
        success: dark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning: dark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200',
        danger: dark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border border-rose-200',
        info: dark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200',
        purple: dark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-violet-50 text-violet-700 border border-violet-200',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-widest border transition-all ${variants[variant] || variants.default} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
