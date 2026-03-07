import React from 'react';

const Input = ({ label, error, className = '', icon: Icon, dark = false, ...props }) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${dark ? 'text-slate-600' : 'text-slate-500'}`}>
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${dark ? 'text-slate-600 group-focus-within:text-indigo-500' : 'text-slate-400 group-focus-within:text-indigo-600'}`}>
                        <Icon size={18} />
                    </div>
                )}
                <input
                    className={`
                        w-full rounded-[20px] transition-colors outline-none focus:ring-2 text-sm font-bold
                        ${Icon ? 'pl-14' : 'px-6'} 
                        ${dark
                            ? 'bg-white/5 border border-white/5 text-white placeholder:text-slate-700 focus:ring-sky-300/50 focus:border-sky-400 focus:bg-white/[0.08]'
                            : 'bg-white border border-slate-200 text-slate-800 focus:ring-sky-300 focus:border-sky-400 focus:bg-white'} 
                        ${error ? 'border-rose-300 bg-rose-50/50' : ''} 
                        py-4 
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest ml-2">{error}</p>}
        </div>
    );
};

export default Input;
