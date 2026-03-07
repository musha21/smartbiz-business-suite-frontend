import { useCallback, useEffect } from 'react';

/**
 * useErpKeyboardForm
 * 
 * Implements ERP/POS style keyboard navigation (Tally style).
 * - Enter moves to next field.
 * - Select dropdowns support arrow navigation + Enter to move next.
 * - Auto-focus first field on mount.
 * - Submit on last field.
 * 
 * @param {React.RefObject} formRef - Reference to the form element
 * @param {Object} options
 * @param {boolean} options.autoFocus - Focus first field on mount
 * @param {boolean} options.selectTextOnFocus - Select input text on focus
 * @param {boolean} options.submitOnLast - Submit form on last field Enter
 */
export const useErpKeyboardForm = (formRef, {
    autoFocus = true,
    selectTextOnFocus = true,
    submitOnLast = true
} = {}) => {

    const getFocusableElements = useCallback(() => {
        if (!formRef.current) return [];

        const selector = 'input, select, textarea, button[type="submit"], [data-erp-focus]';
        const elements = Array.from(formRef.current.querySelectorAll(selector));

        return elements.filter(el => {
            // Visibility check
            const isVisible = !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
            const style = window.getComputedStyle(el);
            const isTrulyVisible = isVisible && style.visibility !== 'hidden' && style.display !== 'none';

            // Interaction checks
            const isDisabled = el.disabled || el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
            const isHiddenType = el.type === 'hidden';
            const isTabSkip = el.tabIndex === -1;
            const isErpSkip = el.dataset.erpSkip === 'true' || el.closest('[data-erp-skip="true"]');

            return isTrulyVisible && !isDisabled && !isHiddenType && !isTabSkip && !isErpSkip;
        });
    }, [formRef]);

    const handleFocusNext = useCallback((currentElement) => {
        const elements = getFocusableElements();
        const currentIndex = elements.indexOf(currentElement);

        if (currentIndex === -1) return;

        const isLast = currentIndex === elements.length - 1;

        if (isLast) {
            if (submitOnLast) {
                const form = formRef.current.tagName === 'FORM'
                    ? formRef.current
                    : formRef.current.closest('form');

                if (form) {
                    if (typeof form.requestSubmit === 'function') {
                        form.requestSubmit();
                    } else {
                        const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                        form.dispatchEvent(submitEvent);
                        if (!submitEvent.defaultPrevented) form.submit();
                    }
                }
            }
        } else {
            const nextElement = elements[currentIndex + 1];
            nextElement.focus();
            if (selectTextOnFocus && typeof nextElement.select === 'function' && nextElement.tagName === 'INPUT') {
                nextElement.select();
            }
        }
    }, [getFocusableElements, formRef, submitOnLast, selectTextOnFocus]);

    const onKeyDown = useCallback((e) => {
        if (e.key !== 'Enter') return;

        const target = e.target;

        // Allow normal Enter behavior in textareas (newline)
        if (target.tagName === 'TEXTAREA') return;

        // Don't interfere with main OS/Browser shortcuts
        if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

        // For Native Select: Browser needs a tick to apply change, then we move
        if (target.tagName === 'SELECT') {
            // We don't preventDefault here so the browser can potentially use Enter to close/apply
            // But usually native selects apply value on focus change or arrow keys.
            // Some POS systems prefer immediate move.
            setTimeout(() => handleFocusNext(target), 0);
            return;
        }

        // For regular inputs and buttons
        e.preventDefault();
        handleFocusNext(target);
    }, [handleFocusNext]);

    // Reliable Autofocus
    useEffect(() => {
        if (autoFocus && formRef.current) {
            const timer = setTimeout(() => {
                const elements = getFocusableElements();
                if (elements.length > 0) {
                    const first = elements[0];
                    first.focus();
                    if (selectTextOnFocus && typeof first.select === 'function' && first.tagName === 'INPUT') {
                        first.select();
                    }
                }
            }, 100); // 100ms delay for animations as requested
            return () => clearTimeout(timer);
        }
    }, [autoFocus, getFocusableElements, formRef, selectTextOnFocus]);

    return { onKeyDown };
};

export default useErpKeyboardForm;
