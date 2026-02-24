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
    X,
    Archive,
    RefreshCcw,
    ArchiveX
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
    Chip,
    CircularProgress,
    TextField,
    Button,
    Select,
    FormControl,
    InputLabel,
    FormHelperText,
    Typography,
    Box,
    InputAdornment,
    Tabs,
    Tab
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { productService, categoryService, supplierService } from '../../api';
import Modal from '../../components/ui/Modal';
import { formatLKR } from '../../utils/formatters';

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
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [stockFilter, setStockFilter] = useState('All');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'archived'

    // Debounce search search term
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 400); // 400ms delay

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
            toast.success(data?.message || 'Product created successfully');
            handleCloseProductModal();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product')
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }) => productService.updateProduct(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', viewMode] });
            toast.success(data?.message || 'Product updated successfully');
            handleCloseProductModal();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product')
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id) => productService.deleteProduct(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'archived'] });
            toast.success(data?.message || 'Product deleted');
            setIsDeleteModalOpen(false);
            setAnchorEl(null);
            setSelectedProduct(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete product')
    });

    const restoreProductMutation = useMutation({
        mutationFn: (id) => productService.restoreProduct(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['products', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'archived'] });
            toast.success(data?.message || 'Product restored');
            setAnchorEl(null);
            setSelectedProduct(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to restore product')
    });

    const createCategoryMutation = useMutation({
        mutationFn: (data) => categoryService.createCategory(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] }).then(() => {
                setValue('categoryId', data?.id?.toString());
            });
            toast.success(data?.message || 'Category created');
            setIsCategoryModalOpen(false);
            resetCat();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create category')
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
    const handleMenuClick = (event, product) => {
        setAnchorEl(event.currentTarget);
        setSelectedProduct(product);
    };

    const handleMenuClose = () => setAnchorEl(null);

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
        handleMenuClose();
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

    if (isLoadingProducts) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <CircularProgress color="primary" />
                <Typography className="text-slate-500 font-medium animate-pulse">Loading products...</Typography>
            </div>
        );
    }

    if (isError) {
        return (
            <Box className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 bg-rose-50 rounded-3xl border border-rose-100 italic">
                <AlertTriangle size={48} className="text-rose-500" />
                <Typography className="text-rose-700 font-bold text-xl text-center">
                    Oops! Failed to load products.
                </Typography>
                <Typography className="text-rose-600 text-center max-w-md">
                    {error?.response?.data?.message || error?.message || "There was an error connecting to the server. Please check your connection and try again."}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-8 py-2 mt-4 shadow-lg shadow-rose-100"
                >
                    Retry Loading
                </Button>
            </Box>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Product Management</h1>
                    <p className="text-slate-500 mt-1">Manage your inventory, pricing and stock levels.</p>
                </div>
                <button
                    onClick={() => handleOpenProductModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add New Product</span>
                </button>
            </div>

            <div className="border-b border-slate-100">
                <Tabs
                    value={viewMode}
                    onChange={(_, val) => setViewMode(val)}
                    sx={{
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                        '& .MuiTab-root': { fontWeight: 600, fontSize: '0.9rem', textTransform: 'none', minWidth: 120 }
                    }}
                >
                    <Tab
                        icon={<Package size={18} />}
                        iconPosition="start"
                        label="Active Products"
                        value="active"
                    />
                    <Tab
                        iconPosition="start"
                        icon={<Archive size={18} />}
                        label="Archived"
                        value="archived"
                    />
                </Tabs>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by SKU or Product Name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                        className={`flex items-center gap-2 border px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${stockFilter !== 'All' ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter size={18} />
                        {stockFilter === 'All' ? 'Filter' : stockFilter}
                    </button>
                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={() => setFilterAnchorEl(null)}
                        PaperProps={{ sx: { borderRadius: '16px', mt: 1, border: '1px solid #f1f5f9' } }}
                    >
                        <MenuItem onClick={() => { setStockFilter('All'); setFilterAnchorEl(null); }} className="text-sm font-semibold py-2 px-6">All Products</MenuItem>
                        <MenuItem onClick={() => { setStockFilter('Low Stock'); setFilterAnchorEl(null); }} className="text-sm font-semibold py-2 px-6 text-rose-600">Low Stock Only</MenuItem>
                    </Menu>
                </div>
            </div>

            <TableContainer component={Paper} elevation={0} className="border border-slate-100 overflow-hidden shadow-sm" sx={{ borderRadius: '24px' }}>
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">SKU</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Product Name</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Category</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Price</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-center">Available Stock</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-center">Low Stock Limit</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="border-none py-20 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <Package size={48} className="opacity-20 mb-2" />
                                        <Typography className="font-bold text-lg">No products found</Typography>
                                        <Typography className="text-sm">Try adjusting your search or filters.</Typography>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((p) => {
                                const isLowStock = p.availableStock <= p.lowStockLimit;
                                return (
                                    <TableRow key={p.id} hover className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="border-none px-8 py-6 font-mono text-xs font-bold text-slate-400">{p.sku}</TableCell>
                                        <TableCell className="border-none px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 ${viewMode === 'archived' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'} rounded-xl flex items-center justify-center`}>
                                                    <Package size={20} />
                                                </div>
                                                <span className={`font-bold ${viewMode === 'archived' ? 'text-slate-400' : 'text-slate-800'}`}>{p.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="border-none px-8 py-6">
                                            <Chip
                                                label={p.categoryName || 'Uncategorized'}
                                                className={`${viewMode === 'archived' ? 'bg-slate-50 text-slate-300' : 'bg-slate-100 text-slate-600'} font-bold text-[10px] uppercase tracking-wider h-7`}
                                            />
                                        </TableCell>
                                        <TableCell className={`border-none px-8 py-6 font-bold ${viewMode === 'archived' ? 'text-slate-400' : 'text-slate-700'}`}>{formatLKR(p.price)}</TableCell>
                                        <TableCell className="border-none px-8 py-6 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`font-bold ${viewMode === 'archived' ? 'text-slate-300' : (isLowStock ? 'text-rose-600' : 'text-emerald-600')}`}>
                                                    {p.availableStock} units
                                                </span>
                                                {isLowStock && viewMode === 'active' && <Chip icon={<AlertTriangle size={12} />} label="LOW STOCK" size="small" className="bg-rose-50 text-rose-600 font-bold text-[9px] h-5" />}
                                            </div>
                                        </TableCell>
                                        <TableCell className={`border-none px-8 py-6 text-center font-semibold ${viewMode === 'archived' ? 'text-slate-300' : 'text-slate-500'}`}>{p.lowStockLimit}</TableCell>
                                        <TableCell className="border-none px-8 py-6 text-right">
                                            <IconButton onClick={(e) => handleMenuClick(e, p)}>
                                                <MoreVertical size={20} className="text-slate-400" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{ sx: { borderRadius: '16px', minWidth: 180, mt: 1, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' } }}
            >
                {viewMode === 'active' ? (
                    <>
                        <MenuItem onClick={() => handleOpenProductModal(selectedProduct)} className="text-sm font-semibold text-slate-700 py-3 px-4 flex gap-3 hover:bg-slate-50">
                            <Edit size={16} className="text-indigo-600" /> Edit Product
                        </MenuItem>
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        <MenuItem onClick={() => { setIsDeleteModalOpen(true); handleMenuClose(); }} className="text-sm font-semibold text-rose-600 py-3 px-4 flex gap-3 hover:bg-rose-50">
                            <Trash2 size={16} /> Delete Product
                        </MenuItem>
                    </>
                ) : (
                    <MenuItem
                        onClick={() => { restoreProductMutation.mutate(selectedProduct.id); }}
                        className="text-sm font-semibold text-emerald-600 py-3 px-4 flex gap-3 hover:bg-emerald-50"
                        disabled={restoreProductMutation.isPending}
                    >
                        {restoreProductMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <RefreshCcw size={16} />}
                        Restore Product
                    </MenuItem>
                )}
            </Menu>

            {/* Product Add/Edit Modal */}
            <Modal
                isOpen={isProductModalOpen}
                onClose={handleCloseProductModal}
                title={isEditMode ? 'Edit Product' : 'Add New Product'}
                footer={
                    <div className="flex gap-4">
                        <button
                            onClick={handleCloseProductModal}
                            className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit(onSubmitProduct)}
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-5 py-4">
                    {isEditMode && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Product SKU</p>
                            <p className="font-mono text-indigo-600 font-bold">{selectedProduct?.sku}</p>
                        </div>
                    )}
                    <TextField
                        fullWidth
                        label="Product Name"
                        {...register('name')}
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                    />
                    <div className="flex gap-2 items-start">
                        <FormControl fullWidth error={!!errors.categoryId}>
                            <InputLabel>Category</InputLabel>
                            <Controller
                                name="categoryId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        value={field.value || ''}
                                        label="Category"
                                        sx={{ borderRadius: '16px' }}
                                    >
                                        <MenuItem value="" disabled><em>Select Category</em></MenuItem>
                                        {categories?.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id.toString()}>{cat.name}</MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.categoryId && <FormHelperText>{errors.categoryId.message}</FormHelperText>}
                        </FormControl>
                        <button
                            type="button"
                            onClick={() => setIsCategoryModalOpen(true)}
                            className="h-14 min-w-[56px] flex items-center justify-center bg-slate-100 text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors"
                        >
                            <PlusCircle size={24} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            {...register('price')}
                            error={!!errors.price}
                            helperText={errors.price?.message}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                                step: "0.01"
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Low Stock Limit"
                            type="number"
                            {...register('lowStockLimit')}
                            error={!!errors.lowStockLimit}
                            helperText={errors.lowStockLimit?.message}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                    </div>
                    <FormControl fullWidth error={!!errors.supplierId}>
                        <InputLabel>Supplier (Optional)</InputLabel>
                        <Controller
                            name="supplierId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    value={field.value || ''}
                                    label="Supplier (Optional)"
                                    sx={{ borderRadius: '16px' }}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {suppliers?.map((sup) => (
                                        <MenuItem key={sup.id} value={sup.id.toString()}>{sup.name}</MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                        {errors.supplierId && <FormHelperText>{errors.supplierId.message}</FormHelperText>}
                    </FormControl>
                </div>
            </Modal>

            {/* Category Modal */}
            <Modal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title="Create New Category"
                footer={
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsCategoryModalOpen(false)}
                            className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmitCat(onSubmitCategory)}
                            disabled={createCategoryMutation.isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {createCategoryMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Create'}
                        </button>
                    </div>
                }
            >
                <div className="py-4">
                    <TextField
                        fullWidth
                        label="Category Name"
                        autoFocus
                        {...registerCat('name')}
                        error={!!catErrors.name}
                        helperText={catErrors.name?.message}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                    />
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Product?"
                footer={
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={handleDelete}
                            disabled={deleteProductMutation.isPending}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {deleteProductMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Yes, Delete Product'}
                        </button>
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                            Keep Product
                        </button>
                    </div>
                }
            >
                <div className="text-center py-6">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={40} className="text-rose-500" />
                    </div>
                    <p className="text-slate-600 leading-relaxed text-center">
                        Delete this product? <br />
                        <span className="text-sm text-slate-400">You can restore it from <b>Archived</b> later.</span>
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default Products;
