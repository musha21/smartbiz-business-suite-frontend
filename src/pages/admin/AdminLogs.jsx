import React from 'react';
import {
    Activity,
    Search,
    Filter,
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
    const { data: logs, isLoading, error } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: () => logService.getSystemLogs(),
    });

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
                    Sync Error: Failed to load system forensic logs.
                </div>
            </div>
        );
    }

    const metrics = [
        { label: 'Security Firewall', count: '148', color: 'rose', icon: <Shield size={22} />, trend: '+12%', sub: 'Active blocks' },
        { label: 'AI Infrastructure', count: '1,240', color: 'indigo', icon: <Zap size={22} />, trend: '+5.4%', sub: 'Total Invocations' },
        { label: 'DB Query Engine', count: '45.2', color: 'emerald', icon: <Database size={22} />, trend: 'Healthy', sub: 'Ops per second' },
        { label: 'System Kernel', count: '100%', color: 'sky', icon: <Activity size={22} />, trend: 'Stable', sub: 'Uptime latency' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 relative">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
                        Audit Ecosystem
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Real-time system activity monitoring and forensic protocols</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2.5 bg-white/5 text-slate-400 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:text-white transition-all border border-white/5 group">
                        <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                        <span>Export Logs</span>
                    </button>
                    <button className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        <Activity size={18} className="animate-pulse" />
                        <span>Live Stream</span>
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
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-3xl font-black text-white">{stat.count}</h3>
                                <span className={`text-[10px] font-black uppercase ${stat.color === 'emerald' || stat.color === 'sky' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">{stat.sub}</p>
                        </div>
                        {/* Glow effect */}
                        <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl group-hover:bg-${stat.color}-500/10 transition-all`} />
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8">
                    <Input
                        dark
                        icon={Search}
                        placeholder="Filter by event, user, IP address, or kernel message..."
                    />
                </div>
                <div className="lg:col-span-4">
                    <button className="w-full h-14 flex items-center justify-center gap-3 bg-[#15161c] border border-white/5 rounded-[20px] text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:bg-[#1a1b24] transition-all">
                        <Filter size={18} />
                        Advanced Forensic Filters
                    </button>
                </div>
            </div>

            {/* Forensic Table */}
            <div className="bg-[#15161c] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent', borderRadius: 0 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.05)', py: 4 } }}>
                                <TableCell className="px-10 font-black text-[10px] text-slate-600 uppercase tracking-[0.2em]">Protocol</TableCell>
                                <TableCell className="px-10 font-black text-[10px] text-slate-600 uppercase tracking-[0.2em]">Forensic Detail</TableCell>
                                <TableCell className="px-10 font-black text-[10px] text-slate-600 uppercase tracking-[0.2em]">Identity</TableCell>
                                <TableCell className="px-10 font-black text-[10px] text-slate-600 uppercase tracking-[0.2em]">Origin (IP)</TableCell>
                                <TableCell className="px-10 font-black text-[10px] text-slate-600 uppercase tracking-[0.2em]">Timestamp</TableCell>
                                <TableCell className="px-10 font-black text-[10px] text-slate-600 uppercase tracking-[0.2em] text-right">State</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs?.map((log) => (
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
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${log.type === 'Security' ? 'bg-rose-500 shadow-rose-500/50' :
                                                    log.type === 'AI' ? 'bg-indigo-500 shadow-indigo-500/50' :
                                                        log.type === 'Alert' ? 'bg-amber-500 shadow-amber-500/50' :
                                                            'bg-slate-500 shadow-slate-500/50'
                                                }`} />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{log.type}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 font-bold text-slate-400 text-sm italic">
                                        {log.event}
                                    </TableCell>
                                    <TableCell className="px-10">
                                        <div className="flex items-center gap-4">
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    fontSize: '0.7rem',
                                                    bgcolor: 'rgba(255,255,255,0.05)',
                                                    color: '#94a3b8',
                                                    fontWeight: '900',
                                                    border: '1px solid rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                {(log.user || 'S')[0].toUpperCase()}
                                            </Avatar>
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{log.user || 'System Kernel'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10">
                                        <span className="font-mono text-[10px] text-indigo-400/70 font-black tracking-widest">{log.ip || '0.0.0.0'}</span>
                                    </TableCell>
                                    <TableCell className="px-10">
                                        <div className="flex flex-col">
                                            <span className="text-white font-black text-[10px] uppercase tracking-widest">{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</span>
                                            <span className="text-slate-700 text-[9px] font-bold uppercase tracking-widest">{new Date(log.timestamp || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-10 text-right">
                                        <Badge variant={log.status === 'Success' ? 'success' : 'warning'} dark>
                                            {log.status || 'Verified'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* Terminal View Component (Aesthetic addition) */}
            <div className="bg-black border border-white/5 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Terminal size={18} className="text-indigo-500" />
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Real-time Kernel Stream</h3>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                    </div>
                </div>
                <div className="space-y-3 font-mono text-[10px] leading-relaxed">
                    <p className="text-emerald-500/80"><span className="text-slate-600">[02:14:55]</span> INF: Secure tunnel established to node-042x</p>
                    <p className="text-indigo-500/80"><span className="text-slate-600">[02:15:02]</span> AI: Vector processing complete for invoice-9912. Latency: 12ms</p>
                    <p className="text-rose-500/80"><span className="text-slate-600">[02:15:10]</span> SEC: Unauthorized handshake attempt from 192.168.1.1. Blocked.</p>
                    <div className="flex gap-2">
                        <span className="text-indigo-500 font-bold">$</span>
                        <div className="w-2 h-4 bg-indigo-500 animate-pulse" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40 pointer-events-none" />
            </div>
        </div>
    );
};

export default AdminLogs;
