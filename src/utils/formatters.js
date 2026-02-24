/**
 * Formats a Date object or string into a local ISO string (YYYY-MM-DDTHH:mm)
 * suitable for 'datetime-local' input values.
 */
export const getLocalISOString = (dateInput) => {
    const date = dateInput ? new Date(dateInput) : new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date - offset).toISOString().slice(0, 16);
};

/**
 * Formats a currency amount into Sri Lankan Rupee (LKR)
 */
export const formatLKR = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};
