import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Formats a subscription expiry/renewal date into a human readable string.
 * Example: "Mar 15, 2026 (in 14 days)"
 */
export const formatSubscriptionDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
        const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
        if (!isValid(date)) return dateStr;

        const precise = format(date, 'MMM dd, yyyy');
        const relative = formatDistanceToNow(date, { addSuffix: true });

        return `${precise} (${relative})`;
    } catch (error) {
        console.error('Error formatting subscription date:', error);
        return dateStr;
    }
};
