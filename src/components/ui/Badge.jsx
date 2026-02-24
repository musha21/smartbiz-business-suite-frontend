import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-slate-100 text-slate-600',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border border-amber-200',
        danger: 'bg-rose-50 text-rose-700 border border-rose-200',
        info: 'bg-blue-50 text-blue-700 border border-blue-200',
        purple: 'bg-violet-50 text-violet-700 border border-violet-200',
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${variants[variant] || variants.default} ${className}`}
        >
            {children}
        </span>
    );
};

export default Badge;
