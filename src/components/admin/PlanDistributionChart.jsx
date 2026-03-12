import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#3b82f6'];

const PlanDistributionChart = ({ data }) => {
    const chartData = React.useMemo(() => {
        let list = [];
        if (Array.isArray(data)) {
            list = data;
        } else if (data && typeof data === 'object') {
            // Case 1: Nested array
            const possibleList = data.planDistribution || data.distribution || data.plans || data.data;
            if (Array.isArray(possibleList)) {
                list = possibleList;
            } else {
                // Case 2: Key-value object { "Free": 5, "Pro": 2 }
                // Filter out success/message keys if it's a raw response
                list = Object.entries(data)
                    .filter(([key]) => !['success', 'message', 'data'].includes(key))
                    .map(([name, value]) => ({ name, value: Number(value) }));
                return list.filter(item => !isNaN(item.value) && item.value > 0);
            }
        }

        return list.map(item => ({
            name: item.planName || item.name || item.label || 'Unknown',
            value: Number(item.count || item.value || item.businessCount || 0)
        })).filter(item => !isNaN(item.value) && item.value > 0);
    }, [data]);

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                No plan data available
            </div>
        );
    }

    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <div className="relative w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1a1b24', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
                <span className="text-[32px] font-black text-white leading-none">{total}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
            </div>
        </div>
    );
};

export default PlanDistributionChart;
