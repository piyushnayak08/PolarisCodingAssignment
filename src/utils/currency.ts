export function parseCurrency(value: string): number {
  const normalized = value.replace(/[^\d.-]/g, '');
  return Number.parseFloat(normalized);
}
