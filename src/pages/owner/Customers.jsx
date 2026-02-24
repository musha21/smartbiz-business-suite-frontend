import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Edit
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
    TextField,
    Button
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { customerService } from '../../api';
import Modal from '../../components/ui/Modal';
import CreatedAtText from '../../components/ui/CreatedAtText';

const Customers = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [editCustomer, setEditCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active'
    });

    const queryClient = useQueryClient();
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(searchInput);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchInput]);

    const { data: customers, isLoading, error } = useQuery({
        queryKey: ['customers'],
        queryFn: () => customerService.getCustomers()
    });

    // Handle v5 error side-effect
    useEffect(() => {
        if (error) {
            toast.error(error.response?.data?.message || 'Failed to load customers');
        }
    }, [error]);

    const filteredCustomers = React.useMemo(() => {
        if (!customers) return [];
        return customers.filter(c => {
            const matchesSearch =
                c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.phone?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [customers, searchTerm, statusFilter]);

    const deleteMutation = useMutation({
        mutationFn: (id) => customerService.deleteCustomer(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success(data?.message || 'Customer deleted successfully');
            handleClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete customer');
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => customerService.createCustomer(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success(data?.message || 'Customer added successfully');
            setIsAddModalOpen(false);
            setNewCustomer({ name: '', email: '', phone: '', address: '' });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to add customer');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => customerService.updateCustomer(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success(data?.message || 'Customer profile updated');
            setIsEditModalOpen(false);
            handleClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update customer');
        }
    });

    const handleClick = (event, customer) => {
        setAnchorEl(event.currentTarget);
        setSelectedCustomer(customer);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setSelectedCustomer(null);
    };

    const handleDelete = () => {
        if (selectedCustomer) {
            deleteMutation.mutate(selectedCustomer.id);
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(newCustomer);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate({ id: selectedCustomer.id, data: editCustomer });
    };

    const handleEditClick = () => {
        if (selectedCustomer) {
            setEditCustomer({
                name: selectedCustomer.name || '',
                email: selectedCustomer.email || '',
                phone: selectedCustomer.phone || '',
                address: selectedCustomer.address || '',
                status: selectedCustomer.status || 'Active'
            });
            setIsEditModalOpen(true);
        }
    };

    const handleExportCSV = () => {
        if (!customers || customers.length === 0) return;

        const headers = ["ID", "Name", "Email", "Phone", "Address", "Status"];
        const rows = filteredCustomers.map(c => [
            c.id,
            c.name,
            c.email,
            c.phone,
            `"${c.address || ''}"`,
            c.status || 'Active'
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-vh-50 mt-20">
                <CircularProgress color="primary" />
            </div>
        );
    }

    const open = Boolean(anchorEl);

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Customer Database</h1>
                    <p className="text-slate-500 mt-1">Manage and track your customer relationships.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                >
                    <Plus size={20} />
                    <span>Add New Customer</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
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
                        {statusFilter === 'All' ? 'Filter' : `Status: ${statusFilter}`}
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="border border-slate-200 px-5 py-3 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        Export CSV
                    </button>
                </div>

                <Menu
                    anchorEl={filterAnchorEl}
                    open={Boolean(filterAnchorEl)}
                    onClose={() => setFilterAnchorEl(null)}
                    PaperProps={{ sx: { borderRadius: '16px', mt: 1, border: '1px solid #f1f5f9', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' } }}
                >
                    {['All', 'Active', 'Inactive', 'Premium'].map((status) => (
                        <MenuItem
                            key={status}
                            onClick={() => { setStatusFilter(status); setFilterAnchorEl(null); }}
                            className={`text-sm font-semibold py-2 px-6 ${statusFilter === status ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600'}`}
                        >
                            {status}
                        </MenuItem>
                    ))}
                </Menu>
            </div>

            <TableContainer component={Paper} elevation={0} className="border border-slate-100 overflow-hidden" sx={{ borderRadius: '24px' }}>
                <Table>
                    <TableHead className="bg-slate-50">
                        <TableRow>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Customer</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5">Contact Details</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-center">Address</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-center">Status</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-center">Joined On</TableCell>
                            <TableCell className="font-bold text-slate-500 border-none px-8 py-5 text-right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCustomers.map((customer) => (
                            <TableRow key={customer.id} hover className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="border-none px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar sx={{ bgcolor: 'indigo.500', width: 40, height: 40, fontSize: '0.875rem', fontWeight: 'bold' }}>
                                            {customer.name?.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-slate-800 leading-none">{customer.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">ID: #CUST-{customer.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Mail size={14} className="text-slate-400" />
                                            {customer.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Phone size={14} className="text-slate-400" />
                                            {customer.phone}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-center">
                                    {customer.address ? (
                                        <div className="flex items-center justify-center gap-2 text-slate-600 text-sm">
                                            <MapPin size={14} className="text-slate-400" />
                                            {customer.address}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-sm italic">No address</span>
                                    )}
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-center">
                                    <Chip
                                        label={customer.status || 'Active'}
                                        className={`${customer.status === 'Inactive' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-700'} font-bold text-[10px] uppercase tracking-wider h-7`}
                                    />
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-center">
                                    <CreatedAtText value={customer.createdAt} className="justify-center" showIcon={false} />
                                </TableCell>
                                <TableCell className="border-none px-8 py-6 text-right">
                                    <IconButton onClick={(e) => handleClick(e, customer)}>
                                        <MoreVertical size={20} className="text-slate-400" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="border-none py-20 text-center">
                                    <p className="text-slate-400 font-medium">No customers found matching your criteria</p>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: { borderRadius: '16px', minWidth: 150, mt: 1.5, border: '1px solid #f1f5f9' }
                }}
            >
                <MenuItem onClick={handleEditClick} className="text-sm font-semibold text-slate-700 py-2.5 px-4 flex gap-3">
                    <Edit size={16} /> Edit Profile
                </MenuItem>
                <MenuItem onClick={handleClose} className="text-sm font-semibold text-slate-700 py-2.5 px-4 flex gap-3">
                    <Mail size={16} /> Send Email
                </MenuItem>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <MenuItem
                    onClick={handleDelete}
                    className="text-sm font-semibold text-rose-600 py-2.5 px-4 flex gap-3"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <Trash2 size={16} />}
                    Delete
                </MenuItem>
            </Menu>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Customer"
                footer={
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateSubmit}
                            disabled={createMutation.isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {createMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Save Customer'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-4">
                    <TextField
                        fullWidth
                        label="Customer Name"
                        variant="outlined"
                        required
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        required
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        fullWidth
                        label="Phone Number"
                        variant="outlined"
                        required
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        fullWidth
                        label="Address"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Customer Profile"
                footer={
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateSubmit}
                            disabled={updateMutation.isPending}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {updateMutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                            ) : 'Update Customer'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 py-4">
                    <TextField
                        fullWidth
                        label="Customer Name"
                        variant="outlined"
                        required
                        value={editCustomer.name}
                        onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        required
                        value={editCustomer.email}
                        onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        fullWidth
                        label="Phone Number"
                        variant="outlined"
                        required
                        value={editCustomer.phone}
                        onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Status"
                        variant="outlined"
                        required
                        value={editCustomer.status || 'Active'}
                        onChange={(e) => setEditCustomer({ ...editCustomer, status: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="Premium">Premium</MenuItem>
                    </TextField>
                    <TextField
                        fullWidth
                        label="Address"
                        variant="outlined"
                        multiline
                        rows={3}
                        value={editCustomer.address}
                        onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                </div>
            </Modal>
        </div >
    );
};

export default Customers;
