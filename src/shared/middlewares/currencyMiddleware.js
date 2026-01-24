import {
  CURRENCY_VALUES,
  DEFAULT_CURRENCY,
} from "../constants/currency.enums.js";

/**
 * Currency Middleware
 *
 * Extracts user's preferred currency from:
 * 1. x-currency header
 * 2. currency query parameter
 * 3. Authenticated user's currency preference
 * 4. Default currency (EGP)
 *
 * Attaches req.userCurrency for use in controllers/services
 */
export function currencyMiddleware(req, res, next) {
  // Priority: header > query > user preference > default
  let currency = req.headers["x-currency"] || req.query.currency;

  // Validate if provided
  if (currency) {
    currency = currency.toUpperCase();
    if (!CURRENCY_VALUES.includes(currency)) {
      currency = null; // Invalid, fall through to next option
    }
  }

  // Fallback to user's preference
  if (!currency && req.user?.currency) {
    currency = req.user.currency;
  }

  // Final fallback to default
  req.userCurrency = currency || DEFAULT_CURRENCY;

  next();
}
