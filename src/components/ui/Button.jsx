import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    loading = false,
    disabled = false,
    icon: Icon,
    ...props
}) => {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-200',
        dark: 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10',
        outline: 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    return (
        <button
            disabled={disabled || loading}
            className={`
                flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]} 
                ${sizes[size]} 
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                Icon && <Icon size={size === 'sm' ? 14 : 18} />
            )}
            <span>{loading ? 'Processing...' : children}</span>
        </button>
    );
};

export default Button;
