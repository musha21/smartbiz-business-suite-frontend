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
    Power
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
    Chip
} from '@mui/material';
import { toast } from 'react-toastify';
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
            toast.success(`Plan ${selectedPlan ? 'updated' : 'created'} successfully`);
            setIsPlanModalOpen(false);
            setSelectedPlan(null);
        },
        onError: (err) => {
            if (err?.isForbidden) {
                toast.error("Operation Forbidden: Admin access required");
                return;
            }
            toast.error(err.response?.data?.message || 'Operation failed. Check server connectivity.');
        }
    });

    // Status Update Mutation
    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => subscriptionService.updatePlanStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['admin-plans']);
            toast.success(`Plan ${variables.status === 'ACTIVE' ? 'Activated' : 'Deactivated'} successfully`);
            setIsConfirmModalOpen(false);
            setPendingStatusUpdate(null);
        },
        onError: (err) => {
            if (err?.isForbidden) {
                toast.error("Admin access required");
                return;
            }
            toast.error(err.response?.data?.message || 'Status update failed.');
        }
    });

    const handleToggleStatus = (plan) => {
        const newStatus = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        setPendingStatusUpdate({ id: plan.id, status: newStatus });
        setIsConfirmModalOpen(true);
    };

    const confirmStatusUpdate = () => {
        if (pendingStatusUpdate) {
            statusMutation.mutate(pendingStatusUpdate);
        }
    };

    const handleOpenPlanModal = (plan = null) => {
        setSelectedPlan(plan);
        setIsPlanModalOpen(true);
    };

    const handleOpenLimitsModal = (plan) => {
        setSelectedPlan(plan);
        setIsLimitsModalOpen(true);
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
                <CircularProgress color="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert severity="error">Failed to load plans. Please try again later.</Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Subscription Plans</h1>
                    <p className="text-slate-500 mt-1">Manage global billing tiers and service level agreements.</p>
                </div>
                <Button
                    onClick={() => handleOpenPlanModal()}
                    icon={Plus}
                    className="h-14 rounded-2xl px-6 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                >
                    Create New Plan
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by plan name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex items-center justify-center gap-2 border border-slate-200 px-6 py-3.5 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-widest outline-none appearance-none cursor-pointer"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Inactive Only</option>
                </select>
            </div>

            {/* Plans Table */}
            <TableContainer component={Paper} elevation={0} className="border border-slate-100 overflow-hidden shadow-sm" sx={{ borderRadius: '24px' }}>
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5">Plan Detail</TableCell>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5">Pricing</TableCell>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5">Status</TableCell>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5 text-right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredPlans?.map((plan) => (
                            <TableRow key={plan.id} hover className="border-b border-slate-50 last:border-0 transition-colors group">
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                            {plan.name[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">{plan.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{plan.code}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-black text-slate-900">LKR {plan.monthlyPrice?.toLocaleString()}</span>
                                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">/mo</span>
                                        </div>
                                        {plan.yearlyPrice > 0 && (
                                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                                                LKR {plan.yearlyPrice?.toLocaleString()} / yr
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <Chip
                                        label={plan.status || (plan.active ? 'ACTIVE' : 'INACTIVE')}
                                        size="small"
                                        className={`font-black text-[9px] uppercase tracking-widest h-6 ${(plan.status === 'ACTIVE' || (plan.status === undefined && plan.active))
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-rose-50 text-rose-600'
                                            }`}
                                    />
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleToggleStatus(plan)}
                                            className={`p-2.5 rounded-xl transition-colors ${plan.status === 'ACTIVE'
                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                }`}
                                            title={plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenLimitsModal(plan)}
                                            className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                            title="Manage Limits"
                                        >
                                            <Settings2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (plan.status !== 'ACTIVE' && plan.status !== undefined) {
                                                    toast.error("Inactive plans cannot be assigned.");
                                                    return;
                                                }
                                                setSelectedPlan(plan);
                                                setIsAssignModalOpen(true);
                                            }}
                                            className={`p-2.5 rounded-xl transition-colors ${(plan.status === 'ACTIVE' || plan.status === undefined)
                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                                }`}
                                            title="Assign to Business"
                                        >
                                            <Plus size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleOpenPlanModal(plan)}
                                            className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                            title="Edit Plan"
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Plan Edit Modal Implementation */}
            {isPlanModalOpen && (
                <PlanFormAction
                    plan={selectedPlan}
                    onClose={() => setIsPlanModalOpen(false)}
                    onSave={(data) => planMutation.mutate(data)}
                    isLoading={planMutation.isLoading}
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
            {isConfirmModalOpen && (
                <Modal
                    isOpen={true}
                    onClose={() => setIsConfirmModalOpen(false)}
                    title="Change Plan Status"
                    footer={
                        <div className="flex gap-4 justify-end">
                            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
                            <Button
                                variant={pendingStatusUpdate?.status === 'INACTIVE' ? 'dark' : 'primary'}
                                onClick={confirmStatusUpdate}
                                loading={statusMutation.isLoading}
                            >
                                {pendingStatusUpdate?.status === 'ACTIVE' ? 'Activate Plan' : 'Deactivate Plan'}
                            </Button>
                        </div>
                    }
                >
                    <div className="flex flex-col items-center text-center p-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${pendingStatusUpdate?.status === 'INACTIVE' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                            }`}>
                            <Power size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Are you sure?</h3>
                        <p className="text-slate-500 font-medium">
                            {pendingStatusUpdate?.status === 'INACTIVE'
                                ? "Inactive plans can't be assigned to new businesses, but existing subscriptions stay valid."
                                : "Activating this plan will make it available for new business assignments."
                            }
                        </p>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// Inline sub-component for plan form until decided otherwise
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
            title={plan ? 'Edit Infrastructure Tier' : 'Provision New Plan'}
            footer={
                <div className="flex gap-4 justify-end">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={isLoading}>
                        {plan ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <Input
                        label="Plan Name"
                        placeholder="e.g. Pro Business"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="System Code"
                        placeholder="e.g. BUSINESS_PRO"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        required
                    />
                </div>
                <Input
                    label="Description"
                    placeholder="Short summary of what this plan offers..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-6">
                    <Input
                        label="Monthly Price (LKR)"
                        type="number"
                        value={formData.monthlyPrice}
                        onChange={e => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                        required
                    />
                    <Input
                        label="Yearly Price (LKR)"
                        type="number"
                        value={formData.yearlyPrice}
                        onChange={e => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) })}
                    />
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 w-full">
                    <input
                        type="checkbox"
                        id="active-check"
                        className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500"
                        checked={formData.active}
                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label htmlFor="active-check" className="text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                        Mark Plan as Active
                    </label>
                </div>
            </form>
        </Modal>
    );
};

export default AdminPlans;
