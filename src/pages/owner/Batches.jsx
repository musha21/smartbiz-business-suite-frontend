import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Eye,
    Package,
    Calendar,
    ArrowRight,
    X,
    Inbox,
    AlertCircle,
    Info
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Select,
    FormControl,
    InputLabel,
    FormHelperText,
    Typography,
    Box,
    Chip,
    Avatar,
    Divider
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { batchService, productService } from '../../api';

// Validation Schema for Adding Stock
const addStockSchema = z.object({
    productId: z.number(),
    batchNumber: z.string().min(1, 'Batch number is required'),
    qty: z.preprocess((val) => Number(val), z.number().positive('Quantity must be greater than 0'))
});

const Batches = () => {
    const queryClient = useQueryClient();
    const [selectedProductId, setSelectedProductId] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('All');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    // Debounce search term
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchInput]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Queries
    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: productService.getAllProducts
    });

    const { data: batches, isLoading: isLoadingBatches, error: batchesError } = useQuery({
        queryKey: ['batches', selectedProductId],
        queryFn: () => batchService.getBatchesByProduct(selectedProductId),
        enabled: !!selectedProductId
    });

    // Forms
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(addStockSchema),
        defaultValues: {
            productId: selectedProductId,
            batchNumber: '',
            qty: ''
        }
    });

    // Mutations
    const addStockMutation = useMutation({
        mutationFn: batchService.addStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches', selectedProductId] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Stock added successfully');
            setIsAddModalOpen(false);
            reset();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to add stock');
        }
    });

    const deleteBatchMutation = useMutation({
        mutationFn: batchService.deleteBatch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['batches', selectedProductId] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Batch removed successfully');
            setIsDeleteModalOpen(false);
            setAnchorEl(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to remove batch');
        }
    });

    // Computed Data
    const selectedProduct = useMemo(() => {
        return products?.find(p => p.id === Number(selectedProductId));
    }, [products, selectedProductId]);

    const filteredBatches = useMemo(() => {
        if (!batches) return [];
        return batches.filter(b => {
            const matchesSearch = b.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesFilter = true;
            if (stockFilter === 'In Stock') matchesFilter = b.qtyAvailable > 0;
            if (stockFilter === 'Zero Stock') matchesFilter = b.qtyAvailable === 0;

            return matchesSearch && matchesFilter;
        });
    }, [batches, searchTerm, stockFilter]);

    // Handlers
    const handleAddStockSubmit = (data) => {
        addStockMutation.mutate({ ...data, productId: Number(selectedProductId) });
    };

    const handleMenuClick = (event, batch) => {
        setAnchorEl(event.currentTarget);
        setSelectedBatch(batch);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        if (selectedBatch) {
            deleteBatchMutation.mutate(selectedBatch.id);
        }
    };

    if (isLoadingProducts) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CircularProgress color="primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Stock Batches</h1>
                    <p className="text-slate-500 mt-1">Track inventory arrivals and batch-wise stock levels.</p>
                </div>
            </div>

            {/* Product Selection & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Box className="lg:col-span-1">
                    <Paper elevation={0} className="p-6 rounded-3xl border border-slate-100 shadow-sm h-full">
                        <Typography className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Product</Typography>
                        <FormControl fullWidth>
                            <InputLabel>Product</InputLabel>
                            <Select
                                label="Product"
                                value={selectedProductId || ''}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                sx={{ borderRadius: '16px' }}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    <em>Select a product to view batches</em>
                                </MenuItem>
                                {products?.map((p) => (
                                    <MenuItem key={p.id} value={p.id.toString()}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{p.name}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</span>
                                        </div>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {selectedProduct && (
                            <Box className="mt-8 space-y-4">
                                <Divider />
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</span>
                                        <span className="text-sm font-mono font-bold text-slate-700">{selectedProduct.sku}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</span>
                                        <span className="text-xs font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-lg">{selectedProduct.categoryName || 'Uncategorized'}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock</span>
                                        <Chip
                                            label={`${selectedProduct.availableStock} Units`}
                                            className={`font-bold text-xs h-7 ${selectedProduct.availableStock <= selectedProduct.lowStockLimit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}
                                        />
                                    </div>
                                </div>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={() => {
                                        setValue('productId', Number(selectedProductId));
                                        setIsAddModalOpen(true);
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-100 mt-4 capitalize"
                                    startIcon={<Plus size={18} />}
                                >
                                    Add Stock
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Box>

                <Box className="lg:col-span-2">
                    {!selectedProductId ? (
                        <Paper elevation={0} className="rounded-3xl border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center h-full bg-slate-50/50">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 mb-6">
                                <Package size={32} />
                            </div>
                            <Typography className="text-xl font-bold text-slate-700 mb-2">No Product Selected</Typography>
                            <Typography className="text-slate-500 max-w-xs mx-auto">Please select a product from the list to view and manage its stock batches.</Typography>
                        </Paper>
                    ) : (
                        <div className="space-y-6">
                            {/* Batches Table Toolbar */}
                            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by Batch Number..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                                        className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-semibold transition-all ${stockFilter !== 'All' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                    >
                                        <Filter size={16} />
                                        {stockFilter === 'All' ? 'Filter' : stockFilter}
                                    </button>
                                    <Menu
                                        anchorEl={filterAnchorEl}
                                        open={Boolean(filterAnchorEl)}
                                        onClose={() => setFilterAnchorEl(null)}
                                        PaperProps={{ sx: { borderRadius: '12px', mt: 1, border: '1px solid #f1f5f9' } }}
                                    >
                                        {['All', 'In Stock', 'Zero Stock'].map((f) => (
                                            <MenuItem
                                                key={f}
                                                onClick={() => { setStockFilter(f); setFilterAnchorEl(null); }}
                                                className={`text-sm font-semibold py-2 px-6 ${stockFilter === f ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                                            >
                                                {f}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </div>
                            </div>

                            {/* Batches Table */}
                            <TableContainer component={Paper} elevation={0} className="border border-slate-100 overflow-hidden shadow-sm" sx={{ borderRadius: '24px' }}>
                                {isLoadingBatches ? (
                                    <div className="py-20 flex justify-center"><CircularProgress size={30} /></div>
                                ) : (
                                    <Table>
                                        <TableHead className="bg-slate-50">
                                            <TableRow>
                                                <TableCell className="font-bold text-slate-500 border-none px-6 py-4">Batch Number</TableCell>
                                                <TableCell className="font-bold text-slate-500 border-none px-6 py-4 text-center">Available Qty</TableCell>
                                                <TableCell className="font-bold text-slate-500 border-none px-6 py-4 text-center">Created At</TableCell>
                                                <TableCell className="font-bold text-slate-500 border-none px-6 py-4 text-right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredBatches.map((b) => (
                                                <TableRow key={b.id} hover className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                    <TableCell className="border-none px-6 py-5 font-mono text-xs font-bold text-indigo-600">{b.batchNumber}</TableCell>
                                                    <TableCell className="border-none px-6 py-5 text-center">
                                                        <span className={`font-bold ${b.qtyAvailable > 0 ? 'text-slate-700' : 'text-rose-400'}`}>
                                                            {b.qtyAvailable} Units
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-6 py-5 text-center text-slate-500 text-xs">
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex items-center gap-1 font-semibold text-slate-600">
                                                                <Calendar size={12} />
                                                                {format(new Date(b.createdAt), 'MMM dd, yyyy')}
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 mt-0.5">{format(new Date(b.createdAt), 'HH:mm a')}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="border-none px-6 py-5 text-right">
                                                        <IconButton onClick={(e) => handleMenuClick(e, b)}>
                                                            <MoreVertical size={18} className="text-slate-400" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredBatches.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="border-none py-16 text-center">
                                                        <Inbox size={40} className="mx-auto text-slate-200 mb-2" />
                                                        <Typography className="text-slate-400 font-medium text-sm">No batches found for this product</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                )}
                            </TableContainer>
                        </div>
                    )}
                </Box>
            </div>

            {/* Add Stock Modal */}
            <Dialog
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                PaperProps={{ sx: { borderRadius: '28px', padding: '12px', maxWidth: '450px', width: '100%' } }}
            >
                <DialogTitle className="font-bold text-2xl text-slate-800 flex justify-between items-center">
                    Add New Batch
                    <IconButton onClick={() => setIsAddModalOpen(false)} size="small"><X size={20} /></IconButton>
                </DialogTitle>
                <form onSubmit={handleSubmit(handleAddStockSubmit)}>
                    <DialogContent className="space-y-6">
                        <input type="hidden" {...register('productId')} />
                        <Box className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-4">
                            <Avatar sx={{ bgcolor: 'indigo.500', width: 44, height: 44, borderRadius: '12px' }}>
                                <Package size={22} />
                            </Avatar>
                            <div>
                                <Typography className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Selected Product</Typography>
                                <Typography className="font-bold text-slate-700 leading-tight">{selectedProduct?.name}</Typography>
                            </div>
                        </Box>

                        <TextField
                            fullWidth
                            label="Batch Number"
                            {...register('batchNumber')}
                            error={!!errors.batchNumber}
                            helperText={errors.batchNumber?.message}
                            placeholder="e.g. BATCH-2024-001"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />

                        <TextField
                            fullWidth
                            label="Quantity to Add"
                            type="number"
                            {...register('qty')}
                            error={!!errors.qty}
                            helperText={errors.qty?.message}
                            placeholder="Amount of units"
                            InputProps={{
                                endAdornment: <Typography className="text-xs font-bold text-slate-400 ml-2">Units</Typography>
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                    </DialogContent>
                    <DialogActions className="p-6 pt-2">
                        <Button
                            onClick={() => setIsAddModalOpen(false)}
                            fullWidth
                            className="text-slate-500 font-bold py-3 rounded-2xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={addStockMutation.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-100"
                        >
                            {addStockMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Confirm Add Stock'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Batch Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: { borderRadius: '16px', minWidth: 160, mt: 1, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }
                }}
            >
                <MenuItem onClick={() => { setIsViewModalOpen(true); handleMenuClose(); }} className="text-sm font-semibold text-slate-700 py-3 px-4 flex gap-3 hover:bg-slate-50">
                    <Eye size={16} className="text-indigo-600" /> View Details
                </MenuItem>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <MenuItem
                    onClick={() => { setIsDeleteModalOpen(true); handleMenuClose(); }}
                    className="text-sm font-semibold text-rose-600 py-3 px-4 flex gap-3 hover:bg-rose-50"
                >
                    <Trash2 size={16} /> Delete Batch
                </MenuItem>
            </Menu>

            {/* Batch Detail Modal */}
            <Dialog
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', padding: '16px', maxWidth: '400px', width: '100%' } }}
            >
                <DialogTitle className="font-bold text-slate-800 flex justify-between items-center">
                    Batch Details
                    <IconButton onClick={() => setIsViewModalOpen(false)} size="small"><X size={20} /></IconButton>
                </DialogTitle>
                <DialogContent className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-start gap-3">
                        <div className="mt-1 p-2 bg-white rounded-lg border border-slate-100 text-slate-400">
                            <Info size={16} />
                        </div>
                        <div>
                            <Typography className="text-xs font-bold text-slate-400 uppercase tracking-widest">Internal ID</Typography>
                            <Typography className="font-mono text-sm text-slate-600">#{selectedBatch?.id}</Typography>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-slate-100 rounded-2xl">
                            <Typography className="text-xs font-bold text-slate-400 uppercase mb-1">Stock Status</Typography>
                            {selectedBatch?.qtyAvailable > 0 ? (
                                <Chip label="In Stock" size="small" className="bg-emerald-50 text-emerald-600 font-bold text-[10px] h-6" />
                            ) : (
                                <Chip label="Empty" size="small" className="bg-rose-50 text-rose-400 font-bold text-[10px] h-6" />
                            )}
                        </div>
                        <div className="p-4 border border-slate-100 rounded-2xl">
                            <Typography className="text-xs font-bold text-slate-400 uppercase mb-1">Batch #</Typography>
                            <Typography className="font-bold text-slate-700">{selectedBatch?.batchNumber}</Typography>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className="p-6">
                    <Button onClick={() => setIsViewModalOpen(false)} fullWidth variant="outlined" className="border-slate-200 text-slate-600 font-bold py-3 rounded-2xl">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', padding: '16px', maxWidth: '400px' } }}
            >
                <DialogTitle className="font-bold text-center text-slate-800">Delete Stock Batch?</DialogTitle>
                <DialogContent className="space-y-4">
                    <Typography className="text-slate-500 text-center">
                        Are you sure you want to remove batch <span className="font-bold text-slate-700">{selectedBatch?.batchNumber}</span>?
                    </Typography>
                    <Box className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <Typography className="text-[11px] font-medium leading-tight">
                            Batches can only be deleted if they have <span className="font-bold">zero available stock</span>.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions className="p-6 flex-col gap-2">
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        fullWidth
                        disabled={deleteBatchMutation.isPending}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-rose-100"
                    >
                        {deleteBatchMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Yes, Remove Batch'}
                    </Button>
                    <Button onClick={() => setIsDeleteModalOpen(false)} fullWidth className="text-slate-500 font-bold py-3">Cancel</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Batches;
