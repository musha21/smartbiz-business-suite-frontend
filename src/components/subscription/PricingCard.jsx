import React from 'react';
import { Check, Shield, Star, Rocket, Contact } from 'lucide-react';
import Button from '../ui/Button';

const PricingCard = ({
    plan,
    isActive = false,
    onAction,
    actionText = 'Select Plan',
    isOwnerView = false
}) => {
    // Determine icon based on plan name or tier
    const getIcon = () => {
        const name = (plan?.name || '').toLowerCase();
        if (name.includes('starter') || name.includes('basic')) return <Shield className="text-blue-500" size={24} />;
        if (name.includes('pro') || name.includes('business')) return <Star className="text-indigo-500" size={24} />;
        if (name.includes('enterprise') || name.includes('unlimit')) return <Rocket className="text-purple-500" size={24} />;
        return <Shield className="text-slate-500" size={24} />;
    };

    const limits = plan?.limits || [];

    return (
        <div className={`relative bg-white rounded-[32px] border-2 transition-all duration-300 p-8 flex flex-col h-full ${isActive
            ? 'border-indigo-600 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50'
            : 'border-slate-100 hover:border-slate-200 hover:shadow-lg'
            }`}>
            {isActive && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Current Plan
                </div>
            )}

            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? 'bg-indigo-50' : 'bg-slate-50'
                    }`}>
                    {getIcon()}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{plan?.name}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{plan?.code}</p>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 leading-none">
                        LKR {(plan?.monthlyPrice ?? plan?.price ?? 0).toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-bold text-sm">/mo</span>
                </div>
                <p className="text-slate-500 text-sm mt-3 font-medium">
                    {plan?.description || 'Upgrade your business infrastructure with advanced tools and higher limits.'}
                </p>
                {(plan?.yearlyPrice > 0) && (
                    <div className="mt-3 inline-block bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        Billed yearly: LKR {plan?.yearlyPrice?.toLocaleString()}
                    </div>
                )}
            </div>

            <div className="space-y-4 mb-10 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Included Limits</p>
                {(plan?.limits && (Array.isArray(plan.limits) ? plan.limits.length > 0 : Object.keys(plan.limits).length > 0)) ? (
                    (Array.isArray(plan.limits) ? plan.limits : Object.entries(plan.limits).map(([k, v]) => ({ limitKey: k, limitValue: v }))).map((limit, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                            <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="text-slate-700 font-bold">{(limit?.limitKey || limit?.key || '').replace(/_/g, ' ')}:</span>
                            <span className="text-slate-900 font-black ml-auto">
                                {limit?.limitValue === -1 ? 'Unlimited' : (limit?.limitValue ?? 0).toLocaleString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-400 text-xs italic">No specific limits defined for this plan.</p>
                )}
            </div>

            <Button
                variant={isActive ? 'outline' : 'primary'}
                disabled={isActive}
                onClick={() => onAction && onAction(plan)}
                className="w-full h-14 rounded-2xl group"
                icon={isActive ? null : (isOwnerView ? Contact : null)}
            >
                {isActive ? 'Active Plan' : actionText}
            </Button>
        </div>
    );
};

export default PricingCard;
