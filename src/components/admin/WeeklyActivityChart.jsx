import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const WeeklyActivityChart = ({ data }) => {
    const chartData = React.useMemo(() => {
        let list = [];
        if (Array.isArray(data)) {
            list = data;
        } else if (data && typeof data === 'object') {
            list = data.weeklyActivity || data.activity || data.usagePerDay || [];
        }
        return list;
    }, [data]);

    if (chartData.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                No activity data available
            </div>
        );
    }

    return (
        <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1b24', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                        }}
                    />
                    <Legend 
                        verticalAlign="top" 
                        align="right"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{value}</span>}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="registrations" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorReg)" 
                        animationDuration={1500}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="activations" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAct)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeeklyActivityChart;
