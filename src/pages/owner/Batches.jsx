import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Eye,
    Package,
    Calendar,
    X,
    Inbox,
    AlertCircle,
    Info,
    RefreshCw
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
    Menu,
    MenuItem,
    CircularProgress,
    TextField,
    Button,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Box,
    Chip,
    Avatar,
    Divider,
    Alert
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { format, isValid, parseISO } from 'date-fns';
import { batchService, productService } from '../../api';
import Modal from '../../components/ui/Modal';
import CreatedAtText from '../../components/ui/CreatedAtText';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

// ─── Validation Schema ────────────────────────────────────────────────────────
const addStockSchema = z.object({
    productId: z.preprocess((val) => Number(val), z.number().positive('Product is required')),
    batchNumber: z.string().min(1, 'Batch number is required'),
    qty: z.preprocess(
        (val) => Number(val),
        z.number().positive('Quantity must be greater than 0')
    ),
});

// ─── Helper: safely parse API array response ──────────────────────────────────
const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
};

// ─── Component ────────────────────────────────────────────────────────────────
const Batches = () => {
    const queryClient = useQueryClient();

    // ── State ──────────────────────────────────────────────────────────────────
    const [selectedProductId, setSelectedProductId] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('All');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // ── Debounced search ───────────────────────────────────────────────────────
    useEffect(() => {
        const handler = setTimeout(() => setSearchTerm(searchInput), 400);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // ── Queries ────────────────────────────────────────────────────────────────
    const {
        data: productsRaw,
        isLoading: isLoadingProducts,
        error: productsError
    } = useQuery({
        queryKey: ['products'],
        queryFn: productService.getProducts,
        staleTime: 60_000,
    });

    const products = useMemo(() => toArray(productsRaw), [productsRaw]);

    const {
        data: batchesRaw,
        isLoading: isLoadingBatches,
        error: batchesError,
        refetch: refetchBatches
    } = useQuery({
        queryKey: ['batches', selectedProductId],
        queryFn: () => batchService.getBatchesByProduct(selectedProductId),
        enabled: !!selectedProductId,
        staleTime: 0,
    });

    const batches = useMemo(() => toArray(batchesRaw), [batchesRaw]);

    // ── Form ───────────────────────────────────────────────────────────────────
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addStockSchema),
        defaultValues: { productId: '', batchNumber: '', qty: '' },
    });

    // Keep hidden productId field in sync with selected product
    useEffect(() => {
        if (selectedProductId) {
            setValue('productId', Number(selectedProductId), { shouldValidate: false });
        }
    }, [selectedProductId, setValue]);

    // ── Mutations ──────────────────────────────────────────────────────────────
    const addStockMutation = useMutation({
        mutationFn: batchService.addStock,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['batches'] });
            await queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success(data?.message || 'Stock added successfully!');
            setIsAddModalOpen(false);
            reset({ productId: Number(selectedProductId), batchNumber: '', qty: '' });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to add stock. Please try again.');
        },
    });

    const deleteBatchMutation = useMutation({
        mutationFn: batchService.deleteBatch,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['batches'] });
            await queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success(data?.message || 'Batch removed successfully!');
            setIsDeleteModalOpen(false);
            setAnchorEl(null);
            setSelectedBatch(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to remove batch.');
        },
    });

    // ── Computed ───────────────────────────────────────────────────────────────
    const selectedProduct = useMemo(() => {
        // Compare as numbers — selectedProductId may be a string
        return products.find((p) => String(p.id) === String(selectedProductId)) || null;
    }, [products, selectedProductId]);

    const filteredBatches = useMemo(() => {
        return batches.filter((b) => {
            const batchNum = (b.batchNumber || b.batch_number || '').toLowerCase();
            const matchSearch = batchNum.includes(searchTerm.toLowerCase());

            const qty = b.qtyAvailable ?? b.qty_available ?? b.quantity ?? 0;
            let matchFilter = true;
            if (stockFilter === 'In Stock') matchFilter = qty > 0;
            if (stockFilter === 'Zero Stock') matchFilter = qty === 0;

            return matchSearch && matchFilter;
        });
    }, [batches, searchTerm, stockFilter]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleOpenAddModal = () => {
        setValue('productId', Number(selectedProductId), { shouldValidate: false });
        setIsAddModalOpen(true);
    };

    const handleAddStockSubmit = (data) => {
        addStockMutation.mutate({ ...data, productId: Number(selectedProductId) });
    };

    const handleMenuClick = (event, batch) => {
        setAnchorEl(event.currentTarget);
        setSelectedBatch(batch);
    };

    const handleMenuClose = () => setAnchorEl(null);

    const handleDelete = () => {
        if (selectedBatch) {
            deleteBatchMutation.mutate(selectedBatch.id);
        }
    };

    const getBatchQty = (b) => b?.qtyAvailable ?? b?.qty_available ?? b?.quantity ?? 0;

    // ── Loading state ──────────────────────────────────────────────────────────
    if (isLoadingProducts) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <CircularProgress color="primary" />
                <Typography className="text-slate-400 text-sm">Loading products…</Typography>
            </div>
        );
    }

    if (productsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle size={40} className="text-rose-400" />
                <Typography className="text-slate-600 font-semibold">Failed to load products</Typography>
                <Button
                    variant="outlined"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
                    startIcon={<RefreshCw size={16} />}
                    className="rounded-xl"
                >
                    Retry
                </Button>
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Stock Batches</h1>
                    <p className="text-slate-500 mt-1 text-sm">Track inventory arrivals and batch-wise stock levels.</p>
                </div>
                {selectedProductId && (
                    <Button
                        variant="contained"
                        onClick={handleOpenAddModal}
                        startIcon={<Plus size={18} />}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 capitalize"
                    >
                        Add Stock
                    </Button>
                )}
            </div>

            {/* ── Product Selection + Summary ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left panel — product picker */}
                <Box className="lg:col-span-1">
                    <Paper
                        elevation={0}
                        className="p-6 rounded-3xl border border-slate-100 shadow-sm h-full"
                    >
                        <Typography className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                            Select Product
                        </Typography>

                        <FormControl fullWidth>
                            <InputLabel></InputLabel>
                            <Select
                                label="Product"
                                value={selectedProductId}
                                onChange={(e) => {
                                    setSelectedProductId(e.target.value);
                                    setSearchInput('');
                                    setSearchTerm('');
                                    setStockFilter('All');
                                }}
                                sx={{ borderRadius: '16px' }}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    <em>Select a product to view batches</em>
                                </MenuItem>
                                {products.map((p) => (
                                    <MenuItem key={p.id} value={String(p.id)}>
                                        <div className="flex flex-col py-0.5">
                                            <span className="font-bold text-slate-700">{p.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                SKU: {p.sku || p.skuCode || '—'}
                                            </span>
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Product summary card */}
                        {selectedProduct && (
                            <Box className="mt-6 space-y-4">
                                <Divider />
                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</span>
                                        <span className="text-sm font-mono font-bold text-slate-700">
                                            {selectedProduct.sku || selectedProduct.skuCode || '—'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</span>
                                        <span className="text-xs font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-lg">
                                            {selectedProduct.categoryName || selectedProduct.category?.name || 'Uncategorized'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock</span>
                                        <Chip
                                            label={`${selectedProduct.availableStock ?? selectedProduct.stock ?? 0} Units`}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                height: 26,
                                                bgcolor: (selectedProduct.availableStock ?? selectedProduct.stock ?? 0) <= (selectedProduct.lowStockLimit ?? 5)
                                                    ? '#fff1f2' : '#f0fdf4',
                                                color: (selectedProduct.availableStock ?? selectedProduct.stock ?? 0) <= (selectedProduct.lowStockLimit ?? 5)
                                                    ? '#e11d48' : '#16a34a',
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Batches</span>
                                        <span className="text-sm font-bold text-slate-700">{batches.length}</span>
                                    </div>
                                </div>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleOpenAddModal}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-100 capitalize"
                                    startIcon={<Plus size={18} />}
                                >
                                    Add Stock Batch
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Right panel — batches table */}
                <Box className="lg:col-span-2">
                    {!selectedProductId ? (
                        <Paper
                            elevation={0}
                            className="rounded-3xl border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center h-full bg-slate-50/50"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 mb-6">
                                <Package size={32} />
                            </div>
                            <Typography className="text-xl font-bold text-slate-700 mb-2">
                                No Product Selected
                            </Typography>
                            <Typography className="text-slate-500 max-w-xs mx-auto">
                                Select a product from the dropdown to view and manage its stock batches.
                            </Typography>
                        </Paper>
                    ) : (
                        <div className="space-y-4">

                            {/* Toolbar */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search
                                        size={16}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by batch number…"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    {searchInput && (
                                        <button
                                            onClick={() => setSearchInput('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${stockFilter !== 'All'
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Filter size={15} />
                                        {stockFilter === 'All' ? 'Filter' : stockFilter}
                                    </button>
                                    <Menu
                                        anchorEl={filterAnchorEl}
                                        open={Boolean(filterAnchorEl)}
                                        onClose={() => setFilterAnchorEl(null)}
                                        PaperProps={{ sx: { borderRadius: '12px', mt: 1, border: '1px solid #f1f5f9', minWidth: 160 } }}
                                    >
                                        {['All', 'In Stock', 'Zero Stock'].map((f) => (
                                            <MenuItem
                                                key={f}
                                                onClick={() => { setStockFilter(f); setFilterAnchorEl(null); }}
                                                className={`text-sm font-semibold py-2 px-5 ${stockFilter === f ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                                            >
                                                {f}
                                            </MenuItem>
                                        ))}
                                    </Menu>

                                    <IconButton
                                        onClick={() => refetchBatches()}
                                        size="small"
                                        title="Refresh batches"
                                        className="border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
                                    >
                                        <RefreshCw size={16} />
                                    </IconButton>
                                </div>
                            </div>

                            {/* Error banner */}
                            {batchesError && (
                                <Alert
                                    severity="error"
                                    action={
                                        <Button color="inherit" size="small" onClick={() => refetchBatches()}>
                                            Retry
                                        </Button>
                                    }
                                    sx={{ borderRadius: '16px' }}
                                >
                                    {batchesError.response?.data?.message || 'Failed to load batches.'}
                                </Alert>
                            )}

                            {/* Batches table */}
                            <TableContainer
                                component={Paper}
                                elevation={0}
                                className="border border-slate-100 overflow-hidden shadow-sm"
                                sx={{ borderRadius: '24px' }}
                            >
                                {isLoadingBatches ? (
                                    <div className="py-20 flex flex-col items-center gap-3">
                                        <CircularProgress size={30} />
                                        <Typography className="text-slate-400 text-sm">Loading batches…</Typography>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, color: '#64748b', border: 'none', px: 3, py: 2 }}>
                                                    Batch Number
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#64748b', border: 'none', px: 3, py: 2, textAlign: 'center' }}>
                                                    Available Qty
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#64748b', border: 'none', px: 3, py: 2, textAlign: 'center' }}>
                                                    Created At
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 700, color: '#64748b', border: 'none', px: 3, py: 2, textAlign: 'right' }}>
                                                    Actions
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredBatches.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} sx={{ border: 'none', py: 10, textAlign: 'center' }}>
                                                        <Inbox size={40} className="mx-auto text-slate-200 mb-2" />
                                                        <Typography className="text-slate-400 font-medium text-sm">
                                                            {searchTerm || stockFilter !== 'All'
                                                                ? 'No batches match your filters.'
                                                                : 'No batches found for this product.'}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredBatches.map((b) => {
                                                    const qty = getBatchQty(b);
                                                    return (
                                                        <TableRow
                                                            key={b.id}
                                                            hover
                                                            sx={{
                                                                '&:last-child td': { borderBottom: 0 },
                                                                '&:hover': { bgcolor: '#f8fafc' },
                                                                transition: 'background 0.15s',
                                                            }}
                                                        >
                                                            {/* Batch number */}
                                                            <TableCell sx={{ border: 'none', px: 3, py: 2.5 }}>
                                                                <span className="font-mono text-sm font-bold text-indigo-600">
                                                                    {b.batchNumber || b.batch_number}
                                                                </span>
                                                            </TableCell>

                                                            {/* Qty */}
                                                            <TableCell sx={{ border: 'none', px: 3, py: 2.5, textAlign: 'center' }}>
                                                                <Chip
                                                                    label={`${qty} Units`}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        fontSize: '0.72rem',
                                                                        height: 26,
                                                                        bgcolor: qty > 0 ? '#f0fdf4' : '#fff1f2',
                                                                        color: qty > 0 ? '#16a34a' : '#e11d48',
                                                                    }}
                                                                />
                                                            </TableCell>

                                                            {/* Date */}
                                                            <TableCell sx={{ border: 'none', px: 3, py: 2.5, textAlign: 'center' }}>
                                                                <CreatedAtText value={b.createdAt || b.created_at} className="justify-center flex-col !gap-0.5" />
                                                            </TableCell>

                                                            {/* Actions */}
                                                            <TableCell sx={{ border: 'none', px: 3, py: 2.5, textAlign: 'right' }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => handleMenuClick(e, b)}
                                                                    sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}
                                                                >
                                                                    <MoreVertical size={18} className="text-slate-400" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </TableContainer>

                            {/* Footer count */}
                            {!isLoadingBatches && filteredBatches.length > 0 && (
                                <p className="text-xs text-slate-400 text-right px-1">
                                    Showing {filteredBatches.length} of {batches.length} batch{batches.length !== 1 ? 'es' : ''}
                                </p>
                            )}
                        </div>
                    )}
                </Box>
            </div>

            {/* ── Add Stock Modal ─────────────────────────────────────────── */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); reset({ productId: Number(selectedProductId), batchNumber: '', qty: '' }); }}
                title="Add New Batch"
                footer={
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setIsAddModalOpen(false); reset({ productId: Number(selectedProductId), batchNumber: '', qty: '' }); }}
                            className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(handleAddStockSubmit)}
                            disabled={addStockMutation.isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {addStockMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Confirm Add Stock'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    {/* Selected product info */}
                    <div className="bg-indigo-50/50 p-6 rounded-[1.5rem] border border-indigo-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Package size={22} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Target Product</p>
                            <h4 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">{selectedProduct?.name || '—'}</h4>
                            <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-tighter">SKU: {selectedProduct?.sku || selectedProduct?.skuCode || '—'}</p>
                        </div>
                    </div>

                    <Input
                        label="Batch Number"
                        {...register('batchNumber')}
                        error={errors.batchNumber?.message}
                        placeholder="e.g. BATCH-2024-001"
                    />

                    <Input
                        label="Quantity to Add"
                        type="number"
                        {...register('qty')}
                        error={errors.qty?.message}
                        placeholder="e.g. 100"
                    />
                </div>
            </Modal>

            {/* ── Batch Action Dropdown ───────────────────────────────────── */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '16px', minWidth: 170, mt: 1,
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 8px 30px -8px rgba(0,0,0,0.08)',
                    },
                }}
            >
                <MenuItem
                    onClick={() => { setIsViewModalOpen(true); handleMenuClose(); }}
                    sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', py: 1.5, px: 2.5, gap: 1.5, '&:hover': { bgcolor: '#f8fafc' } }}
                >
                    <Eye size={16} className="text-indigo-500" /> View Details
                </MenuItem>
                <Divider sx={{ my: 0.5, mx: 1 }} />
                <MenuItem
                    onClick={() => { setIsDeleteModalOpen(true); handleMenuClose(); }}
                    sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#e11d48', py: 1.5, px: 2.5, gap: 1.5, '&:hover': { bgcolor: '#fff1f2' } }}
                >
                    <Trash2 size={16} /> Delete Batch
                </MenuItem>
            </Menu>

            {/* ── Batch Detail Modal ──────────────────────────────────────── slice ── */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Batch Details"
                footer={
                    <button
                        onClick={() => setIsViewModalOpen(false)}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-colors"
                    >
                        Close Portal
                    </button>
                }
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                            <Info size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Identifier</p>
                            <p className="text-sm font-mono font-bold text-slate-700">ID_REF::{selectedBatch?.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Resource Status</p>
                            {getBatchQty(selectedBatch) > 0 ? (
                                <Badge variant="success" className="px-4 py-1.5 shadow-sm shadow-emerald-50 border-emerald-100 font-black">ACTIVE STOCK</Badge>
                            ) : (
                                <Badge variant="danger" className="px-4 py-1.5 shadow-sm shadow-rose-50 border-rose-100 font-black">DEPLETED</Badge>
                            )}
                        </div>
                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Batch Reference</p>
                            <p className="text-base font-black text-slate-800 tracking-tight">#{selectedBatch?.batchNumber || selectedBatch?.batch_number || '—'}</p>
                        </div>
                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Available Quantity</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-900">{getBatchQty(selectedBatch)}</span>
                                <span className="text-xs font-bold text-slate-400 uppercase">Units</span>
                            </div>
                        </div>
                        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ingestion Timestamp</p>
                            <CreatedAtText value={selectedBatch?.createdAt || selectedBatch?.created_at} className="flex-col !items-start !gap-0.5" />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => { if (!deleteBatchMutation.isPending) setIsDeleteModalOpen(false); }}
                title="Delete Stock Batch?"
                footer={
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={handleDelete}
                            disabled={deleteBatchMutation.isPending}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {deleteBatchMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Yes, Remove Batch'}
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleteBatchMutation.isPending}
                            className="text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-4">
                    <p className="text-slate-600 text-center leading-relaxed">
                        Are you sure you want to remove batch{' '}
                        <strong className="text-slate-800">
                            {selectedBatch?.batchNumber || selectedBatch?.batch_number}
                        </strong>
                        ?
                    </p>
                    <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                            Batches can only be deleted if they have{' '}
                            <strong>zero available stock</strong>. The server will reject the request otherwise.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Batches;
