import React from 'react';
import {
    Plus,
    Search,
    ArrowUpRight,
    PieChart,
    Calendar,
    Download,
    MoreVertical,
    Wallet
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
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { expenseService } from '../../api';

const Expenses = () => {
    const { data: expenses, isLoading, error } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expenseService.getExpenses(),
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
                <Alert severity="error">Failed to load expenses. Please try again later.</Alert>
            </div>
        );
    }

    const totalBurn = expenses?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
    const formattedBurn = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBurn);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Expense Tracking</h1>
                    <p className="text-slate-500 mt-1">Control your business burn rate and operational costs.</p>
                </div>
                <button className="flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95">
                    <Plus size={20} />
                    <span>Record Expense</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                            <ArrowUpRight />
                        </div>
                        <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">+8.4%</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Monthly Burn</p>
                    <h3 className="text-2xl font-black text-slate-800">{formattedBurn}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <PieChart />
                        </div>
                        <span className="text-xs font-bold text-slate-400">Fixed: 40%</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Major Category</p>
                    <h3 className="text-2xl font-black text-slate-800">{expenses?.[0]?.category || 'N/A'}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Wallet />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Safe</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Remaining Budget</p>
                    <h3 className="text-2xl font-black text-slate-800">$3,379.30</h3>
                </div>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by payee or category..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 border border-slate-200 px-5 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        <Calendar size={18} />
                        Date
                    </button>
                    <button className="flex items-center gap-2 border border-slate-200 px-5 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            <TableContainer component={Paper} elevation={0} className="border border-slate-100 overflow-hidden shadow-sm" sx={{ borderRadius: '24px' }}>
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Date</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Payee & Category</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Type</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-center">Amount</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-center">Status</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses?.map((exp) => (
                            <TableRow key={exp.id} hover className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="border-none px-8 py-6 text-slate-500 font-medium">
                                    {new Date(exp.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <div>
                                        <p className="font-bold text-slate-800 leading-none">{exp.payee}</p>
                                        <p className="text-xs text-slate-400 mt-1 font-semibold">{exp.category}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <span className="px-2.5 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        {exp.type || 'Expense'}
                                    </span>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-center font-black text-slate-800">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(exp.amount)}
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-center">
                                    <Chip
                                        label={exp.status}
                                        className={`font-black text-[10px] uppercase tracking-wider h-7 ${exp.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                            exp.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                            }`}
                                    />
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-right">
                                    <IconButton size="small">
                                        <MoreVertical size={18} className="text-slate-400" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Expenses;
