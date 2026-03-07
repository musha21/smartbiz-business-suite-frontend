import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    BarChart3, Sparkles, TrendingUp, Package, FileText,
    Loader2, RefreshCw, ArrowUpRight, Clock, Share2, Mail,
    Copy, Download, Activity, Image as ImageIcon, Zap,
    CheckCircle2, MessageSquare
} from 'lucide-react';
import { reportService, aiService, subscriptionService, customerService, authService } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatLKR } from '../../utils/formatters';
import UsageProgressBar from '../../components/subscription/UsageProgressBar';
import { toast } from 'react-toastify';
import CreatedAtText from '../../components/ui/CreatedAtText';
import Badge from '../../components/ui/Badge';

// ─── Constants ──────────────────────────────────────
const REPORT_TONES = ['Professional', 'Friendly', 'Analytical', 'Executive'];
const QUICK_QUESTIONS = [
    { id: 'summary', label: '📊 Summarize Performance', prompt: 'Give me a complete summary of my business performance for this period.' },
    { id: 'profit', label: '📉 Profit Analysis', prompt: 'Analyze my profit margins and highlight areas of concern.' },
    { id: 'growth', label: '💡 Growth Suggestions', prompt: 'Based on my sales and product data, suggest actionable growth strategies.' },
    { id: 'forecast', label: '🔮 Sales Forecast', prompt: 'Based on current trends, forecast my sales for the next month.' },
    { id: 'risk', label: '⚠️ Risk Assessment', prompt: 'Identify potential financial risks based on unpaid invoices and expense trends.' },
    { id: 'top', label: '🏆 Top Product Deep Dive', prompt: 'Analyze my top performing products and suggest ways to maximize their revenue.' },
];

const MARKETING_PLATFORMS = [
    { id: 'instagram_post', label: 'IG Post', size: '1024x1024' },
    { id: 'instagram_story', label: 'IG Story', size: '1024x1536' },
    { id: 'facebook_post', label: 'FB Post', size: '1024x1024' },
    { id: 'banner', label: 'Banner', size: '1536x1024' },
];
const MARKETING_TONES = ['Exciting', 'Professional', 'Friendly', 'Urgent / FOMO', 'Luxury', 'Humorous'];

const EMAIL_CATEGORIES = [
    { id: 'INVOICE_REMINDER', label: 'Invoice Reminder', icon: '🧾', tones: ['Friendly', 'Second', 'Urgent'] },
    { id: 'PROMO_OFFER', label: 'Promo Offer', icon: '🎁', tones: ['Discount', 'New Product', 'Seasonal Sale'] },
];

// ─── Helper: Parse "Subject: ...\n\nBody: ..." string into object ───
const parseEmailString = (str) => {
    if (!str || typeof str !== 'string') return { subject: '', body: str || '' };
    const subjectMatch = str.match(/Subject:\s*(.+)/i);
    // Capture everything after 'Body:' (or 'Body:\n' variants), strip leading blank lines
    const bodyMatch = str.match(/Body:\s*\n*([\s\S]+)/i);
    return {
        subject: subjectMatch ? subjectMatch[1].trim() : '',
        body: bodyMatch ? bodyMatch[1].trim() : str,
    };
};

// ─── Sub-Components ───────────────────────────
const Card = ({ children, className = '', isDarkMode }) => (
    <div className={`rounded-[32px] border overflow-hidden ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-100 shadow-sm'} ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ icon, title, badge, isDarkMode, activeColor }) => (
    <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9 bg-${activeColor}-500/10 rounded-xl flex items-center justify-center text-${activeColor}-500`}>{icon}</div>
            <h3 className="text-xs font-black uppercase tracking-widest italic">{title}</h3>
        </div>
        {badge}
    </div>
);

// ─── Component ──────────────────────────────────────

const AnalyticsDashboard = () => {
    const { isDarkMode } = useTheme();
    const { user, profile } = useAuth();

    // Toggle State
    const [activeMode, setActiveMode] = useState('REPORTS');

    // Date Range
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });

    // Reports State
    const [reportTone, setReportTone] = useState('Professional');
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [customReportPrompt, setCustomReportPrompt] = useState('');

    // Marketing State
    const [marketingTopic, setMarketingTopic] = useState('');
    const [marketingPlatform, setMarketingPlatform] = useState('instagram_post');
    const [marketingTone, setMarketingTone] = useState('Exciting');
    const [imageSize, setImageSize] = useState('1024x1024');

    // Email State
    const [emailCategory, setEmailCategory] = useState('INVOICE_REMINDER');
    const [emailTone, setEmailTone] = useState('Friendly');
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [promoData, setPromoData] = useState({ title: '', discount: '', validUntil: '', ctaLink: '' });
    const [emailDrafts, setEmailDrafts] = useState([]);

    const [copiedKey, setCopiedKey] = useState(null);

    // ─── Queries ────────────────────────────────────
    const {
        data: analyticsData,
        isLoading: isAnalyticsLoading,
        isFetching: isAnalyticsFetching,
        refetch: refetchAnalytics
    } = useQuery({
        queryKey: ['analytics', dateRange.from, dateRange.to],
        queryFn: () => reportService.getAnalytics(dateRange.from, dateRange.to),
        retry: 1,
        enabled: !!user,
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: customerService.getCustomers,
        enabled: !!user && activeMode === 'EMAIL',
    });

    const { data: usageData, refetch: refetchUsage } = useQuery({
        queryKey: ['subscriptionUsage'],
        queryFn: subscriptionService.getUsageCounters,
        enabled: !!user,
    });

    // Removed redundant myProfile query as profile is now in AuthContext

    // ─── Mutations ──────────────────────────────────
    const aiReportMutation = useMutation({
        mutationFn: (payload) => aiService.getDetailedReport(payload),
        onSuccess: () => { toast.success('AI Report generated!'); refetchUsage(); },
        onError: () => toast.error('Failed to generate report.'),
    });

    const marketingMutation = useMutation({
        mutationFn: (data) => aiService.generateMarketingPost(data),
        onSuccess: () => { toast.success('Campaign drafted!'); refetchUsage(); },
        onError: () => toast.error('Marketing generation failed.'),
    });

    const imageMutation = useMutation({
        mutationFn: (data) => aiService.generateImage(data),
        onSuccess: () => { toast.success('Poster generated!'); refetchUsage(); },
        onError: () => toast.error('Image generation failed.'),
    });

    const emailMutation = useMutation({
        mutationFn: (data) => aiService.generateEmail(data),
        onSuccess: (res) => {
            toast.success('Email drafts generated!');
            refetchUsage();

            const data = res?.data || res;
            let templates = [];

            // 1. Extract templates from response
            if (data?.email && typeof data.email === 'string') {
                templates = [parseEmailString(data.email)];
            } else if (Array.isArray(data)) {
                templates = data.map(item => {
                    if (item?.email && typeof item.email === 'string') return parseEmailString(item.email);
                    if (item?.subject || item?.body) return item;
                    return parseEmailString(typeof item === 'string' ? item : JSON.stringify(item));
                });
            } else {
                const list = data?.drafts || data?.emails || data?.result;
                if (Array.isArray(list)) {
                    templates = list.map(item => {
                        if (item?.email && typeof item.email === 'string') return parseEmailString(item.email);
                        if (item?.subject || item?.body) return item;
                        return parseEmailString(typeof item === 'string' ? item : JSON.stringify(item));
                    });
                } else {
                    const rawStr = typeof data === 'string' ? data : JSON.stringify(data);
                    templates = [parseEmailString(rawStr)];
                }
            }

            // 2. Populate placeholders with real-time data
            const companyName = profile?.businessName || 'Our Business';
            const userName = profile?.name || user?.name || user?.fullName || user?.username || '';
            const finalDrafts = [];

            if (emailCategory === 'INVOICE_REMINDER' && selectedInvoiceIds.length > 0) {
                // Map templates to selected invoices
                selectedInvoiceIds.forEach((invId, idx) => {
                    const inv = analyticsData?.unpaidInvoices?.find(i => i.id === invId);
                    if (!inv) return;

                    // If we have multiple templates, try to match them, else use the first one
                    const template = templates[idx % templates.length] || templates[0];
                    let subject = template.subject || '';
                    let body = template.body || '';

                    const replacements = {
                        'customer.name': inv.customerName || 'Valued Customer',
                        'invoice.number': inv.invoiceNumber || 'N/A',
                        'invoice.amount': formatLKR(inv.totalAmount || 0),
                        'invoice.dueDate': inv.dueDate || inv.expiryDate ? new Date(inv.dueDate || inv.expiryDate).toLocaleDateString() : 'Soon',
                        'company.name': companyName,
                        'company.phone': profile?.phone || user?.phone || '',
                        'company.email': profile?.email || user?.email || '',
                        'company.address': profile?.address || user?.address || '',
                        'user.name': userName,
                        'owner.name': userName
                    };

                    Object.entries(replacements).forEach(([key, val]) => {
                        // Support {{key}}, {{key.sub}}, {{key_sub}} and other variations
                        const keys = [key, key.replace('.', '_'), key.replace('.', '')];
                        keys.forEach(k => {
                            const regex = new RegExp(`{{\\s*${k}\\s*}}`, 'gi');
                            subject = subject.replace(regex, val);
                            body = body.replace(regex, val);
                        });
                    });

                    finalDrafts.push({ ...template, subject, body, to: inv.customerName, invoiceId: inv.invoiceNumber });
                });
            } else if (emailCategory === 'PROMO_OFFER' && selectedCustomerIds.length > 0) {
                // Map templates to selected customers
                selectedCustomerIds.forEach((custId, idx) => {
                    const cust = customers.find(c => c.id === custId);
                    if (!cust) return;

                    const template = templates[idx % templates.length] || templates[0];
                    let subject = template.subject || '';
                    let body = template.body || '';

                    const replacements = {
                        'customer.name': cust.name || 'Valued Customer',
                        'promo.title': promoData.title || 'Special Offer',
                        'promo.discount': promoData.discount || '',
                        'promo.validUntil': promoData.validUntil
                            ? new Date(promoData.validUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                            : '',
                        'promo.ctaLink': promoData.ctaLink || '',
                        'company.name': companyName,
                        'company.phone': profile?.phone || user?.phone || '',
                        'company.email': profile?.email || user?.email || '',
                        'user.name': userName,
                        'owner.name': userName
                    };

                    Object.entries(replacements).forEach(([key, val]) => {
                        // Support {{key.sub}}, {{key_sub}}, and {{keysub}} variations
                        const keys = [key, key.replace('.', '_'), key.replace('.', '')];
                        keys.forEach(k => {
                            const regex = new RegExp(`{{\\s*${k}\\s*}}`, 'gi');
                            subject = subject.replace(regex, val);
                            body = body.replace(regex, val);
                        });
                    });

                    finalDrafts.push({ ...template, subject, body, to: cust.name });
                });
            } else {
                // Fallback for cases without specific targets
                templates.forEach(t => {
                    let subject = t.subject || '';
                    let body = t.body || '';

                    const reps = {
                        'company.name': companyName,
                        'company.phone': profile?.phone || user?.phone || '',
                        'company.email': profile?.email || user?.email || '',
                        'user.name': userName,
                        'owner.name': userName
                    };

                    Object.entries(reps).forEach(([key, val]) => {
                        const keys = [key, key.replace('.', '_'), key.replace('.', '')];
                        keys.forEach(k => {
                            const regex = new RegExp(`{{\\s*${k}\\s*}}`, 'gi');
                            subject = subject.replace(regex, val);
                            body = body.replace(regex, val);
                        });
                    });

                    finalDrafts.push({ ...t, subject, body });
                });
            }

            setEmailDrafts(finalDrafts);
        },
        onError: () => toast.error('Email generation failed.'),
    });

    // ─── Reset AI results on date change ────────────
    const fromDate = dateRange.from;
    const toDate = dateRange.to;
    React.useEffect(() => {
        aiReportMutation.reset();
        marketingMutation.reset();
        imageMutation.reset();
        emailMutation.reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDate, toDate]);

    // ─── Handlers ───────────────────────────────────
    const handleGenerateReport = () => {
        if (!analyticsData?.metrics) {
            toast.warning('No data available. Please adjust your date range.');
            return;
        }
        const parts = [];
        if (selectedQuestion) parts.push(selectedQuestion.prompt);
        if (customReportPrompt.trim()) parts.push(customReportPrompt.trim());
        const prompt = parts.length > 0 ? parts.join('\n\n') : undefined;

        aiReportMutation.mutate({
            from: dateRange.from,
            to: dateRange.to,
            tone: reportTone,
            businessContext: {
                industry: profile?.industry,
                country: profile?.country,
                brandTagline: profile?.brandTagline,
                brandTone: profile?.brandTone
            },
            ...(prompt && { prompt })
        });
    };

    const handleGenerateMarketing = () => {
        if (!marketingTopic.trim()) { toast.warning('Please enter a topic.'); return; }
        marketingMutation.mutate({
            topic: `Platform: ${marketingPlatform}\nTone: ${marketingTone}\nTopic: ${marketingTopic}`,
            businessContext: {
                industry: profile?.industry,
                country: profile?.country,
                brandTagline: profile?.brandTagline,
                brandTone: profile?.brandTone
            }
        });
        imageMutation.mutate({ prompt: marketingTopic, size: imageSize });
    };

    const handleGenerateEmail = () => {
        const payload = {
            category: emailCategory,
            tone: emailTone.toUpperCase(),
            businessContext: {
                industry: profile?.industry,
                country: profile?.country,
                brandTagline: profile?.brandTagline,
                brandTone: profile?.brandTone
            }
        };

        if (emailCategory === 'INVOICE_REMINDER') {
            if (selectedInvoiceIds.length === 0) {
                toast.warning('Please select at least one invoice.');
                return;
            }
            payload.targets = { invoiceIds: selectedInvoiceIds };
        } else if (emailCategory === 'PROMO_OFFER') {
            if (selectedCustomerIds.length === 0) {
                toast.warning('Please select at least one customer.');
                return;
            }
            if (!promoData.title.trim()) {
                toast.warning('Please enter a promo title.');
                return;
            }
            payload.targets = { customerIds: selectedCustomerIds };
            payload.promo = promoData;
        }

        emailMutation.mutate(payload);
    };

    const handleCopy = (content, key) => {
        const text = typeof content === 'object'
            ? (content.aiReport || content.report || content.post || content.email || content.content || JSON.stringify(content))
            : content;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
        toast.info('Copied!');
    };

    const handleDownload = (base64) => {
        if (!base64) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64}`;
        link.download = `smartbiz_poster_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Downloaded!');
    };

    // ─── Derived ────────────────────────────────────
    const aiCredits = useMemo(() => {
        const data = usageData?.data || usageData || {};
        const counters = Array.isArray(data) ? data : [];

        const limitRecord = counters.find(u =>
            u.limitKey === 'AI_CREDITS' ||
            u.limitKey === 'AI_USED'
        );

        if (limitRecord) {
            return {
                used: Number(limitRecord.used ?? limitRecord.currentUsage ?? 0),
                total: Number(limitRecord.limitValue ?? limitRecord.total ?? 100)
            };
        }

        const usedVal = data.aiUsed ?? data.AI_USED ?? data.aiCreditsUsed;
        const totalVal = data.aiLimit ?? data.AI_LIMIT ?? data.aiCreditsTotal ?? data.limitValue ?? data.total ?? data.limit;

        if (usedVal !== undefined) {
            return {
                used: Number(usedVal),
                total: Number(totalVal ?? 100)
            };
        }

        return { used: 0, total: 0 };
    }, [usageData]);

    const formatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

    const MODES = [
        { id: 'REPORTS', label: 'Reports', icon: <BarChart3 size={16} />, color: 'indigo' },
        { id: 'MARKETING', label: 'Marketing', icon: <Share2 size={16} />, color: 'emerald' },
        { id: 'EMAIL', label: 'Email', icon: <Mail size={16} />, color: 'amber' },
    ];

    const activeColor = MODES.find(m => m.id === activeMode)?.color || 'indigo';

    // ─── Render ─────────────────────────────────────
    return (
        <div className={`min-h-screen pb-20 space-y-8 animate-in fade-in duration-700 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>

            {/* ═══ HEADER ═══ */}
            <div className={`flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.35)]">
                            <Sparkles size={22} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter italic uppercase">AI Intelligence</h1>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] ml-1">Data · Strategy · Automation</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className={`p-3 rounded-2xl border min-w-[260px] ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <UsageProgressBar label="AI Credits" used={aiCredits.used} total={aiCredits.total} unit="Tasks" dark={isDarkMode} />
                    </div>
                    <div className={`p-3 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex gap-3">
                            <div className="space-y-0.5">
                                <label className="text-[7px] font-black uppercase text-slate-500 ml-0.5">From</label>
                                <input type="date" name="from" value={dateRange.from}
                                    onChange={(e) => setDateRange(p => ({ ...p, from: e.target.value }))}
                                    className={`p-1.5 rounded-lg text-[10px] font-black outline-none w-[120px] ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-900'}`}
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[7px] font-black uppercase text-slate-500 ml-0.5">To</label>
                                <input type="date" name="to" value={dateRange.to}
                                    onChange={(e) => setDateRange(p => ({ ...p, to: e.target.value }))}
                                    className={`p-1.5 rounded-lg text-[10px] font-black outline-none w-[120px] ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-900'}`}
                                />
                            </div>
                        </div>
                        <button onClick={() => { refetchAnalytics(); refetchUsage(); }}
                            className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all">
                            <RefreshCw size={14} className={isAnalyticsFetching ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ MODE TOGGLE ═══ */}
            <div className="flex justify-center">
                <div className={`p-1.5 rounded-2xl border flex gap-1 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                    {MODES.map(mode => (
                        <button key={mode.id} onClick={() => setActiveMode(mode.id)}
                            className={`px-8 py-2.5 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all ${activeMode === mode.id
                                ? `bg-${mode.color}-600 text-white shadow-lg shadow-${mode.color}-600/20`
                                : (isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-500 hover:text-slate-800')
                                }`}>
                            {mode.icon}
                            <span>{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════ REPORTS MODE ═══════════ */}
            {activeMode === 'REPORTS' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {isAnalyticsLoading ? (
                            Array.from({ length: 6 }).map((_, i) => <div key={i} className={`h-28 rounded-[28px] animate-pulse ${isDarkMode ? 'bg-white/[0.03]' : 'bg-slate-50'}`} />)
                        ) : (
                            analyticsData?.metrics && Object.entries(analyticsData.metrics).map(([key, value]) => (
                                <div key={key} className={`p-5 rounded-[28px] border group transition-all duration-300 hover:scale-[1.02] ${isDarkMode ? 'bg-[#1a1b24] border-white/5 hover:border-indigo-500/20' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} text-slate-500 group-hover:text-indigo-500 transition-colors`}>
                                            {key.toLowerCase().includes('sales') ? <TrendingUp size={14} /> : key.toLowerCase().includes('invoice') ? <FileText size={14} /> : <Activity size={14} />}
                                        </div>
                                        <ArrowUpRight size={12} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">{formatKey(key)}</p>
                                    <h3 className="text-xl font-mono font-black tracking-tighter">
                                        {typeof value === 'number' && (
                                            key.toLowerCase().includes('total') ||
                                            key.toLowerCase().includes('profit') ||
                                            key.toLowerCase().includes('revenue') ||
                                            key.toLowerCase().includes('expenses') ||
                                            key.toLowerCase().includes('amount')
                                        ) ? formatLKR(value) : value}
                                    </h3>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Top Products + Unpaid Invoices */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card isDarkMode={isDarkMode}>
                            <CardHeader isDarkMode={isDarkMode} activeColor={activeColor} icon={<Package size={18} />} title="Top Products" />
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/[0.02] text-slate-600' : 'bg-slate-50/50 text-slate-400'}`}>
                                            <th className="py-4 px-6">Product</th>
                                            <th className="py-4 px-6 text-center">Qty</th>
                                            <th className="py-4 px-6 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isAnalyticsLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={3} className="px-6 py-5 animate-pulse bg-white/5" /></tr>)
                                        ) : (!analyticsData?.topProducts?.length) ? (
                                            <tr><td colSpan={3} className="py-16 text-center text-[9px] font-black uppercase text-slate-500">No data</td></tr>
                                        ) : analyticsData.topProducts.map((p, i) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-6 font-bold text-xs">#{i + 1} {p.productName || p.name}</td>
                                                <td className="py-4 px-6 text-center font-mono font-black text-sm">{p.qtySold || p.totalQty || p.quantity}</td>
                                                <td className="py-4 px-6 text-right font-mono font-black text-indigo-500 text-sm">{formatLKR(p.totalRevenue || p.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card isDarkMode={isDarkMode}>
                            <CardHeader isDarkMode={isDarkMode} activeColor={activeColor} icon={<Clock size={18} />} title="Unpaid Invoices" badge={<Badge variant="warning">{analyticsData?.unpaidInvoices?.length || 0}</Badge>} />
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/[0.02] text-slate-600' : 'bg-slate-50/50 text-slate-400'}`}>
                                            <th className="py-4 px-6">Invoice</th>
                                            <th className="py-4 px-6">Customer</th>
                                            <th className="py-4 px-6 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {isAnalyticsLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={3} className="px-6 py-5 animate-pulse bg-white/5" /></tr>)
                                        ) : (!analyticsData?.unpaidInvoices?.length) ? (
                                            <tr><td colSpan={3} className="py-16 text-center text-[9px] font-black uppercase text-slate-500">All clear!</td></tr>
                                        ) : analyticsData.unpaidInvoices.map((inv, i) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-6 font-black text-rose-500 italic text-xs">#{inv.invoiceNumber}</td>
                                                <td className="py-4 px-6 text-xs font-bold">{inv.customerName || '—'}</td>
                                                <td className="py-4 px-6 text-right font-mono font-black text-rose-500">{formatLKR(inv.totalAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Tone + Quick Questions */}
                    <Card isDarkMode={isDarkMode} className="p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tone</span>
                            <div className="flex flex-wrap gap-2">
                                {REPORT_TONES.map(tone => (
                                    <button key={tone} onClick={() => setReportTone(tone)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${reportTone === tone
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : isDarkMode ? 'bg-white/5 text-slate-500 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                                            }`}>
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Quick Questions</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {QUICK_QUESTIONS.map(q => (
                                    <button key={q.id} onClick={() => setSelectedQuestion(selectedQuestion?.id === q.id ? null : q)}
                                        className={`p-3 rounded-xl text-left text-[10px] font-bold transition-all border ${selectedQuestion?.id === q.id
                                            ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400'
                                            : isDarkMode ? 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-200'
                                            }`}>
                                        {q.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Custom Instructions (Optional)</p>
                            <textarea
                                value={customReportPrompt}
                                onChange={e => setCustomReportPrompt(e.target.value)}
                                placeholder="e.g. Focus on profit margins for top 3 products and suggest pricing adjustments..."
                                className={`w-full h-24 p-4 rounded-2xl text-xs font-bold outline-none resize-none transition-all border ${isDarkMode
                                    ? 'bg-white/5 border-white/5 text-white placeholder:text-slate-600 focus:border-indigo-500/30'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-300'
                                    }`}
                            />
                        </div>
                    </Card>

                    <button onClick={handleGenerateReport}
                        disabled={aiReportMutation.isPending}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50">
                        {aiReportMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        Generate AI Report
                    </button>

                    {aiReportMutation.isSuccess && (
                        <Card isDarkMode={isDarkMode} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="p-6 flex justify-between items-center border-b border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-500">AI Business Narrative</span>
                                <button onClick={() => handleCopy(aiReportMutation.data, 'report')}
                                    className={`p-2 rounded-lg transition-colors ${copiedKey === 'report' ? 'text-emerald-500' : 'text-slate-500 hover:text-white'}`}>
                                    {copiedKey === 'report' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="p-8">
                                <div className="text-sm leading-[1.9] whitespace-pre-wrap opacity-90 font-archivo">
                                    {aiReportMutation.data?.aiReport || aiReportMutation.data?.report || aiReportMutation.data}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* ═══════════ MARKETING MODE ═══════════ */}
            {activeMode === 'MARKETING' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                    <Card isDarkMode={isDarkMode} className="p-6 space-y-5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Platform</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {MARKETING_PLATFORMS.map(p => (
                                <button key={p.id} onClick={() => { setMarketingPlatform(p.id); setImageSize(p.size); }}
                                    className={`p-3 rounded-xl border text-[9px] font-black uppercase transition-all ${marketingPlatform === p.id
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg'
                                        : isDarkMode ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
                                        }`}>{p.label}</button>
                            ))}
                        </div>

                        <textarea value={marketingTopic} onChange={e => setMarketingTopic(e.target.value)}
                            placeholder="What are we promoting today?"
                            className={`w-full h-28 p-5 rounded-2xl text-xs font-bold outline-none resize-none ${isDarkMode ? 'bg-white/5 border border-white/5 text-white placeholder:text-slate-600' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                        />

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Tone</p>
                            <div className="flex flex-wrap gap-2">
                                {MARKETING_TONES.map(t => (
                                    <button key={t} onClick={() => setMarketingTone(t)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${marketingTone === t
                                            ? 'bg-emerald-600 text-white shadow-lg'
                                            : isDarkMode ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-500'
                                            }`}>{t}</button>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <button onClick={handleGenerateMarketing}
                        disabled={marketingMutation.isPending || imageMutation.isPending}
                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50">
                        {(marketingMutation.isPending || imageMutation.isPending) ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                        Generate Campaign
                    </button>

                    {(marketingMutation.isSuccess || imageMutation.isSuccess) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-700">
                            {marketingMutation.isSuccess && (
                                <Card isDarkMode={isDarkMode} className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Caption</span>
                                        <button onClick={() => handleCopy(marketingMutation.data, 'marketing')}
                                            className={`p-2 rounded-lg ${copiedKey === 'marketing' ? 'text-emerald-500' : 'text-slate-500 hover:text-white'}`}>
                                            {copiedKey === 'marketing' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="text-xs leading-relaxed italic opacity-80 font-archivo">{marketingMutation.data?.post || marketingMutation.data}</div>
                                </Card>
                            )}
                            {imageMutation.isSuccess && (
                                <Card isDarkMode={isDarkMode} className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Poster</span>
                                        <button onClick={() => handleDownload(imageMutation.data?.image || imageMutation.data)}
                                            className="p-2 rounded-lg text-slate-500 hover:text-white">
                                            <Download size={14} />
                                        </button>
                                    </div>
                                    <img src={`data:image/png;base64,${imageMutation.data?.image || imageMutation.data}`}
                                        className="w-full rounded-2xl border border-white/5" alt="Poster" />
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════ EMAIL MODE ═══════════ */}
            {activeMode === 'EMAIL' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Sidebar: Categories */}
                    <div className="lg:col-span-3 space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Email Category</p>
                        <div className="flex flex-col gap-2">
                            {EMAIL_CATEGORIES.map(cat => (
                                <button key={cat.id}
                                    onClick={() => {
                                        setEmailCategory(cat.id);
                                        setEmailTone(cat.tones[0]);
                                        setSelectedInvoiceIds([]);
                                        setSelectedCustomerIds([]);
                                    }}
                                    className={`p-4 rounded-[24px] border flex items-center gap-4 transition-all ${emailCategory === cat.id
                                        ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20'
                                        : isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-white border-slate-100 text-slate-500 hover:text-slate-800'
                                        }`}>
                                    <span className="text-xl">{cat.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Area */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Tone Selector */}
                        <Card isDarkMode={isDarkMode} className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tone</span>
                                <div className="flex flex-wrap gap-2">
                                    {EMAIL_CATEGORIES.find(c => c.id === emailCategory)?.tones.map(tone => (
                                        <button key={tone} onClick={() => setEmailTone(tone)}
                                            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${emailTone === tone
                                                ? 'bg-amber-600 text-white shadow-lg'
                                                : isDarkMode ? 'bg-white/5 text-slate-500 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'
                                                }`}>
                                            {tone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Targets Panel */}
                        <Card isDarkMode={isDarkMode}>
                            <CardHeader
                                isDarkMode={isDarkMode}
                                activeColor="amber"
                                icon={<MessageSquare size={18} />}
                                title={emailCategory === 'INVOICE_REMINDER' ? 'Select Unpaid Invoices' : 'Promo Campaign Details'}
                            />
                            <div className="p-6">
                                {emailCategory === 'INVOICE_REMINDER' ? (
                                    <div className="overflow-x-auto -mx-6">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/[0.02] text-slate-600' : 'bg-slate-50/50 text-slate-400'}`}>
                                                    <th className="py-4 px-6 w-10">Select</th>
                                                    <th className="py-4 px-6">Invoice</th>
                                                    <th className="py-4 px-6">Customer</th>
                                                    <th className="py-4 px-6 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {isAnalyticsLoading ? (
                                                    Array.from({ length: 3 }).map((_, i) => <tr key={i}><td colSpan={4} className="px-6 py-5 animate-pulse bg-white/5" /></tr>)
                                                ) : (!analyticsData?.unpaidInvoices?.length) ? (
                                                    <tr><td colSpan={4} className="py-16 text-center text-[9px] font-black uppercase text-slate-500">No unpaid invoices</td></tr>
                                                ) : analyticsData.unpaidInvoices.map((inv) => (
                                                    <tr key={inv.id}
                                                        onClick={() => setSelectedInvoiceIds(prev =>
                                                            prev.includes(inv.id) ? prev.filter(id => id !== inv.id) : [...prev, inv.id]
                                                        )}
                                                        className={`cursor-pointer transition-colors ${selectedInvoiceIds.includes(inv.id) ? (isDarkMode ? 'bg-amber-600/10' : 'bg-amber-50') : 'hover:bg-white/[0.02]'}`}>
                                                        <td className="py-4 px-6">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedInvoiceIds.includes(inv.id) ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-500'}`}>
                                                                {selectedInvoiceIds.includes(inv.id) && <Sparkles size={10} />}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 font-black text-rose-500 italic text-xs">#{inv.invoiceNumber}</td>
                                                        <td className="py-4 px-6 text-xs font-bold">{inv.customerName || '—'}</td>
                                                        <td className="py-4 px-6 text-right font-mono font-black text-rose-500">{formatLKR(inv.totalAmount)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Promo Title</label>
                                                <input type="text"
                                                    value={promoData.title}
                                                    onChange={e => setPromoData({ ...promoData, title: e.target.value })}
                                                    placeholder="e.g. Eid Mubarak Offer"
                                                    className={`w-full p-4 rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-white/5 border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Discount (Optional)</label>
                                                <input type="text"
                                                    value={promoData.discount}
                                                    onChange={e => setPromoData({ ...promoData, discount: e.target.value })}
                                                    placeholder="e.g. 20% OFF"
                                                    className={`w-full p-4 rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-white/5 border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-500 ml-1">Valid Until — Offer Expiry Date ✦</label>
                                                <input type="date"
                                                    value={promoData.validUntil}
                                                    onChange={e => setPromoData({ ...promoData, validUntil: e.target.value })}
                                                    className={`w-full p-4 rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-white/5 border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-500 ml-1">CTA Link (Optional)</label>
                                                <input type="text"
                                                    value={promoData.ctaLink}
                                                    onChange={e => setPromoData({ ...promoData, ctaLink: e.target.value })}
                                                    placeholder="e.g. https://yourstore.com/offer"
                                                    className={`w-full p-4 rounded-xl text-xs font-bold outline-none ${isDarkMode ? 'bg-white/5 border border-white/5 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Select Target Customers</p>
                                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                                                {customers.map(c => (
                                                    <button key={c.id}
                                                        onClick={() => setSelectedCustomerIds(prev =>
                                                            prev.includes(c.id) ? prev.filter(id => id !== c.id) : [...prev, c.id]
                                                        )}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${selectedCustomerIds.includes(c.id)
                                                            ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                                                            : isDarkMode ? 'bg-white/5 border-white/5 text-slate-500' : 'bg-white border-slate-200 text-slate-500'
                                                            }`}>
                                                        {c.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <button onClick={handleGenerateEmail}
                            disabled={emailMutation.isPending || (emailCategory === 'INVOICE_REMINDER' && selectedInvoiceIds.length === 0) || (emailCategory === 'PROMO_OFFER' && selectedCustomerIds.length === 0)}
                            className="w-full py-5 bg-amber-600 hover:bg-amber-500 rounded-2xl text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-amber-600/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50">
                            {emailMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                            {emailMutation.isPending ? 'Generating Drafts...' : 'Generate Email Drafts'}
                        </button>

                        {/* Draft Preview Panel */}
                        {emailMutation.isSuccess && emailDrafts.length > 0 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 italic">
                                        Review Generated Drafts ({emailDrafts.length})
                                    </h4>
                                    <button onClick={() => setEmailDrafts([])} className="text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-colors">
                                        Clear All
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {emailDrafts.map((draft, idx) => (
                                        <Card key={idx} isDarkMode={isDarkMode} className="relative group">
                                            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-black">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{draft.to || 'Generated Draft'}</p>
                                                        {draft.invoiceId && <p className="text-[7px] font-bold text-amber-600">Ref: Invoice #{draft.invoiceId}</p>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(`${draft.subject || ''}\n\n${draft.body || ''}`, `draft-${idx}`)}
                                                    className={`p-2 rounded-lg transition-all ${copiedKey === `draft-${idx}` ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-white/10 text-slate-500'}`}>
                                                    {copiedKey === `draft-${idx}` ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>

                                            <div className="p-6 space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[7px] font-black uppercase tracking-widest text-slate-500 ml-1">Subject</label>
                                                    <input
                                                        type="text"
                                                        value={draft.subject || ''}
                                                        onChange={(e) => {
                                                            const newDrafts = [...emailDrafts];
                                                            newDrafts[idx] = { ...draft, subject: e.target.value };
                                                            setEmailDrafts(newDrafts);
                                                        }}
                                                        className={`w-full p-3 rounded-xl text-xs font-bold outline-none border transition-all font-archivo ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-amber-500/30' : 'bg-white border-slate-100 text-slate-900 focus:border-amber-200 shadow-sm'}`}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[7px] font-black uppercase tracking-widest text-slate-500 ml-1">Message Body</label>
                                                    <textarea
                                                        value={draft.body || ''}
                                                        onChange={(e) => {
                                                            const newDrafts = [...emailDrafts];
                                                            newDrafts[idx] = { ...draft, body: e.target.value };
                                                            setEmailDrafts(newDrafts);
                                                        }}
                                                        className={`w-full h-48 p-4 rounded-2xl text-xs font-medium leading-relaxed outline-none border transition-all resize-none font-archivo ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-300 focus:border-amber-500/30' : 'bg-white border-slate-100 text-slate-700 focus:border-amber-200 shadow-sm'}`}
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsDashboard;