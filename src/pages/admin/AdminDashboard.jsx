import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    getAdminStats,
    getAdminLogs
} from "../../api";
import StatsCards from "../../components/admin/StatsCards";
import LatestLogsTable from "../../components/admin/LatestLogsTable";

const AdminDashboard = () => {
    const navigate = useNavigate();

    // 1. Fetch Stats
    const {
        data: stats,
        isLoading: statsLoading,
        isError: statsError,
        error: statsErrorObj,
        refetch: refetchStats
    } = useQuery({
        queryKey: ["adminStatsOverview"],
        queryFn: getAdminStats,
    });

    // 2. Fetch Logs
    const {
        data: logs,
        isLoading: logsLoading,
        isError: logsError,
        error: logsErrorObj,
        refetch: refetchLogs
    } = useQuery({
        queryKey: ["adminLogs", 20],
        queryFn: () => getAdminLogs(20),
    });

    const isLoading = statsLoading || logsLoading;
    const isForbidden = statsErrorObj?.isForbidden || logsErrorObj?.isForbidden;
    const hasGeneralError = (statsError || logsError) && !isForbidden;

    // Retry all Handler
    const handleRetryAll = () => {
        refetchStats();
        refetchLogs();
    };

    // Forbidden UI State
    if (isForbidden) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-rose-100 p-4 rounded-full mb-4">
                    <svg className="w-12 h-12 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11 3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Admin Access Required</h2>
                <p className="text-slate-600 mb-8 max-w-md">
                    You do not have the necessary permissions to view the admin dashboard.
                    Please log in with an administrator account.
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    // Error UI State
    if (hasGeneralError) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-amber-100 p-4 rounded-full mb-4">
                    <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Failed to load dashboard</h2>
                <p className="text-slate-600 mb-6">Something went wrong while fetching the admin data.</p>
                <button
                    onClick={handleRetryAll}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor border">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">SaaS ERP Global Overview & System Health</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRetryAll}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all"
                        title="Refresh Data"
                    >
                        <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    {/* Skeleton Loaders */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-[400px] bg-slate-200 animate-pulse rounded-xl" />
                        <div className="h-[400px] bg-slate-200 animate-pulse rounded-xl" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Section */}
                    <StatsCards stats={stats} />

                    {/* Tables Section */}
                    <div className="grid grid-cols-1 gap-6 items-start">
                        <LatestLogsTable logs={logs || []} />
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
