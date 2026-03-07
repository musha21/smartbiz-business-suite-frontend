import React from 'react';

const Loader = ({ size = 'md', fullPage = false, text = '', dark = false }) => {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-[3px]',
        lg: 'w-16 h-16 border-4',
    };

    const spinner = (
        <div className="flex flex-col items-center gap-5">
            <div
                className={`${sizes[size]} ${dark ? 'border-white/5 border-t-indigo-500' : 'border-indigo-100 border-t-indigo-600'} rounded-full animate-spin`}
            />
            {text && <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${dark ? 'text-slate-600' : 'text-slate-500'}`}>{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className={`flex items-center justify-center min-h-[500px] w-full ${dark ? 'bg-[#0c0d10]' : ''}`}>
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default Loader;
