import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    ShoppingCart,
    User,
    X,
    Calculator
} from 'lucide-react';
import {
    Paper,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Typography,
    Box,
    IconButton,
    Divider,
    Autocomplete
} from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import {
    invoiceService,
    customerService,
    productService,
    batchService
} from '../../api';
import { formatLKR } from '../../utils/formatters';


// Validation Schema
const itemSchema = z.object({
    productId: z.number({ required_error: 'Product required' }),
    batchId: z.number({ required_error: 'Batch required' }),
    quantity: z.preprocess((val) => Number(val), z.number().positive('Qty must be > 0')),
    unitPrice: z.preprocess((val) => Number(val), z.number().nonnegative('Price required'))
});

const invoiceSchema = z.object({
    customerId: z.number({ required_error: 'Please select a customer' }),
    items: z.array(itemSchema).min(1, 'At least one item is required')
});

const InvoiceCreatePage = () => {
    const navigate = useNavigate();

    // Form Setup
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            customerId: null,
            items: [{ productId: '', batchId: '', quantity: 1, unitPrice: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchedItems = watch('items');

    // Fetch Data
    const { data: customers, isLoading: isLoadingCustomers } = useQuery({
        queryKey: ['customers'],
        queryFn: () => customerService.getCustomers()
    });

    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => productService.getProducts()
    });

    // Helper to fetch batches when product changes
    const [batchesMap, setBatchesMap] = useState({}); // { productId: batches[] }

    const fetchBatches = async (productId) => {
        if (!productId || batchesMap[productId]) return;
        try {
            const batches = await batchService.getBatchesByProduct(productId);
            setBatchesMap(prev => ({ ...prev, [productId]: batches }));
        } catch (err) {
            toast.error('Failed to load batches');
        }
    };

    // Mutation
    const createMutation = useMutation({
        mutationFn: (data) => invoiceService.createInvoice(data),
        onSuccess: (data) => {
            toast.success(data?.message || 'Invoice created successfully');
            navigate(`/invoices/${data.id}`);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create invoice')
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    // Helper: get product name by id
    const getProductName = (productId) => {
        const prod = products?.find(p => p.id === productId);
        return prod?.name || '';
    };

    // Totals Calculation
    const subtotal = watchedItems.reduce((acc, item) => {
        return acc + (Number(item.quantity) * Number(item.unitPrice) || 0);
    }, 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <IconButton onClick={() => navigate('/invoices')} className="bg-white shadow-sm border border-slate-100 p-3">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </IconButton>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create New Invoice</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Customer Selection */}
                    <Paper className="p-8 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <User size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Customer Selection</h2>
                        </div>
                        <Controller
                            name="customerId"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={customers || []}
                                    getOptionLabel={(option) => `${option.name} (${option.phone})`}
                                    onChange={(_, newVal) => field.onChange(newVal?.id)}
                                    loading={isLoadingCustomers}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search Customer"
                                            error={!!errors.customerId}
                                            helperText={errors.customerId?.message}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Paper>

                    {/* Items Section */}
                    <Paper className="p-8 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <ShoppingCart size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">Invoice Items</h2>
                            </div>
                            <Button
                                variant="outlined"
                                startIcon={<Plus size={18} />}
                                onClick={() => append({ productId: '', batchId: '', quantity: 1, unitPrice: 0 })}
                                className="border-indigo-100 text-indigo-600 font-bold px-4 py-2 hover:bg-indigo-50 rounded-xl"
                            >
                                Add Item
                            </Button>
                        </div>

                        {errors.items?.message && (
                            <Typography color="error" className="text-sm font-medium mb-4">
                                {errors.items.message}
                            </Typography>
                        )}

                        <div className="space-y-6">
                            {fields.map((field, index) => {
                                const currentItem = watchedItems[index] || {};
                                const lineTotal = (Number(currentItem.quantity) * Number(currentItem.unitPrice)) || 0;
                                const selectedProd = products?.find(p => p.id === currentItem.productId);

                                return (
                                    <div key={field.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                        <IconButton
                                            onClick={() => remove(index)}
                                            className="absolute -top-3 -right-3 bg-white shadow-md hover:bg-rose-50 hover:text-rose-600"
                                            size="small"
                                        >
                                            <X size={16} />
                                        </IconButton>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Product Select */}
                                            <FormControl fullWidth error={!!errors.items?.[index]?.productId}>
                                                <InputLabel>Product</InputLabel>
                                                <Controller
                                                    name={`items.${index}.productId`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            label="Product"
                                                            sx={{ borderRadius: '12px', background: 'white' }}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                field.onChange(val);
                                                                setValue(`items.${index}.batchId`, '');
                                                                fetchBatches(val);
                                                                // Auto-fill unit price from product price
                                                                const prod = products?.find(p => p.id === val);
                                                                if (prod?.price) {
                                                                    setValue(`items.${index}.unitPrice`, prod.price);
                                                                }
                                                            }}
                                                        >
                                                            {products?.map(p => (
                                                                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    )}
                                                />
                                                <Typography variant="caption" color="error">
                                                    {errors.items?.[index]?.productId?.message}
                                                </Typography>
                                            </FormControl>

                                            {/* Batch Select */}
                                            <FormControl fullWidth error={!!errors.items?.[index]?.batchId}>
                                                <InputLabel>Batch</InputLabel>
                                                <Controller
                                                    name={`items.${index}.batchId`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            label="Batch"
                                                            disabled={!currentItem.productId}
                                                            sx={{ borderRadius: '12px', background: 'white' }}
                                                        >
                                                            {batchesMap[currentItem.productId]?.map(b => (
                                                                <MenuItem key={b.id} value={b.id}>
                                                                    Batch #{b.batchNumber || b.id} (Stock: {b.qtyAvailable})
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    )}
                                                />
                                                <Typography variant="caption" color="error">
                                                    {errors.items?.[index]?.batchId?.message}
                                                </Typography>
                                            </FormControl>

                                            {/* Quantity */}
                                            <TextField
                                                label="Quantity"
                                                type="number"
                                                {...register(`items.${index}.quantity`)}
                                                error={!!errors.items?.[index]?.quantity}
                                                helperText={errors.items?.[index]?.quantity?.message}
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', background: 'white' } }}
                                            />
                                        </div>

                                        {/* Auto-filled price & line total display */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <Typography className="text-sm text-slate-400 font-medium">
                                                Unit Price:{' '}
                                                <span className="text-slate-700 font-bold">
                                                    {selectedProd ? formatLKR(currentItem.unitPrice) : '—'}
                                                </span>
                                            </Typography>
                                            <Typography className="text-sm font-bold text-slate-500">
                                                Line Total:{' '}
                                                <span className="text-slate-900 ml-1 font-black">
                                                    {formatLKR(lineTotal)}
                                                </span>
                                            </Typography>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Paper>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-8">
                    <Paper className="p-8 rounded-[32px] border border-slate-100 shadow-sm sticky top-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Calculator size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Order Summary</h2>
                        </div>

                        {/* Per-item line totals */}
                        <div className="space-y-3 mb-6">
                            {watchedItems.map((item, idx) => {
                                const prodName = getProductName(item.productId);
                                const qty = Number(item.quantity) || 0;
                                const price = Number(item.unitPrice) || 0;
                                const lineTotal = qty * price;
                                return (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div className="flex-1 min-w-0 mr-3">
                                            <span className="font-semibold text-slate-700 block truncate">
                                                {prodName || `Item ${idx + 1}`}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {qty} × {formatLKR(price)}
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-800 whitespace-nowrap">
                                            {formatLKR(lineTotal)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <Divider className="mb-4" />

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-slate-500 font-medium">
                                <span>Subtotal</span>
                                <span>{formatLKR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-500 font-medium pb-4 border-b border-slate-50">
                                <span>Tax (0.00%)</span>
                                <span>Rs. 0.00</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="text-lg font-bold text-slate-800">Total Amount</span>
                                <span className="text-2xl font-black text-indigo-600">{formatLKR(subtotal)}</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={createMutation.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all flex gap-3"
                        >
                            {createMutation.isPending ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Generate Invoice</span>
                                </>
                            )}
                        </Button>

                        <Typography className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-widest">
                            Invoices are marked as UNPAID by default
                        </Typography>
                    </Paper>
                </div>
            </form>
        </div>
    );
};

export default InvoiceCreatePage;
