/*
  src/lib/utils/validators.ts
  Reusable validation functions for forms and API inputs.
*/

/** Email format check */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Phone — accepts US formats */
export function isValidPhone(phone: string): boolean {
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone.replace(/\s/g, ""));
}

/** US ZIP code */
export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

/** Password — 8+ chars, at least one letter and one number */
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

/** EIN — XX-XXXXXXX */
export function isValidEIN(ein: string): boolean {
  return /^\d{2}-\d{7}$/.test(ein);
}

/** URL */
export function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

/** Non-empty string */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/** Credit card — Luhn algorithm */
export function isValidCardNumber(number: string): boolean {
  const digits = number.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** Age gate — must be 21+ */
export function isOver21(dateOfBirth: Date): boolean {
  const today  = new Date();
  const age    = today.getFullYear() - dateOfBirth.getFullYear();
  const month  = today.getMonth() - dateOfBirth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < dateOfBirth.getDate())) {
    return age - 1 >= 21;
  }
  return age >= 21;
}

/** Return first error message or null if valid */
export function validateAddress(addr: {
  full_name: string; line1: string; city: string; state: string; zip: string; phone: string;
}): string | null {
  if (!isNonEmpty(addr.full_name)) return "Full name is required.";
  if (!isNonEmpty(addr.line1))     return "Address line 1 is required.";
  if (!isNonEmpty(addr.city))      return "City is required.";
  if (!isNonEmpty(addr.state))     return "State is required.";
  if (!isValidZip(addr.zip))       return "Enter a valid ZIP code.";
  if (!isValidPhone(addr.phone))   return "Enter a valid phone number.";
  return null;
}
