import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Building2, Globe, Coins, Factory,
    Sparkles, ArrowRight, Loader2, Upload,
    CheckCircle2, Info, Plus, User, Mail,
    Phone, MapPin, Hash, Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { profileService } from '../../api/profile.service';
import { toast } from 'react-toastify';

const profileSchema = z.object({
    businessName: z.string().min(2, 'Business name is required'),
    ownerName: z.string().min(2, 'Owner name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(8, 'Valid phone number is required'),
    address: z.string().min(5, 'Address is required'),
    industry: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    currency: z.string().length(3, 'Currency must be 3 characters (e.g., LKR)'),
    invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
    brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color').default('#6366f1'),
    brandTone: z.string().optional(),
    brandTagline: z.string().max(100, 'Tagline must be less than 100 characters').optional(),
    paymentTerms: z.string().optional(),
});

const ProfileSetup = () => {
    const navigate = useNavigate();
    const { updateProfileState, user } = useAuth();
    const { isDarkMode } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            currency: 'LKR',
            brandTone: 'Professional',
            brandColor: '#6366f1'
        }
    });

    const watchedColor = watch('brandColor');

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, logo: logoPreview };
            const result = await profileService.createProfile(payload);
            toast.success('Business profile created successfully!');
            updateProfileState(result);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create profile:', error);
            // Error handled by axios interceptor
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#0a0b10]' : 'bg-slate-50'}`}>
            <div className={`max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-[40px] shadow-2xl border ${isDarkMode ? 'bg-[#15161c] border-white/5 shadow-indigo-500/10' : 'bg-white border-slate-200'}`}>

                {/* Left Side: Info & Branding */}
                <div className="p-12 bg-gradient-to-br from-indigo-600 to-violet-800 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                            <Sparkles size={24} className="text-indigo-200" />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Welcome to<br />SmartBiz</h1>
                        <p className="text-indigo-100 text-sm font-bold opacity-80 leading-relaxed max-w-xs">
                            Let's set up your business profile to personalize your experience and power your AI capabilities.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest">Global Identity</h4>
                                <p className="text-[10px] text-indigo-200">Set your currency and locale</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest">AI Intelligence</h4>
                                <p className="text-[10px] text-indigo-200">Personalize AI-generated content</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-12">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="text-center lg:text-left mb-8">
                            <h2 className={`text-2xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Business Profile</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Foundational Setup</p>
                        </div>

                        {/* Logo Upload */}
                        <div className="flex justify-center lg:justify-start mb-8">
                            <div className="relative group">
                                <div className={`w-24 h-24 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${logoPreview ? 'border-indigo-500' : isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload size={24} className="text-slate-500" />
                                    )}
                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                                    <Plus size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Business Name *</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('businessName')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="Acme Corp" />
                                </div>
                                {errors.businessName && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.businessName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Owner Name *</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('ownerName')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="John Doe" />
                                </div>
                                {errors.ownerName && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.ownerName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('email')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="contact@acme.com" />
                                </div>
                                {errors.email && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone *</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('phone')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="+94 77 123 4567" />
                                </div>
                                {errors.phone && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.phone.message}</p>}
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Business Address *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-slate-500" size={16} />
                                    <textarea {...register('address')} rows={2} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="123 Business Way, Colombo 03" />
                                </div>
                                {errors.address && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.address.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Industry (Optional)</label>
                                <div className="relative">
                                    <Factory className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('industry')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="Retail / SaaS / Tech" />
                                </div>
                                {errors.industry && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.industry.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Country (Optional)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('country')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="Sri Lanka" />
                                </div>
                                {errors.country && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.country.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Currency *</label>
                                <div className="relative">
                                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('currency')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="LKR" />
                                </div>
                                {errors.currency && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.currency.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Invoice Prefix *</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('invoicePrefix')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="SB / INV" />
                                </div>
                                {errors.invoicePrefix && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.invoicePrefix.message}</p>}
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Brand Color (Hex Code) *</label>
                                <div className="relative">
                                    <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('brandColor')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="#6366f1" />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-white/10" style={{ backgroundColor: watchedColor || '#6366f1' }} />
                                </div>
                                {errors.brandColor && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.brandColor.message}</p>}
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Brand Tagline (Max 100 chars)</label>
                            <div className="relative">
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input {...register('brandTagline')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500/50'}`} placeholder="e.g. Excellence in Every Step" />
                            </div>
                            {errors.brandTagline && <p className="text-[9px] text-rose-500 font-bold ml-1">{errors.brandTagline.message}</p>}
                        </div>

                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex gap-3">
                            <Info size={16} className="text-indigo-400 shrink-0" />
                            <p className="text-[9px] font-bold text-indigo-400 leading-relaxed">
                                You can update optional settings like Brand Tone and Payment Terms anytime from your profile settings.
                            </p>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <span>Complete Setup</span>}
                            <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
