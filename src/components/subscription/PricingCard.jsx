import { Check, Shield, Star, Rocket, Contact, Zap, Calendar, AlertCircle } from 'lucide-react';
import { formatSubscriptionDate } from '../../utils/date';
import Button from '../ui/Button';
import { useState, useEffect } from 'react';

const PricingCard = ({
    plan,
    variants = [],
    isActive = false,
    activeCycle = 'MONTHLY',
    status = 'ACTIVE',
    expiresAt = null,
    onAction,
    actionText = 'Select Plan',
    isOwnerView = false,
    dark = false
}) => {
    // 1. Manage billing cycle state (init from activeCycle if provided)
    const [selectedCycle, setSelectedCycle] = useState(activeCycle || 'MONTHLY');

    // Sync with activeCycle if it changes
    useEffect(() => {
        if (isActive && activeCycle) {
            setSelectedCycle(activeCycle);
        }
    }, [isActive, activeCycle]);

    // 2. Derive the current displayed plan variant
    const currentVariant = variants.find(v => v.durationType === selectedCycle) || plan;
    const isExpired = status === 'EXPIRED';

    // 3. Fallback for limits (very important for 'missing limits' fix)
    const displayLimits = currentVariant?.limits || plan?.limits || variants[0]?.limits || [];

    const hasYearly = variants.some(v => v.durationType === 'YEARLY');
    const hasMonthly = variants.some(v => v.durationType === 'MONTHLY');

    // Determine icon based on plan name or tier
    const getIcon = () => {
        const name = (plan?.name || '').toLowerCase();
        if (isExpired) return <AlertCircle className="text-rose-500" size={24} />;
        if (name.includes('starter') || name.includes('basic')) return <Shield className={dark ? "text-indigo-400" : "text-blue-500"} size={24} />;
        if (name.includes('pro') || name.includes('business')) return <Star className={dark ? "text-amber-400" : "text-indigo-500"} size={24} />;
        if (name.includes('enterprise') || name.includes('unlimit')) return <Rocket className={dark ? "text-rose-400" : "text-purple-500"} size={24} />;
        return <Shield className="text-slate-500" size={24} />;
    };

    if (dark) {
        return (
            <div className={`relative bg-[#15161c] rounded-[40px] border transition-all duration-500 p-10 flex flex-col h-full group ${isActive
                ? isExpired
                    ? 'border-rose-500 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.3)] bg-gradient-to-b from-rose-500/5 to-transparent'
                    : 'border-indigo-500/50 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.3)] bg-gradient-to-b from-indigo-500/5 to-transparent'
                : 'border-white/5 hover:border-indigo-500/30'
                }`}>

                {isActive && (
                    <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg z-10 ${isExpired ? 'bg-rose-600 shadow-rose-600/40' : 'bg-indigo-600 shadow-indigo-600/40'}`}>
                        {isExpired ? 'Expired' : 'Current Plan'}
                    </div>
                )}

                <div className="flex flex-col items-center text-center gap-6 mb-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isActive ? isExpired ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-white/5 border border-white/5'}`}>
                        {getIcon()}
                    </div>
                    <div>
                        <h3 className={`text-3xl font-black italic uppercase tracking-tighter ${isExpired ? 'text-rose-400' : 'text-white'}`}>{plan?.name}</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{currentVariant?.code || plan?.code}</p>
                    </div>

                    {/* Refined Billing Cycle Toggle */}
                    {(hasMonthly && hasYearly) && (
                        <div className="flex p-1.5 bg-white/5 border border-white/5 rounded-2xl">
                            <button
                                onClick={() => setSelectedCycle('MONTHLY')}
                                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCycle === 'MONTHLY' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setSelectedCycle('YEARLY')}
                                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCycle === 'YEARLY' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Yearly
                            </button>
                        </div>
                    )}
                </div>

                {isActive && expiresAt && (
                    <div className={`mb-8 p-5 rounded-3xl border flex items-center gap-4 ${isExpired ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400'}`}>
                        <div className={`p-2 rounded-xl ${isExpired ? 'bg-rose-500/10' : 'bg-indigo-500/10'}`}>
                            <Calendar size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{isExpired ? 'Expired On' : 'Renews On'}</span>
                            <span className="text-sm font-black uppercase tracking-wider">{formatSubscriptionDate(expiresAt)}</span>
                        </div>
                    </div>
                )}

                <div className="mb-10 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-6xl font-black text-white italic tracking-tighter">
                            LKR {(currentVariant?.monthlyPrice ?? currentVariant?.price ?? 0).toLocaleString()}
                        </span>
                        <div className="h-px w-12 bg-white/5 my-2" />
                        <span className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
                            Per {selectedCycle === 'YEARLY' ? 'Yearly' : 'Monthly'} Cycle
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-6 font-bold leading-relaxed uppercase tracking-wide max-w-xs mx-auto">
                        {plan?.description || 'Advanced business infrastructure with high-performance nodes.'}
                    </p>
                </div>

                <div className="space-y-5 mb-12 flex-1 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Deployment Limits</p>
                    </div>

                    {(displayLimits && (Array.isArray(displayLimits) ? displayLimits.length > 0 : Object.keys(displayLimits).length > 0)) ? (
                        (Array.isArray(displayLimits) ? displayLimits : Object.entries(displayLimits).map(([k, v]) => ({ limitKey: k, limitValue: v }))).map((limit, idx) => (
                            <div key={idx} className="flex items-center gap-4 group/item">
                                <div className="w-1 h-1 rounded-full bg-slate-700 group-hover/item:bg-indigo-500 transition-colors" />
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover/item:text-slate-300 transition-colors">{(limit?.limitKey || limit?.key || limit?.name || '').replace(/_/g, ' ')}</span>
                                <span className="text-xs font-black text-white ml-auto italic">
                                    {(limit?.limitValue === -1 || limit?.value === -1) ? 'UNLIMITED' : (limit?.limitValue ?? limit?.value ?? 0).toLocaleString()}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-700 text-[10px] font-black italic uppercase tracking-widest text-center py-4">Standard features included</p>
                    )}
                </div>

                <button
                    disabled={isActive}
                    onClick={() => onAction && onAction(currentVariant)}
                    className={`w-full h-20 rounded-[30px] font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 active:scale-95 ${isActive
                        ? 'bg-white/5 border border-white/10 text-slate-600 cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30'
                        }`}
                >
                    {isActive ? <Shield size={20} /> : (isOwnerView ? <Contact size={20} /> : <Zap size={20} />)}
                    <span>{isActive ? 'Active Plan' : actionText}</span>
                </button>

                <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-[100px] group-hover:bg-indigo-500/10 transition-colors duration-700" />
            </div>
        );
    }

    // Original Light Theme fallback (keeping it similar for consistency)
    return (
        <div className={`relative bg-white rounded-[40px] border transition-all duration-300 p-10 flex flex-col h-full ${isActive
            ? 'border-indigo-600 shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50'
            : 'border-slate-100 hover:border-slate-200 hover:shadow-xl'
            }`}>
            {isActive && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[11px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg ${isExpired ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                    {isExpired ? 'Expired' : 'Current Plan'}
                </div>
            )}

            <div className="flex flex-col items-center text-center gap-5 mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    {getIcon()}
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{plan?.name}</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{currentVariant?.code || plan?.code}</p>
                </div>

                {/* Billing Cycle Toggle */}
                {(hasMonthly && hasYearly) && (
                    <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
                        <button
                            onClick={() => setSelectedCycle('MONTHLY')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedCycle === 'MONTHLY' ? 'bg-white text-indigo-600 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setSelectedCycle('YEARLY')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedCycle === 'YEARLY' ? 'bg-white text-indigo-600 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Yearly
                        </button>
                    </div>
                )}
            </div>

            <div className="mb-10 text-center">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-5xl font-black text-slate-900 leading-none tracking-tighter italic">
                        LKR {(currentVariant?.monthlyPrice ?? currentVariant?.price ?? 0).toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">/ {selectedCycle === 'YEARLY' ? 'Year' : 'Month'}</span>
                </div>
                <p className="text-slate-500 text-sm mt-4 font-medium leading-relaxed">
                    {plan?.description || 'Upgrade your business infrastructure with advanced tools and higher limits.'}
                </p>
            </div>

            <div className="space-y-4 mb-10 flex-1 border-t border-slate-50 pt-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Included Limits</p>
                {(displayLimits && (Array.isArray(displayLimits) ? displayLimits.length > 0 : Object.keys(displayLimits).length > 0)) ? (
                    (Array.isArray(displayLimits) ? displayLimits : Object.entries(displayLimits).map(([k, v]) => ({ limitKey: k, limitValue: v }))).map((limit, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="text-slate-600 font-bold">{(limit?.limitKey || limit?.key || limit?.name || '').replace(/_/g, ' ')}:</span>
                            <span className="text-slate-900 font-black ml-auto italic">
                                {(limit?.limitValue === -1 || limit?.value === -1) ? 'Unlimited' : (limit?.limitValue ?? limit?.value ?? 0).toLocaleString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-400 text-xs italic text-center py-4">No specific limits defined for this plan.</p>
                )}
            </div>

            {isActive && expiresAt && (
                <div className={`mb-8 p-5 rounded-3xl border flex items-center gap-4 ${isExpired ? 'bg-rose-50/50 border-rose-100 text-rose-600' : 'bg-indigo-50/50 border-indigo-100 text-indigo-600'}`}>
                    <div className={`p-2 rounded-xl ${isExpired ? 'bg-rose-100' : 'bg-indigo-100'}`}>
                        <Calendar size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 leading-none mb-1">{isExpired ? 'Expired On' : 'Renews On'}</span>
                        <span className="text-sm font-black uppercase tracking-wider">{formatSubscriptionDate(expiresAt)}</span>
                    </div>
                </div>
            )}

            <Button
                variant={isActive ? 'outline' : 'primary'}
                disabled={isActive}
                onClick={() => onAction && onAction(currentVariant)}
                className="w-full h-16 rounded-[24px] group text-[11px] font-black uppercase tracking-widest"
                icon={isActive ? null : (isOwnerView ? Contact : null)}
            >
                {isActive ? 'Active Plan' : actionText}
            </Button>
        </div>
    );
};

export default PricingCard;
