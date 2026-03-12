import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
    getAdminStats,
    getAdminLogs,
    getPlanAnalytics,
    getWeeklyActivity,
    getAIAnalytics
} from "../../api";
import StatsCards from "../../components/admin/StatsCards";
import LatestLogsTable from "../../components/admin/LatestLogsTable";
import PlanDistributionChart from "../../components/admin/PlanDistributionChart";
import WeeklyActivityChart from "../../components/admin/WeeklyActivityChart";
import AIUsageAnalytics from "../../components/admin/AIUsageAnalytics";
import {
    CalendarMonth as CalendarIcon,
    Refresh as RefreshIcon,
    ArrowForward as ArrowIcon,
    PictureAsPdf as PdfIcon,
    FileDownload as DownloadIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const dashboardRef = useRef(null);

    // Dynamic Data Fetching with Auto-refresh
    const {
        data: stats,
        isLoading: statsLoading,
        refetch: refetchStats
    } = useQuery({
        queryKey: ["adminStatsOverview"],
        queryFn: getAdminStats,
        refetchInterval: 10000, // 10s auto-refresh
    });

    const {
        data: planAnalytics,
        isLoading: planLoading
    } = useQuery({
        queryKey: ["adminPlanAnalytics"],
        queryFn: getPlanAnalytics,
        refetchInterval: 30000, // 30s auto-refresh
    });

    const {
        data: weeklyActivity,
        isLoading: activityLoading
    } = useQuery({
        queryKey: ["adminWeeklyActivity"],
        queryFn: getWeeklyActivity,
        refetchInterval: 60000, // 60s auto-refresh
    });

    const {
        data: aiAnalytics,
        isLoading: aiLoading
    } = useQuery({
        queryKey: ["adminAIAnalytics"],
        queryFn: getAIAnalytics,
        refetchInterval: 30000, // 30s auto-refresh
    });

    const {
        data: logs,
        isLoading: logsLoading,
        refetch: refetchLogs
    } = useQuery({
        queryKey: ["adminLogs", 20],
        queryFn: () => getAdminLogs(20),
        refetchInterval: 15000, // 15s auto-refresh
    });

    const isLoading = statsLoading || logsLoading || planLoading || activityLoading || aiLoading;

    const handleRetryAll = () => {
        refetchStats();
        refetchLogs();
    };

    const handleDownloadPDF = async () => {
        if (!dashboardRef.current) return;
        
        const canvas = await html2canvas(dashboardRef.current, {
            backgroundColor: '#0a0a0c',
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`admin-report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleExportCSV = () => {
        // Simple CSV export for logs
        if (!logs) return;
        const headers = ["Admin", "Action", "Timestamp"];
        const rows = logs.map(log => [log.admin, log.action, log.timestamp]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 max-w-[1600px] mx-auto min-h-screen" ref={dashboardRef}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 pb-8 border-b border-white/5 relative">
                <div className="space-y-2">
                    <h1 className="text-6xl font-black text-white tracking-tighter leading-none italic uppercase">
                        System Health
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">SaaS ERP Global Overview & AI Analytics</p>
                </div>

                <div className="flex items-center gap-4 no-print">
                    <div className="hidden lg:flex bg-[#15161c] border border-white/5 py-2.5 px-6 rounded-2xl items-center gap-4 group">
                        <CalendarIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                        <span className="text-sm font-black text-slate-400 tracking-tight uppercase">
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            className="p-3.5 rounded-2xl border border-white/5 bg-[#15161c] text-indigo-400 hover:text-white hover:bg-indigo-500/10 transition-all group"
                            title="Export PDF"
                        >
                            <PdfIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="p-3.5 rounded-2xl border border-white/5 bg-[#15161c] text-emerald-400 hover:text-white hover:bg-emerald-500/10 transition-all"
                            title="Export CSV"
                        >
                            <DownloadIcon sx={{ fontSize: 18 }} />
                        </button>
                        <button
                            onClick={handleRetryAll}
                            className="p-3.5 rounded-2xl border border-white/5 bg-[#15161c] text-slate-500 hover:text-white hover:border-indigo-500/30 transition-all active:rotate-180 duration-500"
                        >
                            <RefreshIcon className={isLoading ? 'animate-spin' : ''} sx={{ fontSize: 18 }} />
                        </button>
                    </div>
                </div>
            </div>

            {isLoading && !stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-40 bg-[#15161c] animate-pulse rounded-[24px] border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-12">
                    {/* Main Stats */}
                    <StatsCards stats={stats} />

                    {/* Middle Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Weekly Activity */}
                        <div className="lg:col-span-8 bg-[#15161c] border border-white/5 p-8 rounded-[32px] group relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                    Weekly Activity
                                    <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer text-xs uppercase tracking-widest font-black flex items-center gap-1 ml-4 border-b border-indigo-400/20 pb-0.5">
                                        Last 7 Days
                                    </span>
                                </h3>
                            </div>
                            <WeeklyActivityChart data={weeklyActivity} />
                        </div>

                        {/* Plan Distribution */}
                        <div className="lg:col-span-4 bg-[#15161c] border border-white/5 p-8 rounded-[32px] relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white tracking-tight">Plan Distribution</h3>
                            </div>
                            <PlanDistributionChart data={planAnalytics} />
                        </div>
                    </div>

                    {/* Bottom Analytics Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* AI Usage Analytics */}
                        <div className="lg:col-span-5 bg-[#15161c] border border-white/5 p-8 rounded-[32px] relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white tracking-tight">AI Utilization</h3>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Per Business</span>
                            </div>
                            <AIUsageAnalytics data={aiAnalytics} />
                        </div>

                        {/* Recent System Logs */}
                        <div className="lg:col-span-7 bg-[#15161c] border border-white/5 p-8 rounded-[32px] overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-white tracking-tight">System Audit Logs</h3>
                                <button 
                                    onClick={() => navigate('/admin/logs')}
                                    className="text-indigo-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-1"
                                >
                                    Detailed View <ArrowIcon sx={{ fontSize: 12 }} />
                                </button>
                            </div>
                            <LatestLogsTable logs={logs} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
