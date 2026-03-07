import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Settings2,
    Edit3,
    Trash2,
    Layers,
    Filter,
    Search,
    AlertCircle,
    Power,
    ChevronRight as ArrowIcon
} from 'lucide-react';
import {
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Tooltip
} from '@mui/material';
import { subscriptionService } from '../../api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import PlanLimitsModal from './PlanLimitsModal';
import AssignSubscriptionModal from './AssignSubscriptionModal';

const AdminPlans = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

    // Fetch Plans
    const { data: plans, isLoading, error } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: subscriptionService.fetchAllPlans,
    });

    // Create/Update Plan Mutation
    const planMutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                ...data,
                status: data.active ? 'ACTIVE' : 'INACTIVE'
            };
            if (selectedPlan) {
                return subscriptionService.updatePlan(selectedPlan.id, payload);
            }
            return subscriptionService.createPlan(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-plans']);
            setIsPlanModalOpen(false);
            setSelectedPlan(null);
        },
        onError: (err) => {
            // Error handled globally
        }
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => subscriptionService.updatePlanStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['admin-plans']);
            setIsConfirmModalOpen(false);
            setPendingStatusUpdate(null);
        },
        onError: (err) => {
            // Error handled globally
        }
    });

    const handleToggleStatus = (plan) => {
        const newStatus = (plan.status || (plan.active ? 'ACTIVE' : 'INACTIVE')) === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setPendingStatusUpdate({ id: plan.id, status: newStatus });
        setIsConfirmModalOpen(true);
    };

    const confirmStatusUpdate = () => {
        if (pendingStatusUpdate) {
            statusMutation.mutate(pendingStatusUpdate);
        }
    };

    const filteredPlans = plans?.filter(plan => {
        const matchesSearch = plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plan.code?.toLowerCase().includes(searchTerm.toLowerCase());

        const effectiveStatus = plan.status || (plan.active ? 'ACTIVE' : 'INACTIVE');
        const matchesStatus = statusFilter === 'ALL' || effectiveStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CircularProgress sx={{ color: '#6366f1' }} />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none bg-gradient-to-br from-white via-indigo-300 to-indigo-600 bg-clip-text text-transparent">
                            Subscription Plans
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Manage global billing tiers and service level agreements</p>
                    </div>
                    <button
                        onClick={() => {
                            setSelectedPlan(null);
                            setIsPlanModalOpen(true);
                        }}
                        className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Create New Plan</span>
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by plan name or system code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-[#15161c] border border-white/5 rounded-[20px] text-sm font-bold text-white placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500/50 focus:bg-[#1a1b24] transition-all"
                        />
                    </div>
                    <div className="lg:col-span-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-6 py-4 bg-[#15161c] border border-white/5 rounded-[20px] text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer hover:bg-[#1a1b24] hover:text-white transition-all appearance-none"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active Only</option>
                            <option value="INACTIVE">Inactive Only</option>
                        </select>
                    </div>
                </div>

                {/* Plans Table */}
                <div className="bg-[#15161c] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                    <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', borderRadius: 0 }}>
                        <Table>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        '& th': {
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            py: 4,
                                            color: '#ffffff',
                                            fontWeight: 900,
                                            fontSize: '10px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.2em'
                                        }
                                    }}
                                >
                                    <TableCell>Plan Identity</TableCell>
                                    <TableCell>Pricing structure</TableCell>
                                    <TableCell>Deployment status</TableCell>
                                    <TableCell align="right">Orchestration</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPlans?.map((plan) => {
                                    const isActive = (plan.status || (plan.active ? 'ACTIVE' : 'INACTIVE')) === 'ACTIVE';
                                    return (
                                        <TableRow
                                            key={plan.id}
                                            sx={{
                                                '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', py: 4 },
                                                '&:last-child td': { borderBottom: 0 },
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' }
                                            }}
                                            className="group transition-colors"
                                        >
                                            <TableCell className="px-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                        {plan.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white text-lg tracking-tight">{plan.name}</p>
                                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{plan.code}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-10">
                                                <div className="flex flex-col">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-xl font-black text-white">LKR {plan.monthlyPrice?.toLocaleString()}</span>
                                                        <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">/ Periodic</span>
                                                    </div>
                                                    {plan.yearlyPrice > 0 && (
                                                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-0.5 opacity-70">
                                                            LKR {plan.yearlyPrice?.toLocaleString()} / Annual Subscription
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-10">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isActive
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                    {isActive ? 'Live' : 'On-Hold'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-10 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                    <Tooltip title={isActive ? 'Deactivate Node' : 'Activate Node'}>
                                                        <button
                                                            onClick={() => handleToggleStatus(plan)}
                                                            className={`p-2.5 rounded-[14px] transition-all ${isActive
                                                                ? 'text-rose-400 bg-rose-400/10 hover:bg-rose-400 hover:text-white'
                                                                : 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400 hover:text-white'
                                                                }`}
                                                        >
                                                            <Power size={18} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip title="Infrastructure Limits">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPlan(plan);
                                                                setIsLimitsModalOpen(true);
                                                            }}
                                                            className="p-2.5 rounded-[14px] bg-white/5 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                                                        >
                                                            <Settings2 size={18} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip title="Provision to Entity">
                                                        <button
                                                            onClick={() => {
                                                                if (!isActive) {
                                                                    return;
                                                                }
                                                                setSelectedPlan(plan);
                                                                setIsAssignModalOpen(true);
                                                            }}
                                                            className={`p-2.5 rounded-[14px] transition-all ${isActive
                                                                ? 'bg-white/5 text-slate-400 hover:bg-emerald-600 hover:text-white'
                                                                : 'bg-white/[0.02] text-slate-700 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            <Plus size={18} />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip title="Configure Core">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPlan(plan);
                                                                setIsPlanModalOpen(true);
                                                            }}
                                                            className="p-2.5 rounded-[14px] bg-white/5 text-slate-400 hover:bg-white hover:text-black transition-all"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>

            {/* Plan Edit Modal */}
            {isPlanModalOpen && (
                <PlanFormAction
                    plan={selectedPlan}
                    onClose={() => setIsPlanModalOpen(false)}
                    onSave={(data) => planMutation.mutate(data)}
                    isLoading={planMutation.isPending}
                />
            )}

            {/* Plan Limits Modal */}
            <PlanLimitsModal
                isOpen={isLimitsModalOpen}
                onClose={() => setIsLimitsModalOpen(false)}
                plan={selectedPlan}
            />

            {/* Assign Subscription Modal */}
            <AssignSubscriptionModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
            />

            {/* Confirm Status Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Status Override"
                dark
                onSubmit={confirmStatusUpdate}
                footer={
                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                            onClick={() => setIsConfirmModalOpen(false)}
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${pendingStatusUpdate?.status === 'INACTIVE'
                                ? 'bg-rose-600 text-white hover:bg-rose-500'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                            disabled={statusMutation.isPending}
                        >
                            {statusMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Power size={14} />}
                            {pendingStatusUpdate?.status === 'ACTIVE' ? 'Complete Activation' : 'Execute Deactivation'}
                        </button>
                    </div>
                }
            >
                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-2xl ${pendingStatusUpdate?.status === 'INACTIVE'
                        ? 'bg-rose-500/10 text-rose-500 shadow-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20'
                        }`}>
                        <Power size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">Authorize Status Shift?</h3>
                    <p className="text-slate-500 font-bold text-sm max-w-xs mx-auto leading-relaxed">
                        {pendingStatusUpdate?.status === 'INACTIVE'
                            ? "Deactivating this tier will prevent new business assignments. Existing nodes remain unaffected."
                            : "Activating this tier will immediately enable it for global infrastructure provisioning."
                        }
                    </p>
                </div>
            </Modal>
        </>
    );
};

// Internal Form Component
const PlanFormAction = ({ plan, onClose, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        name: plan?.name || '',
        code: plan?.code || '',
        description: plan?.description || '',
        monthlyPrice: plan?.monthlyPrice || 0,
        yearlyPrice: plan?.yearlyPrice || 0,
        active: plan?.active !== undefined ? plan.active : true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={plan ? 'Modify Infrastructure Root' : 'Provision Logic Tier'}
            dark
            onSubmit={handleSubmit}
            footer={
                <div className="flex gap-4 justify-end">
                    <button
                        type="button"
                        className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 flex items-center gap-2"
                    >
                        {isLoading && <CircularProgress size={16} color="inherit" />}
                        {plan ? 'Snapshot Update' : 'Initialize Plan'}
                    </button>
                </div>
            }
        >
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Tier Identifier</label>
                        <input
                            placeholder="e.g. Pro Business"
                            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">System Kernel Code</label>
                        <input
                            placeholder="e.g. BUSINESS_PRO"
                            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Manifest Description</label>
                    <textarea
                        rows={3}
                        placeholder="Detailed service level agreement..."
                        className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Monthly Overhead (LKR)</label>
                        <input
                            type="number"
                            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            value={formData.monthlyPrice}
                            onChange={e => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Annual Commitment (LKR)</label>
                        <input
                            type="number"
                            className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white placeholder:text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            value={formData.yearlyPrice}
                            onChange={e => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                <div
                    className="flex items-center gap-4 bg-white/[0.03] p-6 rounded-2xl border border-white/5 cursor-pointer group hover:bg-white/[0.05] transition-all"
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                >
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.active ? 'bg-indigo-600 border-indigo-600' : 'border-white/10 group-hover:border-white/20'}`}>
                        {formData.active && <Plus size={16} className="text-white" />}
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                        Mark Component as Operational
                    </span>
                </div>
            </div>
        </Modal>
    );
};

export default AdminPlans;
