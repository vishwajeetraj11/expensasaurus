export const formatCurrency = (currencyCode: string = 'INR', currencyValue: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    });

    return formatter.format(currencyValue);
}

export const formatCompactCurrency = (
    currencyCode: string = 'INR',
    currencyValue: number
) => {
    if (!Number.isFinite(currencyValue)) {
        return formatCurrency(currencyCode, 0);
    }

    if (Math.abs(currencyValue) < 1000) {
        return formatCurrency(currencyCode, currencyValue);
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
    });

    return formatter.format(currencyValue).replace(/([A-Z])$/, (match) => match.toLowerCase());
}
