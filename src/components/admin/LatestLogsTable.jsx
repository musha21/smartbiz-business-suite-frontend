import React from "react";

const LatestLogsTable = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 shadow-sm">
                No logs available
            </div>
        );
    }

    const getLevelStyles = (level) => {
        switch (level?.toUpperCase()) {
            case "INFO":
                return "text-blue-600 bg-blue-50";
            case "WARN":
                return "text-orange-600 bg-orange-50";
            case "ERROR":
                return "text-red-600 bg-red-50";
            default:
                return "text-slate-600 bg-slate-50";
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">Latest System Logs</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Level</th>
                            <th className="px-6 py-4">Message</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getLevelStyles(log.level)}`}>
                                        {log.level}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-700 font-medium">
                                    {log.message}
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
