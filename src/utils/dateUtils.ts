/**
 * Helper utilities for dynamic system date formatting
 */

/**
 * Returns today's system date formatted in uppercase string (e.g., "12 AUG 2026")
 */
export function getSystemDefaultDate(): string {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = now.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Formats an HTML date input value ("YYYY-MM-DD") into ticket format ("12 AUG 2026")
 */
export function formatDateInputValue(isoDateStr: string): string {
  if (!isoDateStr) return getSystemDefaultDate();
  const [year, month, day] = isoDateStr.split('-').map(Number);
  if (!year || !month || !day) return isoDateStr.toUpperCase();
  
  const d = new Date(year, month - 1, day);
  const monthName = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  return `${day} ${monthName} ${year}`;
}
