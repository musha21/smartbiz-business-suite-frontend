import React from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-lg',
    footer
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[9999]">
            {/* Backdrop Layer (z-40 Equivalent relative to container) */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity z-40"
                onClick={onClose}
            />

            {/* Modal Container (z-50) */}
            <div
                className={`
                    relative bg-white rounded-[2rem] shadow-2xl ${maxWidth} w-full 
                    flex flex-col animate-in zoom-in-95 fade-in duration-300 z-50
                    max-h-[85vh] sm:max-h-[80vh]
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body - Internal Scroll + Safe Overflow for Dropdowns */}
                <div
                    className="flex-grow px-8 py-8 overflow-y-auto overflow-x-visible relative custom-scrollbar"
                    onFocus={(e) => {
                        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }}
                >
                    {children}
                </div>

                {/* Footer (Optional) */}
                {footer && (
                    <div className="px-8 py-6 border-t border-slate-50 shrink-0 bg-slate-50/50 rounded-b-[2rem]">
                        {footer}
                    </div>
                )}
            </div>

            <style p="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
};

export default Modal;
