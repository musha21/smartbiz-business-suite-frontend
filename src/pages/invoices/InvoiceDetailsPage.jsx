import React, { useState } from 'react';
import {
    ArrowLeft,
    Download,
    FileText,
    User,
    Calendar,
    Hash,
    Search,
    Zap,
    TrendingUp,
    Shield,
    CheckCircle,
    Clock,
    Activity,
    Lock,
    Printer
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    CircularProgress,
    Box,
    TextField,
    InputAdornment
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '../../api';
import CreatedAtText from '../../components/ui/CreatedAtText';
import { formatLKR } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';

const InvoiceDetailsPage = () => {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();
    const [searchNumber, setSearchNumber] = useState('');
    const [currentId, setCurrentId] = useState(paramId);

    const { data: invoice, isLoading, error } = useQuery({
        queryKey: ['invoice', currentId],
        queryFn: () => invoiceService.getInvoiceById(currentId),
        enabled: !!currentId,
    });

    const statusMutation = useMutation({
        mutationFn: (status) => invoiceService.updateInvoiceStatus(currentId, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['invoice', currentId] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const handleSearch = async () => {
        if (!searchNumber) return;
        try {
            const result = await invoiceService.getInvoiceByNumber(searchNumber);
            if (result && result.id) {
                setCurrentId(result.id);
                navigate(`/invoices/${result.id}`, { replace: true });
                setSearchNumber('');
            } else {
                // Not found handled implicitly or explicitly if needed
            }
        } catch (err) {
            // Not found handled
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <CircularProgress sx={{ color: '#6366f1' }} />
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] animate-pulse ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Loading invoice details...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="p-8">
                <div className={`border rounded-[2rem] px-8 py-6 font-black uppercase tracking-widest text-xs text-center shadow-2xl ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                    Error: Invoice not found or failed to load.
                </div>
            </div>
        );
    }

    const toggleLabel = invoice.status === 'PAID' ? 'UNPAID' : 'PAID';

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
            {/* Header / Actions */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/5 relative">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/invoices')}
                        className={`w-14 h-14 border rounded-2xl flex items-center justify-center transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Invoice #{invoice.invoiceNumber}
                            </h1>
                            <Badge variant={invoice.status === 'PAID' ? 'success' : 'danger'} dark={isDarkMode}>{invoice.status}</Badge>
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Customer: <span className="text-indigo-400">{invoice.customer?.name || invoice.customerName || 'Cash Sale'}</span></p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => invoiceService.previewPdf(invoice.id)}
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border shadow-xl ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <Printer size={18} />
                        <span>Preview PDF</span>
                    </button>
                    <button
                        onClick={() => invoiceService.downloadPdf(invoice.id)}
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border shadow-xl ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <Download size={18} />
                        <span>Download PDF</span>
                    </button>
                    <button
                        onClick={() => statusMutation.mutate(toggleLabel)}
                        disabled={statusMutation.isPending}
                        className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${invoice.status === 'PAID'
                            ? (isDarkMode ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white')
                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/40'
                            }`}
                    >
                        {statusMutation.isPending ? <CircularProgress size={16} color="inherit" /> : (invoice.status === 'PAID' ? <Clock size={18} /> : <CheckCircle size={18} />)}
                        <span>Mark as {toggleLabel}</span>
                    </button>
                </div>
            </div>

            {/* Quick Search Section */}
            <div className="flex justify-start">
                <div className="relative group w-80">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-700 group-focus-within:text-indigo-400' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={18} />
                    <input
                        type="text"
                        placeholder="Search Invoice #..."
                        value={searchNumber}
                        onChange={(e) => setSearchNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className={`w-full pl-14 pr-18 py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all ${isDarkMode ? 'bg-[#15161c] border-white/5 text-white placeholder:text-slate-800' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-300 shadow-sm'}`}
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        Go
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Details Breakdown */}
                <div className="lg:col-span-8 space-y-10">
                    <div className={`p-10 rounded-[40px] border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                <Hash size={20} />
                            </div>
                            <h2 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Invoice Items</h2>
                        </div>

                        <div className="overflow-x-auto relative z-10">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className={`border-b ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <th className={`py-5 px-8 text-[9px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Product</th>
                                        <th className={`py-5 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-center ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Qty</th>
                                        <th className={`py-5 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-right ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Price</th>
                                        <th className={`py-5 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-right ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items?.map((item, index) => (
                                        <tr key={item.id || index} className={`border-b last:border-0 transition-colors group/row ${isDarkMode ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50/50'}`}>
                                            <td className="py-6 px-8">
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-xs uppercase tracking-tight transition-colors ${isDarkMode ? 'text-white group-hover/row:text-indigo-400' : 'text-slate-900 group-hover/row:text-indigo-600'}`}>{item.product?.name || item.productName}</span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 italic ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Batch: {item.batch?.batchNumber || item.batchNumber || item.batchId || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-center">
                                                <span className={`text-xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>x{item.quantity}</span>
                                            </td>
                                            <td className={`py-6 px-8 text-right font-black text-xs italic ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {formatLKR(item.unitPrice)}
                                            </td>
                                            <td className={`py-6 px-8 text-right font-black text-base italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {formatLKR(item.lineTotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={`mt-12 flex flex-col items-end gap-4 relative z-10 border-t pt-10 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className={`flex justify-between w-64 font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                <span>Subtotal</span>
                                <span className={`italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatLKR(invoice.totalAmount)}</span>
                            </div>
                            <div className={`flex justify-between w-64 pt-6 mt-2 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                <span className={`text-lg font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Grand Total</span>
                                <span className="text-3xl font-black text-indigo-400 italic tracking-tighter whitespace-nowrap">
                                    {formatLKR(invoice.totalAmount)}
                                </span>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px]" />
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div className={`p-10 rounded-[40px] border relative overflow-hidden h-fit transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="space-y-10 relative z-10">
                            <div>
                                <div className={`flex items-center gap-3 mb-6 uppercase tracking-[0.2em] font-black text-[9px] ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>
                                    <User size={16} /> Customer Info
                                </div>
                                <div className={`p-6 rounded-[24px] border space-y-4 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                    <p className={`font-black text-sm uppercase tracking-wide italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{invoice.customer?.name || invoice.customerName || 'Cash Sale'}</p>
                                    <div className={`h-px ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`} />
                                    <div className="space-y-2">
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{invoice.customer?.email || '—'}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{invoice.customer?.phone || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className={`flex items-center gap-3 mb-6 uppercase tracking-[0.2em] font-black text-[9px] ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>
                                    <Calendar size={16} /> Key Dates
                                </div>
                                <div className={`grid grid-cols-2 gap-6 p-6 rounded-[24px] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="space-y-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Issued</span>
                                        <CreatedAtText value={invoice.invoiceDate} showIcon={false} className={`text-[10px] font-black uppercase italic tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest block ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Due</span>
                                        <CreatedAtText value={invoice.invoiceDate} showIcon={false} className={`text-[10px] font-black uppercase italic tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 bg-indigo-500/5 rounded-[24px] border border-indigo-500/10 space-y-3`}>
                                <div className="flex items-center gap-3">
                                    <Shield size={16} className="text-indigo-500" />
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Helpful Note</span>
                                </div>
                                <p className={`text-[10px] font-bold leading-relaxed uppercase tracking-wide ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                    This invoice is permanently stored in your records.
                                </p>
                            </div>
                        </div>
                        <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] ${isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-500/10'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsPage;
