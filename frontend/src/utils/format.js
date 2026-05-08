/**
 * Formats a number to Indian currency format with 2 decimal places.
 * Example: 123456.78 -> 1,23,456.78
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatIndianCurrency = (amount) => {
  const number = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};
