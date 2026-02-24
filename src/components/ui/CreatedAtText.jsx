import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Clock } from 'lucide-react';

/**
 * CreatedAtText Component
 * 
 * Safely renders ISO timestamps from backend into local time format.
 * Defaults to: dd MMM yyyy, hh:mm a
 */
const CreatedAtText = ({ value, className = '', showIcon = true }) => {
    if (!value) return <span className="text-slate-400">N/A</span>;

    try {
        const date = typeof value === 'string' ? parseISO(value) : new Date(value);

        if (!isValid(date)) {
            return <span className="text-rose-400 font-medium">Invalid Date</span>;
        }

        return (
            <div className={`flex items-center gap-2 ${className}`}>
                {showIcon && <Clock size={12} className="text-slate-400" />}
                <span className="font-semibold text-slate-700">
                    {format(date, 'dd MMM yyyy, hh:mm a')}
                </span>
            </div>
        );
    } catch (error) {
        console.error('Date parsing error:', error);
        return <span className="text-rose-400">Error rendering time</span>;
    }
};

export default CreatedAtText;
