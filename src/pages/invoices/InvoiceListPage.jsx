import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Download,
    Eye,
    FileText,
    CheckCircle,
    XCircle,
    MoreVertical,
    Calendar,
    Filter,
    ArrowUpDown,
    Check,
    X,
    Clock,
    Zap,
    History
} from 'lucide-react';
import {
    CircularProgress,
    Box
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/ui/Modal';
import CreatedAtText from '../../components/ui/CreatedAtText';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { formatLKR, getLocalISOString } from '../../utils/formatters';
import { Printer } from 'lucide-react';


const InvoiceListPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();

    // Filters state
    const [status, setStatus] = useState('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [search, setSearch] = useState('');
    const [activeMenu, setActiveMenu] = useState(null);

    // UI state
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const queryParams = useMemo(() => {
        const params = {};
        if (status !== 'ALL') params.status = status;
        if (fromDate) params.from = `${fromDate}:00`;
        if (toDate) params.to = `${toDate}:00`;
        if (search) params.q = search;
        return params;
    }, [status, fromDate, toDate, search]);

    const { data: invoices, isLoading, error } = useQuery({
        queryKey: ['invoices', queryParams],
        queryFn: () => invoiceService.getInvoices(queryParams),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => invoiceService.updateInvoiceStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setIsConfirmDialogOpen(false);
            setSelectedInvoice(null);
            setActiveMenu(null);
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const handleToggleStatus = (targetStatus) => {
        setNewStatus(targetStatus);
        setIsConfirmDialogOpen(true);
    };

    const handleDownload = (id) => {
        invoiceService.downloadPdf(id).catch(() => { /* handled */ });
        setActiveMenu(null);
    };

    const handlePreview = (id) => {
        invoiceService.previewPdf(id).catch(() => { /* handled */ });
        setActiveMenu(null);
    };

    const columns = [
        {
            key: 'invoiceNumber',
            label: 'Invoice #',
            render: (val) => (
                <span className={`font-mono font-black text-[11px] border px-3 py-1.5 rounded-xl ${isDarkMode ? 'text-indigo-400 bg-white/5 border-white/10' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>
                    #{val}
                </span>
            )
        },
        {
            key: 'invoiceDate',
            label: 'Date',
            render: (val) => <CreatedAtText value={val} showIcon={false} className={`text-[10px] uppercase font-black tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (cust, row) => {
                const name = cust?.name || row?.customerName || 'Cash Sale';
                const contact = cust?.email || cust?.phone || row?.customerEmail || row?.customerPhone || 'NO CONTACT';
                return (
                    <div className="flex flex-col">
                        <span className={`font-black text-xs uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{name}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{contact}</span>
                    </div>
                );
            }
        },
        {
            key: 'totalAmount',
            label: 'Total',
            render: (val) => <span className={`font-black text-base italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatLKR(val)}</span>
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <Badge variant={val === 'PAID' ? 'success' : 'danger'} dark={isDarkMode}>{val}</Badge>
            )
        }
    ];

    if (error) {
        return (
            <div className="p-8">
                <div className={`border rounded-[2rem] px-8 py-6 font-black uppercase tracking-widest text-xs text-center shadow-2xl ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                    Error: Failed to load invoices.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-2">
                    <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Invoices
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Manage and track your business transactions</p>
                </div>
                <div className="flex gap-4">
                    <button className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border group ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                        <History size={18} className="group-hover:-translate-y-1 transition-transform" />
                        <span>Audit Log</span>
                    </button>
                    <button
                        onClick={() => navigate('/invoices/new')}
                        className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Create Invoice</span>
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className={`p-8 rounded-[32px] border relative overflow-hidden group transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center gap-2.5 mb-8 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                        <Filter size={16} />
                    </div>
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                    <div className="md:col-span-4 group/input">
                        <Input
                            dark={isDarkMode}
                            placeholder="Search invoices or customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={Search}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className={`w-full h-14 px-6 border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/[0.08]' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                        >
                            <option value="ALL">Status: All</option>
                            <option value="PAID">Status: Paid</option>
                            <option value="UNPAID">Status: Unpaid</option>
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <input
                            type="datetime-local"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className={`w-full h-14 px-6 border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none transition-all custom-datetime-input ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-600 focus:text-indigo-400' : 'bg-slate-50 border-slate-100 text-slate-400 focus:text-indigo-600'}`}
                        />
                    </div>
                    <div className="md:col-span-3 flex gap-4">
                        <input
                            type="datetime-local"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className={`w-full h-14 px-6 border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] outline-none transition-all custom-datetime-input ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-600 focus:text-indigo-400' : 'bg-slate-50 border-slate-100 text-slate-400 focus:text-indigo-600'}`}
                        />
                        <button
                            onClick={() => {
                                setStatus('ALL');
                                setFromDate('');
                                setToDate('');
                                setSearch('');
                            }}
                            className={`w-14 h-14 border rounded-2xl flex items-center justify-center transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:text-rose-400' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50'}`}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-50 ${isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-500/10'}`} />
            </div>

            {/* Table */}
            <div onClick={() => setActiveMenu(null)}>
                <DataTable
                    dark={isDarkMode}
                    columns={columns}
                    data={invoices || []}
                    isLoading={isLoading}
                    emptyMessage="No invoices found."
                    actions={(row) => (
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
                                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border shadow-sm ${activeMenu === row.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/40' : (isDarkMode ? 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-white' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-indigo-600')}`}
                            >
                                <MoreVertical size={18} />
                            </button>

                            {activeMenu === row.id && (
                                <div className={`absolute right-0 top-12 w-64 rounded-[24px] border shadow-2xl py-4 z-50 animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#1a1b24] border-white/10' : 'bg-white border-slate-100'}`}>
                                    <p className={`px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] border-b mb-2 ${isDarkMode ? 'text-slate-600 border-white/5' : 'text-slate-400 border-slate-50'}`}>Actions</p>

                                    <button
                                        onClick={() => navigate(`/invoices/${row.id}`)}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Eye size={16} /> View Details
                                    </button>
                                    <button
                                        onClick={() => handlePreview(row.id)}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-white/80 hover:bg-white/5' : 'text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <Printer size={16} className="text-slate-500" /> Print Invoice
                                    </button>
                                    <button
                                        onClick={() => handleDownload(row.id)}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                    >
                                        <Download size={16} /> Download PDF
                                    </button>
                                    <div className={`h-px my-2 mx-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`} />
                                    <button
                                        onClick={() => { setSelectedInvoice(row); handleToggleStatus(row.status === 'PAID' ? 'UNPAID' : 'PAID'); }}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${row.status === 'PAID' ? (isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50') : (isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50')}`}
                                    >
                                        {row.status === 'PAID' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                        Mark as {row.status === 'PAID' ? 'Unpaid' : 'Paid'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Status Confirmation Modal */}
            <Modal
                isOpen={isConfirmDialogOpen}
                onClose={() => { setIsConfirmDialogOpen(false); setSelectedInvoice(null); }}
                title="Update Status"
                dark={isDarkMode}
                onSubmit={() => statusMutation.mutate({
                    id: selectedInvoice.id,
                    status: newStatus
                })}
                footer={
                    <div className="flex gap-4 w-full">
                        <button
                            type="button"
                            onClick={() => { setIsConfirmDialogOpen(false); setSelectedInvoice(null); }}
                            className={`flex-1 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all ${isDarkMode ? 'bg-white/5 text-slate-500 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={statusMutation.isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            {statusMutation.isPending ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                <div className="text-center py-6 space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 relative ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
                        <Clock size={40} className={`transition-colors ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <div className={`absolute inset-0 blur-2xl opacity-10 ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`} />
                    </div>
                    <div className="space-y-2">
                        <p className={`font-black uppercase italic text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Update Invoice Status?</p>
                        <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Changing invoice status for <span className="text-indigo-400">#{selectedInvoice?.invoiceNumber}</span> to <span className={newStatus === 'PAID' ? 'text-emerald-400' : 'text-rose-400'}>{newStatus}</span>.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default InvoiceListPage;
