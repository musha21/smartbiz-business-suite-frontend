import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus,
    Search,
    ArrowUpRight,
    PieChart,
    Calendar,
    Download,
    MoreVertical,
    Wallet,
    Trash2,
    Edit,
    X,
    AlertCircle,
    Inbox,
    FileText,
    Clock
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Alert,
    TextField,
    Button,
    Menu,
    MenuItem,
    Typography,
    Box,
    Tooltip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { expenseService } from '../../api';
import Modal from '../../components/ui/Modal';
import CreatedAtText from '../../components/ui/CreatedAtText';
import Input from '../../components/ui/Input';
import { formatLKR } from '../../utils/formatters';

// Validation Schema matches backend exactly now
const expenseSchema = z.object({
    category: z.string().min(2, 'Category is required'),
    amount: z.preprocess((val) => Number(val), z.number().positive('Amount must be positive')),
    expenseDate: z.string().min(1, 'Date is required'),
    note: z.string().optional()
});

const Expenses = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuSelectedExpense, setMenuSelectedExpense] = useState(null);

    // Search state
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => setSearchTerm(searchInput), 400);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const { data: expenses, isLoading, error } = useQuery({
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
            expenseDate: new Date().toISOString().slice(0, 16), // datetime-local format: YYYY-MM-DDTHH:mm
            note: ''
        }
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => expenseService.createExpense(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success(data?.message || 'Expense recorded');
            handleCloseModal();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to record expense')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => expenseService.updateExpense(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success(data?.message || 'Expense updated');
            handleCloseModal();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update expense')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => expenseService.deleteExpense(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            toast.success(data?.message || 'Record deleted');
            setIsDeleteModalOpen(false);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete record')
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
        if (!expenses || expenses.length === 0) return { total: 0, majorCategory: 'N/A' };
        const total = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const categoryMap = {};
        expenses.forEach(exp => categoryMap[exp.category] = (categoryMap[exp.category] || 0) + (Number(exp.amount) || 0));
        const majorCategory = Object.entries(categoryMap).reduce((a, b) => a[1] > b[1] ? a : b)[0];
        return { total, majorCategory };
    }, [expenses]);

    // Helper for Real System Time (Local ISO)
    const getLocalISO = (dateStr) => {
        const date = dateStr ? new Date(dateStr) : new Date();
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date - offset).toISOString().slice(0, 16);
    };

    // Handlers
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
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedExpense(null);
        reset();
    };

    const onSubmit = (data) => {
        // Ensure date is in precise ISO format for LocalDateTime if needed, 
        // but datetime-local's YYYY-MM-DDTHH:mm is usually fine.
        if (isEditMode) {
            updateMutation.mutate({ id: selectedExpense.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleMenuClick = (event, expense) => {
        setAnchorEl(event.currentTarget);
        setMenuSelectedExpense(expense);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuSelectedExpense(null);
    };

    if (isLoading) return <Box className="flex items-center justify-center min-h-[400px]"><CircularProgress color="primary" /></Box>;
    if (error) return <Box className="p-8"><Alert severity="error">Failed to load expenses. Please try again later.</Alert></Box>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Expense Tracker</h1>
                    <p className="text-slate-500 mt-1">Manage business overheads and operational costs.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add Expense</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                            <ArrowUpRight />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Burn</p>
                    <h3 className="text-3xl font-black text-slate-800">{formatLKR(stats.total)}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <PieChart />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Top Category</p>
                    <h3 className="text-3xl font-black text-slate-800">{stats.majorCategory}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Wallet />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Records</p>
                    <h3 className="text-3xl font-black text-slate-800">{expenses?.length}</h3>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search category or notes..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-rose-500 transition-all outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 border border-slate-200 px-5 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                    <Calendar size={18} />
                    <span>Filter</span>
                </button>
            </div>

            <TableContainer component={Paper} elevation={0} className="border border-slate-100 overflow-hidden shadow-sm" sx={{ borderRadius: '24px' }}>
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Date & Time</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Category</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Amount</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Note</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredExpenses.map((exp) => (
                            <TableRow key={exp.id} hover className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex flex-col">
                                        <CreatedAtText value={exp.expenseDate} showIcon={false} className="!gap-1 flex-col !items-start" />
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">{exp.category}</span>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 font-black text-slate-800 text-lg">
                                    {formatLKR(exp.amount)}
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-slate-500 text-sm">
                                    <Tooltip title={exp.note || 'No note'}><span className="cursor-help">{exp.note || '-'}</span></Tooltip>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-right">
                                    <IconButton size="small" onClick={(e) => handleMenuClick(e, exp)}>
                                        <MoreVertical size={18} className="text-slate-400" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredExpenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <Inbox size={48} className="mx-auto text-slate-200 mb-2" />
                                    <Typography className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Manage Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={isEditMode ? 'Edit Record' : 'Record Expense'}
                footer={
                    <div className="flex gap-4">
                        <button
                            onClick={handleCloseModal}
                            className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Confirm Record'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <Input
                        label="Category"
                        {...register('category')}
                        error={errors.category?.message}
                        placeholder="e.g. Rent, Salary, Utilities"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input
                            label="Amount"
                            type="number"
                            {...register('amount')}
                            error={errors.amount?.message}
                            placeholder="0.00"
                        />
                        <Input
                            label="Date & Time"
                            type="datetime-local"
                            {...register('expenseDate')}
                            error={errors.expenseDate?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                            Note (Optional)
                        </label>
                        <textarea
                            rows={3}
                            {...register('note')}
                            placeholder="Add memo or description..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-semibold text-slate-800 placeholder:text-slate-300 resize-none"
                        />
                    </div>
                </div>
            </Modal>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ sx: { borderRadius: '16px', minWidth: 160, mt: 1, border: '1px solid #f1f5f9' } }}
            >
                <MenuItem onClick={() => { handleOpenModal(menuSelectedExpense); handleMenuClose(); }} className="text-sm font-semibold text-slate-700 py-3 px-4 flex gap-3 hover:bg-slate-50">
                    <Edit size={16} className="text-indigo-600" /> Edit Record
                </MenuItem>
                <MenuItem onClick={() => { setSelectedExpense(menuSelectedExpense); setIsDeleteModalOpen(true); handleMenuClose(); }} className="text-sm font-semibold text-rose-600 py-3 px-4 flex gap-3 hover:bg-rose-50">
                    <Trash2 size={16} /> Delete Record
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Record?"
                footer={
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => deleteMutation.mutate(selectedExpense.id)}
                            disabled={deleteMutation.isPending}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Yes, Delete Record'}
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="text-center py-6">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={40} className="text-rose-500" />
                    </div>
                    <p className="text-slate-600 leading-relaxed text-center">
                        Delete expense record of <br />
                        <span className="font-bold text-slate-800 text-lg">{formatLKR(selectedExpense?.amount)}</span>?
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default Expenses;
