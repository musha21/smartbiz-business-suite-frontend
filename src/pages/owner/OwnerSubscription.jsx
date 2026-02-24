import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    ShieldCheck,
    Zap,
    Calendar,
    ArrowUpCircle,
    Info,
    AlertCircle,
    LayoutDashboard
} from 'lucide-react';
import { CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../api';
import UsageProgressBar from '../../components/subscription/UsageProgressBar';
import PricingCard from '../../components/subscription/PricingCard';
import Button from '../../components/ui/Button';

const OwnerSubscription = () => {
    const { business } = useAuth();

    // 1. Fetch My Subscription
    const { data: mySub, isLoading: isSubLoading, error: subError } = useQuery({
        queryKey: ['my-subscription', business?.id],
        queryFn: () => subscriptionService.fetchMySubscription(business?.id),
        enabled: !!business?.id,
    });

    // 2. Fetch Available Plans
    const { data: plans, isLoading: isPlansLoading, error: plansError } = useQuery({
        queryKey: ['active-plans'],
        queryFn: subscriptionService.fetchActivePlans,
    });

    const isLoading = isSubLoading || isPlansLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CircularProgress color="primary" />
            </div>
        );
    }

    if (subError || plansError) {
        return (
            <div className="p-8">
                <Alert severity="error">
                    {subError?.response?.data?.message || plansError?.response?.data?.message || 'Infrastructure synchronization failed. Please refresh or contact support.'}
                </Alert>
            </div>
        );
    }

    const isActive = mySub?.status === 'ACTIVE';

    return (
        <div className="max-w-7xl mx-auto space-y-16 py-12 px-4 animate-in fade-in duration-700">
            {/* Debug info - hidden but useful for troubleshooting */}
            {plans && plans.length > 0 && false && (
                <pre className="hidden">{JSON.stringify(plans, null, 2)}</pre>
            )}
            {/* Minimalist Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        System Status: {isActive ? 'Live & Active' : 'Access Restricted'}
                    </span>
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">Infrastructure Tiers</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
                    Managing Service Level Agreements for <span className="text-indigo-600">{business?.name}</span>
                </p>
            </div>

            {/* Plans Grid - THE PRIMARY CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {(() => {
                    const availablePlans = Array.isArray(plans) ? plans : (plans?.plans || plans?.data || []);

                    // 1. Identify current plan from subscription
                    const currentPlan = mySub?.plan;

                    // 2. Create a unified list ensuring current plan is present
                    let allDisplayPlans = [...availablePlans];

                    if (currentPlan && !allDisplayPlans.find(p => p.id === currentPlan.id)) {
                        allDisplayPlans.unshift(currentPlan);
                    }

                    return allDisplayPlans.map((plan) => (
                        <PricingCard
                            key={plan.id}
                            plan={plan}
                            isActive={mySub?.planId === plan.id || mySub?.plan?.id === plan.id}
                            isOwnerView={true}
                            actionText="Request Resource Upgrade"
                            onAction={() => window.open(`mailto:support@smartbiz.io?subject=Infrastructure Upgrade Request: ${plan.name} (Business ID: ${business?.id})`)}
                        />
                    ));
                })()}

                {(!plans || (Array.isArray(plans) && plans.length === 0) || (plans && !Array.isArray(plans) && !(plans?.plans) && !(plans?.data))) && !mySub?.plan && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                        <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                        <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Alternative Infrastructure Tiers Available</h4>
                    </div>
                )}
            </div>

            {/* Support/Faq Minimal Footer */}
            <div className="pt-20 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Info size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-500 max-w-sm">
                        Enterprise resources are provisioned dynamically. For custom SLAs beyond the listed tiers, please contact your account manager.
                    </p>
                </div>
                <button
                    onClick={() => window.open('mailto:support@smartbiz.io')}
                    className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                >
                    Enterprise Support Protocol →
                </button>
            </div>
        </div>
    );
};

export default OwnerSubscription;
