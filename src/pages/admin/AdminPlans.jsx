import React from 'react';
import {
    Plus,
    Layers,
    Check,
    Edit,
    Trash2,
    Users,
    Zap,
    Scale
} from 'lucide-react';
import {
    IconButton,
    Tooltip,
    Switch,
    CircularProgress,
    Alert
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { planService } from '../../api';

const AdminPlans = () => {
    const { data: plans, isLoading, error } = useQuery({
        queryKey: ['plans'],
        queryFn: () => planService.getPlans(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CircularProgress color="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert severity="error">Failed to load subscription plans. Please try again later.</Alert>
            </div>
        );
    }

    const planColors = {
        'Free Starter': 'indigo',
        'Business Pro': 'blue',
        'Enterprise': 'slate',
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Subscription Architecture</h1>
                    <p className="text-slate-500 mt-1">Configure platform tiers, pricing, and feature access.</p>
                </div>
                <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 uppercase text-xs tracking-widest">
                    <Plus size={18} />
                    <span>Create New Tier</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans?.map((plan) => {
                    const color = planColors[plan.name] || 'indigo';
                    return (
                        <div key={plan.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative group hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-2">
                            <div className={`h-2 w-full bg-${color}-500`} />
                            <div className="p-8 pb-0">
                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-14 h-14 bg-${color}-50 rounded-2xl flex items-center justify-center text-${color}-600`}>
                                        <Layers />
                                    </div>
                                    <div className="flex gap-1">
                                        <Tooltip title="Edit Tier">
                                            <IconButton size="small"><Edit size={16} /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Tier">
                                            <IconButton size="small" className="text-rose-500"><Trash2 size={16} /></IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 underline decoration-slate-100 decoration-8 underline-offset-4">{plan.name}</h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(plan.price || 0)}
                                    </span>
                                    <span className="text-slate-400 font-bold ml-1 text-sm">/month</span>
                                </div>
                            </div>

                            <div className="p-8 space-y-4 flex-1">
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <Users size={18} className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-600">{plan.maxUsers || plan.users || 'Unlimited'} Capacity</span>
                                </div>
                                <div className="pt-4 space-y-3">
                                    {(plan.features || []).map((f, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-500">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 pt-0 mt-auto">
                                <div className="h-px bg-slate-100 mb-6" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Inst.</p>
                                        <p className="text-lg font-black text-slate-800">{plan.businesses || 0} Businesses</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visible</span>
                                        <Switch defaultChecked={plan.status === 'Active'} size="small" color="primary" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex items-center justify-between overflow-hidden relative">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6 border border-blue-500/30">
                            <Zap />
                        </div>
                        <h3 className="text-xl font-black mb-2 tracking-tight">Platform Utilization</h3>
                        <p className="text-slate-400 text-sm max-w-xs font-semibold">Tier distribution and revenue per user analytics are ready to view.</p>
                    </div>
                    <div className="w-40 h-40 bg-blue-500/10 rounded-full blur-3xl absolute -right-20 -bottom-20" />
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                            <Scale />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Tax & Compliance</h3>
                        <p className="text-slate-500 text-sm max-w-xs font-semibold">Global VAT/GST and billing rules configuration panel.</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest">Manage Rules</button>
                </div>
            </div>
        </div>
    );
};

export default AdminPlans;
