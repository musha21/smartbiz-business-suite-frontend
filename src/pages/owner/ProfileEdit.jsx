import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Building2, Globe, Coins, Factory,
    Sparkles, Save, Loader2, Upload,
    Plus, Info, ArrowLeft, Trash2,
    User, Mail, Phone, MapPin, Hash, Palette
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { profileService } from '../../api/profile.service';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

const ProfileEdit = () => {
    const navigate = useNavigate();
    const { profile, updateProfileState } = useAuth();
    const { isDarkMode } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoPreview, setLogoPreview] = useState(profile?.logo || null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: profile || {
            currency: 'LKR',
            brandTone: 'Professional',
            brandColor: '#6366f1'
        }
    });

    const watchedColor = watch('brandColor');

    useEffect(() => {
        if (profile) {
            reset(profile);
            setLogoPreview(profile.logo);
        }
    }, [profile, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = { ...data, logo: logoPreview };
            const result = await profileService.updateProfile(payload);
            toast.success('Business profile updated successfully!');
            updateProfileState(result);
        } catch (error) {
            console.error('Failed to update profile:', error);
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => navigate(-1)} className={`p-2 rounded-xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}>
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-4xl font-black tracking-tighter italic uppercase">Business Settings</h1>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] ml-1">Identity · Branding · Localization</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Basic Info & Logo */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-9 h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                <Building2 size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest italic">General Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Business Name *</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('businessName')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="e.g. Acme Corp" />
                                </div>
                                {errors.businessName && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.businessName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Owner Name *</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('ownerName')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="John Doe" />
                                </div>
                                {errors.ownerName && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.ownerName.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('email')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="contact@acme.com" />
                                </div>
                                {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Phone *</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('phone')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="+94 77 123 4567" />
                                </div>
                                {errors.phone && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.phone.message}</p>}
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Business Address *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-slate-500" size={16} />
                                    <textarea {...register('address')} rows={2} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border h-20 resize-none transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="123 Business Way, Colombo 03" />
                                </div>
                                {errors.address && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.address.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Industry (Optional)</label>
                                <input {...register('industry')} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="e.g. Retail" />
                                {errors.industry && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.industry.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Country (Optional)</label>
                                <input {...register('country')} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="e.g. Sri Lanka" />
                                {errors.country && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.country.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Currency *</label>
                                <input {...register('currency')} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="e.g. LKR" />
                                {errors.currency && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.currency.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Invoice Prefix *</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('invoicePrefix')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="SB / INV" />
                                </div>
                                {errors.invoicePrefix && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.invoicePrefix.message}</p>}
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Brand Color (Hex Code) *</label>
                                <div className="relative">
                                    <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input {...register('brandColor')} className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="#6366f1" />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-white/10" style={{ backgroundColor: watchedColor || '#6366f1' }} />
                                </div>
                                {errors.brandColor && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.brandColor.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                <Sparkles size={18} />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-widest italic">AI & Branding</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Brand Tagline (Max 100 chars)</label>
                                <input {...register('brandTagline')} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="e.g. Excellence in Every Step" />
                                {errors.brandTagline && <p className="text-[10px] text-rose-500 font-bold ml-2">{errors.brandTagline.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Brand Tone</label>
                                <select {...register('brandTone')} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`}>
                                    <option value="Professional">Professional</option>
                                    <option value="Friendly">Friendly</option>
                                    <option value="Luxury">Luxury</option>
                                    <option value="Minimalist">Minimalist</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-2">Payment Terms (Default)</label>
                                <textarea {...register('paymentTerms')} className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border h-24 resize-none transition-all ${isDarkMode ? 'bg-white/5 border-white/5 text-white focus:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'}`} placeholder="e.g. Net 30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Logo & Status */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`p-8 rounded-[32px] border flex flex-col items-center text-center ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="relative mb-6">
                            <div className={`w-32 h-32 rounded-[40px] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${logoPreview ? 'border-indigo-500 border-solid' : isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload size={32} className="text-slate-500" />
                                )}
                                <input type="file" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                            {logoPreview && (
                                <button type="button" onClick={() => setLogoPreview(null)} className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-1 italic">Business Logo</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Recommended size: 512x512px</p>
                    </div>

                    <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3 mb-6">
                            <Info size={16} className="text-indigo-400" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Data Usage</h4>
                        </div>
                        <p className={`text-[11px] leading-relaxed font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Your business data is used to personalize AI-generated content like email drafts and marketing posters. Keep it updated for the best results.
                        </p>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileEdit;
