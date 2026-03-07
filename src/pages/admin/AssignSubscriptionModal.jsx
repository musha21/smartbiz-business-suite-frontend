import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users,
    Layers,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Info,
    ArrowRight
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { subscriptionService, businessService } from '../../api';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const AssignSubscriptionModal = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('');
    const [selectedCycle, setSelectedCycle] = useState('MONTHLY');
    const [durationCount, setDurationCount] = useState(1);

    // Fetch Businesses
    const { data: rawBusinesses, isLoading: bizLoading } = useQuery({
        queryKey: ['admin-businesses-simple'],
        queryFn: () => businessService.getBusinesses({ limit: 100 }),
    });

    // Fetch Selected Business Current Subscription
    const { data: businessDetails, isLoading: detailsLoading } = useQuery({
        queryKey: ['admin-business-details', selectedBusiness],
        queryFn: () => businessService.getBusinessById(selectedBusiness),
        enabled: !!selectedBusiness && isOpen,
    });

    const activeSub = businessDetails?.data?.subscription || businessDetails?.subscription;

    const businesses = (Array.isArray(rawBusinesses?.data) ? rawBusinesses.data : (Array.isArray(rawBusinesses) ? rawBusinesses : []))
        .filter(biz => {
            const val = biz.active !== undefined ? biz.active : biz.status;
            return (val === 'Active' || val === 'active' || val === true);
        });

    // Fetch Plans
    const { data: plans, isLoading: plansLoading } = useQuery({
        queryKey: ['admin-plans-simple'],
        queryFn: subscriptionService.fetchAllPlans,
        enabled: isOpen,
    });

    const mutation = useMutation({
        mutationFn: (payload) => subscriptionService.assignSubscription(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-businesses']);
            onClose();
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const handleAssign = () => {
        if (!selectedBusiness || !selectedPlan) {
            return;
        }

        mutation.mutate({
            businessId: parseInt(selectedBusiness),
            planId: parseInt(selectedPlan),
            billingCycle: selectedCycle,
            durationCount: durationCount,
            durationUnit: selectedCycle === 'MONTHLY' ? 'MONTHS' : 'YEARS'
        });
    };

    const isLoading = bizLoading || plansLoading;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Provision Infrastructure Access"
            dark
            onSubmit={handleAssign}
            footer={
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        onClick={onClose}
                    >
                        Abort
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || mutation.isPending}
                        className="px-10 py-4 bg-indigo-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3"
                    >
                        {mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Layers size={18} />}
                        <span>{activeSub ? 'Switch Deployment Tier' : 'Provision Plan'}</span>
                    </button>
                </div>
            }
        >
            <div className="space-y-10">
                <div className="bg-white/[0.03] border border-white/5 rounded-[24px] p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Info size={20} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
                        Assigning a tier will immediately update the target business's operational limits and billing cycle. This action is <span className="text-white underline underline-offset-4 decoration-indigo-500/50">permanent and logged</span> for audit.
                    </p>
                </div>

                {activeSub && (
                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[24px] p-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                            <Layers size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">Current Active Tier</p>
                            <p className="text-sm font-black text-white uppercase italic tracking-tight">
                                {activeSub.planName || activeSub.plan?.name || 'Standard Tier'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Status: <span className="text-emerald-500">{activeSub.status}</span> • Renews: {activeSub.expiresAt || 'Infinite'}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                            <AlertCircle size={12} className="text-rose-400" />
                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Switching will Override</span>
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {/* Business Selection */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Active Target Business Deployment</label>
                        <div className="relative group">
                            <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <select
                                className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none appearance-none cursor-pointer"
                                value={selectedBusiness}
                                onChange={(e) => setSelectedBusiness(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="" className="bg-[#15161c]">Select an active business instance...</option>
                                {businesses?.map(biz => (
                                    <option key={biz.id} value={biz.id} className="bg-[#15161c]">
                                        {biz.name} — Node ID: {biz.id} ({biz.ownerEmail || biz.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Plan Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Assign Service Tier</label>
                            <div className="relative group">
                                <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <select
                                    className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none appearance-none cursor-pointer"
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="" className="bg-[#15161c]">Select service tier...</option>
                                    {plans?.filter(p => p.status === 'ACTIVE' || (p.status === undefined && p.active))?.map(plan => (
                                        <option key={plan.id} value={plan.id} className="bg-[#15161c]">
                                            {plan.name} — LKR {(plan.monthlyPrice || plan.price)?.toLocaleString()}/mo
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Duration Selection */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Billing Cycle</label>
                                <select
                                    className="w-full h-16 px-6 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none appearance-none cursor-pointer"
                                    value={selectedCycle}
                                    onChange={(e) => setSelectedCycle(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="MONTHLY" className="bg-[#15161c]">Monthly</option>
                                    <option value="YEARLY" className="bg-[#15161c]">Yearly</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Count</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full h-16 px-6 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white focus:ring-1 focus:ring-indigo-500/50 focus:bg-white/[0.08] transition-all outline-none"
                                    value={durationCount}
                                    onChange={(e) => setDurationCount(parseInt(e.target.value) || 1)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center gap-4 py-6 border-t border-white/5">
                        <CircularProgress size={20} sx={{ color: '#6366f1' }} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Synchronizing global registry...</span>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AssignSubscriptionModal;
