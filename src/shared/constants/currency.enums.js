/**
 * Supported currencies for the application
 */
export const CURRENCIES = Object.freeze({
  EGP: "EGP", // Egyptian Pound
  SAR: "SAR", // Saudi Riyal
  AED: "AED", // UAE Dirham
  USD: "USD", // US Dollar
  EUR: "EUR", // Euro
});

export const CURRENCY_VALUES = Object.values(CURRENCIES);

export const DEFAULT_CURRENCY = CURRENCIES.EGP;
