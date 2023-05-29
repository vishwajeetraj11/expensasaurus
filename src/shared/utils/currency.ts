export const formatCurrency = (currencyCode: string, currencyValue: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    });

    return formatter.format(currencyValue);
}