import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Edit,
    Truck,
    ShieldCheck,
    ChevronDown,
    Activity,
    Target,
    Zap,
    Download
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    CircularProgress,
    Avatar,
    Tooltip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useErpKeyboardForm } from '../../hooks/useErpKeyboardForm';
import { supplierService } from '../../api';

// UI Components
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';


// Validation Schema
const supplierSchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address').or(z.string().length(0)).optional(),
    phone: z.string().min(9, 'Phone number must be at least 9 characters'),
    address: z.string().min(3, 'Address must be at least 3 characters')
});

const Suppliers = () => {
    const { isDarkMode } = useTheme();
    const queryClient = useQueryClient();
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const formRef = React.useRef(null);
    const { onKeyDown } = useErpKeyboardForm(formRef, { autoFocus: true });

    // Debounce search term
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // Fetch Suppliers
    const { data: suppliers, isLoading, error } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => supplierService.getSuppliers(),
    });

    // Form Setup
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: ''
        }
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (data) => supplierService.createSupplier(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            handleCloseAddModal();
        },
        onError: (err) => {
            // Handled globally
        }
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => supplierService.updateSupplier(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            handleCloseEditModal();
        },
        onError: (err) => {
            // Handled globally
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => supplierService.deleteSupplier(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            setIsDeleteModalOpen(false);
            setActiveMenu(null);
            setSelectedSupplier(null);
        },
        onError: (err) => {
            // Handled globally
        }
    });

    // Filtering Logic
    const filteredSuppliers = useMemo(() => {
        if (!suppliers) return [];
        return suppliers.filter(s => {
            const matchesSearch =
                s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.address?.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesFilter = true;
            if (statusFilter === 'Has Email') matchesFilter = !!s.email;
            if (statusFilter === 'Has Phone') matchesFilter = !!s.phone;

            return matchesSearch && matchesFilter;
        });
    }, [suppliers, searchTerm, statusFilter]);

    // Handlers
    const handleOpenAddModal = () => {
        reset({ name: '', email: '', phone: '', address: '' });
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        reset();
    };

    const handleOpenEditModal = (supplier) => {
        setValue('name', supplier.name);
        setValue('email', supplier.email || '');
        setValue('phone', supplier.phone);
        setValue('address', supplier.address);
        setIsEditModalOpen(true);
        setActiveMenu(null);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        reset();
    };

    const onSubmitAdd = (data) => createMutation.mutate(data);
    const onSubmitEdit = (data) => updateMutation.mutate({ id: selectedSupplier.id, data });

    const handleDelete = () => {
        if (selectedSupplier) {
            deleteMutation.mutate(selectedSupplier.id);
        }
    };

    const handleExportCSV = () => {
        if (!suppliers || suppliers.length === 0) return;
        const headers = ["ID", "Company", "Email", "Phone", "Address"];
        const rows = filteredSuppliers.map(s => [s.id, `"${s.name}"`, s.email || 'N/A', s.phone, `"${s.address}"`]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `suppliers_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const columns = [
        {
            key: 'id',
            label: '#',
            render: (_, _row, index) => (
                <span className={`text-[11px] font-black italic ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    {index + 1}
                </span>
            )
        },
        {
            key: 'name',
            label: 'Supplier',
            render: (val, row) => (
                <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 border rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-white/5 border-white/10 text-indigo-400 shadow-2xl shadow-indigo-500/10' : 'bg-slate-50 border-slate-200 text-indigo-600 shadow-sm shadow-indigo-500/5'}`}>
                        <Truck size={22} />
                    </div>
                    <div>
                        <p className={`font-black uppercase tracking-tight leading-tight italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{val}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{row.email || 'No email'}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'contact',
            label: 'Contact Details',
            render: (_, row) => (
                <div className="space-y-1.5">
                    <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        <Phone size={12} className="text-indigo-500/50" />
                        {row.phone || '—'}
                    </div>
                </div>
            )
        },
        {
            key: 'address',
            label: 'Address',
            render: (val) => (
                <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={12} className={isDarkMode ? 'text-slate-700' : 'text-slate-400'} />
                    <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[180px]">{val || '—'}</span>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <CircularProgress sx={{ color: '#6366f1' }} />
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Loading suppliers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className={`border rounded-[32px] p-12 flex flex-col items-center text-center gap-6 ${isDarkMode ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="w-20 h-20 bg-rose-500 text-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-rose-500/20">
                        <Target size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Failed to load suppliers</h3>
                        <p className={`text-sm font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            We encountered an error while retrieving your supplier list.
                        </p>
                    </div>
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['suppliers'] })}
                        className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isDarkMode ? 'bg-white/5 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white shadow-sm'}`}
                    >
                        Try Again
                    </button>
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
                        Suppliers
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Manage your vendor relationships and supply chain</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExportCSV}
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border group ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-indigo-600'}`}
                    >
                        <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                        <span>Export List</span>
                    </button>
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Add Supplier</span>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative group w-full lg:w-96">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-700 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={18} />
                    <input
                        type="text"
                        placeholder="Search by company or email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={`w-full pl-14 pr-6 py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all ${isDarkMode ? 'bg-[#15161c] border-white/5 text-white placeholder:text-slate-800 focus:ring-1 focus:ring-indigo-500/50' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 focus:ring-1 focus:ring-indigo-600/20 shadow-sm'}`}
                    />
                </div>

                <div className="relative w-full lg:w-64">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`w-full h-14 px-6 border rounded-[22px] text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all appearance-none ${isDarkMode ? 'bg-[#15161c] border-white/5 text-slate-400 hover:bg-[#1a1b24] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                    >
                        <option value="All" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>All Vendors</option>
                        <option value="Has Email" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>With Email</option>
                        <option value="Has Phone" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>With Phone</option>
                    </select>
                    <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={16} />
                </div>
            </div>

            {/* Table */}
            <div onClick={() => setActiveMenu(null)}>
                <DataTable
                    dark={isDarkMode}
                    columns={columns}
                    data={filteredSuppliers}
                    emptyMessage="No suppliers found."
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
                                        onClick={() => handleOpenEditModal(row)}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Edit size={16} /> Edit Details
                                    </button>
                                    <button
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                    >
                                        <Phone size={16} /> Call Supplier
                                    </button>
                                    <div className={`h-px my-2 mx-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`} />
                                    <button
                                        onClick={() => { setIsDeleteModalOpen(true); setSelectedSupplier(row); setActiveMenu(null); }}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                                    >
                                        <Trash2 size={16} /> Delete Supplier
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isAddModalOpen || isEditModalOpen}
                onClose={isAddModalOpen ? handleCloseAddModal : handleCloseEditModal}
                title={isAddModalOpen ? 'Add Supplier' : 'Edit Supplier'}
                dark={isDarkMode}
                onSubmit={handleSubmit(isAddModalOpen ? onSubmitAdd : onSubmitEdit)}
                formRef={formRef}
                onKeyDown={onKeyDown}
                footer={
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={isAddModalOpen ? handleCloseAddModal : handleCloseEditModal} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Cancel</button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3"
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={16} color="inherit" /> : <ShieldCheck size={18} />}
                            <span>{isAddModalOpen ? 'Add Supplier' : 'Save Changes'}</span>
                        </button>
                    </div>
                }
            >
                <div className="space-y-8">
                    <div className={`border rounded-[24px] p-6 flex items-start gap-4 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                            <Truck size={20} />
                        </div>
                        <p className={`text-[11px] font-bold leading-relaxed uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isAddModalOpen ? "Enter the supplier's details to add them to your database." : "Update the supplier's information below."}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Input
                            dark={isDarkMode}
                            label="Company Name"
                            {...register('name')}
                            error={errors.name?.message}
                            placeholder="Enter company name..."
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                dark={isDarkMode}
                                label="Email Address"
                                type="email"
                                {...register('email')}
                                error={errors.email?.message}
                                placeholder="vendor@info.com"
                            />
                            <Input
                                dark={isDarkMode}
                                label="Phone Number"
                                {...register('phone')}
                                error={errors.phone?.message}
                                placeholder="+94 ..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Address</label>
                            <textarea
                                className={`w-full border rounded-2xl p-6 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 focus:shadow-[0_0_0_6px_rgba(56,189,248,0.18)] transition-all duration-300 min-h-[120px] ${isDarkMode ? 'bg-white/5 border-white/5 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300'}`}
                                placeholder="Enter full office address..."
                                {...register('address')}
                            />
                            {errors.address && <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest ml-2">{errors.address.message}</p>}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Supplier"
                dark={isDarkMode}
                onSubmit={handleDelete}
                footer={
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            type="submit"
                            disabled={deleteMutation.isPending}
                            className="bg-rose-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                        >
                            {deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : 'Confirm Delete'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className={`font-black text-[10px] uppercase tracking-widest py-3 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="text-center py-6 space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 relative ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                        <Trash2 size={40} className="text-rose-500" />
                        <div className={`absolute inset-0 blur-2xl opacity-10 ${isDarkMode ? 'bg-rose-500' : 'bg-rose-200'}`} />
                    </div>
                    <div className="space-y-2">
                        <p className={`font-black uppercase italic text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Are you sure?</p>
                        <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            The profile for <span className="text-rose-400 font-black">{selectedSupplier?.name}</span> will be permanently deleted.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Suppliers;
