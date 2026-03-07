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
    RefreshCw,
    ChevronDown,
    Zap,
    Activity,
    Database,
    Clock,
    ShieldAlert
} from 'lucide-react';
import {
    IconButton,
    CircularProgress,
    Tooltip,
    Avatar
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { batchService, productService } from '../../api';
import { useTheme } from '../../context/ThemeContext';

// UI Components
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import CreatedAtText from '../../components/ui/CreatedAtText';

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

const Batches = () => {
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();

    // ── State ──────────────────────────────────────────────────────────────────
    const [selectedProductId, setSelectedProductId] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('All');
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

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
            setIsAddModalOpen(false);
            reset({ productId: Number(selectedProductId), batchNumber: '', qty: '' });
        },
        onError: (err) => {
            // Handled globally
        },
    });

    const deleteBatchMutation = useMutation({
        mutationFn: batchService.deleteBatch,
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['batches'] });
            await queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsDeleteModalOpen(false);
            setActiveMenu(null);
            setSelectedBatch(null);
        },
        onError: (err) => {
            // Handled globally
        },
    });

    // ── Computed ───────────────────────────────────────────────────────────────
    const selectedProduct = useMemo(() => {
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

    const handleOpenAddModal = () => {
        setValue('productId', Number(selectedProductId), { shouldValidate: false });
        setIsAddModalOpen(true);
    };

    const handleAddStockSubmit = (data) => {
        addStockMutation.mutate({ ...data, productId: Number(selectedProductId) });
    };

    const handleDelete = () => {
        if (selectedBatch) {
            deleteBatchMutation.mutate(selectedBatch.id);
        }
    };

    const getBatchQty = (b) => b?.qtyAvailable ?? b?.qty_available ?? b?.quantity ?? 0;

    const columns = [
        {
            key: 'batchNumber',
            label: 'Batch ID',
            render: (val) => (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                        <Database size={14} />
                    </div>
                    <span className={`font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{val}</span>
                </div>
            )
        },
        {
            key: 'qtyAvailable',
            label: 'Stock Level',
            render: (_, row) => {
                const qty = getBatchQty(row);
                return (
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${qty > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                        <span className={`text-sm font-bold tracking-tight ${qty > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {qty} <span className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Units</span>
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'createdAt',
            label: 'Added Date',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <Clock size={12} className={isDarkMode ? 'text-slate-400' : 'text-slate-400'} />
                    <CreatedAtText value={val} className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} showIcon={false} />
                </div>
            )
        }
    ];

    if (isLoadingProducts) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <CircularProgress sx={{ color: '#6366f1' }} />
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Loading inventory data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b transition-all duration-300 ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-2">
                    <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Stock Batches
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Track and manage product arrivals and stock levels</p>
                </div>
                {selectedProductId && (
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Add New Batch</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Product Selector */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`border p-8 rounded-[32px] space-y-8 relative overflow-hidden group transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Select Product</p>
                            <div className="relative">
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className={`w-full h-14 pl-6 pr-12 border rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white hover:bg-white/[0.08]' : 'bg-slate-50 border-slate-100 text-slate-900 hover:bg-slate-100'}`}
                                >
                                    <option value="" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white'}>Choose a Product...</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={String(p.id)} className={isDarkMode ? 'bg-[#15161c]' : 'bg-white'}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={16} />
                            </div>
                        </div>

                        {selectedProduct ? (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                <div className={`h-px ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`} />
                                <div className="flex items-center gap-5">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                        <Package size={32} />
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-black italic uppercase tracking-tight leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedProduct.name}</h3>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>SKU: {selectedProduct.sku || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 border rounded-2xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Total Stock</p>
                                        <p className={`text-xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedProduct.availableStock ?? 0}</p>
                                    </div>
                                    <div className={`p-4 border rounded-2xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Active Batches</p>
                                        <p className={`text-xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{batches?.length ?? 0}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleOpenAddModal}
                                    className={`w-full h-14 border rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-dashed ${isDarkMode ? 'bg-white/5 border-white/5 text-white hover:bg-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'}`}
                                >
                                    Add New Batch
                                </button>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center gap-4 text-center">
                                <div className={`w-16 h-16 border rounded-3xl flex items-center justify-center ${isDarkMode ? 'bg-white/[0.02] border-white/5 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                                    <Activity size={32} />
                                </div>
                                <p className={`text-[11px] font-bold leading-relaxed uppercase tracking-widest max-w-[200px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                    Select a product to view its batch records.
                                </p>
                            </div>
                        )}
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                    </div>
                </div>

                {/* Right Side: Batch Registry */}
                <div className="lg:col-span-8 space-y-6">
                    {!selectedProductId ? (
                        <div className={`border border-dashed rounded-[40px] p-32 flex flex-col items-center text-center gap-8 group transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className={`w-24 h-24 border rounded-[32px] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-800' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                                <Database size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Waiting for Selection</h3>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                    Please select a product from the left to load its batch records.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                            {/* Toolbar */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                <div className="md:col-span-8 relative group">
                                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-slate-600 group-focus-within:text-indigo-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by batch number..."
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        className={`w-full pl-14 pr-6 py-3.5 border rounded-[20px] text-sm font-bold transition-all outline-none ${isDarkMode ? 'bg-[#15161c] border-white/5 text-white placeholder:text-slate-700 focus:bg-[#1a1b24] focus:ring-1 focus:ring-indigo-500/50' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-500/30 shadow-sm'}`}
                                    />
                                </div>
                                <div className="md:col-span-4 relative">
                                    <select
                                        value={stockFilter}
                                        onChange={(e) => setStockFilter(e.target.value)}
                                        className={`w-full h-12 px-6 border rounded-[20px] text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all appearance-none ${isDarkMode ? 'bg-[#15161c] border-white/5 text-slate-400 hover:bg-[#1a1b24] hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}`}
                                    >
                                        <option value="All" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white'}>All Batches</option>
                                        <option value="In Stock" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white'}>In Stock</option>
                                        <option value="Zero Stock" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white'}>Empty Batches</option>
                                    </select>
                                    <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={14} />
                                </div>
                            </div>

                            {/* DataTable */}
                            <div onClick={() => setActiveMenu(null)}>
                                <DataTable
                                    dark={isDarkMode}
                                    columns={columns}
                                    data={filteredBatches}
                                    isLoading={isLoadingBatches}
                                    emptyMessage="No batches found for this product."
                                    actions={(row) => (
                                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
                                                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center border shadow-sm ${activeMenu === row.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/40' : (isDarkMode ? 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-white' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-indigo-600')}`}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {activeMenu === row.id && (
                                                <div className={`absolute right-0 top-12 w-64 rounded-[24px] border shadow-2xl py-4 z-50 animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#1a1b24] border-white/10' : 'bg-white border-slate-100'}`}>
                                                    <p className={`px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] border-b mb-2 ${isDarkMode ? 'text-slate-600 border-white/5' : 'text-slate-400 border-slate-50'}`}>Batch Actions</p>

                                                    <button
                                                        onClick={() => { setIsViewModalOpen(true); setSelectedBatch(row); setActiveMenu(null); }}
                                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                                    >
                                                        <Eye size={16} /> View Details
                                                    </button>
                                                    <div className={`h-px my-2 mx-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`} />
                                                    <button
                                                        onClick={() => { setIsDeleteModalOpen(true); setSelectedBatch(row); setActiveMenu(null); }}
                                                        className={`w-full px-6 py-3.5 text-left flex items-center gap-3 transition-all font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                                                    >
                                                        <Trash2 size={16} /> Delete Batch
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Stock Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Stock Batch"
                dark={isDarkMode}
                onSubmit={handleSubmit(handleAddStockSubmit)}
                footer={
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Cancel</button>
                        <button
                            type="submit"
                            disabled={addStockMutation.isPending}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3"
                        >
                            {addStockMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Plus size={18} />}
                            <span>Confirm and Add Stock</span>
                        </button>
                    </div>
                }
            >
                <div className="space-y-8">
                    <div className={`flex items-center gap-5 pb-6 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 ${isDarkMode ? 'bg-white/5 border-white/10 text-indigo-400' : 'bg-slate-50 border-slate-100 text-indigo-600'}`}>
                            <Package size={32} />
                        </div>
                        <div>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Target Product</p>
                            <h3 className={`text-xl font-black italic uppercase tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedProduct?.name}</h3>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <Input
                            dark={isDarkMode}
                            label="Batch Number"
                            {...register('batchNumber')}
                            error={errors.batchNumber?.message}
                            placeholder="e.g. BATCH-001"
                        />
                        <Input
                            dark={isDarkMode}
                            label="Quantity"
                            type="number"
                            {...register('qty')}
                            error={errors.qty?.message}
                            placeholder="Enter quantity..."
                        />
                    </div>
                </div>
            </Modal>

            {/* Batch Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Batch Details"
                dark={isDarkMode}
                footer={
                    <button
                        onClick={() => setIsViewModalOpen(false)}
                        className={`w-full border font-black py-4 rounded-[24px] transition-all text-[10px] uppercase tracking-widest ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/[0.08]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                        Close Details
                    </button>
                }
            >
                <div className="space-y-8 py-4">
                    <div className="flex justify-center">
                        <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                            <Database size={40} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-6 border rounded-3xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-2 text-center ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Batch Number</p>
                            <p className={`text-sm font-black text-center uppercase font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedBatch?.batchNumber || 'N/A'}</p>
                        </div>
                        <div className={`p-6 border rounded-3xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-2 text-center ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Status</p>
                            <div className="flex justify-center">
                                <Badge variant={getBatchQty(selectedBatch) > 0 ? 'success' : 'danger'} dark={isDarkMode}>
                                    {getBatchQty(selectedBatch) > 0 ? 'IN STOCK' : 'DEPLETED'}
                                </Badge>
                            </div>
                        </div>
                        <div className={`p-6 border rounded-3xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-2 text-center ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Quantity</p>
                            <p className={`text-2xl font-black italic tracking-tighter text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{getBatchQty(selectedBatch)} <span className="text-[10px] not-italic text-slate-600 ml-1 font-bold">UNITS</span></p>
                        </div>
                        <div className={`p-6 border rounded-3xl text-center ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Created Date</p>
                            <CreatedAtText value={selectedBatch?.createdAt} className="flex-col !items-center !gap-0.5" />
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Batch Record"
                dark={isDarkMode}
                onSubmit={handleDelete}
                footer={
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            type="submit"
                            disabled={deleteBatchMutation.isPending}
                            className="bg-rose-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                        >
                            {deleteBatchMutation.isPending ? <CircularProgress size={16} color="inherit" /> : 'Confirm Delete'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className={`font-black text-[10px] uppercase tracking-widest py-3 transition-colors ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="text-center py-6 space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 relative ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                        <ShieldAlert size={40} className="text-rose-500" />
                        <div className={`absolute inset-0 blur-2xl opacity-10 ${isDarkMode ? 'bg-rose-500' : 'bg-rose-200'}`} />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className={`font-black uppercase italic text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Delete this batch?</p>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                Batch number <span className="text-rose-400 font-black">{selectedBatch?.batchNumber}</span> will be permanently deleted.
                            </p>
                        </div>
                        <div className={`border rounded-2xl p-4 flex items-start gap-3 ${isDarkMode ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-100'}`}>
                            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className={`text-[10px] font-bold uppercase tracking-wide text-left leading-relaxed ${isDarkMode ? 'text-amber-500/80' : 'text-amber-600'}`}>
                                Note: Only empty batches can be deleted.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Batches;
