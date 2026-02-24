import React from 'react';

const UsageProgressBar = ({ label, used, total, unit = 'invoices' }) => {
    const isUnlimited = total === -1;
    const percentage = isUnlimited ? 0 : Math.min(100, (used / total) * 100);

    // Determine color based on usage percentage
    const getColorClass = () => {
        if (isUnlimited) return 'bg-indigo-500';
        if (percentage > 90) return 'bg-rose-500';
        if (percentage > 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getBgColorClass = () => {
        if (isUnlimited) return 'bg-indigo-50';
        if (percentage > 90) return 'bg-rose-50';
        if (percentage > 70) return 'bg-amber-50';
        return 'bg-emerald-50';
    };

    const getTextColorClass = () => {
        if (isUnlimited) return 'text-indigo-600';
        if (percentage > 90) return 'text-rose-600';
        if (percentage > 70) return 'text-amber-600';
        return 'text-emerald-600';
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-xl font-black ${getTextColorClass()}`}>
                            {used.toLocaleString()}
                        </span>
                        <span className="text-slate-400 font-bold text-xs">
                            / {isUnlimited ? '∞' : total.toLocaleString()} {unit}
                        </span>
                    </div>
                </div>
                {!isUnlimited && (
                    <span className={`text-xs font-black uppercase tracking-widest ${getTextColorClass()}`}>
                        {Math.round(percentage)}%
                    </span>
                )}
            </div>

            <div className={`w-full h-3 rounded-full overflow-hidden ${getBgColorClass()}`}>
                <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${getColorClass()}`}
                    style={{ width: `${isUnlimited ? 100 : percentage}%` }}
                />
            </div>

            {!isUnlimited && percentage > 85 && (
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">
                    Approaching limit! Consider upgrading soon.
                </p>
            )}
        </div>
    );
};

export default UsageProgressBar;
