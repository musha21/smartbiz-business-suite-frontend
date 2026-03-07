import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Edit,
    Package,
    AlertTriangle,
    PlusCircle,
    Archive,
    RefreshCcw,
    ArchiveX,
    Zap,
    Box as BoxIcon,
    ChevronDown,
    ArrowRight,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    IconButton,
    CircularProgress,
    Tooltip,
    Tabs,
    Tab
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useErpKeyboardForm } from '../../hooks/useErpKeyboardForm';
import { productService, categoryService, supplierService } from '../../api';
import { formatLKR } from '../../utils/formatters';

// UI Components
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';

// Validation Schemas
const productSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    price: z.preprocess((val) => Number(val), z.number().positive('Price must be greater than 0')),
    lowStockLimit: z.preprocess((val) => Number(val), z.number().min(0, 'Limit cannot be negative')),
    categoryId: z.string().min(1, 'Category is required'),
    supplierId: z.string().optional()
});

const categorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters')
});

const Products = () => {
    const queryClient = useQueryClient();
    const { isDarkMode } = useTheme();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('All');
    const [activeMenu, setActiveMenu] = useState(null);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'

    const productFormRef = React.useRef(null);
    const categoryFormRef = React.useRef(null);

    const { onKeyDown: onProductKeyDown } = useErpKeyboardForm(productFormRef, { autoFocus: true });
    const { onKeyDown: onCategoryKeyDown } = useErpKeyboardForm(categoryFormRef, { autoFocus: true });

    // Debounce search search term
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 400);

        return () => clearTimeout(handler);
    }, [searchInput]);

    // Queries
    const { data: products, isLoading: isLoadingProducts, isError, error } = useQuery({
        queryKey: ['products', viewMode],
        queryFn: () => viewMode === 'active' ? productService.getProducts() : productService.getArchivedProducts(),
        retry: 1
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getCategories
    });

    const { data: suppliers } = useQuery({
        queryKey: ['suppliers'],
        queryFn: supplierService.getSuppliers
    });

    // Forms
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
        control
    } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            price: '',
            lowStockLimit: 10,
            categoryId: '',
            supplierId: ''
        }
    });

    const {
        register: registerCat,
        handleSubmit: handleSubmitCat,
        reset: resetCat,
        formState: { errors: catErrors }
    } = useForm({
        resolver: zodResolver(categorySchema)
    });

    // Mutations
    const createProductMutation = useMutation({
        mutationFn: (data) => productService.createProduct(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', 'active'] });
            handleCloseProductModal();
        },
        onError: (err) => { /* Handled globally */ }
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }) => productService.updateProduct(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', viewMode] });
            handleCloseProductModal();
        },
        onError: (err) => { /* Handled globally */ }
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id) => productService.deleteProduct(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'archived'] });
            setIsDeleteModalOpen(false);
            setActiveMenu(null);
            setSelectedProduct(null);
        },
        onError: (err) => { /* Handled globally */ }
    });

    const restoreProductMutation = useMutation({
        mutationFn: (id) => productService.restoreProduct(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'archived'] });
            setActiveMenu(null);
            setSelectedProduct(null);
        },
        onError: (err) => { /* Handled globally */ }
    });

    const createCategoryMutation = useMutation({
        mutationFn: (data) => categoryService.createCategory(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] }).then(() => {
                setValue('categoryId', data?.id?.toString());
            });
            setIsCategoryModalOpen(false);
            resetCat();
        },
        onError: (err) => { /* Handled globally */ }
    });

    // Filtering
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p => {
            const matchesSearch =
                p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

            const isLowStock = p.availableStock <= p.lowStockLimit;
            const matchesFilter = stockFilter === 'All' || (stockFilter === 'Low Stock' && isLowStock);

            return matchesSearch && matchesFilter;
        });
    }, [products, searchTerm, stockFilter]);

    // Handlers
    const handleOpenProductModal = (product = null) => {
        if (product) {
            setIsEditMode(true);
            setSelectedProduct(product);
            reset({
                name: product.name,
                price: product.price,
                lowStockLimit: product.lowStockLimit,
                categoryId: product.categoryId?.toString() || '',
                supplierId: product.supplierId?.toString() || ''
            });
        } else {
            setIsEditMode(false);
            reset({
                name: '',
                price: '',
                lowStockLimit: 10,
                categoryId: '',
                supplierId: ''
            });
        }
        setIsProductModalOpen(true);
        setActiveMenu(null);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        reset();
    };

    const onSubmitProduct = (data) => {
        if (isEditMode) {
            updateProductMutation.mutate({ id: selectedProduct.id, data });
        } else {
            createProductMutation.mutate(data);
        }
    };

    const onSubmitCategory = (data) => {
        createCategoryMutation.mutate(data);
    };

    const handleDelete = () => {
        if (selectedProduct) {
            deleteProductMutation.mutate(selectedProduct.id);
        }
    };

    const columns = [
        {
            key: 'sku',
            label: 'SKU',
            render: (val) => <span className={`font-mono font-bold text-[10px] border px-2 py-1 rounded-lg ${isDarkMode ? 'text-indigo-400 bg-white/5 border-white/10' : 'text-indigo-600 bg-indigo-50 border-indigo-100'}`}>#{val}</span>
        },
        {
            key: 'name',
            label: 'Product',
            render: (val, row) => (
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-white/5 border border-white/5 text-indigo-500' : 'bg-slate-50 border border-slate-100 text-indigo-600'}`}>
                        <Package size={18} />
                    </div>
                    <div>
                        <p className={`font-black tracking-tight leading-tight ${viewMode === 'archived' ? 'text-slate-600 italic' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>{val}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{row.categoryName || 'General'}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'price',
            label: 'Price',
            render: (val) => <span className={`font-bold text-sm tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatLKR(val)}</span>
        },
        {
            key: 'availableStock',
            label: 'Stock Quantity',
            render: (val, row) => {
                const isLowStock = val <= row.lowStockLimit;
                return (
                    <div className="flex flex-col items-start gap-1.5">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-black uppercase tracking-widest ${isLowStock ? 'text-rose-500' : 'text-emerald-500'}`}>{val} units</span>
                            <div className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-500'}`} />
                        </div>
                        {isLowStock && viewMode === 'active' && (
                            <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-rose-500/20 ${isDarkMode ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-50 text-rose-600'}`}>
                                Low Stock
                            </div>
                        )}
                    </div>
                );
            }
        }
    ];

    if (isLoadingProducts) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
                <CircularProgress sx={{ color: '#6366f1' }} />
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Loading inventory...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8">
                <div className={`border rounded-[32px] p-12 flex flex-col items-center text-center gap-6 ${isDarkMode ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="w-20 h-20 bg-rose-500 text-white rounded-[24px] flex items-center justify-center shadow-rose-500/20">
                        <AlertTriangle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className={`text-2xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Failed to load inventory</h3>
                        <p className={`text-sm font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {error?.response?.data?.message || "There was an error connecting to the inventory service."}
                        </p>
                    </div>
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
                        className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${isDarkMode ? 'bg-white/5 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-600 hover:text-white shadow-sm'}`}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-2">
                    <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Inventory
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Manage your products and stock levels</p>
                </div>
                <div className="flex gap-4">
                    <button className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest border group ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-indigo-600'}`}>
                        <TrendingUp size={18} />
                        <span>Audit Log</span>
                    </button>
                    <button
                        onClick={() => handleOpenProductModal()}
                        className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-600/20"
                    >
                        <Plus size={20} />
                        <span>Add Product</span>
                    </button>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className={`flex items-center gap-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <button
                    onClick={() => setViewMode('active')}
                    className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] relative ${viewMode === 'active' ? 'text-indigo-600' : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}
                >
                    Active Products
                    {viewMode === 'active' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full" />}
                </button>
                <button
                    onClick={() => setViewMode('archived')}
                    className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] relative ${viewMode === 'archived' ? 'text-rose-500' : (isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600')}`}
                >
                    Archived
                    {viewMode === 'archived' && <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-500 rounded-full" />}
                </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-9 relative group">
                    <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-600 group-focus-within:text-indigo-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`} size={20} />
                    <input
                        type="text"
                        placeholder="Search for products by name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={`w-full pl-14 pr-6 py-4 border rounded-[22px] text-sm font-bold outline-none ${isDarkMode ? 'bg-[#15161c] border-white/5 text-white placeholder:text-slate-700 focus:ring-1 focus:ring-indigo-500/50 focus:bg-[#1a1b24]' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-indigo-500/30 focus:bg-slate-50'}`}
                    />
                </div>
                <div className="lg:col-span-3">
                    <div className="relative group">
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className={`w-full h-14 px-6 border rounded-[22px] text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer appearance-none ${isDarkMode ? 'bg-[#15161c] border-white/5 text-slate-400 hover:bg-[#1a1b24] hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}`}
                        >
                            <option value="All">All Products</option>
                            <option value="Low Stock">Low Stock Only</option>
                        </select>
                        <ChevronDown className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={16} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div onClick={() => setActiveMenu(null)}>
                <DataTable
                    dark={isDarkMode}
                    columns={columns}
                    data={filteredProducts}
                    emptyMessage="No products found."
                    actions={(row) => (
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setActiveMenu(activeMenu === row.id ? null : row.id)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${activeMenu === row.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/40' : (isDarkMode ? 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-white' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-indigo-600')}`}
                            >
                                <MoreVertical size={18} />
                            </button>

                            {activeMenu === row.id && (
                                <div className={`absolute right-0 top-12 w-64 rounded-[24px] border shadow-2xl py-4 z-50 ${isDarkMode ? 'bg-[#1a1b24] border-white/10' : 'bg-white border-slate-100'}`}>
                                    <p className={`px-6 py-2 text-[9px] font-black uppercase tracking-[0.2em] border-b mb-2 ${isDarkMode ? 'text-slate-600 border-white/5' : 'text-slate-400 border-slate-50'}`}>Actions</p>

                                    {viewMode === 'active' ? (
                                        <>
                                            <button
                                                onClick={() => handleOpenProductModal(row)}
                                                className={`w-full px-6 py-3.5 text-left flex items-center gap-3 font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'}`}
                                            >
                                                <Edit size={16} /> Edit Product
                                            </button>
                                            <button
                                                onClick={() => { setIsDeleteModalOpen(true); setSelectedProduct(row); setActiveMenu(null); }}
                                                className={`w-full px-6 py-3.5 text-left flex items-center gap-3 font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                                            >
                                                <Trash2 size={16} /> Archive Product
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => { restoreProductMutation.mutate(row.id); }}
                                            className={`w-full px-6 py-3.5 text-left flex items-center gap-3 font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                            disabled={restoreProductMutation.isPending}
                                        >
                                            <RefreshCcw size={16} /> Restore Product
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                />
            </div>

            {/* Product Modal */}
            <Modal
                isOpen={isProductModalOpen}
                onClose={handleCloseProductModal}
                title={isEditMode ? 'Edit Product' : 'Add New Product'}
                dark={isDarkMode}
                onSubmit={handleSubmit(onSubmitProduct)}
                formRef={productFormRef}
                onKeyDown={onProductKeyDown}
                footer={
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={handleCloseProductModal} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Cancel</button>
                        <button
                            type="submit"
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            className="bg-indigo-600 text-white px-10 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 flex items-center gap-3"
                        >
                            {(createProductMutation.isPending || updateProductMutation.isPending) ? <CircularProgress size={16} color="inherit" /> : <ShieldCheck size={18} />}
                            <span>{isEditMode ? 'Save Changes' : 'Add Product'}</span>
                        </button>
                    </div>
                }
            >
                <div className="space-y-8">
                    {isEditMode && (
                        <div className={`border p-6 rounded-[24px] flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <div>
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Product SKU</p>
                                <p className={`font-mono font-black text-lg ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{selectedProduct?.sku}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                <BoxIcon size={24} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <Input
                            dark={isDarkMode}
                            label="Product Name"
                            {...register('name')}
                            error={errors.name?.message}
                            placeholder="Enter product name..."
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div className="space-y-3">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Category</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <select
                                            {...register('categoryId')}
                                            className={`w-full h-14 px-6 border rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 focus:shadow-[0_0_0_6px_rgba(56,189,248,0.18)] ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:bg-white/[0.08]' : 'bg-slate-50 border-slate-100 text-slate-900 focus:bg-slate-100/50'}`}
                                        >
                                            <option value="" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>Select Category...</option>
                                            {categories?.map((cat) => (
                                                <option key={cat.id} value={cat.id.toString()} className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={16} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(true)}
                                        className={`w-14 h-14 flex items-center justify-center rounded-2xl border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500 hover:text-white' : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white'}`}
                                    >
                                        <PlusCircle size={22} />
                                    </button>
                                </div>
                                {errors.categoryId && <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest ml-2">{errors.categoryId.message}</p>}
                            </div>

                            <Input
                                dark={isDarkMode}
                                label="Price"
                                type="number"
                                {...register('price')}
                                error={errors.price?.message}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                dark={isDarkMode}
                                label="Low Stock Limit"
                                type="number"
                                {...register('lowStockLimit')}
                                error={errors.lowStockLimit?.message}
                                placeholder="10"
                            />

                            <div className="space-y-3">
                                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Supplier</label>
                                <div className="relative">
                                    <select
                                        {...register('supplierId')}
                                        className={`w-full h-14 px-6 border rounded-2xl text-sm font-bold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 focus:shadow-[0_0_0_6px_rgba(56,189,248,0.18)] ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:bg-white/[0.08]' : 'bg-slate-50 border-slate-100 text-slate-900 focus:bg-slate-100/50'}`}
                                    >
                                        <option value="" className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>None Assigned</option>
                                        {suppliers?.map((sup) => (
                                            <option key={sup.id} value={sup.id.toString()} className={isDarkMode ? 'bg-[#15161c]' : 'bg-white text-slate-900'}>{sup.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Category Modal */}
            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="Add Category"
                dark={isDarkMode}
                onSubmit={handleSubmitCat(onSubmitCategory)}
                formRef={categoryFormRef}
                onKeyDown={onCategoryKeyDown}
                footer={
                    <div className="flex gap-4 justify-end">
                        <button type="button" onClick={() => setIsCategoryModalOpen(false)} className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>Cancel</button>
                        <button
                            type="submit"
                            disabled={createCategoryMutation.isPending}
                            className="bg-emerald-600 text-white px-10 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 flex items-center gap-3"
                        >
                            {createCategoryMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PlusCircle size={18} />}
                            <span>Add Category</span>
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div className={`border rounded-2xl p-5 flex items-start gap-4 ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
                        <PlusCircle size={20} className="text-emerald-500 shrink-0" />
                        <p className={`text-[11px] font-bold leading-relaxed uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            Define a new category to organize your products.
                        </p>
                    </div>
                    <Input
                        dark={isDarkMode}
                        label="Category Name"
                        autoFocus
                        {...registerCat('name')}
                        error={catErrors.name?.message}
                        placeholder="Electronics, Consumables, etc..."
                    />
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Archive Product"
                dark={isDarkMode}
                onSubmit={handleDelete}
                footer={
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            type="submit"
                            disabled={deleteProductMutation.isPending}
                            className="bg-rose-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-rose-500 shadow-xl shadow-rose-600/20"
                        >
                            {deleteProductMutation.isPending ? <CircularProgress size={16} color="inherit" /> : 'Confirm Archive'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className={`font-black text-[10px] uppercase tracking-widest py-3 ${isDarkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Cancel
                        </button>
                    </div>
                }
            >
                <div className="text-center py-6 space-y-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto border-2 relative ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
                        <ArchiveX size={40} className="text-rose-500" />
                    </div>
                    <div className="space-y-2">
                        <p className={`font-black uppercase italic text-xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Archive this product?</p>
                        <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            The product will be moved to the <span className="text-rose-400">archived list</span> and removed from active inventory.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Products;
