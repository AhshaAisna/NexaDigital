import { generateInvoice } from './invoiceService';
import { calculatePPN } from '../utils/formatCurrency';

/**
 * Status pesanan terstandarisasi sesuai panduan koding Svelte:
 * - pending: Menunggu pembayaran atau verifikasi
 * - paid: Pembayaran lunas terkonfirmasi
 * - in_progress: Sedang dikerjakan oleh tim spesialis
 * - revision: Sedang dalam tahap tinjauan revisi klien
 * - completed: Proyek selesai dan seluruh deliverables diserahterimakan
 * - cancelled: Pesanan dibatalkan
 */
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  IN_PROGRESS: 'in_progress',
  REVISION: 'revision',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

/**
 * Label bahasa Indonesia untuk status pesanan.
 */
export const ORDER_STATUS_LABELS = {
  pending: 'Menunggu Pembayaran',
  paid: 'Pembayaran Lunas',
  in_progress: 'Sedang Dikerjakan',
  revision: 'Tahap Revisi',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

/**
 * Membuat entitas pesanan baru dari form checkout.
 *
 * @param {Object} input Data form pemesanan
 * @param {number} orderCounter Nomor urut pesanan
 * @returns {{ order: Object, invoice: Object }} Pasangan entitas pesanan dan faktur otomatis
 */
export function createOrderEntity(input, orderCounter = 1) {
  const today = new Date();
  const orderId = `NXD-${today.getFullYear()}-${String(orderCounter).padStart(3, '0')}`;
  const orderDate = today.toISOString().split('T')[0];

  const deliveryDays = Number(input.deliveryDays) || 5;
  const deadlineDate = new Date(today);
  deadlineDate.setDate(deadlineDate.getDate() + deliveryDays);
  const deadline = deadlineDate.toISOString().split('T')[0];

  const price = Number(input.price) || 0;
  const discount = Number(input.discount) || 0;
  const taxableAmount = Math.max(0, price - discount);
  const tax = calculatePPN(taxableAmount);
  const total = taxableAmount + tax;

  const paymentStatus = input.paymentStatus || 'PENDING';
  const projectStatus = paymentStatus === 'PAID' ? ORDER_STATUSES.IN_PROGRESS : ORDER_STATUSES.PENDING;

  const order = {
    id: orderId,
    serviceId: input.serviceId,
    serviceName: input.serviceName,
    packageId: input.packageId,
    packageName: input.packageName,
    customer: {
      name: input.customerName,
      email: input.customerEmail,
      phone: input.customerPhone,
      company: input.customerCompany || '-'
    },
    orderDate,
    deadline,
    price,
    discount,
    tax,
    total,
    paymentMethod: input.paymentMethod || 'Bank Transfer BCA (VA)',
    paymentStatus,
    projectStatus,
    progress: paymentStatus === 'PAID' ? 20 : 0,
    assignedTeam: input.assignedTeam || 'Dimas Arya (Project Lead)',
    requirements: {
      title: input.projectTitle || `Proyek ${input.serviceName}`,
      description: input.projectDescription || 'Kebutuhan awal proyek telah diisi pada langkah checkout.',
      referenceUrl: input.referenceUrl || '',
      notes: input.notes || 'Tidak ada catatan tambahan.'
    },
    timeline: [
      {
        stage: "Pesanan Diterima",
        date: today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: "completed",
        desc: `Pembayaran lunas via ${input.paymentMethod || 'Transfer'}. Faktur resmi diterbitkan.`
      },
      {
        stage: "Kebutuhan Proyek Dikirim",
        date: today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: "completed",
        desc: "Dokumen brief kebutuhan telah diverifikasi tim Nexa Digital."
      },
      {
        stage: "Proyek Dimulai",
        date: "Besok, 09:00 WIB",
        status: "current",
        desc: "Tim mulai mempersiapkan workspace dan riset awal."
      },
      {
        stage: "Pengembangan & Desain",
        date: `Target ${deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`,
        status: "pending",
        desc: "Eksekusi desain atau kode program sesuai spesifikasi paket."
      },
      {
        stage: "Review & Revisi",
        date: "Tahap berikutnya",
        status: "pending",
        desc: "Pengajuan preview untuk masukan klien."
      },
      {
        stage: "Final Quality Assurance",
        date: "Tahap berikutnya",
        status: "pending",
        desc: "Pengecekan kelengkapan deliverables dan performa."
      },
      {
        stage: "Selesai & Serah Terima",
        date: deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: "pending",
        desc: "Penyerahan seluruh master file Figma, source code, dan dokumentasi."
      }
    ],
    messages: [
      {
        id: 1,
        sender: "Sistem Nexa Digital",
        role: "system",
        time: today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        text: `Pesanan ${orderId} berhasil dikonfirmasi. Faktur resmi diterbitkan otomatis.`
      },
      {
        id: 2,
        sender: "Dimas Arya (Project Lead)",
        role: "agency",
        time: today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        text: `Halo ${input.customerName}! Selamat datang di Nexa Digital. Kami sedang meninjau kebutuhan proyek Anda.`
      }
    ],
    files: [
      {
        name: `Brief_${orderId}.pdf`,
        size: "1.2 MB",
        type: "pdf",
        date: today.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      }
    ]
  };

  // Otomatis terbitkan invoice jika pembayaran lunas
  let invoice = null;
  if (paymentStatus === 'PAID') {
    invoice = generateInvoice(order, orderCounter);
    order.invoiceNumber = invoice.invoiceNumber;
  }

  return { order, invoice };
}
