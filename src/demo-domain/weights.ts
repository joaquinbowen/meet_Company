const KG_FACTOR = 1_000;
const CENT_FACTOR = 100;

function decimalParts(value: string, maxDecimals: number, label: string): number {
  const normalized = value.trim().replace(',', '.');
  const pattern = new RegExp(`^\\d+(?:\\.\\d{1,${maxDecimals}})?$`);
  if (!pattern.test(normalized)) throw new Error(`${label} no válido.`);
  const [whole, fraction = ''] = normalized.split('.');
  const scale = 10 ** maxDecimals;
  const result = Number(whole) * scale + Number(fraction.padEnd(maxDecimals, '0'));
  if (!Number.isSafeInteger(result)) throw new Error(`${label} fuera de rango.`);
  return result;
}

export function kgToGrams(value: string): number {
  return decimalParts(value, 3, 'Peso');
}

export function usdToCents(value: string): number {
  return decimalParts(value, 2, 'Costo');
}

export function sumGrams(values: readonly number[]): number {
  return values.reduce((sum, value) => {
    if (!Number.isSafeInteger(value) || value < 0 || !Number.isSafeInteger(sum + value)) {
      throw new Error('Peso fuera de rango.');
    }
    return sum + value;
  }, 0);
}

export function gramsToKg(value: number): string {
  return (value / KG_FACTOR).toFixed(3).replace(/\.?(?:0+)$/, '');
}

export function centsToUsd(value: number): string {
  return (value / CENT_FACTOR).toFixed(2);
}
