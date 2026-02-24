import React from 'react';

const Input = ({ label, error, className = '', icon: Icon, ...props }) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`
                        w-full rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-semibold text-slate-800
                        ${Icon ? 'pl-11' : 'px-4'} 
                        ${error ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white'} 
                        py-3 
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="text-rose-500 text-xs font-semibold">{error}</p>}
        </div>
    );
};

export default Input;
