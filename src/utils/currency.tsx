export default function formatCurrency(
  value: number | null | undefined,
  currency: string = "EUR"
) {
  if (value == null) {
    return "";
  }
  const hasDecimalPart = value % 1 !== 0;
  const maximumFractionDigits = hasDecimalPart ? 2 : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: maximumFractionDigits,
  }).format(value);
}
