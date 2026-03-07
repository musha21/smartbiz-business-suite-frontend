import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ShieldCheck,
    Zap,
    Calendar,
    ArrowUpCircle,
    Info,
    AlertCircle,
    Server,
    CreditCard
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { CircularProgress, Alert } from '@mui/material';
import { subscriptionService } from '../../api';
import { formatSubscriptionDate } from '../../utils/date';
import PricingCard from '../../components/subscription/PricingCard';

const OwnerSubscription = () => {
    const { isDarkMode } = useTheme();

    // 1. Fetch Available Plans
    const {
        data: plans,
        isLoading: isPlansLoading,
        error: plansError
    } = useQuery({
        queryKey: ['active-plans'],
        queryFn: subscriptionService.fetchActivePlans,
    });

    // 2. Fetch My Current Plan (Owner specific)
    const {
        data: myPlan,
        isLoading: isMyPlanLoading,
        error: myPlanError
    } = useQuery({
        queryKey: ['owner-my-plan'],
        queryFn: subscriptionService.fetchMyPlan,
    });

    const isLoading = isPlansLoading || isMyPlanLoading;
    const error = plansError || myPlanError;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <CircularProgress sx={{ color: '#6366f1' }} />
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] animate-pulse ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Synchronizing subscription data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-20">
                <Alert severity="error" variant="filled" className="rounded-2xl font-bold uppercase tracking-wider text-xs">
                    Failed to load subscription data. Please try again later.
                </Alert>
            </div>
        );
    }

    const availablePlans = Array.isArray(plans) ? plans : (plans?.plans || plans?.data || []);
    const hasActiveSubscription = myPlan?.status === 'ACTIVE' || myPlan?.status === 'EXPIRED';

    return (
        <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
            {/* Header Section */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-2">
                    <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Subscription
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Deployment Tiers & Infrastructure Management</p>
                </div>

                {hasActiveSubscription && (
                    <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${myPlan.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                            {myPlan.planName} Tier: {myPlan.status} {myPlan.expiresAt && `• ${myPlan.status === 'EXPIRED' ? 'Expired' : 'Renews'} ${formatSubscriptionDate(myPlan.expiresAt)}`}
                        </span>
                    </div>
                )}
            </div>

            {/* Plans Grid */}
            <div className="space-y-10">
                <div className="flex items-center gap-4 px-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Available Deployment Plans</h2>
                    <div className={`h-px flex-1 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`} />
                </div>

                {availablePlans.length === 0 ? (
                    <div className={`col-span-full py-32 text-center border-2 border-dashed rounded-[40px] space-y-6 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto ${isDarkMode ? 'bg-white/5 text-slate-800' : 'bg-white text-slate-200 shadow-sm'}`}>
                            <Server size={40} />
                        </div>
                        <div className="space-y-1">
                            <h4 className={`text-xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Plans Found</h4>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>The infrastructure registry is currently empty.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {(() => {
                            // 1. Group plans by ID to handle monthly/yearly variants in one card
                            const groupedPlans = availablePlans.reduce((acc, plan) => {
                                if (!acc[plan.id]) {
                                    acc[plan.id] = { ...plan, variants: [] };
                                }
                                acc[plan.id].variants.push(plan);
                                return acc;
                            }, {});

                            return Object.values(groupedPlans).map((planGroup) => {
                                const isMyPlan = planGroup.id == myPlan?.planId;
                                return (
                                    <PricingCard
                                        key={planGroup.id}
                                        dark={isDarkMode}
                                        plan={planGroup}
                                        variants={planGroup.variants}
                                        isActive={isMyPlan}
                                        activeCycle={isMyPlan ? myPlan.billingCycle : 'MONTHLY'}
                                        status={isMyPlan ? myPlan.status : 'ACTIVE'}
                                        expiresAt={isMyPlan ? myPlan.expiresAt : null}
                                        isOwnerView={true}
                                        actionText={isMyPlan ? "Active Plan" : "Upgrade Restricted"}
                                        onAction={null}
                                    />
                                );
                            });
                        })()}
                    </div>
                )}
            </div>

            {/* Support Section */}
            <div className={`pt-20 border-t flex flex-col md:flex-row items-center justify-between gap-10 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <Info size={24} />
                    </div>
                    <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 leading-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Infrastructure Support</p>
                        <p className={`text-xs font-bold max-w-sm uppercase leading-relaxed tracking-wide ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                            Plan migrations and scale adjustments are managed by the administration team to ensure system stability.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => window.open('mailto:support@smartbiz.io')}
                    className={`flex items-center gap-3 px-8 py-4 border rounded-2xl transition-all font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-indigo-500/50' : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-500/30 shadow-sm'}`}
                >
                    <CreditCard size={18} />
                    <span>Contact Authority</span>
                </button>
            </div>
        </div>
    );
};

export default OwnerSubscription;
