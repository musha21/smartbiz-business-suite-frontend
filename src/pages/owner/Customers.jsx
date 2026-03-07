import React, { useState, useEffect } from 'react';
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
    Download,
    UserCheck,
    ChevronDown,
    Users,
    ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    CircularProgress,
    Avatar,
    Tooltip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useErpKeyboardForm } from '../../hooks/useErpKeyboardForm';
import { customerService } from '../../api';

// UI Components
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';


const Customers = () => {
    const { isDarkMode } = useTheme();
    const queryClient = useQueryClient();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    const handleOpenAddModal = React.useCallback(() => setIsAddModalOpen(true), []);
    const handleCloseAddModal = React.useCallback(() => setIsAddModalOpen(false), []);
    const handleCloseEditModal = React.useCallback(() => setIsEditModalOpen(false), []);
    const handleCloseDeleteModal = React.useCallback(() => setIsDeleteModalOpen(false), []);

    const addFormRef = React.useRef(null);
    const editFormRef = React.useRef(null);

    const { onKeyDown: onAddKeyDown } = useErpKeyboardForm(addFormRef, { autoFocus: true });
    const { onKeyDown: onEditKeyDown } = useErpKeyboardForm(editFormRef, { autoFocus: true });

    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active'
    });
    const [editCustomer, setEditCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active'
    });

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const { data: rawCustomers, isLoading, error } = useQuery({
        queryKey: ['customers'],
        queryFn: () => customerService.getCustomers()
    });

    const customers = React.useMemo(() => {
        if (!rawCustomers) return [];
        if (Array.isArray(rawCustomers)) return rawCustomers;
        if (Array.isArray(rawCustomers.data)) return rawCustomers.data;
        if (Array.isArray(rawCustomers.content)) return rawCustomers.content;
        return [];
    }, [rawCustomers]);

    const filteredCustomers = React.useMemo(() => {
        if (!customers) return [];
        return customers.filter(c => {
            const matchesSearch =
                c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.phone?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [customers, searchTerm, statusFilter]);

    const deleteMutation = useMutation({
        mutationFn: (id) => customerService.deleteCustomer(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            handleCloseDeleteModal();
            setActiveMenu(null);
            setSelectedCustomer(null);
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => customerService.createCustomer(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            handleCloseAddModal();
            setNewCustomer({ name: '', email: '', phone: '', address: '', status: 'Active' });
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => customerService.updateCustomer(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            handleCloseEditModal();
            setActiveMenu(null);
            setSelectedCustomer(null);
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const handleCreateSubmit = (e) => {
        e?.preventDefault?.();

        if (!newCustomer.name?.trim()) {
            return;
        }

        // Clean payload: send only non-empty fields
        const payload = Object.fromEntries(
            Object.entries(newCustomer).filter(([_, v]) => v !== '' && v !== null)
        );

        createMutation.mutate(payload);
    };

    const handleUpdateSubmit = (e) => {
        e?.preventDefault?.();
        updateMutation.mutate({ id: selectedCustomer.id, data: editCustomer });
    };

    const handleDelete = () => {
        if (selectedCustomer?.id) {
            deleteMutation.mutate(selectedCustomer.id);
        }
    };

    const handleEditClick = (customer) => {
        setSelectedCustomer(customer);
        setEditCustomer({
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
            address: customer.address || '',
            status: customer.status || 'Active'
        });
        setIsEditModalOpen(true);
        setActiveMenu(null);
    };

    const handleExportCSV = () => {
        if (!customers || customers.length === 0) return;

        const headers = ["ID", "Name", "Email", "Phone", "Address", "Status"];
        const rows = filteredCustomers.map(c => [
            c.id,
            `"${c.name}"`,
            c.email,
            c.phone,
            `"${c.address || ''}"`,
            c.status || 'Active'
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `customer_registry_${new Date().toISOString().split('T')[0]}.csv`);
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
            label: 'Customer',
            render: (val, row) => (
                <div className="flex items-center gap-4">
                    <Avatar
                        sx={{
                            width: 38,
                            height: 38,
                            fontSize: '0.8rem',
                            bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)',
                            color: '#6366f1',
                            fontWeight: '900',
                            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.1)'}`
                        }}
                    >
                        {val?.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || '?'}
                    </Avatar>
                    <div>
                        <p className={`font-black leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{val}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{row.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'contact',
            label: 'Contact Info',
            render: (_, row) => (
                <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-[11px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        <Phone size={12} className="text-indigo-500/50" />
                        {row.phone || '—'}
                    </div>
                    <div className={`flex items-center gap-2 text-[11px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        <MapPin size={12} className="text-indigo-500/50" />
                        {row.address || '—'}
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => (
                <Badge variant={val === 'Premium' ? 'purple' : (val === 'Inactive' ? 'danger' : 'success')} dark={isDarkMode}>
                    {val || 'Active'}
                </Badge>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <CircularProgress sx={{ color: '#6366f1' }} />
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Loading customers...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-2">
                    <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Customers
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Manage your customer base and contact information</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExportCSV}
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest border group ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-indigo-600'}`}
                    >
                        <Download size={18} />
                        <span>Export List</span>
                    </button>
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} />
                        <span>Create Customer</span>
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="relative group w-full lg:w-96">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-700 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={`w-full pl-14 pr-6 py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none ${isDarkMode ? 'bg-[#15161c] border-white/5 text-white placeholder:text-slate-800' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 shadow-sm'}`}
                    />
                </div>

                <div className="relative w-full lg:w-64">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`w-full h-14 px-6 border rounded-[22px] text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none ${isDarkMode ? 'bg-[#15161c] border-white/5 text-slate-400 hover:bg-[#1a1b24] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                    >
                        {['All', 'Active', 'Inactive', 'Premium'].map((status) => (
                            <option key={status} value={status} className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>{status} Status</option>
                        ))}
                    </select>
                    <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={16} />
                </div>
            </div>

            <div onClick={() => setActiveMenu(null)}>
                <DataTable
                    dark={isDarkMode}
                    columns={columns}
                    data={filteredCustomers}
                    emptyMessage="No customers found."
                    actions={(row) => (
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${activeMenu === row.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/40' : (isDarkMode ? 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-white' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-indigo-600')}`}
                            >
                                <MoreVertical size={18} />
                            </button>

                            {activeMenu === row.id && (
                                <div className={`absolute right-0 top-12 w-64 rounded-[24px] border shadow-2xl py-4 z-50 ${isDarkMode ? 'bg-[#1a1b24] border-white/10' : 'bg-white border-slate-100'}`}>
                                    <p className={`px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] border-b mb-2 ${isDarkMode ? 'text-slate-600 border-white/5' : 'text-slate-400 border-slate-50'}`}>Actions</p>

                                    <button
                                        onClick={() => handleEditClick(row)}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Edit size={16} /> Edit Details
                                    </button>
                                    <button
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                    >
                                        <Mail size={16} /> Send Email
                                    </button>
                                    <div className={`h-px my-2 mx-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`} />
                                    <button
                                        onClick={() => { setIsDeleteModalOpen(true); setSelectedCustomer(row); setActiveMenu(null); }}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                                    >
                                        <Trash2 size={16} /> Delete Customer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                title="Add New Customer"
                dark={isDarkMode}
                onSubmit={handleCreateSubmit}
                formRef={addFormRef}
                onKeyDown={onAddKeyDown}
                footer={
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={handleCloseAddModal} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Cancel</button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 flex items-center gap-3"
                        >
                            {createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <UserCheck size={18} />}
                            <span>Add Customer</span>
                        </button>
                    </div>
                }
            >
                <div className="space-y-8">
                    <div className={`border rounded-[24px] p-6 flex items-start gap-4 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                            <Users size={20} />
                        </div>
                        <p className={`text-[11px] font-bold leading-relaxed uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Enter the customer's contact details to save them to your base.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Input
                            dark={isDarkMode}
                            label="Full Name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            placeholder="John Doe..."
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                dark={isDarkMode}
                                label="Email"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                placeholder="customer@example.com"
                            />
                            <Input
                                dark={isDarkMode}
                                label="Phone Number"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                placeholder="+94 ..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Address</label>
                            <textarea
                                className={`w-full border rounded-2xl p-6 text-sm font-bold outline-none focus:ring-1 focus:ring-indigo-500/50 min-h-[120px] ${isDarkMode ? 'bg-white/5 border-white/5 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300'}`}
                                placeholder="Enter address here..."
                                value={newCustomer.address}
                                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                title="Edit Customer"
                dark={isDarkMode}
                onSubmit={handleUpdateSubmit}
                formRef={editFormRef}
                onKeyDown={onEditKeyDown}
                footer={
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={handleCloseEditModal} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Cancel</button>
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 flex items-center gap-3"
                        >
                            {updateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <ShieldCheck size={18} />}
                            <span>Update Profile</span>
                        </button>
                    </div>
                }
            >
                <div className="space-y-8">
                    <div className="flex items-center gap-5 pb-6 border-b border-white/5">
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                fontSize: '1.2rem',
                                bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)',
                                color: '#6366f1',
                                fontWeight: '900',
                                border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.1)'}`
                            }}
                        >
                            {editCustomer.name?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Customer Name</p>
                            <h3 className={`text-xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{editCustomer.name}</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Input
                            dark={isDarkMode}
                            label="Full Name"
                            value={editCustomer.name}
                            onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                dark={isDarkMode}
                                label="Email"
                                value={editCustomer.email}
                                onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                            />
                            <Input
                                dark={isDarkMode}
                                label="Phone Number"
                                value={editCustomer.phone}
                                onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Status</label>
                                <div className="relative">
                                    <select
                                        value={editCustomer.status || 'Active'}
                                        onChange={(e) => setEditCustomer({ ...editCustomer, status: e.target.value })}
                                        className={`w-full h-14 px-6 border rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:bg-white/[0.08]' : 'bg-slate-50 border-slate-100 text-slate-900 focus:bg-slate-100/50'}`}
                                    >
                                        <option value="Active" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>Active</option>
                                        <option value="Inactive" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>Inactive</option>
                                        <option value="Premium" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>Premium</option>
                                    </select>
                                    <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Address</label>
                            <textarea
                                className={`w-full border rounded-2xl p-6 text-sm font-bold outline-none min-h-[100px] ${isDarkMode ? 'bg-white/5 border-white/5 text-white placeholder:text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-300'}`}
                                value={editCustomer.address}
                                onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseDeleteModal}
                title="Delete Customer"
                dark={isDarkMode}
                onSubmit={handleDelete}
                footer={
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            type="submit"
                            disabled={deleteMutation.isPending}
                            className="bg-rose-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-rose-500 shadow-xl shadow-rose-600/20"
                        >
                            {deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : 'Confirm Delete'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCloseDeleteModal}
                            className={`font-black text-[10px] uppercase tracking-widest py-3 ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="text-center py-6 space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 relative ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                        <Trash2 size={40} className="text-rose-500" />
                    </div>
                    <div className="space-y-2">
                        <p className={`font-black uppercase italic text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Are you sure?</p>
                        <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            The profile for <span className="text-rose-400 font-black">{selectedCustomer?.name}</span> will be permanently deleted.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Customers;
