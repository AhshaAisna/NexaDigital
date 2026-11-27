import { writable, get } from 'svelte/store';
import { services as baseServices } from '../data/services';
import { orders, invoices, showToast } from './marketplaceStore';
import { calculatePPN, formatRupiah } from '../lib/utils/formatCurrency';
import { createServiceApi, updateServiceApi, deleteServiceApi, fetchServicesFromApi, fetchClientsFromApi, createOrderToApi } from '../lib/services/apiService';

const STORAGE_PRODUCTS_KEY = 'nexa_digital_admin_products_v4';
const STORAGE_CLIENTS_KEY = 'nexa_digital_admin_clients_v4';
const STORAGE_SCHEDULER_KEY = 'nexa_digital_auto_scheduler_active_v1';

// Initial Products Data: Diturunkan langsung dari katalog resmi Nexa Digital
const defaultProducts = baseServices.map((s) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  tagline: s.tagline,
  billingType: "subscription",
  billingCycle: "Bulanan",
  price: s.startingPrice,
  sla: s.estimatedDelivery,
  deliverables: s.deliverables,
  status: "active",
  activeSubscribers: 10,
  createdAt: "2026-08-01"
}));

// Initial Clients Data
const defaultClients = [
  {
    id: "CLI-2026-001",
    name: "Rian Hidayat",
    company: "PT Logistik Kita Bersama",
    email: "rian.hidayat@startupkita.id",
    phone: "+62 812-9988-7766",
    serviceId: "ui-ux-design",
    serviceName: "UI/UX Design",
    package: "Standard Retainer",
    billingAmount: 1500000,
    billingCycle: "Bulanan",
    startDate: "2026-09-01",
    currentPeriodEnd: "2026-10-01",
    wantsRenewal: true, // INGIN LANJUT BERLANGGANAN!
    subscriptionStatus: "renewal_due", // Siap dikirimi tagihan otomatis
    renewalNotes: "Klien telah konfirmasi chat ingin lanjut berlangganan untuk modul driver tracking.",
    autoInvoiceSent: false,
    lastInvoiceNumber: "INV-2026-00001",
    lastAutoInvoiceDate: null,
    address: "Sudirman Central Business District (SCBD) Lot 9, Jakarta Selatan"
  },
  {
    id: "CLI-2026-002",
    name: "Siti Rahmawati",
    company: "Fintech Kini Indonesia",
    email: "siti.rahma@fintechkini.co.id",
    phone: "+62 857-1122-3344",
    serviceId: "front-end-development",
    serviceName: "Front End Development",
    package: "Premium SLA",
    billingAmount: 2800000,
    billingCycle: "Bulanan",
    startDate: "2026-09-12",
    currentPeriodEnd: "2026-10-12",
    wantsRenewal: true, // INGIN LANJUT BERLANGGANAN!
    subscriptionStatus: "renewal_due",
    renewalNotes: "Perpanjangan kontrak maintenance halaman fintech & kalkulator pinjaman.",
    autoInvoiceSent: false,
    lastInvoiceNumber: "INV-2026-00002",
    lastAutoInvoiceDate: null,
    address: "Jl. TB Simatupang No. 18, Jakarta Selatan"
  },
  {
    id: "CLI-2026-003",
    name: "Elena Wijaya",
    company: "PT Edukasi Cerdas Nusantara",
    email: "elena.w@educerdas.ac.id",
    phone: "+62 819-0123-4567",
    serviceId: "fullstack-web-architecture",
    serviceName: "Fullstack Web Architecture",
    package: "Enterprise Dedicated SLA",
    billingAmount: 6500000,
    billingCycle: "Bulanan",
    startDate: "2026-09-05",
    currentPeriodEnd: "2026-10-05",
    wantsRenewal: true, // INGIN LANJUT BERLANGGANAN!
    subscriptionStatus: "renewal_due",
    renewalNotes: "SLA backend dan cloud database microservices LMS edukasi.",
    autoInvoiceSent: false,
    lastInvoiceNumber: "INV-2026-00005",
    lastAutoInvoiceDate: null,
    address: "Gedung Cyber 2 Lt. 12, Rasuna Said, Jakarta"
  },
  {
    id: "CLI-2026-004",
    name: "Budi Santoso",
    company: "CV Agri Mandiri",
    email: "budi.s@agrikultur.id",
    phone: "+62 813-4455-6677",
    serviceId: "mobile-app-development",
    serviceName: "Mobile App Development",
    package: "Standard Maintenance",
    billingAmount: 3500000,
    billingCycle: "Bulanan",
    startDate: "2026-09-18",
    currentPeriodEnd: "2026-10-18",
    wantsRenewal: true, // INGIN LANJUT BERLANGGANAN!
    subscriptionStatus: "active",
    renewalNotes: "Maintenance berkala APK panen petani di pelosok.",
    autoInvoiceSent: false,
    lastInvoiceNumber: "INV-2026-00003",
    lastAutoInvoiceDate: null,
    address: "Jl. Veteran No. 45, Malang, Jawa Timur"
  },
  {
    id: "CLI-2026-005",
    name: "Darmawan Saputra",
    company: "Kreatif Studio",
    email: "darmawan@kreatifstudio.com",
    phone: "+62 821-7788-9900",
    serviceId: "devops-cloud-infrastructure",
    serviceName: "DevOps & Cloud Infrastructure",
    package: "Basic Cloud Ops",
    billingAmount: 1800000,
    billingCycle: "Bulanan",
    startDate: "2026-08-20",
    currentPeriodEnd: "2026-10-20",
    wantsRenewal: false, // MASIH MEMPERTIMBANGKAN / TIDAK
    subscriptionStatus: "under_review",
    renewalNotes: "Klien masih mendiskusikan alokasi anggaran kuartal 4 dengan direksi.",
    autoInvoiceSent: false,
    lastInvoiceNumber: "INV-2026-00004",
    lastAutoInvoiceDate: null,
    address: "Ruko Dago Boulevard Blok C-4, Bandung"
  }
];

function loadSavedProducts() {
  if (typeof window === 'undefined') return defaultProducts;
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading products from storage:', e);
  }
  return defaultProducts;
}

function loadSavedClients() {
  if (typeof window === 'undefined') return defaultClients;
  try {
    const raw = localStorage.getItem(STORAGE_CLIENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading clients from storage:', e);
  }
  return defaultClients;
}

function loadSavedScheduler() {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(STORAGE_SCHEDULER_KEY);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading scheduler from storage:', e);
  }
  return true; // Default aktif
}

// Stores
export const products = writable(loadSavedProducts());
export const clients = writable(loadSavedClients());
export const autoSchedulerActive = writable(loadSavedScheduler());

// Sync stores to LocalStorage
if (typeof window !== 'undefined') {
  products.subscribe((val) => {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(val));
    } catch (e) {
      console.error('Failed to persist products:', e);
    }
  });

  clients.subscribe((val) => {
    try {
      localStorage.setItem(STORAGE_CLIENTS_KEY, JSON.stringify(val));
    } catch (e) {
      console.error('Failed to persist clients:', e);
    }
  });

  autoSchedulerActive.subscribe((val) => {
    try {
      localStorage.setItem(STORAGE_SCHEDULER_KEY, JSON.stringify(val));
    } catch (e) {
      console.error('Failed to persist scheduler state:', e);
    }
  });
}

/**
 * Sinkronisasi produk dari MySQL phpMyAdmin saat web dibuka
 */
export async function syncProductsWithBackend() {
  if (typeof window === 'undefined') return;
  try {
    const apiServices = await fetchServicesFromApi();
    if (Array.isArray(apiServices) && apiServices.length > 0) {
      products.update((current) => {
        const existingIds = new Set(current.map((p) => p.id));
        const newFromApi = [];
        apiServices.forEach((s) => {
          if (!existingIds.has(s.id)) {
            newFromApi.push({
              id: s.id,
              name: s.name,
              category: s.category || 'Development',
              tagline: s.tagline || `Layanan ${s.name} profesional resmi Nexa Digital.`,
              billingType: s.billing_type || 'subscription',
              billingCycle: s.billing_cycle || 'Bulanan',
              price: Number(s.starting_price || s.price) || 1500000,
              sla: s.estimated_delivery || s.sla || '3 - 7 Hari Kerja',
              deliverables: Array.isArray(s.deliverables) ? s.deliverables : [],
              status: s.status || 'active',
              activeSubscribers: 0,
              createdAt: s.created_at ? s.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
            });
          }
        });
        return [...newFromApi, ...current];
      });
      console.log(`[Nexa Admin] Berhasil memuat ${apiServices.length} produk dari MySQL phpMyAdmin!`);
    }
  } catch (err) {
    console.log('[Nexa Admin] Sync produk MySQL offline/cached:', err.message);
  }
}

/**
 * Sinkronisasi data klien dari database backend saat web dibuka
 */
export async function syncClientsWithBackend() {
  if (typeof window === 'undefined') return;
  try {
    const apiClients = await fetchClientsFromApi();
    if (Array.isArray(apiClients) && apiClients.length > 0) {
      clients.update((current) => {
        const existingEmails = new Set(current.map((c) => (c.email || '').toLowerCase()));
        const newFromApi = [];
        apiClients.forEach((u, idx) => {
          if (!existingEmails.has((u.email || '').toLowerCase())) {
            newFromApi.push({
              id: `CLI-DB-${u.id || idx + 1}`,
              name: u.name,
              company: u.company || '-',
              email: u.email,
              phone: u.phone || '-',
              serviceId: 'ui-ux-design',
              serviceName: 'UI/UX Design',
              package: 'Standard Retainer',
              billingAmount: 1500000,
              billingCycle: 'Bulanan',
              startDate: new Date().toISOString().split('T')[0],
              currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
              wantsRenewal: false,
              subscriptionStatus: 'active',
              renewalNotes: '',
              autoInvoiceSent: false,
              address: '-'
            });
          }
        });
        return [...newFromApi, ...current];
      });
      console.log(`[Nexa Admin] Berhasil memuat ${apiClients.length} klien dari database!`);
    }
  } catch (err) {
    console.log('[Nexa Admin] Sync klien database offline/cached:', err.message);
  }
}

if (typeof window !== 'undefined') {
  syncProductsWithBackend();
  syncClientsWithBackend();
}

// Product Management Actions
export async function addProduct(productData) {
  const slug = (productData.name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const newId = slug ? `${slug}-${Date.now().toString().slice(-4)}` : `prod-${Date.now()}`;
  const deliverables = Array.isArray(productData.deliverables)
    ? productData.deliverables
    : (productData.deliverables || "").split("\n").filter((s) => s.trim().length > 0);

  const newProduct = {
    id: newId,
    name: productData.name.trim(),
    category: productData.category || "Development",
    tagline: productData.tagline || `Layanan ${productData.name.trim()} profesional resmi Nexa Digital.`,
    billingType: productData.billingType || "subscription",
    billingCycle: productData.billingCycle || "Bulanan",
    price: Number(productData.price) || 0,
    sla: productData.sla || "SLA Standar Studio Nexa",
    deliverables: deliverables.length > 0 ? deliverables : [
      'Source code bersih & terstruktur',
      'Optimasi performa & responsive',
      'Dokumentasi handoff resmi studio'
    ],
    status: productData.status || "active",
    activeSubscribers: 0,
    createdAt: new Date().toISOString().split('T')[0]
  };

  products.update((list) => [newProduct, ...list]);

  // Sync langsung ke Backend Laravel Database MySQL (phpMyAdmin)
  try {
    const res = await createServiceApi({
      name: newProduct.name,
      category: newProduct.category,
      tagline: newProduct.tagline,
      price: newProduct.price,
      sla: newProduct.sla,
      deliverables: newProduct.deliverables
    });
    if (res && res.data) {
      console.log('[Nexa Admin] Produk tersimpan di MySQL phpMyAdmin:', res.data.id);
      showToast(`Produk "${newProduct.name}" berhasil tersimpan ke database MySQL (phpMyAdmin)!`, 'success');
    }
  } catch (err) {
    console.warn('[Nexa Admin] Backend mode offline / cached lokal:', err.message);
    showToast(`Produk "${newProduct.name}" disimpan secara lokal di katalog.`, 'info');
  }

  return newProduct;
}

export function updateProduct(id, updatedData) {
  products.update((list) =>
    list.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...updatedData,
          price: Number(updatedData.price) || p.price,
          deliverables: Array.isArray(updatedData.deliverables)
            ? updatedData.deliverables
            : (updatedData.deliverables || "").split("\n").filter((s) => s.trim().length > 0)
        };
      }
      return p;
    })
  );
  showToast('Informasi produk jasa berhasil diperbarui!', 'success');

  updateServiceApi(id, updatedData).catch(() => {});
}

export function deleteProduct(id) {
  products.update((list) => list.filter((p) => p.id !== id));
  showToast('Produk jasa berhasil dihapus dari katalog.', 'info');

  deleteServiceApi(id).catch(() => {});
}

export function toggleProductStatus(id) {
  products.update((list) =>
    list.map((p) => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'draft' : 'active';
        return { ...p, status: nextStatus };
      }
      return p;
    })
  );
}

// Client Management Actions
export function addClient(clientData) {
  const clientCount = get(clients).length + 1;
  const newId = `CLI-2026-${String(clientCount).padStart(3, '0')}`;
  
  const today = new Date();
  const startDate = clientData.startDate || today.toISOString().split('T')[0];
  
  // Set default period end 30 days ahead if not provided
  let endDate = clientData.currentPeriodEnd;
  if (!endDate) {
    const end = new Date(today);
    end.setDate(end.getDate() + 30);
    endDate = end.toISOString().split('T')[0];
  }

  const newClient = {
    id: newId,
    name: clientData.name.trim(),
    company: clientData.company ? clientData.company.trim() : 'Perusahaan Klien',
    email: clientData.email.trim(),
    phone: clientData.phone.trim(),
    serviceId: clientData.serviceId || 'prod-ui-ux',
    serviceName: clientData.serviceName || 'UI/UX Design Retainer',
    package: clientData.package || 'Standard Retainer',
    billingAmount: Number(clientData.billingAmount) || 1500000,
    billingCycle: clientData.billingCycle || 'Bulanan',
    startDate: startDate,
    currentPeriodEnd: endDate,
    wantsRenewal: clientData.wantsRenewal !== undefined ? Boolean(clientData.wantsRenewal) : true,
    subscriptionStatus: clientData.wantsRenewal ? 'renewal_due' : 'active',
    renewalNotes: clientData.renewalNotes || 'Klien baru terdaftar di sistem berlangganan Nexa Digital.',
    autoInvoiceSent: false,
    lastInvoiceNumber: '-',
    lastAutoInvoiceDate: null,
    address: clientData.address || 'Jakarta, Indonesia'
  };

  clients.update((list) => [newClient, ...list]);
  showToast(`Klien "${newClient.name} (${newClient.company})" berhasil didaftarkan!`, 'success');
  return newClient;
}

export function updateClient(id, updatedData) {
  clients.update((list) =>
    list.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...updatedData,
          billingAmount: Number(updatedData.billingAmount) || c.billingAmount,
          wantsRenewal: updatedData.wantsRenewal !== undefined ? Boolean(updatedData.wantsRenewal) : c.wantsRenewal
        };
      }
      return c;
    })
  );
  showToast('Data klien berhasil diperbarui!', 'success');
}

export function deleteClient(id) {
  clients.update((list) => list.filter((c) => c.id !== id));
  showToast('Klien telah dihapus dari sistem.', 'info');
}

export function toggleClientRenewal(id) {
  let updatedValue = false;
  clients.update((list) =>
    list.map((c) => {
      if (c.id === id) {
        updatedValue = !c.wantsRenewal;
        return {
          ...c,
          wantsRenewal: updatedValue,
          subscriptionStatus: updatedValue ? 'renewal_due' : 'under_review'
        };
      }
      return c;
    })
  );

  if (updatedValue) {
    showToast('Klien ditandai: "Ingin Lanjut Berlangganan". Siap kirim tagihan otomatis!', 'success');
  } else {
    showToast('Klien ditandai: "Tidak / Belum ingin lanjut perpanjangan".', 'info');
  }
}

/**
 * GENERATE & SEND AUTOMATED RECURRING INVOICE
 * Core Feature: Membuat e-faktur perpanjangan resmi, menambahkannya ke database orders & invoices global,
 * memperbarui status klien, dan menyusun template notifikasi Email & WhatsApp.
 */
export async function sendAutoInvoiceToClient(clientId) {
  const currentClients = get(clients);
  const targetClient = currentClients.find((c) => c.id === clientId);

  if (!targetClient) {
    showToast('Klien tidak ditemukan!', 'error');
    return null;
  }

  const currentOrders = get(orders);
  const nextOrderCounter = currentOrders.length + 1;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Hitung periode baru (30 hari dari period end sebelumnya atau dari hari ini)
  const prevEnd = new Date(targetClient.currentPeriodEnd || today);
  const nextPeriodStart = isNaN(prevEnd.getTime()) ? new Date() : prevEnd;
  const nextPeriodEnd = new Date(nextPeriodStart);
  nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 30);

  const formatID = (d) =>
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const periodLabel = `${formatID(nextPeriodStart)} - ${formatID(nextPeriodEnd)}`;
  
  // Format nomor invoice dan order ID unik (fallback lokal)
  const newInvoiceNumber = `INV-${today.getFullYear()}-RNW${String(nextOrderCounter).padStart(3, '0')}`;
  const newOrderId = `NXD-${today.getFullYear()}-RNW${String(nextOrderCounter).padStart(2, '0')}`;

  const price = Number(targetClient.billingAmount) || 1500000;
  const discount = 0;
  const taxableAmount = price - discount;
  const tax = calculatePPN(taxableAmount);
  const total = taxableAmount + tax;

  // 1. Siapkan Entitas Order Resmi Nexa Digital (fallback)
  let renewalOrder = {
    id: newOrderId,
    invoiceNumber: newInvoiceNumber,
    serviceId: targetClient.serviceId,
    serviceName: targetClient.serviceName,
    packageId: "renewal-recurring",
    packageName: `Perpanjangan Langganan (${targetClient.package}) - ${periodLabel}`,
    customer: {
      name: targetClient.name,
      email: targetClient.email,
      phone: targetClient.phone,
      company: targetClient.company
    },
    orderDate: todayStr,
    deadline: nextPeriodEnd.toISOString().split('T')[0],
    price: price,
    tax: tax,
    discount: discount,
    total: total,
    paymentMethod: "Midtrans Payment Gateway (Auto-Billing)",
    paymentStatus: "PENDING",
    projectStatus: "Menunggu Pembayaran",
    progress: 0,
    assignedTeam: "Billing & Customer Success Nexa Digital",
    requirements: {
      title: `Tagihan Otomatis Perpanjangan Langganan: ${targetClient.serviceName}`,
      description: `Perpanjangan siklus langganan layanan jasa digital Nexa Digital untuk periode resmi ${periodLabel}.`,
      referenceUrl: "",
      notes: targetClient.renewalNotes || "Perpanjangan otomatis disetujui klien."
    },
    timeline: [
      {
        stage: "Faktur Diterbitkan Otomatis",
        date: `${formatID(today)}, ${today.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        status: "completed",
        desc: `Faktur e-Billing resmi ${newInvoiceNumber} diterbitkan oleh sistem Nexa Digital.`
      }
    ],
    messages: [],
    files: []
  };

  let renewalInvoice = {
    invoiceNumber: newInvoiceNumber,
    orderId: newOrderId,
    invoiceDate: todayStr,
    customer: {
      name: targetClient.name,
      email: targetClient.email,
      phone: targetClient.phone,
      company: targetClient.company
    },
    service: {
      id: targetClient.serviceId,
      name: targetClient.serviceName,
      packageName: `Perpanjangan Periode: ${periodLabel}`,
      description: `Tagihan perpanjangan jasa digital berkala (${targetClient.package})`
    },
    payment: {
      method: "Midtrans Payment Gateway",
      status: "PENDING",
      paidAt: null
    },
    financial: {
      subtotal: price,
      discount: discount,
      taxableAmount: taxableAmount,
      taxRate: 0.11,
      tax: tax,
      total: total
    },
    issuer: {
      companyName: "PT Nexa Digital Solusindo",
      npwp: "01.234.567.8-012.000",
      address: "Menara Cyber 2, Lantai 14, Jl. H.R. Rasuna Said, Jakarta Selatan 12950",
      email: "billing@nexadigital.id"
    }
  };

  let emailSent = false;
  let emailNotice = null;
  let paymentUrl = null;

  // 2. Simpan langsung ke Backend MySQL & kirim email invoice via SMTP jika terkonfigurasi
  try {
    const apiResult = await createOrderToApi({
      serviceId: targetClient.serviceId,
      serviceName: targetClient.serviceName,
      packageId: "renewal-recurring",
      packageName: `Perpanjangan Langganan (${targetClient.package}) - ${periodLabel}`,
      customerName: targetClient.name,
      customerEmail: targetClient.email,
      customerPhone: targetClient.phone,
      customerCompany: targetClient.company,
      price,
      discount,
      tax,
      total,
      deliveryDays: 7,
      paymentMethod: "Midtrans Payment Gateway (Auto-Billing)",
      paymentStatus: "PENDING",
      projectTitle: `Tagihan Otomatis Perpanjangan: ${targetClient.serviceName}`,
      projectDescription: `Perpanjangan siklus langganan layanan untuk periode ${periodLabel}.`,
      notes: targetClient.renewalNotes || "Perpanjangan otomatis.",
      send_email: true
    });

    if (apiResult?.order) {
      renewalOrder = apiResult.order;
      const persistedInvoiceNumber = apiResult.invoice?.invoice_number || apiResult.order.invoiceNumber;
      if (persistedInvoiceNumber) {
        renewalInvoice = {
          ...renewalInvoice,
          invoiceNumber: persistedInvoiceNumber,
          orderId: apiResult.order.id,
          paymentUrl: apiResult.redirectUrl || apiResult.order.paymentUrl || null
        };
      }
      emailSent = Boolean(apiResult.emailSent);
      emailNotice = apiResult.emailNotice;
      paymentUrl = apiResult.redirectUrl || apiResult.order.paymentUrl || null;
    }
  } catch (err) {
    console.warn('[Nexa Admin] Gagal simpan auto-invoice ke backend, fallback lokal:', err.message);
    emailNotice = err.message;
  }

  const finalInvoiceNumber = renewalInvoice.invoiceNumber;
  const finalOrderId = renewalOrder.id;

  // 3. Masukkan ke Global Store
  orders.update((list) => [renewalOrder, ...list.filter((o) => o.id !== finalOrderId)]);
  invoices.update((list) => [renewalInvoice, ...list.filter((i) => (i.invoiceNumber || i.invoice_number) !== finalInvoiceNumber)]);

  // 4. Perbarui data klien
  clients.update((list) =>
    list.map((c) => {
      if (c.id === clientId) {
        return {
          ...c,
          autoInvoiceSent: true,
          lastInvoiceNumber: finalInvoiceNumber,
          lastAutoInvoiceDate: todayStr,
          subscriptionStatus: "renewal_invoiced"
        };
      }
      return c;
    })
  );

  const invoiceLink = paymentUrl || `${window.location.origin}/#invoice?orderId=${finalOrderId}`;

  // 5. Susun template notifikasi WhatsApp & Email
  const waTemplate = `*TAGIHAN RESMI PERPANJANGAN LAYANAN - NEXA DIGITAL*
Yth. *${targetClient.name}* (${targetClient.company}),

Terima kasih atas kepercayaan Anda terus bermitra dengan Nexa Digital. Sesuai konfirmasi perpanjangan langganan produk jasa Anda:

📦 *Layanan:* ${targetClient.serviceName}
🏷️ *Paket:* ${targetClient.package}
🗓️ *Periode Baru:* ${periodLabel}
🧾 *No. Faktur:* ${finalInvoiceNumber}
💰 *Total Tagihan:* ${formatRupiah(total)} (Termasuk PPN 11%)
⏰ *Jatuh Tempo:* 7 Hari dari penerbitan

💳 *Lihat Invoice & Bayar via Midtrans:*
👉 ${invoiceLink}

_Pesan ini dikirimkan secara otomatis oleh Nexa Digital Automated Billing Engine._`;

  const emailSubject = `[Tagihan Resmi] Perpanjangan Langganan Nexa Digital - ${finalInvoiceNumber}`;

  showToast(
    emailSent
      ? `Tagihan ${finalInvoiceNumber} tersimpan di DB & terkirim ke email ${targetClient.email}!`
      : `Tagihan ${finalInvoiceNumber} berhasil diterbitkan ke database!`,
    'success'
  );

  return {
    order: renewalOrder,
    invoice: renewalInvoice,
    client: targetClient,
    periodLabel,
    waTemplate,
    emailSubject,
    emailSent,
    emailNotice
  };
}

/**
 * BATCH SEND AUTOMATED INVOICES
 * Kirim tagihan otomatis sekaligus ke SEMUA klien yang berstatus wantsRenewal === true
 * dan belum dikirimi tagihan perpanjangan periode ini.
 */
export async function sendBatchAutoInvoices() {
  const currentClients = get(clients);
  const eligibleClients = currentClients.filter(
    (c) => c.wantsRenewal === true && (!c.autoInvoiceSent || c.subscriptionStatus === 'renewal_due')
  );

  if (eligibleClients.length === 0) {
    showToast('Tidak ada klien yang berstatus "Ingin Lanjut" yang perlu ditagih saat ini.', 'info');
    return [];
  }

  const results = [];
  for (const client of eligibleClients) {
    const res = await sendAutoInvoiceToClient(client.id);
    if (res) results.push(res);
  }

  showToast(
    `Sukses! ${results.length} tagihan otomatis berhasil diterbitkan & diproses untuk klien berlangganan!`,
    'success'
  );

  return results;
}
