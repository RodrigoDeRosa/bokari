import i18n from '../i18n';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  'es-AR': 'es-AR',
};

export function getNumberLocale(): string {
  return LOCALE_MAP[i18n.language] ?? 'en-US';
}

export default function formatCurrency(
  value: number | null | undefined,
  currency: string = "EUR"
) {
  if (value == null) {
    return "";
  }
  const hasDecimalPart = value % 1 !== 0;
  const maximumFractionDigits = hasDecimalPart ? 2 : 0;

  return new Intl.NumberFormat(getNumberLocale(), {
    style: "currency",
    currency: currency,
    maximumFractionDigits: maximumFractionDigits,
  }).format(value);
}
