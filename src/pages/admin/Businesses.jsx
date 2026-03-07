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
    CreditCard,
    Download,
    ChevronRight as ArrowIcon
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { businessService } from '../../api';

// UI Components
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AssignSubscriptionModal from './AssignSubscriptionModal';
import { Tooltip, IconButton } from '@mui/material';

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
            setActiveMenu(null);
        },
        onError: (err) => {
            // Handled globally
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

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `registry_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    const suspendedCount = businesses?.filter(b => !getIsActive(b)).length || 0;

    const columns = [
        {
            key: 'id',
            label: 'ID',
            render: (val) => <span className="font-mono text-indigo-400 font-black text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded-lg">#{val}</span>
        },
        {
            key: 'name',
            label: 'Business Entity',
            render: (val, row) => (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-white/5 shrink-0 group-hover:scale-110 transition-transform">
                        <Building2 size={18} />
                    </div>
                    <div>
                        <p className="font-black text-white leading-tight tracking-tight">{val}</p>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{row.ownerName || 'Admin User'}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'governance Status',
            render: (_, row) => {
                const isActive = getIsActive(row);
                return (
                    <Badge variant={isActive ? 'success' : 'danger'} dark>
                        {isActive ? 'Operational' : 'Suspended'}
                    </Badge>
                );
            }
        },
        {
            key: 'usage',
            label: 'Resource Load',
            render: () => (
                <div className="flex items-center gap-3">
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/40" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Normal</span>
                </div>
            )
        }
    ];

    if (isLoading) return <Loader fullPage dark text="Retrieving registry data..." />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 relative">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
                        Instance Governance
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Managing {businesses?.length || 0} global business deployments</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => { }}
                        className="flex items-center gap-2.5 bg-white/5 text-slate-400 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:text-white transition-all border border-white/5"
                    >
                        <Shield size={16} />
                        <span>Audit Registry</span>
                    </button>
                    <button
                        onClick={() => setIsAssignModalOpen(true)}
                        className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <CreditCard size={16} />
                        <span>Provision Plan</span>
                    </button>
                </div>
            </div>

            {/* Suspended Alert */}
            {suspendedCount > 0 && (
                <div className="bg-rose-500/5 border border-rose-500/10 rounded-[32px] p-8 flex items-center gap-6 group hover:bg-rose-500/10 transition-all">
                    <div className="w-16 h-16 bg-rose-500 text-white rounded-[24px] flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(244,63,94,0.3)] transform group-hover:rotate-12 transition-transform">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white leading-tight mb-1">Infrastructure Isolation Detected</h3>
                        <p className="text-rose-400 text-sm font-bold opacity-80 leading-relaxed uppercase tracking-wide">
                            Security protocols have restricted resource allocation for <span className="text-white border-b border-rose-400 pb-0.5">{suspendedCount} isolated nodes</span>. Intervention may be required.
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6">
                    <Input
                        dark
                        icon={Search}
                        placeholder="Scan registry by name, administrator, or unique ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="lg:col-span-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-14 px-6 bg-[#15161c] border border-white/5 rounded-[20px] text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer hover:bg-[#1a1b24] hover:text-white transition-all appearance-none"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Operational Only</option>
                        <option value="INACTIVE">Isolated Only</option>
                    </select>
                </div>
                <div className="lg:col-span-3">
                    <button
                        onClick={handleExportCSV}
                        className="w-full h-14 flex items-center justify-center gap-3 bg-white/5 text-slate-400 border border-white/5 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                    >
                        <Download size={18} />
                        Export Global Registry
                    </button>
                </div>
            </div>

            {/* Table */}
            <div onClick={() => setActiveMenu(null)}>
                <DataTable
                    dark
                    columns={columns}
                    data={filteredBusinesses}
                    emptyMessage="No registry entries match your current scan parameters."
                    actions={(row) => {
                        const isActive = getIsActive(row);
                        return (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
                                    className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${activeMenu === row.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:text-white border border-white/5 hover:bg-white/10'}`}
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {activeMenu === row.id && (
                                    <div className="absolute right-0 top-12 w-64 bg-[#1a1b24] rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <p className="px-6 py-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-white/5 mb-2">Security Authorization</p>

                                        <button
                                            onClick={() => handleToggleStatus(row)}
                                            className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all ${isActive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                                            disabled={statusMutation.isPending && statusMutation.variables?.id === row.id}
                                        >
                                            {isActive ? <Lock size={16} /> : <Unlock size={16} />}
                                            <span className="text-xs font-black uppercase tracking-wider">
                                                {statusMutation.isPending && statusMutation.variables?.id === row.id ? 'Processing...' : (isActive ? 'Disable Node' : 'Initialize Node')}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsAssignModalOpen(true);
                                                setActiveMenu(null);
                                            }}
                                            className="w-full px-6 py-3.5 text-left flex items-center gap-3 text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                        >
                                            <CreditCard size={16} />
                                            <span className="text-xs font-black uppercase tracking-wider">Assign Tier</span>
                                        </button>

                                        <button className="w-full px-6 py-3.5 text-left flex items-center gap-3 text-slate-500 hover:bg-white/5 transition-all">
                                            <Shield size={16} />
                                            <span className="text-xs font-black uppercase tracking-wider">Firewall Audit</span>
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
