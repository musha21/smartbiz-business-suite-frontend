import React from 'react';

const UsageProgressBar = ({ label, used, total, unit = 'invoices', dark = false }) => {
    const isUnlimited = total === -1;
    const percentage = isUnlimited ? 0 : Math.min(100, (used / total) * 100);

    // Determine color based on usage percentage
    const getColorClass = () => {
        if (isUnlimited) return 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]';
        if (percentage > 90) return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]';
        if (percentage > 70) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
        return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    };

    const getBgColorClass = () => {
        if (dark) return 'bg-white/5';
        if (isUnlimited) return 'bg-indigo-50';
        if (percentage > 90) return 'bg-rose-50';
        if (percentage > 70) return 'bg-amber-50';
        return 'bg-emerald-50';
    };

    const getTextColorClass = () => {
        if (isUnlimited) return 'text-indigo-400';
        if (percentage > 90) return 'text-rose-400';
        if (percentage > 70) return 'text-amber-400';
        return 'text-emerald-400';
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>{label}</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className={`text-2xl font-black italic tracking-tighter ${dark ? getTextColorClass() : 'text-slate-900'}`}>
                            {used?.toLocaleString() ?? '0'}
                        </span>
                        <span className={`font-black text-[10px] uppercase tracking-widest ${dark ? 'text-slate-700' : 'text-slate-400'}`}>
                            / {isUnlimited ? '∞' : (total?.toLocaleString() ?? '0')} {unit}
                        </span>
                    </div>
                </div>
                {!isUnlimited && (
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getTextColorClass()}`}>
                        {Math.round(percentage)}% USED
                    </span>
                )}
            </div>

            <div className={`w-full h-2 rounded-full overflow-hidden ${getBgColorClass()}`}>
                <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${getColorClass()}`}
                    style={{ width: `${isUnlimited ? 100 : percentage}%` }}
                />
            </div>

            {!isUnlimited && percentage > 85 && (
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                    Warning: High usage — Upgrade recommended
                </p>
            )}
        </div>
    );
};

export default UsageProgressBar;
