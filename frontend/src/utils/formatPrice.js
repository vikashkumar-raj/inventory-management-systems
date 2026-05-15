const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
});

export function formatPrice(value) {
  const numericValue = Number(value);

  return inrFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

export default formatPrice;
