/**
 * Utility untuk memformat tanggal ke standar penulisan resmi Indonesia.
 * Contoh: "2026-09-22" -> "22 September 2026"
 *
 * @param {string|Date} dateInput Objek tanggal atau ISO string
 * @returns {string} String tanggal terformat
 */
export function formatDate(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Utility untuk memformat tanggal dan jam Indonesia (WIB).
 * Contoh: "22 Sep 2026, 14:30 WIB"
 *
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const formattedDate = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${formattedDate}, ${hours}:${minutes} WIB`;
}
