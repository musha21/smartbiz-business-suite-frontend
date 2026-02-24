import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../api/auth.service';
import { toast } from 'react-toastify';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    Shield,
    CheckCircle2
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await authService.login(data);
            authLogin(response);
            toast.success(response?.message || 'Access granted. Initializing session.');

            const role = response.role || response.user?.role;
            if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Authentication failure. Verify credentials.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Brand Narrative */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 mb-10">
                        <Shield className="text-white" size={28} />
                    </div>

                    <h1 className="text-5xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
                        Architecting Business <br />
                        <span className="text-indigo-400 font-medium italic">Efficiency.</span>
                    </h1>

                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                        Enter the next generation of multi-tenant enterprise resource planning. Precision-engineered for modern scale.
                    </p>

                    <div className="space-y-6">
                        {[
                            'Secure Multi-tenant Isolation',
                            'Real-time Resource Telemetry',
                            'Automated Invoice Lifecycle',
                            'AI-Driven Business Intelligence'
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-4 text-slate-300">
                                <CheckCircle2 className="text-indigo-500" size={20} />
                                <span className="text-sm font-bold tracking-wide">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 pt-10 border-t border-slate-800 flex items-center gap-6">
                        <div className="flex -space-x-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Trusted by 2,000+ Enterprises</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Authentication Core */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50/30">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Portal Access</h2>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Secure Identity Verification</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-6">
                            <Input
                                label="Identity Email"
                                type="email"
                                placeholder="architect@smartbiz.io"
                                {...register('email')}
                                error={errors.email?.message}
                                icon={Mail}
                            />

                            <div className="relative">
                                <Input
                                    label="Security Key"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••••••"
                                    {...register('password')}
                                    error={errors.password?.message}
                                    icon={Lock}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-[38px] text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer" />
                                    <CheckCircle2 className="absolute text-white scale-0 peer-checked:scale-100 left-0.5 transition-transform pointer-events-none" size={16} />
                                </div>
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">Persistent session</span>
                            </label>
                            <Link to="/forgot-password" size="sm" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">
                                Reset Credentials?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full h-16 rounded-[1.5rem]"
                            icon={LogIn}
                        >
                            Authorize Entry
                        </Button>
                    </form>

                    <div className="pt-8 border-t border-slate-100 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            New to the infrastructure?{' '}
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 ml-2">
                                Register Node
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
