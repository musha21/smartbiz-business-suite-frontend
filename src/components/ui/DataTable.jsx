import React from 'react';

const DataTable = ({ columns, data, emptyMessage = 'No data available', actions, dark = false }) => {
    return (
        <div className={`${dark ? 'bg-[#15161c] border border-white/5 rounded-[32px]' : 'bg-white rounded-2xl border border-slate-100'} shadow-xl overflow-hidden`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className={`${dark ? 'border-b border-white/5' : 'bg-slate-50 border-b border-slate-100'}`}>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${dark ? 'text-slate-600' : 'text-slate-400'}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            {actions && (
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
                                    Operations
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className={`${dark ? 'divide-y divide-white/5' : 'divide-y divide-slate-50'}`}>
                        {(!data || data.length === 0) ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className={`px-8 py-16 text-center font-bold italic ${dark ? 'text-slate-700' : 'text-slate-400'}`}
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, i) => (
                                <tr key={row.id || i} className={`transition-colors group ${dark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50/50'}`}>
                                    {columns.map((col) => (
                                        <td key={col.key} className={`px-8 py-5 text-sm font-bold ${dark ? 'text-slate-400' : 'text-slate-700'}`}>
                                            {col.render ? col.render(row[col.key], row, i) : (row[col.key] ?? '—')}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
