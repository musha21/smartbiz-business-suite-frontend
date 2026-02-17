import React from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ReTooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Business,
    GroupAdd,
    MonetizationOn,
    Psychology,
    Notifications
} from '@mui/icons-material';

const mockSignupTrend = [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 48 },
    { month: 'Apr', count: 70 },
    { month: 'May', count: 61 },
    { month: 'Jun', count: 95 },
];

const mockRevenueByPlan = [
    { name: 'Free', value: 12500 },
    { name: 'Basic', value: 18400 },
    { name: 'Premium', value: 32600 },
];

const COLORS = ['#94a3b8', '#3b82f6', '#1d4ed8'];

const AdminDashboard = () => {
    const stats = [
        { title: "Total Businesses", value: "1,280", trend: "+12%", icon: <Business />, color: "text-blue-600" },
        { title: "Active Platforms", value: "842", trend: "+5%", icon: <GroupAdd />, color: "text-indigo-600" },
        { title: "Monthly Revenue", value: "$46,500", trend: "+24%", icon: <MonetizationOn />, color: "text-emerald-600" },
        { title: "AI Computations", value: "14.2k", trend: "+60%", icon: <Psychology />, color: "text-purple-600" },
    ];

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Pulse</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Real-time Platform Metrics</p>
                </div>
                <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-black text-slate-700">
                    Last Snapshot: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-slate-50 ${s.color} group-hover:bg-blue-600 group-hover:text-white transition-colors`}>
                                {s.icon}
                            </div>
                            <span className="text-emerald-600 font-black text-xs bg-emerald-50 px-3 py-1 rounded-full">{s.trend}</span>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{s.title}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{s.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl">
                    <h3 className="text-white font-black uppercase tracking-widest text-sm mb-10">New Registration Velocity</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockSignupTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="month" stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <YAxis stroke="#475569" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                <ReTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: 'white' }}
                                    itemStyle={{ color: '#60a5fa' }}
                                />
                                <Line type="stepAfter" dataKey="count" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm mb-10">Revenue Yield by Segment</h3>
                    <div className="h-[300px] flex">
                        <ResponsiveContainer width="60%" height="100%">
                            <PieChart>
                                <Pie
                                    data={mockRevenueByPlan}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {mockRevenueByPlan.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ReTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 flex flex-col justify-center space-y-6 ml-8">
                            {mockRevenueByPlan.map((p, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{p.name}</p>
                                        <p className="text-xl font-black text-slate-800">${p.value.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">Target Intelligence Activities</h3>
                    <button className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100">Audit All</button>
                </div>
                <div className="p-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex items-center gap-6 p-6 hover:bg-slate-50 rounded-[2rem] transition-colors border-b border-slate-50 last:border-0 pt-0">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <Notifications fontSize="small" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">New Business Registered: <span className="text-blue-600">Quantum Logistics Ltd.</span></p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: Active • {i * 12} mins ago</p>
                            </div>
                            <button className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-colors">
                                Inspect
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
