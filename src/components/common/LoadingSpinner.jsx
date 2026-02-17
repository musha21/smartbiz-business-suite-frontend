import React from 'react';
import { CircularProgress } from '@mui/material';



const LoadingSpinner = ({ fullPage }) => {
    if (fullPage) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                <CircularProgress size={60} thickness={4} className="text-indigo-600" />
                <p className="mt-4 text-slate-600 font-semibold animate-pulse">Loading SmartBiz...</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8 w-full">
            <CircularProgress size={40} className="text-indigo-600" />
        </div>
    );
};

export default LoadingSpinner;
