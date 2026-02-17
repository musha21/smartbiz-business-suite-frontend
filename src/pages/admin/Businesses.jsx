import React from 'react';
import {
    Building2,
    Search,
    Filter,
    MoreVertical,
    ArrowUpRight,
    User
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
    Tooltip,
    Avatar,
    CircularProgress,
    Alert
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { businessService } from '../../api';

const Businesses = () => {
    const { data: businesses, isLoading, error } = useQuery({
        queryKey: ['admin-businesses'],
        queryFn: () => businessService.getBusinesses(),
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
                <Alert severity="error">Failed to load platform businesses. Please try again later.</Alert>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Business Governance</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
                        Managing {businesses?.length || 0} Registered Entities
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
                        Export Platform Data
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full text-slate-900">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder="Search by business name, owner email or entity ID..."
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    />
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 border border-slate-200 px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex-1 lg:flex-none border border-slate-200 px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
                        Plan Type
                    </button>
                </div>
            </div>

            <TableContainer component={Paper} elevation={0} className="border border-slate-100 bg-white" sx={{ borderRadius: '3rem', overflow: 'hidden shadow-sm' }}>
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-black text-slate-400 uppercase tracking-widest text-[10px] border-none px-10 py-6">Business Entity</TableCell>
                            <TableCell className="font-black text-slate-400 uppercase tracking-widest text-[10px] border-none px-10 py-6">Admin Contact</TableCell>
                            <TableCell className="font-black text-slate-400 uppercase tracking-widest text-[10px] border-none px-10 py-6 text-center">Plan Tier</TableCell>
                            <TableCell className="font-black text-slate-400 uppercase tracking-widest text-[10px] border-none px-10 py-6 text-center">Status</TableCell>
                            <TableCell className="font-black text-slate-400 uppercase tracking-widest text-[10px] border-none px-10 py-6 text-right">Sequence</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {businesses?.map((b) => (
                            <TableRow key={b.id} hover className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all">
                                <TableCell className="border-none px-10 py-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg shadow-slate-900/10">
                                            <Building2 size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 text-base leading-tight">{b.name}</p>
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1 italic">ID-{b.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <Avatar sx={{ bgcolor: 'slate.200', width: 32, height: 32 }}>
                                            <User size={16} className="text-slate-600" />
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-bold text-slate-800">{b.ownerName || 'Admin User'}</p>
                                            <p className="text-[10px] font-bold text-slate-400">Joined {new Date(b.createdAt || Date.now()).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-10 py-8 text-center">
                                    <Chip
                                        label={b.planName || 'Free'}
                                        className={`font-black text-[9px] uppercase tracking-[0.2em] h-7 px-4 ${b.planName === 'Premium' || b.planName === 'Business Pro' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
                                            }`}
                                    />
                                </TableCell>
                                <TableCell className="border-none px-10 py-8 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${b.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${b.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>{b.status || 'Active'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-10 py-8 text-right">
                                    <div className="flex justify-end gap-3">
                                        <Tooltip title="View Intelligence">
                                            <IconButton size="small" className="bg-slate-50 hover:bg-blue-50 transition-colors">
                                                <ArrowUpRight size={18} className="text-slate-400 hover:text-blue-600" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Security Actions">
                                            <IconButton size="small" className="bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <MoreVertical size={18} className="text-slate-400" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Businesses;
