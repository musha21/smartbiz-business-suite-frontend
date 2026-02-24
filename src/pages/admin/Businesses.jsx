import React, { useState } from 'react';
import {
    Building2,
    Search,
    Filter,
    Lock,
    Unlock,
    Settings,
    Shield,
    AlertTriangle,
    MoreVertical,
    CreditCard
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { businessService } from '../../api';
import { toast } from 'react-toastify';

// UI Components
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AssignSubscriptionModal from './AssignSubscriptionModal';

const Businesses = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [activeMenu, setActiveMenu] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    const { data: businesses, isLoading, error } = useQuery({
        queryKey: ['admin-businesses'],
        queryFn: () => businessService.getBusinesses(),
    });

    const getIsActive = (row) => {
        const val = row.active !== undefined ? row.active : row.status;
        return (val === 'Active' || val === 'active' || val === true);
    };

    const statusMutation = useMutation({
        mutationFn: ({ id, isActive }) => {
            return isActive ? businessService.disableBusiness(id) : businessService.enableBusiness(id);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-businesses'] });
            toast.success(data?.message || `Business instance ${variables.isActive ? 'disabled' : 'enabled'} successfully.`);
            setActiveMenu(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update governance state.');
        }
    });

    const handleToggleStatus = (row) => {
        const isActive = getIsActive(row);
        statusMutation.mutate({ id: row.id, isActive });
    };

    // Filtered businesses
    const filteredBusinesses = businesses?.filter(b => {
        const matchesSearch = b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(b.id).includes(searchTerm);

        const isActive = getIsActive(b);
        const matchesStatus = statusFilter === 'ALL' ||
            (statusFilter === 'ACTIVE' && isActive) ||
            (statusFilter === 'INACTIVE' && !isActive);

        return matchesSearch && matchesStatus;
    }) || [];

    const handleExportCSV = () => {
        if (filteredBusinesses.length === 0) {
            toast.warn('No data to export');
            return;
        }

        const headers = ['ID', 'Name', 'Owner', 'Email', 'Active Status'];
        const rows = filteredBusinesses.map(b => [
            b.id,
            `"${b.name || ''}"`,
            `"${b.ownerName || 'N/A'}"`,
            `"${b.ownerEmail || b.email || 'N/A'}"`,
            getIsActive(b) ? 'Active' : 'Inactive'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `businesses_registry_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Registry exported successfully');
    };

    const suspendedCount = businesses?.filter(b => !getIsActive(b)).length || 0;

    const columns = [
        {
            key: 'id',
            label: 'ID',
            render: (val) => <span className="font-mono text-indigo-600 font-black text-xs bg-indigo-50 px-2 py-1 rounded-lg">#{val}</span>
        },
        {
            key: 'name',
            label: 'Business Entity',
            render: (val, row) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <p className="font-black text-slate-800 leading-tight">{val}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.ownerName || 'Admin User'}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Active Status',
            render: (_, row) => {
                const isActive = getIsActive(row);
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isActive ? 'Active' : 'False'}
                        </span>
                    </div>
                );
            }
        },
    ];

    if (isLoading) return <Loader fullPage text="Retrieving registry data..." />;

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl px-8 py-6 font-semibold shadow-sm text-center">
                    Connection Error: Unable to synchronize with the business governance API.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Instance Governance</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        Managing {businesses?.length || 0} production business instances
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={Shield} onClick={() => { }}>Audit Logs</Button>
                    <Button
                        variant="dark"
                        icon={CreditCard}
                        onClick={() => setIsAssignModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-100"
                    >
                        Assign Subscription
                    </Button>
                </div>
            </div>

            {/* Suspended Alert */}
            {suspendedCount > 0 && (
                <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex items-center gap-5 shadow-sm animate-in slide-in-from-top-4">
                    <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-rose-900 leading-tight text-lg">Infrastructure Warning</h3>
                        <p className="text-rose-600 text-sm font-bold opacity-80 mt-0.5">There are {suspendedCount} business instance(s) currently <span className="underline">disabled</span>. System resource allocation for these nodes is restricted.</p>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                    <Input
                        icon={Search}
                        placeholder="Scan registry by name, administrator, or unique ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="py-4 rounded-2xl"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 lg:flex-none h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-all"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="INACTIVE">Disabled Only</option>
                    </select>
                    <Button
                        variant="outline"
                        className="flex-1 lg:flex-none h-14"
                        onClick={handleExportCSV}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Registry Table */}
            <div onClick={() => setActiveMenu(null)}>
                <DataTable
                    columns={columns}
                    data={filteredBusinesses}
                    emptyMessage="No registry entries match your current scan parameters."
                    actions={(row) => {
                        const isActive = getIsActive(row);
                        return (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
                                    className={`p-2 rounded-xl transition-all ${activeMenu === row.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {activeMenu === row.id && (
                                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-slate-100 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <p className="px-5 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">Governance Actions</p>


                                        <button
                                            onClick={() => handleToggleStatus(row)}
                                            className={`w-full px-5 py-3 text-left flex items-center gap-3 transition-colors ${isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                            disabled={statusMutation.isPending && statusMutation.variables?.id === row.id}
                                        >
                                            {isActive ? <Lock size={16} /> : <Unlock size={16} />}
                                            <span className="text-sm font-bold">
                                                {statusMutation.isPending && statusMutation.variables?.id === row.id ? 'Processing...' : (isActive ? 'Disable Business' : 'Enable Business')}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsAssignModalOpen(true);
                                                setActiveMenu(null);
                                            }}
                                            className="w-full px-5 py-3 text-left flex items-center gap-3 text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        >
                                            <CreditCard size={16} />
                                            <span className="text-sm font-bold">Assign Plan</span>
                                        </button>

                                        <button className="w-full px-5 py-3 text-left flex items-center gap-3 text-slate-400 hover:bg-slate-50 transition-colors">
                                            <Shield size={16} />
                                            <span className="text-sm font-bold">Security Audit</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
            </div>

            {/* Modals */}
            <AssignSubscriptionModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
            />
        </div>
    );
};

export default Businesses;
