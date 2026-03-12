import React from 'react';
import {
    Activity,
    Search,
    RefreshCw,
    Shield,
    Database,
    Zap,
    Download,
    Terminal,
    Eye,
    ChevronRight as ArrowIcon
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { logService } from '../../api';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const AdminLogs = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const { data: logs, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: () => logService.getSystemLogs(),
    });

    const filteredLogs = React.useMemo(() => {
        if (!Array.isArray(logs)) return [];
        return logs.filter(log => 
            (log.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.level || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [logs, searchTerm]);

    const totalEvents = filteredLogs.length;
    const errorCount = filteredLogs.filter(l => l.level === 'ERROR').length;
    const infoCount = totalEvents - errorCount;

    const metrics = [
        { label: 'Total Events', count: totalEvents, color: 'indigo', icon: <Activity size={22} />, sub: 'Recorded entries' },
        { label: 'System Errors', count: errorCount, color: 'rose', icon: <Shield size={22} />, sub: 'Action required' },
        { label: 'Info Logs', count: infoCount, color: 'emerald', icon: <Zap size={22} />, sub: 'Normal operations' },
        { label: 'System Health', count: errorCount === 0 && totalEvents > 0 ? '100%' : totalEvents === 0 ? 'Pending' : 'Stable', color: 'sky', icon: <Database size={22} />, sub: 'Online status' },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CircularProgress sx={{ color: '#6366f1' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-[2rem] px-8 py-6 font-black uppercase tracking-widest text-xs text-center shadow-2xl">
                    Sync Error: Failed to load system activity logs.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 relative">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
                        System Activity
                    </h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Real-time monitoring of all backend operations and events</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2.5 bg-white/5 text-slate-400 px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:text-white transition-all border border-white/5 group"
                    >
                        <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
                        <span>Refresh Feed</span>
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((stat, i) => (
                    <div key={i} className="bg-[#15161c] border border-white/5 p-8 rounded-[32px] group hover:bg-[#1a1b24] transition-all duration-300 relative overflow-hidden">
                        <div className={`w-14 h-14 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-3xl font-black text-white">{stat.count}</h3>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{stat.sub}</p>
                        </div>
                        <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:bg-${stat.color}-500/10 transition-all`} />
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative group">
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search logs by message or level..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-16 bg-[#15161c] border border-white/5 rounded-[24px] pl-16 pr-8 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                />
            </div>

            {/* Activity Table */}
            <div className="bg-[#15161c] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', borderRadius: 0 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 4 } }}>
                                <TableCell sx={{ color: '#94a3b8' }} className="px-10 font-black text-[10px] uppercase tracking-[0.2em]">ID</TableCell>
                                <TableCell sx={{ color: '#94a3b8' }} className="px-10 font-black text-[10px] uppercase tracking-[0.2em]">Timestamp</TableCell>
                                <TableCell sx={{ color: '#94a3b8' }} className="px-10 font-black text-[10px] uppercase tracking-[0.2em]">Status Level</TableCell>
                                <TableCell sx={{ color: '#94a3b8' }} className="px-10 font-black text-[10px] uppercase tracking-[0.2em]">System Message</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredLogs.map((log) => (
                                <TableRow
                                    key={log.id}
                                    sx={{
                                        '& td': { borderBottom: '1px solid rgba(255,255,255,0.03)', py: 4 },
                                        '&:last-child td': { borderBottom: 0 },
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' }
                                    }}
                                    className="group transition-colors"
                                >
                                    <TableCell className="px-10">
                                        <span className="text-[11px] font-mono text-slate-300 font-bold">#{log.id}</span>
                                    </TableCell>
                                    <TableCell className="px-10">
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-[10px] uppercase tracking-widest">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${log.level === 'ERROR' ? 'bg-rose-500 shadow-rose-500/50' :
                                                    log.level === 'WARNING' ? 'bg-amber-500 shadow-amber-500/50' :
                                                        'bg-emerald-500 shadow-emerald-500/50'
                                                }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${log.level === 'ERROR' ? 'text-rose-500' :
                                                    log.level === 'WARNING' ? 'text-amber-500' :
                                                        'text-emerald-500'
                                                }`}>
                                                {log.level || 'INFO'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell sx={{ color: '#ffffff' }} className="px-10 font-bold text-sm italic py-6">
                                        {log.message}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredLogs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-20">
                                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No activity logs found matching your criteria</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

export default AdminLogs;
