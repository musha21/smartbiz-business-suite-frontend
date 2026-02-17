import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Edit,
    Truck,
    X
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
    Avatar,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Fade,
    Tooltip
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { supplierService } from '../../api';

// Validation Schema
const supplierSchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    email: z.string().email('Invalid email address').or(z.string().length(0)).optional(),
    phone: z.string().min(9, 'Phone number must be at least 9 characters'),
    address: z.string().min(3, 'Address must be at least 3 characters')
});

const Suppliers = () => {
    const queryClient = useQueryClient();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    // Debounce search term
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // Fetch Suppliers
    const { data: suppliers, isLoading, error } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => supplierService.getSuppliers(),
    });

    // Form Setup
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            address: ''
        }
    });

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: (data) => supplierService.createSupplier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success('Supplier added successfully');
            handleCloseAddModal();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to add supplier');
        }
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => supplierService.updateSupplier(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success('Supplier updated successfully');
            handleCloseEditModal();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update supplier');
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => supplierService.deleteSupplier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            toast.success('Supplier removed successfully');
            setIsDeleteModalOpen(false);
            setAnchorEl(null);
            setSelectedSupplier(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to remove supplier');
        }
    });

    // Filtering Logic
    const filteredSuppliers = useMemo(() => {
        if (!suppliers) return [];
        return suppliers.filter(s => {
            const matchesSearch =
                s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.address?.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesFilter = true;
            if (statusFilter === 'Has Email') matchesFilter = !!s.email;
            if (statusFilter === 'Has Phone') matchesFilter = !!s.phone;

            return matchesSearch && matchesFilter;
        });
    }, [suppliers, searchTerm, statusFilter]);

    // Handlers
    const handleMenuClick = (event, supplier) => {
        setAnchorEl(event.currentTarget);
        setSelectedSupplier(supplier);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleOpenAddModal = () => {
        reset({ name: '', email: '', phone: '', address: '' });
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
        reset();
    };

    const handleOpenEditModal = () => {
        if (selectedSupplier) {
            setValue('name', selectedSupplier.name);
            setValue('email', selectedSupplier.email || '');
            setValue('phone', selectedSupplier.phone);
            setValue('address', selectedSupplier.address);
            setIsEditModalOpen(true);
            handleMenuClose();
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        reset();
    };

    const onSubmitAdd = (data) => createMutation.mutate(data);
    const onSubmitEdit = (data) => updateMutation.mutate({ id: selectedSupplier.id, data });

    const handleDelete = () => {
        if (selectedSupplier) {
            deleteMutation.mutate(selectedSupplier.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CircularProgress color="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert severity="error">Failed to load suppliers. Please try again later.</Alert>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Supplier Directory</h1>
                    <p className="text-slate-500 mt-1">Manage your supply chain and procurement partners.</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add New Supplier</span>
                </button>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by company, email, phone or address..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                        className={`flex items-center gap-2 border px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${statusFilter !== 'All' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter size={18} />
                        {statusFilter === 'All' ? 'Filter' : statusFilter}
                    </button>
                    <Menu
                        anchorEl={filterAnchorEl}
                        open={Boolean(filterAnchorEl)}
                        onClose={() => setFilterAnchorEl(null)}
                        PaperProps={{ sx: { borderRadius: '16px', mt: 1, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' } }}
                    >
                        {['All', 'Has Email', 'Has Phone'].map((f) => (
                            <MenuItem
                                key={f}
                                onClick={() => { setStatusFilter(f); setFilterAnchorEl(null); }}
                                className={`text-sm font-semibold py-2 px-6 ${statusFilter === f ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                            >
                                {f}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>
            </div>

            {/* Table */}
            <TableContainer component={Paper} elevation={0} className="border border-slate-100 overflow-hidden shadow-sm" sx={{ borderRadius: '24px' }}>
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Company</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Email</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Phone</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Address</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredSuppliers.map((s) => (
                            <TableRow key={s.id} hover className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar sx={{ bgcolor: 'indigo.50', color: 'indigo.600', width: 44, height: 44, borderRadius: '12px' }}>
                                            <Truck size={22} />
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-slate-800 leading-none">{s.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">ID: #SUP-{s.id.toString().slice(-4)}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <Mail size={14} className="text-slate-400" />
                                        {s.email || <span className="text-slate-300 italic">No email</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                        <Phone size={14} className="text-slate-400" />
                                        {s.phone}
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                                        <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                                        <span className="truncate max-w-[200px]">{s.address}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-right">
                                    <IconButton onClick={(e) => handleMenuClick(e, s)}>
                                        <MoreVertical size={20} className="text-slate-400" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {filteredSuppliers.length === 0 && (
                    <div className="py-20 text-center">
                        <Truck size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium text-lg">No suppliers found matching your criteria</p>
                    </div>
                )}
            </TableContainer>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: { borderRadius: '16px', minWidth: 160, mt: 1.5, border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }
                }}
            >
                <MenuItem onClick={handleOpenEditModal} className="text-sm font-semibold text-slate-700 py-3 px-4 flex gap-3 hover:bg-slate-50">
                    <Edit size={16} className="text-indigo-600" /> Edit Details
                </MenuItem>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <MenuItem
                    onClick={() => { setIsDeleteModalOpen(true); handleMenuClose(); }}
                    className="text-sm font-semibold text-rose-600 py-3 px-4 flex gap-3 hover:bg-rose-50"
                >
                    <Trash2 size={16} /> Remove Supplier
                </MenuItem>
            </Menu>

            {/* Add/Edit Dialog */}
            <Dialog
                open={isAddModalOpen || isEditModalOpen}
                onClose={isAddModalOpen ? handleCloseAddModal : handleCloseEditModal}
                PaperProps={{ sx: { borderRadius: '28px', padding: '12px', maxWidth: '500px', width: '100%' } }}
            >
                <DialogTitle className="font-bold text-2xl text-slate-800 flex justify-between items-center">
                    {isAddModalOpen ? 'Add New Supplier' : 'Update Supplier'}
                    <IconButton onClick={isAddModalOpen ? handleCloseAddModal : handleCloseEditModal} size="small">
                        <X size={20} />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleSubmit(isAddModalOpen ? onSubmitAdd : onSubmitEdit)}>
                    <DialogContent className="space-y-5">
                        <TextField
                            fullWidth
                            label="Company Name"
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            placeholder="e.g. Silva Groceries"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Email Address (Optional)"
                            type="email"
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            placeholder="john.silva@gmail.com"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            {...register('phone')}
                            error={!!errors.phone}
                            helperText={errors.phone?.message}
                            placeholder="0771234567"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                        <TextField
                            fullWidth
                            label="Address"
                            multiline
                            rows={3}
                            {...register('address')}
                            error={!!errors.address}
                            helperText={errors.address?.message}
                            placeholder="Colombo, Sri Lanka"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                        />
                    </DialogContent>
                    <DialogActions className="p-6 pt-2">
                        <Button
                            onClick={isAddModalOpen ? handleCloseAddModal : handleCloseEditModal}
                            fullWidth
                            className="text-slate-500 font-bold py-3 rounded-2xl hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-100"
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? <CircularProgress size={24} color="inherit" /> : (isAddModalOpen ? 'Save Supplier' : 'Update Supplier')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                PaperProps={{ sx: { borderRadius: '24px', padding: '16px', maxWidth: '400px' } }}
            >
                <DialogTitle className="font-bold text-center text-slate-800">Remove Supplier?</DialogTitle>
                <DialogContent>
                    <p className="text-slate-500 text-center">
                        Are you sure you want to remove <span className="font-bold text-slate-700">{selectedSupplier?.name}</span>? This action cannot be undone.
                    </p>
                </DialogContent>
                <DialogActions className="flex-col gap-2 p-6">
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        fullWidth
                        disabled={deleteMutation.isPending}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl"
                    >
                        {deleteMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'Yes, Remove Supplier'}
                    </Button>
                    <Button
                        onClick={() => setIsDeleteModalOpen(false)}
                        fullWidth
                        className="text-slate-500 font-bold py-3 rounded-2xl"
                    >
                        Keep Supplier
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Suppliers;
