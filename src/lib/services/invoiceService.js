import { calculatePPN } from '../utils/formatCurrency';

/**
 * Entitas dan Service Faktur (Invoice) Resmi Nexa Digital.
 * Bertanggung jawab membuat dan mengelola data invoice saat pembayaran berstatus "paid".
 */

/**
 * Menghasilkan faktur resmi secara otomatis dari entitas pesanan (order).
 *
 * @param {Object} order Entitas pesanan
 * @param {number} invoiceCounter Nomor urut faktur
 * @returns {Object} Entitas Invoice resmi
 */
export function generateInvoice(order, invoiceCounter = 1) {
  const today = new Date();
  const invoiceDate = today.toISOString().split('T')[0];
  const invoiceNumber = `INV-${today.getFullYear()}-${String(invoiceCounter).padStart(5, '0')}`;

  const price = Number(order.price) || 0;
  const discount = Number(order.discount) || 0;
  const subtotal = price;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = calculatePPN(taxableAmount);
  const total = taxableAmount + tax;

  return {
    invoiceNumber,
    orderId: order.id,
    invoiceDate,
    customer: {
      name: order.customer?.name || '-',
      email: order.customer?.email || '-',
      phone: order.customer?.phone || '-',
      company: order.customer?.company || '-'
    },
    service: {
      id: order.serviceId,
      name: order.serviceName,
      packageName: order.packageName,
      description: order.requirements?.title || `Layanan ${order.serviceName}`
    },
    payment: {
      method: order.paymentMethod || 'Bank Transfer BCA',
      status: 'PAID',
      paidAt: today.toISOString()
    },
    financial: {
      subtotal,
      discount,
      taxableAmount,
      taxRate: 0.11, // PPN 11%
      tax,
      total
    },
    issuer: {
      companyName: 'PT Nexa Digital Solusindo',
      npwp: '01.234.567.8-012.000',
      address: 'Menara Cyber 2, Lantai 14, Jl. H.R. Rasuna Said, Jakarta Selatan 12950',
      email: 'billing@nexadigital.id'
    }
  };
}
