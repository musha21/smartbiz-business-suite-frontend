import React, { useState } from 'react';
import {
    ArrowLeft,
    Download,
    FileText,
    User,
    Calendar,
    Hash,
    Search
} from 'lucide-react';
import {
    Paper,
    Typography,
    Box,
    Button,
    IconButton,
    CircularProgress,
    Alert,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Chip,
    Divider,
    TextField,
    InputAdornment
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { invoiceService } from '../../api';
import CreatedAtText from '../../components/ui/CreatedAtText';
import { formatLKR } from '../../utils/formatters';


const InvoiceDetailsPage = () => {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
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
            toast.success(data?.message || 'Invoice status updated');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
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
                toast.error('Invoice not found');
            }
        } catch (err) {
            toast.error('Invoice not found');
        }
    };

    if (isLoading) {
        return (
            <Box className="p-20 text-center">
                <CircularProgress size={48} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="p-8">
                <Alert severity="error">Failed to load invoice details.</Alert>
            </Box>
        );
    }

    if (!invoice) {
        return (
            <Box className="p-8">
                <Alert severity="info">Invoice not found.</Alert>
            </Box>
        );
    }

    const statusChipClass = invoice.status === 'PAID'
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-rose-50 text-rose-600';

    const toggleBtnClass = invoice.status === 'PAID'
        ? 'bg-rose-600 hover:bg-rose-700'
        : 'bg-emerald-600 hover:bg-emerald-700';

    const toggleLabel = invoice.status === 'PAID' ? 'UNPAID' : 'PAID';

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-10">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <IconButton
                        onClick={() => navigate('/invoices')}
                        className="bg-white shadow-sm border border-slate-100 p-3"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </IconButton>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                                Invoice #{invoice.invoiceNumber}
                            </h1>
                            <Chip
                                label={invoice.status}
                                className={`font-black text-[10px] uppercase tracking-widest h-7 ${statusChipClass}`}
                            />
                        </div>
                        <p className="text-slate-500 font-medium">
                            Billed to {invoice.customer?.name}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outlined"
                        startIcon={<FileText size={18} />}
                        onClick={() => invoiceService.previewPdf(invoice.id)}
                        className="border-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                        Preview
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Download size={18} />}
                        onClick={() => invoiceService.downloadPdf(invoice.id)}
                        className="border-slate-200 text-slate-600 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-50"
                    >
                        Download
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => statusMutation.mutate(toggleLabel)}
                        disabled={statusMutation.isPending}
                        className={`font-black px-6 py-2.5 rounded-xl shadow-lg transition-all ${toggleBtnClass}`}
                    >
                        {statusMutation.isPending
                            ? <CircularProgress size={20} color="inherit" />
                            : `Mark as ${toggleLabel}`}
                    </Button>
                </div>
            </div>

            {/* Quick Search Section */}
            <Box className="flex justify-start">
                <TextField
                    size="small"
                    placeholder="Search by invoice number..."
                    value={searchNumber}
                    onChange={(e) => setSearchNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={16} />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <Button size="small" onClick={handleSearch} className="font-bold">
                                Find
                            </Button>
                        )
                    }}
                    sx={{
                        maxWidth: 300,
                        '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'white' }
                    }}
                />
            </Box>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Details Card */}
                <div className="md:col-span-2 space-y-8">
                    <Paper className="p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                            <Hash size={20} className="text-indigo-600" /> Details &amp; Breakdown
                        </h2>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                                            Product
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] text-center">
                                            Qty
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">
                                            Unit Price
                                        </TableCell>
                                        <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">
                                            Total
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoice.items?.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="border-none py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">
                                                        {item.product?.name}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-medium italic">
                                                        Batch: {item.batch?.batchNumber || 'N/A'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="border-none text-center font-bold text-slate-600">
                                                x{item.quantity}
                                            </TableCell>
                                            <TableCell className="border-none text-right font-medium text-slate-600">
                                                {formatLKR(item.unitPrice)}
                                            </TableCell>
                                            <TableCell className="border-none text-right font-black text-slate-800">
                                                {formatLKR(item.lineTotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Divider className="my-6" />

                        <div className="flex flex-col items-end space-y-2">
                            <div className="flex justify-between w-full max-w-[200px] text-slate-500 font-medium">
                                <span>Subtotal</span>
                                <span>{formatLKR(invoice.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between w-full max-w-[200px] pt-2 mt-2 border-t border-slate-100">
                                <span className="text-lg font-bold text-slate-800">Total</span>
                                <span className="text-2xl font-black text-indigo-600">
                                    {formatLKR(invoice.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </Paper>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <Paper className="p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                        <div>
                            <div className="flex items-center gap-2 text-slate-400 mb-2 uppercase tracking-widest font-black text-[10px]">
                                <User size={14} /> Customer Information
                            </div>
                            <Typography className="font-bold text-slate-800">
                                {invoice.customer?.name}
                            </Typography>
                            <Typography className="text-sm text-slate-500">
                                {invoice.customer?.email}
                            </Typography>
                            <Typography className="text-sm text-slate-500">
                                {invoice.customer?.phone}
                            </Typography>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-slate-400 mb-2 uppercase tracking-widest font-black text-[10px]">
                                <Calendar size={14} /> Invoice Dates
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                        Created On
                                    </span>
                                    <CreatedAtText value={invoice.invoiceDate} showIcon={false} />
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                                        Due On
                                    </span>
                                    <CreatedAtText value={invoice.invoiceDate} showIcon={false} />
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <Box className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <Typography className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                                Quick Note
                            </Typography>
                            <Typography className="text-xs text-indigo-800 font-medium leading-relaxed">
                                This invoice was generated by SmartBiz System. Please contact us for any billing inquiries.
                            </Typography>
                        </Box>
                    </Paper>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsPage;
