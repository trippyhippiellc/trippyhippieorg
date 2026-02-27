import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* Format cents to dollar string: 2500 → "$25.00" */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style:    "currency",
    currency: "USD",
  }).format(cents / 100);
}

/* Format a date string to human-readable */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  }).format(new Date(dateStr));
}

/* Truncate text with ellipsis */
export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/* Slugify a string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
