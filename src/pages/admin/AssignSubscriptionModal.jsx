import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Users,
    Layers,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react';
import { CircularProgress, Alert } from '@mui/material';
import { toast } from 'react-toastify';
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
        enabled: isOpen,
    });

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
            toast.success('Subscription provisioned successfully');
            onClose();
        },
        onError: (err) => {
            const msg = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('inactive')) {
                toast.error("This plan is inactive. Choose an active plan.");
            } else {
                toast.error(msg || 'Provisioning failed');
            }
        }
    });

    const handleAssign = () => {
        if (!selectedBusiness || !selectedPlan) {
            toast.warn('Please select both a business and a plan');
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
            maxWidth="max-w-xl"
            footer={
                <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={onClose}>Abort</Button>
                    <Button
                        onClick={handleAssign}
                        loading={mutation.isLoading}
                        icon={CheckCircle2}
                        disabled={isLoading}
                    >
                        Provision Plan
                    </Button>
                </div>
            }
        >
            <div className="space-y-8">
                <Alert severity="info" className="rounded-2xl border border-indigo-100 bg-indigo-50/50">
                    <div className="flex items-start gap-2">
                        <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-indigo-800 leading-relaxed">
                            Assigning a plan will immediately update the target business's limits and billing cycle. This action is auditable.
                        </p>
                    </div>
                </Alert>

                <div className="space-y-6">
                    {/* Business Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Target Business</label>
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none appearance-none"
                                value={selectedBusiness}
                                onChange={(e) => setSelectedBusiness(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="">Select an active business instance...</option>
                                {businesses?.map(biz => (
                                    <option key={biz.id} value={biz.id}>{biz.name} ({biz.ownerEmail || biz.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Plan Selection */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Assigned Tier</label>
                            <div className="relative">
                                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <select
                                    className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none appearance-none"
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    disabled={isLoading}
                                >
                                    <option value="">Select service tier...</option>
                                    {plans?.filter(p => p.status === 'ACTIVE' || (p.status === undefined && p.active))?.map(plan => (
                                        <option key={plan.id} value={plan.id}>{plan.name} — LKR {(plan.monthlyPrice || plan.price)?.toLocaleString()}/mo</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Duration Selection */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Billing Cycle</label>
                                <div className="relative">
                                    <select
                                        className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none appearance-none"
                                        value={selectedCycle}
                                        onChange={(e) => setSelectedCycle(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="YEARLY">Yearly</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Duration Count</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full h-14 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                                        value={durationCount}
                                        onChange={(e) => setDurationCount(parseInt(e.target.value) || 1)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center gap-3 py-4">
                        <CircularProgress size={20} />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Synchronizing directory...</span>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AssignSubscriptionModal;
