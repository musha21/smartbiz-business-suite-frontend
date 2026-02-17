import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/auth.service';
import { toast } from 'react-toastify';
import {
    TextField,
    Button,
    InputAdornment,
    IconButton,
    CircularProgress
} from '@mui/material';
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    Business
} from '@mui/icons-material';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth(); // Rename to avoid confusion
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await authService.login(data);
            authLogin(response);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Check your credentials.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 text-center max-w-lg">
                    <div className="w-16 h-16 bg-indigo-500 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                        <Business className="text-white text-3xl" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        Manage your Business <br />
                        <span className="text-indigo-400">Smater and Faster.</span>
                    </h1>
                    <p className="text-slate-400 text-lg mb-10">
                        Streamline your inventory, sales, and operations with our all-in-one SaaS platform designed for modern growth.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-left">
                        {[
                            'Real-time Analytics',
                            'Inventory Tracking',
                            'Smart Invoicing',
                            'AI Insights'
                        ].map(feature => (
                            <div key={feature} className="flex items-center gap-2 text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                <span className="text-sm font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Please enter your details to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <TextField
                                fullWidth
                                label="Email Address"
                                placeholder="name@company.com"
                                {...register('email')}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <br />
                            <br />

                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                {...register('password')}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock className="text-slate-400" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 border-slate-300 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-indigo-600 text-sm font-semibold hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl shadow-lg shadow-indigo-200 normal-case text-base font-bold"
                            startIcon={!loading && <LoginIcon />}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-sm">
                        Don't have a business account?{' '}
                        <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
