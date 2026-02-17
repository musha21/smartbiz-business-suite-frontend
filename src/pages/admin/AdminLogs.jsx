import React from 'react';
import {
    Activity,
    Search,
    Filter,
    Shield,
    Database,
    Zap,
    Download
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Avatar,
    CircularProgress,
    Alert
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { logService } from '../../api';

const AdminLogs = () => {
    const { data: logs, isLoading, error } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: () => logService.getSystemLogs(),
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
                <Alert severity="error">Failed to load system logs. Please try again later.</Alert>
            </div>
        );
    }

    const metrics = [
        { label: 'Security Events', count: '148', color: 'rose', icon: <Shield size={20} /> },
        { label: 'AI Invocations', count: '1,240', color: 'indigo', icon: <Zap size={20} /> },
        { label: 'DB Queries/sec', count: '45.2', color: 'emerald', icon: <Database size={20} /> },
        { label: 'System Health', count: '100%', color: 'sky', icon: <Activity size={20} /> },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Audit Ecosystem</h1>
                    <p className="text-slate-500 mt-1">Real-time system activity monitoring and forensic logs.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 border border-slate-200 bg-white text-slate-700 px-6 py-3 rounded-2xl font-black hover:bg-slate-50 transition-all uppercase text-xs tracking-widest shadow-sm">
                        <Download size={18} />
                        <span>Export Logs</span>
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 uppercase text-xs tracking-widest active:scale-95">
                        <Activity size={18} />
                        <span>Live Stream</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className={`w-10 h-10 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl flex items-center justify-center mb-4`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.count}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Filter by event, user, or IP address..."
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 border border-slate-200 px-6 py-3.5 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 uppercase tracking-widest">
                    <Filter size={18} />
                    Filters
                </button>
            </div>

            <TableContainer component={Paper} elevation={0} className="border border-slate-100 overflow-hidden shadow-sm" sx={{ borderRadius: '24px' }}>
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5">Type</TableCell>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5">Event Description</TableCell>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5">Initiator</TableCell>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5">IP Address</TableCell>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5">Timestamp</TableCell>
                            <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-none px-8 py-5 text-right">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs?.map((log) => (
                            <TableRow key={log.id} hover className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${log.type === 'Security' ? 'bg-rose-500' : log.type === 'AI' ? 'bg-indigo-500' : log.type === 'Alert' ? 'bg-amber-500' : 'bg-slate-500'
                                            }`} />
                                        <span className="text-xs font-black text-slate-700">{log.type}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <p className="font-bold text-slate-800">{log.event}</p>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: 'slate.200', color: 'slate.600', fontWeight: 'bold' }}>
                                            {(log.user || 'S')[0].toUpperCase()}
                                        </Avatar>
                                        <span className="text-sm font-semibold text-slate-600">{log.user || 'System'}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <span className="font-mono text-xs text-slate-400 font-bold">{log.ip || '0.0.0.0'}</span>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-slate-500 font-bold text-xs">
                                    {new Date(log.timestamp || Date.now()).toLocaleTimeString()}
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-right">
                                    <Chip
                                        label={log.status || 'Success'}
                                        size="small"
                                        className={`font-black text-[9px] uppercase tracking-widest h-6 ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                            }`}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default AdminLogs;
