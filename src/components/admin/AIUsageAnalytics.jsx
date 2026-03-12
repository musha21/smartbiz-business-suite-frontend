import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AIUsageAnalytics = ({ data }) => {
    const chartData = React.useMemo(() => {
        let list = [];
        if (Array.isArray(data)) {
            list = data;
        } else if (data && Array.isArray(data.usagePerBusiness)) {
            list = data.usagePerBusiness;
        }

        return list.map(item => ({
            businessName: item.businessName || item.name || 'Unknown',
            usage: Number(item.creditsUsed || item.usage || item.currentUsage || 0)
        }));
    }, [data]);

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                No AI usage data available
            </div>
        );
    }

    return (
        <div className="h-80 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="businessName" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                        width={100}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        contentStyle={{ 
                            backgroundColor: '#1a1b24', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                        }}
                    />
                    <Bar 
                        dataKey="usage" 
                        radius={[0, 4, 4, 0]} 
                        barSize={20}
                        animationDuration={1000}
                    >
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.usage > 80 ? '#f43f5e' : entry.usage > 50 ? '#f59e0b' : '#6366f1'} 
                                fillOpacity={0.8}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AIUsageAnalytics;
