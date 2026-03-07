import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-[580px]',
    footer,
    dark = false,
    onSubmit, // Optional: if provided, wraps content in a form for Enter-to-Save support
    formRef: externalFormRef,
    onKeyDown
}) => {
    const modalRef = useRef(null);
    const internalFormRef = useRef(null);
    const formRef = externalFormRef || internalFormRef;

    // Handle Autofocus only once when opened
    useEffect(() => {
        if (isOpen) {
            const firstInput = modalRef.current?.querySelector('input:not([type="hidden"]), textarea, select, [contenteditable="true"]');
            if (firstInput) {
                const timer = setTimeout(() => firstInput.focus(), 100);
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const contentItems = (
        <>
            {/* Header */}
            <div className={`flex items-center justify-between px-10 py-8 ${dark ? 'border-b border-white/5' : 'border-b border-slate-50'} shrink-0`}>
                <div>
                    <h2 className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-800'} tracking-tight italic uppercase`}>
                        {title}
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className={`w-10 h-10 rounded-xl ${dark ? 'bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-400'} flex items-center justify-center transition-colors`}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Body */}
            <div
                className="flex-grow px-10 py-10 overflow-y-auto overflow-x-visible relative custom-scrollbar"
            >
                {children}
            </div>

            {/* Footer */}
            {footer && (
                <div className={`px-10 py-8 ${dark ? 'bg-white/[0.01] border-t border-white/5' : 'bg-slate-50 border-t border-slate-50'} shrink-0`}>
                    {footer}
                </div>
            )}
        </>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 z-[9999]">
            {/* Backdrop Layer */}
            <div
                className={`fixed inset-0 ${dark ? 'bg-[#050608]/80' : 'bg-slate-900/40'} backdrop-blur-sm z-40`}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                ref={modalRef}
                className={`
                    relative ${dark ? 'bg-[#15161c] border border-white/5' : 'bg-white border border-slate-100'} 
                    rounded-[2.5rem] ${maxWidth} w-full flex flex-col z-50
                    max-h-[85vh] sm:max-h-[80vh] overflow-hidden
                    ${dark ? 'shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]' : 'shadow-[0_30px_70px_-10px_rgba(15,23,42,0.15)]'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {onSubmit ? (
                    <form
                        ref={formRef}
                        onKeyDown={onKeyDown}
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit(e);
                        }}
                        className="flex flex-col h-full overflow-hidden"
                    >
                        {contentItems}
                    </form>
                ) : (
                    <div ref={formRef} onKeyDown={onKeyDown} className="flex flex-col h-full overflow-hidden">
                        {contentItems}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
