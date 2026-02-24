import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Download,
    Eye,
    FileText,
    CheckCircle,
    XCircle,
    MoreVertical
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Button,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Menu,
    Typography,
    Box
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { invoiceService } from '../../api';
import Modal from '../../components/ui/Modal';
import CreatedAtText from '../../components/ui/CreatedAtText';
import { formatLKR, getLocalISOString } from '../../utils/formatters';


const InvoiceListPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Filters state
    const [status, setStatus] = useState('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [search, setSearch] = useState('');

    // UI state
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const queryParams = useMemo(() => {
        const params = {};
        if (status !== 'ALL') params.status = status;
        if (fromDate) params.from = `${fromDate}:00`;
        if (toDate) params.to = `${toDate}:00`;
        if (search) params.q = search;
        return params;
    }, [status, fromDate, toDate, search]);

    const { data: invoices, isLoading, error } = useQuery({
        queryKey: ['invoices', queryParams],
        queryFn: () => invoiceService.getInvoices(queryParams),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => invoiceService.updateInvoiceStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Invoice status updated');
            setIsConfirmDialogOpen(false);
            setSelectedInvoice(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status')
    });

    const handleMenuOpen = (event, invoice) => {
        setAnchorEl(event.currentTarget);
        setSelectedInvoice(invoice);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleToggleStatus = (targetStatus) => {
        setNewStatus(targetStatus);
        setIsConfirmDialogOpen(true);
        handleMenuClose();
    };

    const handleDownload = (id) => {
        invoiceService.downloadPdf(id).catch(() => toast.error('Download failed'));
        handleMenuClose();
    };

    const handlePreview = (id) => {
        invoiceService.previewPdf(id).catch(() => toast.error('Preview failed'));
        handleMenuClose();
    };

    if (error) {
        return (
            <Box className="p-8 text-center">
                <Alert severity="error">Error loading invoices. Please try again.</Alert>
            </Box>
        );
    }

    const getStatusChipClass = (s) => {
        return s === 'PAID'
            ? 'bg-emerald-50 text-emerald-600'
            : 'bg-rose-50 text-rose-600';
    };

    const getMenuStatusClass = () => {
        return selectedInvoice?.status === 'PAID'
            ? 'text-rose-600'
            : 'text-emerald-600';
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Invoices</h1>
                    <p className="text-slate-500 mt-1">Manage and track your customer billing.</p>
                </div>
                <button
                    onClick={() => navigate('/invoices/new')}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Create Invoice</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="w-full md:w-64">
                        <TextField
                            fullWidth
                            label="Search"
                            placeholder="Invoice # or customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <Search size={18} className="text-slate-400 mr-2" />
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={status}
                                label="Status"
                                onChange={(e) => setStatus(e.target.value)}
                                sx={{ borderRadius: '16px' }}
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="PAID">Paid</MenuItem>
                                <MenuItem value="UNPAID">Unpaid</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className="w-full md:w-auto flex flex-col gap-1">
                        <Typography variant="caption" className="text-slate-500 ml-2 font-bold uppercase tracking-wider">
                            From
                        </Typography>
                        <TextField
                            type="datetime-local"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                    </div>
                    <div className="w-full md:w-auto flex flex-col gap-1">
                        <Typography variant="caption" className="text-slate-500 ml-2 font-bold uppercase tracking-wider">
                            To
                        </Typography>
                        <TextField
                            type="datetime-local"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                    </div>
                    <Button
                        className="h-[56px] px-6 rounded-2xl text-slate-500 font-bold"
                        onClick={() => {
                            setStatus('ALL');
                            setFromDate('');
                            setToDate('');
                            setSearch('');
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <TableContainer
                component={Paper}
                elevation={0}
                className="border border-slate-100 overflow-hidden shadow-sm"
                sx={{ borderRadius: '24px' }}
            >
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Invoice #</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Date</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Customer</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-right">Amount</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-center">Status</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-20">
                                    <CircularProgress size={32} thickness={5} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices?.map((inv) => (
                                <TableRow
                                    key={inv.id}
                                    hover
                                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                >
                                    <TableCell className="border-none px-8 py-6 font-black text-slate-700">
                                        {inv.invoiceNumber}
                                    </TableCell>
                                    <TableCell className="border-none px-8 py-6 text-slate-500 font-medium">
                                        <CreatedAtText value={inv.invoiceDate} showIcon={false} />
                                    </TableCell>
                                    <TableCell className="border-none px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">
                                                {inv.customer?.name}
                                            </span>
                                            <span className="text-xs text-slate-400 font-medium">
                                                {inv.customer?.email || inv.customer?.phone}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="border-none px-8 py-6 text-right font-black text-slate-800">
                                        {formatLKR(inv.totalAmount)}
                                    </TableCell>
                                    <TableCell className="border-none px-8 py-6 text-center">
                                        <Chip
                                            label={inv.status}
                                            className={`font-black text-[10px] uppercase tracking-wider h-7 ${getStatusChipClass(inv.status)}`}
                                        />
                                    </TableCell>
                                    <TableCell className="border-none px-8 py-6 text-right">
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, inv)}>
                                            <MoreVertical size={18} className="text-slate-400" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                {!isLoading && invoices?.length === 0 && (
                    <Box className="py-20 flex flex-col items-center gap-2">
                        <FileText size={48} className="text-slate-200" />
                        <Typography className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                            No invoices found
                        </Typography>
                    </Box>
                )}
            </TableContainer>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: { borderRadius: '16px', minWidth: 180, mt: 1, border: '1px solid #f1f5f9' }
                }}
            >
                <MenuItem
                    onClick={() => navigate(`/invoices/${selectedInvoice?.id}`)}
                    className="text-sm font-semibold py-3 px-4 flex gap-3 hover:bg-slate-50"
                >
                    <Eye size={16} className="text-indigo-600" /> View Details
                </MenuItem>
                <MenuItem
                    onClick={() => handlePreview(selectedInvoice?.id)}
                    className="text-sm font-semibold py-3 px-4 flex gap-3 hover:bg-slate-50"
                >
                    <FileText size={16} className="text-slate-500" /> Preview PDF
                </MenuItem>
                <MenuItem
                    onClick={() => handleDownload(selectedInvoice?.id)}
                    className="text-sm font-semibold py-3 px-4 flex gap-3 hover:bg-slate-50"
                >
                    <Download size={16} className="text-slate-500" /> Download PDF
                </MenuItem>
                <MenuItem
                    onClick={() => handleToggleStatus(
                        selectedInvoice?.status === 'PAID' ? 'UNPAID' : 'PAID'
                    )}
                    className={`text-sm font-bold py-3 px-4 flex gap-3 hover:bg-slate-50 ${getMenuStatusClass()}`}
                >
                    {selectedInvoice?.status === 'PAID'
                        ? <XCircle size={16} />
                        : <CheckCircle size={16} />}
                    Mark as {selectedInvoice?.status === 'PAID' ? 'Unpaid' : 'Paid'}
                </MenuItem>
            </Menu>

            {/* Status Confirmation Modal */}
            <Modal
                isOpen={isConfirmDialogOpen}
                onClose={() => { setIsConfirmDialogOpen(false); setSelectedInvoice(null); }}
                title="Change Status?"
                footer={
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setIsConfirmDialogOpen(false); setSelectedInvoice(null); }}
                            className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => statusMutation.mutate({
                                id: selectedInvoice.id,
                                status: newStatus
                            })}
                            disabled={statusMutation.isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {statusMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Confirm'}
                        </button>
                    </div>
                }
            >
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-amber-500" />
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        Are you sure you want to mark invoice{' '}
                        <span className="font-black text-slate-800">
                            #{selectedInvoice?.invoiceNumber}
                        </span>{' '}
                        as{' '}
                        <span className={`font-black ${newStatus === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {newStatus}
                        </span>?
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default InvoiceListPage;
