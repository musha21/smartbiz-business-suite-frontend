import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/auth.service';
import { toast } from 'react-toastify';
import {
    TextField,
    Button,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

const registerSchema = z.object({
    name: z.string().min(2, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    businessName: z.string().min(2, 'Business name is required'),
});

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            businessName: '',
            name: '',
            email: '',
            password: '',
        }
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await authService.register(data);
            toast.success(response?.message || 'Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Visual Content */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 text-center max-w-lg">
                    <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto mb-10 flex items-center justify-center shadow-2xl shadow-indigo-500/50 rotate-12">
                        <BusinessIcon className="text-white text-4xl" />
                    </div>
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tighter italic">
                        JOIN THE <span className="text-indigo-400">SMART</span> ERA.
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed font-semibold">
                        Scale your business with AI-driven inventory, professional invoicing, and global logistics networking.
                    </p>

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5">
                            <p className="text-2xl font-black text-white">100%</p>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Cloud Secure</p>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-3xl border border-white/5">
                            <p className="text-2xl font-black text-white">AI-First</p>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Intelligence</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-md space-y-10">
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Create Account</h2>
                        <p className="text-slate-500 mt-2 font-semibold">Start your 14-day free trial. No credit card required.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <TextField
                                fullWidth
                                label="Business Name"
                                variant="outlined"
                                {...register('businessName')}
                                error={!!errors.businessName}
                                helperText={errors.businessName?.message}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BusinessIcon className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Full Name"
                                variant="outlined"
                                {...register('name')}
                                error={!!errors.name}
                                helperText={errors.name?.message}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Email address"
                                variant="outlined"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 2,
                                borderRadius: '16px',
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                backgroundColor: '#4f46e5',
                                '&:hover': {
                                    backgroundColor: '#4338ca',
                                },
                                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Register Business'}
                        </Button>

                        <div className="text-center pt-4">
                            <p className="text-slate-500 font-semibold">
                                Already have an account?{' '}
                                <Link to="/login" className="text-indigo-600 font-black hover:underline underline-offset-4">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
