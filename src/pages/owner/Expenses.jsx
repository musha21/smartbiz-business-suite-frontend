import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus,
    Search,
    Calendar,
    Download,
    MoreVertical,
    Wallet,
    Trash2,
    Edit,
    Zap,
    ChevronDown,
    Clock,
    TrendingDown,
    ShieldAlert,
    PieChart,
    Activity
} from 'lucide-react';
import {
    CircularProgress
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { expenseService } from '../../api';
import { formatLKR } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

// UI Components
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import CreatedAtText from '../../components/ui/CreatedAtText';
import Input from '../../components/ui/Input';

// Validation Schema
const expenseSchema = z.object({
    category: z.string().min(2, 'Category is required'),
    amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be positive')),
    expenseDate: z.string().min(1, 'Date is required'),
    note: z.string().optional()
});

const Expenses = () => {
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    // Search state
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => setSearchTerm(searchInput), 400);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expenseService.getExpenses(),
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            category: '',
            amount: '',
            expenseDate: new Date().toISOString().slice(0, 16),
            note: ''
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => expenseService.createExpense(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            handleCloseModal();
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => expenseService.updateExpense(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            handleCloseModal();
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => expenseService.deleteExpense(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            setIsDeleteModalOpen(false);
            setSelectedExpense(null);
        },
        onError: (err) => {
            // Handled globally
        }
    });

    // Computed Data
    const filteredExpenses = useMemo(() => {
        if (!expenses) return [];
        return expenses.filter(exp =>
            exp.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.note?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [expenses, searchTerm]);

    const stats = useMemo(() => {
        if (!expenses || expenses.length === 0) return { total: 0, majorCategory: 'None' };
        const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const categoryMap = {};
        expenses.forEach(exp => categoryMap[exp.category] = (categoryMap[exp.category] || 0) + (Number(exp.amount) || 0));
        const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        const majorCategory = sortedCategories[0][0];
        return { total, majorCategory };
    }, [expenses]);

    const getLocalISO = (dateStr) => {
        const date = dateStr ? new Date(dateStr) : new Date();
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date - offset).toISOString().slice(0, 16);
    };

    const handleOpenModal = (expense = null) => {
        if (expense) {
            setIsEditMode(true);
            setSelectedExpense(expense);
            reset({
                category: expense.category,
                amount: expense.amount,
                expenseDate: getLocalISO(expense.expenseDate),
                note: expense.note || ''
            });
        } else {
            setIsEditMode(false);
            reset({
                category: '',
                amount: '',
                expenseDate: getLocalISO(),
                note: ''
            });
        }
        setIsModalOpen(true);
        setActiveMenu(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedExpense(null);
        reset();
    };

    const onSubmit = (data) => {
        if (isEditMode) {
            updateMutation.mutate({ id: selectedExpense.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const columns = [
        {
            key: 'expenseDate',
            label: 'Date & Time',
            render: (val) => (
                <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={12} className={isDarkMode ? 'text-slate-600' : 'text-slate-400'} />
                    <CreatedAtText value={val} className="text-[10px] uppercase font-bold tracking-widest" showIcon={false} />
                </div>
            )
        },
        {
            key: 'category',
            label: 'Category',
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                        <Wallet size={14} />
                    </div>
                    <span className={`font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{val}</span>
                </div>
            )
        },
        {
            key: 'amount',
            label: 'Amount',
            render: (val) => <span className="text-lg font-black text-rose-500 italic tracking-tight">{formatLKR(val)}</span>
        },
        {
            key: 'note',
            label: 'Notes',
            render: (val) => (
                <span className={`text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px] block ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    {val || "—"}
                </span>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <CircularProgress sx={{ color: '#6366f1' }} />
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Loading expenses...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b transition-all duration-300 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-2">
                    <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Expenses
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Track your daily business spending and overheads</p>
                </div>
                <div className="flex gap-4">
                    <button
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border group ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-indigo-600'}`}
                    >
                        <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                        <span>Download List</span>
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2.5 bg-rose-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Add Expense</span>
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`border p-8 rounded-[32px] group relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start relative z-10 font-black uppercase tracking-widest">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-50 text-rose-600'}`}>
                            <TrendingDown size={22} />
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-rose-500 font-bold mb-1">Total Expenses</p>
                            <div className={`w-2 h-2 rounded-full float-right animate-pulse ${isDarkMode ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]'}`} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-8">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Total Spent</p>
                        <h3 className={`text-3xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatLKR(stats.total)}</h3>
                    </div>
                    <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl transition-opacity ${isDarkMode ? 'bg-rose-500/5 opacity-50' : 'bg-rose-500/5 opacity-30'}`} />
                </div>

                <div className={`border p-8 rounded-[32px] group relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start relative z-10 font-black uppercase tracking-widest">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-500/10 text-indigo-500' : 'bg-indigo-50 text-indigo-600'}`}>
                            <PieChart size={22} />
                        </div>
                        <div className="text-right">
                            <p className={`text-[9px] font-bold mb-1 ${isDarkMode ? 'text-indigo-500' : 'text-indigo-600'}`}>Top Category</p>
                            <div className={`w-2 h-2 rounded-full float-right ${isDarkMode ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]'}`} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-8">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Top Category</p>
                        <h3 className={`text-3xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.majorCategory}</h3>
                    </div>
                    <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl transition-opacity ${isDarkMode ? 'bg-indigo-500/5 opacity-50' : 'bg-indigo-500/5 opacity-30'}`} />
                </div>

                <div className={`border p-8 rounded-[32px] group relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start relative z-10 font-black uppercase tracking-widest">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                            <Activity size={22} />
                        </div>
                        <div className="text-right">
                            <p className={`text-[9px] font-bold mb-1 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>Total Records</p>
                            <div className={`w-2 h-2 rounded-full float-right ${isDarkMode ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]'}`} />
                        </div>
                    </div>
                    <div className="relative z-10 mt-8">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Total Entries</p>
                        <h3 className={`text-3xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{expenses?.length} Items</h3>
                    </div>
                    <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl transition-opacity ${isDarkMode ? 'bg-emerald-500/5 opacity-50' : 'bg-emerald-500/5 opacity-30'}`} />
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-12 relative group">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-600 group-focus-within:text-indigo-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Search expenses by category or note..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={`w-full pl-14 pr-6 py-4 border rounded-[22px] text-sm font-bold transition-all outline-none ${isDarkMode ? 'bg-[#15161c] border-white/5 text-white placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500/50 focus:bg-[#1a1b24]' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500/30 focus:bg-slate-50'}`}
                    />
                </div>
            </div>

            {/* Table */}
            <div onClick={() => setActiveMenu(null)}>
                <DataTable
                    dark={isDarkMode}
                    columns={columns}
                    data={filteredExpenses}
                    emptyMessage="No expense records found."
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
                                        onClick={() => handleOpenModal(row)}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        <Edit size={16} /> Edit Details
                                    </button>
                                    <div className={`h-px my-2 mx-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`} />
                                    <button
                                        onClick={() => { setIsDeleteModalOpen(true); setSelectedExpense(row); setActiveMenu(null); }}
                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                                    >
                                        <Trash2 size={16} /> Delete Expense
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Manage Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={isEditMode ? 'Edit Expense' : 'Add New Expense'}
                dark={isDarkMode}
                onSubmit={handleSubmit(onSubmit)}
                footer={
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={handleCloseModal} className={`px-6 py-3 font-bold text-[10px] uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>Cancel</button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className={`px-10 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3 ${isDarkMode ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/30'}`}
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={16} color="inherit" /> : (isEditMode ? <Edit size={18} /> : <Plus size={18} />)}
                            <span>{isEditMode ? 'Save Changes' : 'Add Expense'}</span>
                        </button>
                    </div>
                }
            >
                <div className="space-y-8">
                    <div className={`border rounded-[24px] p-6 flex items-start gap-4 transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-100 text-rose-600'}`}>
                            <ShieldAlert size={20} />
                        </div>
                        <p className={`text-[11px] font-bold leading-relaxed uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                            All expenses are <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>logged securely</span>. Ensure accuracy for proper financial reporting.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <Input
                            dark={isDarkMode}
                            label="Category"
                            {...register('category')}
                            error={errors.category?.message}
                            placeholder="e.g. Rent, Salaries, Utilities"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                dark={isDarkMode}
                                label="Amount"
                                type="number"
                                {...register('amount')}
                                error={errors.amount?.message}
                                placeholder="0.00"
                            />
                            <Input
                                dark={isDarkMode}
                                label="Date & Time"
                                type="datetime-local"
                                {...register('expenseDate')}
                                error={errors.expenseDate?.message}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Notes (Optional)</label>
                            <textarea
                                className={`w-full border rounded-2xl p-6 text-sm font-bold transition-all outline-none min-h-[120px] ${isDarkMode ? 'bg-white/5 border-white/5 text-white placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500/50' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500/30 shadow-sm'}`}
                                placeholder="Enter any specific details about this expense..."
                                {...register('note')}
                            />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Expense"
                dark={isDarkMode}
                onSubmit={() => deleteMutation.mutate(selectedExpense.id)}
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
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 relative ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                        <Trash2 size={40} className="text-rose-500" />
                        <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-10" />
                    </div>
                    <div className="space-y-2">
                        <p className={`font-black uppercase italic text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Delete this expense?</p>
                        <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            The record for <span className="text-rose-500 font-black">{formatLKR(selectedExpense?.amount)}</span> will be permanently removed.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Expenses;
