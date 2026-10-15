export const kg = (grams: number) => `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 3 }).format(grams / 1000)} kg`;
export const usd = (cents: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(cents / 100);
export const percent = (numerator: number, denominator: number) => denominator ? `${(100 * numerator / denominator).toFixed(1)} %` : 'Sin producción';
export const date = (iso: string) => new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));
