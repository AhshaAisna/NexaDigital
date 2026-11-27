/**
 * Utility untuk memformat nilai angka ke mata uang Rupiah Indonesia (IDR).
 * Contoh: 1500000 -> "Rp1.500.000"
 *
 * @param {number|string|null|undefined} amount Nilai nominal
 * @returns {string} String terformat Rupiah
 */
export function formatRupiah(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return 'Rp0';
  }
  return 'Rp' + Number(amount).toLocaleString('id-ID');
}

/**
 * Utility untuk menghitung Pajak Pertambahan Nilai (PPN 11%) resmi Indonesia.
 *
 * @param {number} taxableAmount Nilai kena pajak setelah diskon
 * @returns {number} Nilai PPN 11% dibulatkan
 */
export function calculatePPN(taxableAmount) {
  if (!taxableAmount || taxableAmount <= 0) return 0;
  return Math.round(taxableAmount * 0.11);
}
