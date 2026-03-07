import React, { useState } from 'react';
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    ShoppingCart,
    User,
    X,
    Calculator,
    Zap,
    Box as BoxIcon,
    ChevronDown,
    ArrowRight,
    TrendingUp,
    Shield,
    FileText,
    History
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
    CircularProgress,
    Box,
    Autocomplete,
    TextField
} from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    invoiceService,
    customerService,
    productService,
    batchService
} from '../../api';
import { formatLKR } from '../../utils/formatters';
import { useErpKeyboardForm } from '../../hooks/useErpKeyboardForm';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Validation Schema
const itemSchema = z.object({
    productId: z.coerce.number({ required_error: 'Product required' }),
    batchId: z.coerce.number({ required_error: 'Batch required' }),
    quantity: z.coerce.number().positive('Qty must be > 0'),
    unitPrice: z.coerce.number().nonnegative('Price required')
});

const invoiceSchema = z.object({
    customerId: z.number({ required_error: 'Please select a customer' }),
    items: z.array(itemSchema).min(1, 'At least one item is required')
});

const InvoiceCreatePage = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const formRef = React.useRef(null);
    const { onKeyDown } = useErpKeyboardForm(formRef, { autoFocus: true });

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

    const [batchesMap, setBatchesMap] = useState({}); // { productId: batches[] }

    const fetchBatches = async (productId) => {
        if (!productId || batchesMap[productId]) return;
        try {
            const batches = await batchService.getBatchesByProduct(productId);
            setBatchesMap(prev => ({ ...prev, [productId]: batches }));
        } catch (err) {
            // Handled globally
        }
    };

    const createMutation = useMutation({
        mutationFn: (data) => invoiceService.createInvoice(data),
        onSuccess: (data) => {
            navigate(`/invoices/${data.id}`);
        },
        onError: (err) => {
            // Handled globally
        }
    });

    const onSubmit = (data) => {
        createMutation.mutate(data);
    };

    const getProductName = (productId) => {
        const prod = products?.find(p => p.id === productId);
        return prod?.name || '';
    };

    const subtotal = watchedItems.reduce((acc, item) => {
        return acc + (Number(item.quantity) * Number(item.unitPrice) || 0);
    }, 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/invoices')}
                        className={`w-14 h-14 border rounded-2xl flex items-center justify-center transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="space-y-2">
                        <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Create Invoice
                        </h1>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Record a new business transaction</p>
                    </div>
                </div>
            </div>

            <form
                ref={formRef}
                onKeyDown={onKeyDown}
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Customer Selection */}
                    <div className={`p-10 rounded-[40px] border relative overflow-hidden group transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center gap-4 mb-10 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                <User size={20} />
                            </div>
                            <h2 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Select Customer</h2>
                        </div>

                        <div className="relative z-10">
                            <Controller
                                name="customerId"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        options={customers || []}
                                        getOptionLabel={(option) => `${option.name} (${option.phone})`}
                                        onChange={(_, newVal) => field.onChange(newVal?.id)}
                                        loading={isLoadingCustomers}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '24px',
                                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                                                color: isDarkMode ? 'white' : '#0f172a',
                                                padding: '8px 16px',
                                                '& fieldset': { border: 'none' },
                                                '&:hover fieldset': { border: 'none' },
                                                '&.Mui-focused fieldset': { border: 'none' },
                                            },
                                            '& .MuiInputBase-input': {
                                                fontFamily: 'Outfit, sans-serif',
                                                fontWeight: '900',
                                                fontSize: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                color: isDarkMode ? 'white' : '#0f172a',
                                            },
                                            '& .MuiIconButton-root': { color: isDarkMode ? '#475569' : '#94a3b8' },
                                            '& .MuiAutocomplete-loading': { color: '#6366f1' },
                                            '& .MuiAutocomplete-endAdornment': {
                                                '& .MuiIconButton-root': {
                                                    color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                                                }
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Search customers by name or phone..."
                                                error={!!errors.customerId}
                                                helperText={errors.customerId?.message}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px]" />
                    </div>

                    {/* Items Section */}
                    <div className={`p-10 rounded-[40px] border relative overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                                    <ShoppingCart size={20} />
                                </div>
                                <h2 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Invoice Items</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => append({ productId: '', batchId: '', quantity: 1, unitPrice: 0 })}
                                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border active:scale-95 ${isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-indigo-600'}`}
                            >
                                <Plus size={16} />
                                <span>Add Item</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {fields.map((field, index) => {
                                const currentItem = watchedItems[index] || {};
                                const lineTotal = (Number(currentItem.quantity) * Number(currentItem.unitPrice)) || 0;
                                const selectedProd = products?.find(p => p.id === currentItem.productId);

                                return (
                                    <div key={field.id} className={`p-8 rounded-[32px] border relative group transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center border transition-all opacity-0 group-hover:opacity-100 shadow-2xl ${isDarkMode ? 'bg-[#1a1b24] text-slate-600 border-white/10 hover:text-rose-500 hover:border-rose-500/50' : 'bg-white text-slate-400 border-slate-200 hover:text-rose-600 hover:border-rose-300'}`}
                                        >
                                            <X size={18} />
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                            {/* Product Select */}
                                            <div className="md:col-span-5 space-y-3">
                                                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Product</label>
                                                <div className="relative">
                                                    <Controller
                                                        name={`items.${index}.productId`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <select
                                                                {...field}
                                                                className={`w-full h-14 px-6 border rounded-2xl text-xs font-black uppercase tracking-wider outline-none appearance-none cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 focus:shadow-[0_0_0_6px_rgba(56,189,248,0.18)] ${isDarkMode ? 'bg-[#0c0d10] border-white/5 text-white hover:bg-white/5' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    field.onChange(val);
                                                                    setValue(`items.${index}.batchId`, '');
                                                                    fetchBatches(val);
                                                                    const prod = products?.find(p => p.id === val);
                                                                    if (prod?.price) {
                                                                        setValue(`items.${index}.unitPrice`, prod.price);
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Select Product...</option>
                                                                {products?.map(p => (
                                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    />
                                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                                </div>
                                            </div>

                                            {/* Batch Select */}
                                            <div className="md:col-span-4 space-y-3">
                                                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Batch</label>
                                                <div className="relative">
                                                    <Controller
                                                        name={`items.${index}.batchId`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <select
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                                disabled={!currentItem.productId}
                                                                className={`w-full h-14 px-6 border rounded-2xl text-xs font-black uppercase tracking-wider outline-none appearance-none cursor-pointer disabled:opacity-30 transition-all duration-300 focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 focus:shadow-[0_0_0_6px_rgba(56,189,248,0.18)] ${isDarkMode ? 'bg-[#0c0d10] border-white/5 text-white hover:bg-white/5' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                                                            >
                                                                <option value="">Select Batch...</option>
                                                                {batchesMap[currentItem.productId]?.map(b => (
                                                                    <option key={b.id} value={b.id}>
                                                                        #{b.batchNumber || b.id} (Stock: {b.qtyAvailable})
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    />
                                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                                                </div>
                                            </div>

                                            {/* Quantity */}
                                            <div className="md:col-span-3 space-y-3">
                                                <label className={`text-[9px] font-black uppercase tracking-[0.2em] ml-2 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Quantity</label>
                                                <input
                                                    type="number"
                                                    {...register(`items.${index}.quantity`)}
                                                    className={`w-full h-14 px-6 border rounded-2xl text-xs font-black uppercase tracking-wider outline-none transition-all text-center ${isDarkMode ? 'bg-[#0c0d10] border-white/5 text-white hover:bg-white/5' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                                                />
                                            </div>
                                        </div>

                                        <div className={`mt-8 pt-6 border-t flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Unit Price</span>
                                                    <span className={`font-black text-xs italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedProd ? formatLKR(currentItem.unitPrice) : '--'}</span>
                                                </div>
                                                <div className={`w-px h-6 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`} />
                                                <div className="flex flex-col">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>Line Total</span>
                                                    <span className="text-indigo-400 font-black text-base italic tracking-tighter">{formatLKR(lineTotal)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => append({ productId: '', batchId: '', quantity: 1, unitPrice: 0 })}
                                className={`w-full py-8 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all group ${isDarkMode ? 'border-white/5 text-slate-700 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/5' : 'border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-500/30 hover:bg-indigo-50'}`}
                            >
                                <Plus size={32} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Add Another Item</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:col-span-4 space-y-10">
                    <div className={`p-10 rounded-[40px] border sticky top-10 overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex justify-between items-start relative z-10 font-black uppercase tracking-widest mb-12">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/10' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                <Calculator size={24} />
                            </div>
                            <div className="text-right">
                                <p className={`text-[9px] mb-1 ${isDarkMode ? 'text-indigo-500/80' : 'text-indigo-600'}`}>Invoice Summary</p>
                                <div className={`w-2 h-2 rounded-full float-right ${isDarkMode ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.3)]'}`} />
                            </div>
                        </div>

                        <div className="space-y-6 mb-12">
                            <p className={`text-[9px] font-black uppercase tracking-[0.2em] border-b pb-4 ${isDarkMode ? 'text-slate-700 border-white/5' : 'text-slate-400 border-slate-50'}`}>Itemized Summary</p>
                            <div className="space-y-5">
                                {watchedItems.map((item, idx) => {
                                    const prodName = getProductName(item.productId);
                                    const qty = Number(item.quantity) || 0;
                                    const price = Number(item.unitPrice) || 0;
                                    const lineTotal = qty * price;
                                    if (!item.productId) return null;
                                    return (
                                        <div key={idx} className="flex justify-between items-start group/summary">
                                            <div className="flex-1 min-w-0 mr-4">
                                                <span className={`font-black text-[11px] uppercase tracking-tight block truncate group-hover/summary:text-indigo-400 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {prodName}
                                                </span>
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {qty} Units @ {formatLKR(price)}
                                                </span>
                                            </div>
                                            <span className={`font-black text-xs whitespace-nowrap italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {formatLKR(lineTotal)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={`space-y-6 pt-8 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-50'}`}>
                            <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Subtotal</span>
                                <span className={`text-sm font-black italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formatLKR(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>VAT (0%)</span>
                                <span className={`text-sm font-black italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>LKR 0.00</span>
                            </div>
                            <div className={`h-px my-2 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`} />
                            <div className="flex justify-between items-center">
                                <span className={`text-xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Total</span>
                                <span className="text-3xl font-black text-indigo-400 italic tracking-tighter">{formatLKR(subtotal)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full mt-10 h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[24px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            {createMutation.isPending ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Create Invoice</span>
                                </>
                            )}
                        </button>

                        <div className={`mt-8 flex items-center gap-3 p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <Shield size={16} className="text-slate-600" />
                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] leading-relaxed ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                Invoice will be created as <span className="text-amber-500">UNPAID</span> until marked otherwise.
                            </p>
                        </div>

                        <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[80px] ${isDarkMode ? 'bg-indigo-500/5' : 'bg-indigo-500/10'}`} />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default InvoiceCreatePage;
