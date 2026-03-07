import React from "react";
import {
    History as HistoryIcon,
    ChevronRight as ArrowIcon
} from '@mui/icons-material';

const LatestLogsTable = ({ logs }) => {
    const getLevelStyles = (level) => {
        switch (level?.toUpperCase()) {
            case "INFO":
                return "text-indigo-400 bg-indigo-400/10 border-indigo-400/20";
            case "WARN":
                return "text-amber-400 bg-amber-400/10 border-amber-400/20";
            case "ERROR":
                return "text-rose-400 bg-rose-400/10 border-rose-400/20";
            case "OK":
                return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            default:
                return "text-slate-400 bg-white/5 border-white/10";
        }
    };

    return (
        <div className="bg-[#15161c] border border-white/5 rounded-[32px] overflow-hidden mt-8">
            <div className="p-8 pb-4 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Latest System Logs</h3>
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-1">Showing 5 of 142</p>
                </div>
                <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-bold text-xs uppercase tracking-widest">
                    View All <ArrowIcon sx={{ fontSize: 16 }} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="border-b border-white/5">
                        <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Time</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Level</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Message</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Entity ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {(logs || []).slice(0, 5).map((log, idx) => (
                            <tr key={log.id || idx} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-8 py-5 text-[13px] font-medium text-slate-500 whitespace-nowrap">
                                    {new Date(log.createdAt || Date.now()).toLocaleString('en-US', {
                                        month: 'numeric',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                        second: 'numeric',
                                        hour12: true
                                    })}
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getLevelStyles(log.level)}`}>
                                        {log.level || 'INFO'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-[14px] font-bold text-slate-300">
                                    {log.message}
                                </td>
                                <td className="px-8 py-5 text-[13px] font-bold text-slate-600">
                                    #{log.id ? String(log.id).slice(-2) : '25'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LatestLogsTable;
