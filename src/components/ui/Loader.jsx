import React from 'react';

const Loader = ({ size = 'md', fullPage = false, text = '' }) => {
    const sizes = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    const spinner = (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`${sizes[size]} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
            />
            {text && <p className="text-sm font-semibold text-slate-500">{text}</p>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default Loader;
