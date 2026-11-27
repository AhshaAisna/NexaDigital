import { writable, get } from 'svelte/store';
import { initialOrders } from '../data/initialOrders';
import { formatRupiah, calculatePPN } from '../lib/utils/formatCurrency';
import { formatDate, formatDateTime } from '../lib/utils/formatDate';
import { createOrderEntity, ORDER_STATUSES } from '../lib/services/orderService';
import { generateInvoice } from '../lib/services/invoiceService';
import {
  createOrderToApi,
  fetchOrdersFromApi,
  updateOrderStatusApi,
  updatePaymentStatusApi,
  sendOrderMessageApi,
  fetchInvoicesFromApi
} from '../lib/services/apiService';

// Re-export utilities agar mudah diakses di seluruh aplikasi Svelte
export { formatRupiah, calculatePPN, formatDate, formatDateTime, ORDER_STATUSES };

const STORAGE_ORDERS_KEY = 'nexa_digital_orders_v2';
const STORAGE_INVOICES_KEY = 'nexa_digital_invoices_v2';

function loadSavedOrders() {
  if (typeof window === 'undefined') return initialOrders;
  try {
    const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load orders from localStorage:', e);
  }
  return initialOrders;
}

function loadSavedInvoices() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_INVOICES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load invoices from localStorage:', e);
  }
  // Inisialisasi awal invoice dari initialOrders yang berstatus PAID
  return initialOrders
    .filter((ord) => ord.paymentStatus === 'PAID')
    .map((ord, idx) => generateInvoice(ord, idx + 1));
}

// Global Writable Stores
export const orders = writable(loadSavedOrders());
export const invoices = writable(loadSavedInvoices());
export const isApiConnected = writable(false);

// Auto-sync ke LocalStorage sebagai offline cache
if (typeof window !== 'undefined') {
  orders.subscribe((val) => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(val));
    } catch (e) {
      console.error('Failed to save orders:', e);
    }
  });

  invoices.subscribe((val) => {
    try {
      localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(val));
    } catch (e) {
      console.error('Failed to save invoices:', e);
    }
  });
}

/**
 * Sinkronisasi awal dengan Backend Laravel MySQL
 */
export async function syncWithBackend() {
  if (typeof window === 'undefined') return;
  try {
    const apiOrders = await fetchOrdersFromApi();
    if (Array.isArray(apiOrders)) {
      isApiConnected.set(true);
      if (apiOrders.length > 0) {
        orders.set(apiOrders);
      }
      console.log(`[Nexa Digital] Tersambung ke Backend API! Dimuat ${apiOrders.length} pesanan.`);
    }

    const apiInvoices = await fetchInvoicesFromApi();
    if (Array.isArray(apiInvoices) && apiInvoices.length > 0) {
      invoices.set(apiInvoices);
    }
  } catch (e) {
    console.log('[Nexa Digital] Mode Offline / Fallback LocalStorage aktif:', e.message);
    isApiConnected.set(false);
  }
}

export function upsertOrderInStore(updatedOrder) {
  if (!updatedOrder || !updatedOrder.id) return;
  orders.update((list) => {
    const exists = list.some((o) => o.id === updatedOrder.id);
    if (!exists) return [updatedOrder, ...list];
    return list.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
  });
  if (updatedOrder.invoice) {
    invoices.update((list) => {
      const invNum = updatedOrder.invoice.invoice_number || updatedOrder.invoice.invoiceNumber;
      const filtered = list.filter((i) => (i.invoice_number || i.invoiceNumber) !== invNum);
      return [updatedOrder.invoice, ...filtered];
    });
  }
}

// Inisialisasi sinkronisasi saat aplikasi dibuka
if (typeof window !== 'undefined') {
  syncWithBackend();
}

function getHashParts() {
  if (typeof window === 'undefined') return { route: 'home', query: new URLSearchParams() };
  const raw = (window.location.hash || '').replace(/^#\/?/, '').trim();
  const [routePart, queryPart] = raw.split('?');
  const searchParams = new URLSearchParams(queryPart || window.location.search || '');
  return {
    route: (routePart || '').toLowerCase().trim(),
    query: searchParams
  };
}

// Router & App State Stores
function getInitialView() {
  if (typeof window === 'undefined') return 'home';
  const { route: clean } = getHashParts();
  if (!clean || clean === 'home' || clean === 'beranda') return 'home';
  if (clean === 'login' || clean === 'masuk') return 'login';
  if (clean === 'backend' || clean === 'admin' || clean === 'admin-dashboard') return 'admin-dashboard';
  if (clean === 'admin-login') return 'login';
  if (clean === 'pegawai' || clean === 'pegawai-dashboard' || clean === 'staff') return 'pegawai-dashboard';
  if (clean === 'pegawai-login' || clean === 'staff-login') return 'login';
  if (clean === 'client' || clean === 'customer' || clean === 'customer-dashboard') return 'customer-dashboard';
  if (clean === 'client-login') return 'login';
  if (clean === 'services' || clean === 'layanan') return 'services';
  if (clean === 'service-detail') return 'service-detail';
  if (clean === 'portfolio' || clean === 'portofolio') return 'portfolio';
  if (clean === 'about' || clean === 'tentang') return 'about';
  if (clean === 'contact' || clean === 'kontak') return 'contact';
  if (clean === 'checkout') return 'checkout';
  if (clean === 'invoice' || clean === 'faktur') return 'invoice';
  if (clean === 'tracker' || clean === 'project-tracker') return 'project-tracker';
  return 'home';
}

function getInitialOrderId() {
  const { query } = getHashParts();
  return query.get('orderId') || 'NXD-2026-081';
}

export const activeView = writable(getInitialView());
export const selectedServiceId = writable('ui-ux-design');
export const selectedPackageId = writable('standard');
export const selectedOrderId = writable(getInitialOrderId());
export const activeRole = writable('client'); // 'client' | 'admin' | 'pegawai'
export const selectedCaseStudy = writable(null);
export const customProjectQuote = writable(null);
export const toastMessage = writable(null);

export function showToast(message, type = 'success') {
  toastMessage.set({ message, type });
  setTimeout(() => {
    toastMessage.set(null);
  }, 4000);
}

const VIEW_TO_HASH_MAP = {
  'home': 'home',
  'services': 'services',
  'service-detail': 'service-detail',
  'portfolio': 'portfolio',
  'about': 'about',
  'contact': 'contact',
  'checkout': 'checkout',
  'invoice': 'invoice',
  'project-tracker': 'tracker',
  'customer-dashboard': 'client',
  'login': 'login',
  'client-login': 'login',
  'admin-dashboard': 'admin',
  'admin-login': 'login',
  'pegawai-dashboard': 'pegawai',
  'pegawai-login': 'login'
};

export function navigateTo(view, params = {}) {
  if (params.serviceId) selectedServiceId.set(params.serviceId);
  if (params.packageId) selectedPackageId.set(params.packageId);
  if (params.orderId) selectedOrderId.set(params.orderId);
  if (params.caseStudy) selectedCaseStudy.set(params.caseStudy);
  
  activeView.set(view);

  if (typeof window !== 'undefined') {
    const hash = VIEW_TO_HASH_MAP[view] || view;
    if (window.location.hash !== `#${hash}`) {
      try {
        window.history.pushState(null, '', `#${hash}`);
      } catch {
        window.location.hash = hash;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Sinkronisasi otomatis saat user menekan back/forward button di browser
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const { query } = getHashParts();
    const orderIdFromUrl = query.get('orderId');
    if (orderIdFromUrl) {
      selectedOrderId.set(orderIdFromUrl);
    }
    const target = getInitialView();
    if (get(activeView) !== target) {
      activeView.set(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

/**
 * Logika pembuatan pesanan: Dikirim langsung ke Laravel Database
 * dengan fallback aman ke LocalStorage (kecuali mode Midtrans online).
 */
export async function createNewOrder(formInput) {
  const currentOrders = get(orders);
  const nextCounter = currentOrders.length + 1;

  // 1. Siapkan entitas lokal sebagai fallback cepat
  const { order: localOrder, invoice: localInvoice } = createOrderEntity(formInput, nextCounter);

  // 2. Kirim data ke Backend Laravel
  try {
    const backendResult = await createOrderToApi(formInput);
    if (backendResult && backendResult.order) {
      const savedOrder = {
        ...backendResult.order,
        _paymentMeta: {
          snapToken: backendResult.snapToken,
          redirectUrl: backendResult.redirectUrl,
          midtransConfigured: backendResult.midtransConfigured,
          midtransError: backendResult.midtransError,
          emailSent: backendResult.emailSent,
          emailNotice: backendResult.emailNotice
        }
      };
      const savedInvoice = backendResult.invoice;

      orders.update((list) => [savedOrder, ...list.filter((o) => o.id !== savedOrder.id)]);
      selectedOrderId.set(savedOrder.id);

      if (savedInvoice) {
        invoices.update((list) => [
          savedInvoice,
          ...list.filter((i) => (i.invoice_number || i.invoiceNumber) !== (savedInvoice.invoice_number || savedInvoice.invoiceNumber))
        ]);
      }

      console.log('[Nexa Digital] Pesanan berhasil disimpan ke Database Laravel:', savedOrder.id);
      return savedOrder;
    }
  } catch (err) {
    console.warn('[Nexa Digital] Gagal terhubung ke backend Laravel:', err.message);
    if (formInput.requireBackend) {
      throw err;
    }
  }

  // 3. Fallback jika backend offline
  orders.update((list) => [localOrder, ...list]);
  selectedOrderId.set(localOrder.id);

  if (localInvoice) {
    invoices.update((list) => [localInvoice, ...list]);
  }

  return localOrder;
}

export function addMessageToOrder(orderId, text, senderName = 'Rian Hidayat', role = 'client') {
  if (!text || !text.trim()) return;
  const now = new Date();
  const timeStr = formatDateTime(now);

  orders.update((list) => {
    return list.map((order) => {
      if (order.id === orderId) {
        const newMsg = {
          id: (order.messages?.length || 0) + 1,
          sender: role === 'client' ? `${senderName} (Klien)` : 'Tim Nexa Digital',
          role: role,
          time: timeStr,
          text: text.trim()
        };
        return {
          ...order,
          messages: [...(order.messages || []), newMsg]
        };
      }
      return order;
    });
  });

  // Sync pesan ke Backend Laravel
  sendOrderMessageApi(orderId, role === 'client' ? senderName : 'Tim Nexa Digital', role, text.trim()).catch((err) => {
    console.warn('[Nexa API] Gagal kirim pesan ke backend:', err.message);
  });

  // Simulasi auto-reply tim Nexa Digital untuk peran client
  if (role === 'client') {
    setTimeout(() => {
      orders.update((list) => {
        return list.map((order) => {
          if (order.id === orderId) {
            const replyMsg = {
              id: (order.messages?.length || 0) + 1,
              sender: order.assignedTeam || 'Dimas Arya (Nexa Digital)',
              role: 'agency',
              time: formatDateTime(new Date()),
              text: 'Pesan Anda sudah kami terima. Tim teknis kami sedang menindaklanjuti hal ini. Terima kasih!'
            };
            return {
              ...order,
              messages: [...(order.messages || []), replyMsg]
            };
          }
          return order;
        });
      });
      showToast('Balasan baru diterima dari Project Lead Nexa Digital!', 'info');
    }, 1800);
  }
}

export function submitRevisionRequest(orderId, revisionNotes) {
  if (!revisionNotes || !revisionNotes.trim()) return;
  const now = new Date();
  const timeStr = formatDateTime(now);

  orders.update((list) => {
    return list.map((order) => {
      if (order.id === orderId) {
        const revMsg = {
          id: (order.messages?.length || 0) + 1,
          sender: `${order.customer?.name || order.customer_name || 'Klien'} (Catatan Revisi Klien)`,
          role: 'client',
          time: timeStr,
          text: `[PERMINTAAN REVISI RESMI]:\n${revisionNotes.trim()}`
        };

        const updatedTimeline = (order.timeline || []).map((step) => {
          if (step.stage === 'Review & Revisi') {
            return {
              ...step,
              status: 'current',
              desc: `Catatan revisi diterima: "${revisionNotes.slice(0, 40)}..."`
            };
          }
          return step;
        });

        return {
          ...order,
          projectStatus: ORDER_STATUSES.REVISION,
          timeline: updatedTimeline,
          messages: [...(order.messages || []), revMsg]
        };
      }
      return order;
    });
  });

  // Sync update status revisi ke backend
  updateOrderStatusApi(orderId, ORDER_STATUSES.REVISION, 85).catch((err) => {
    console.warn('[Nexa API] Gagal sync revisi ke backend:', err.message);
  });

  showToast('Permintaan revisi berhasil dikirim ke dashboard tim teknis!', 'success');
}

export function updateOrderStatusByAdmin(orderId, newProjectStatus, newPaymentStatus) {
  let calcProgress = 10;
  if (newProjectStatus === ORDER_STATUSES.COMPLETED || newProjectStatus === 'Selesai') calcProgress = 100;
  else if (newProjectStatus === ORDER_STATUSES.REVISION || newProjectStatus === 'Tahap Revisi') calcProgress = 85;
  else if (newProjectStatus === ORDER_STATUSES.IN_PROGRESS || newProjectStatus === 'Sedang Dikerjakan') calcProgress = 50;

  orders.update((list) => {
    return list.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          projectStatus: newProjectStatus,
          paymentStatus: newPaymentStatus || order.paymentStatus,
          progress: calcProgress
        };
      }
      return order;
    });
  });

  // Sync ke database backend
  updateOrderStatusApi(orderId, newProjectStatus, calcProgress).catch((err) => {
    console.warn('[Nexa API] Gagal sync status ke backend:', err.message);
  });

  if (newPaymentStatus) {
    updatePaymentStatusApi(orderId, newPaymentStatus).catch((err) => {
      console.warn('[Nexa API] Gagal sync payment ke backend:', err.message);
    });
  }

  showToast(`Status pesanan ${orderId} berhasil diperbarui di Database!`, 'success');
}

export function updatePaymentStatusByAdmin(orderId, newPaymentStatus) {
  orders.update((list) => {
    return list.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          paymentStatus: newPaymentStatus
        };
      }
      return order;
    });
  });

  // Sync ke database backend
  updatePaymentStatusApi(orderId, newPaymentStatus).catch((err) => {
    console.warn('[Nexa API] Gagal sync payment status ke backend:', err.message);
  });

  showToast(`Status pembayaran ${orderId} diperbarui menjadi ${newPaymentStatus}!`, 'success');
}

/**
 * Fitur Pegawai: Menerima & Menyetujui Deal Projek dari Klien
 * Tanpa perlu login ke Admin Utama, pegawai bisa langsung sepakati deal,
 * memperbarui status proyek, dan otomatis menyiapkan invoice deal.
 */
export function acceptDealProject(orderId, employeeName = 'Bagas Pratama (Staff Operasional)', customNotes = '') {
  let updatedOrder = null;
  const now = new Date();
  const timeStr = formatDateTime(now);

  orders.update((list) => {
    return list.map((order) => {
      if (order.id === orderId) {
        const dealTimelineItem = {
          stage: "Kesepakatan Deal Diterima",
          date: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ' WIB',
          status: "completed",
          desc: `Projek resmi disepakati (deal) dan diterima oleh ${employeeName}. Invoice resmi diterbitkan.`
        };

        const dealMsg = {
          id: (order.messages?.length || 0) + 1,
          sender: `${employeeName}`,
          role: 'agency',
          time: timeStr,
          text: `Halo ${order.customer?.name || 'Klien'}! Projek Anda telah resmi kami terima dan disepakati (Deal). Faktur/invoice resmi telah kami terbitkan. Tim operasional segera mengeksekusi kebutuhan proyek ini. ${customNotes ? `Catatan: ${customNotes}` : ''}`
        };

        // Pastikan invoice number ada
        const invNum = order.invoiceNumber || `INV-${now.getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

        updatedOrder = {
          ...order,
          invoiceNumber: invNum,
          projectStatus: ORDER_STATUSES.IN_PROGRESS,
          paymentStatus: order.paymentStatus || 'PAID',
          progress: Math.max(order.progress || 0, 25),
          assignedTeam: employeeName,
          timeline: [
            ...(order.timeline || []).map((t) => t.status === 'pending' ? { ...t, status: 'current' } : t),
            dealTimelineItem
          ],
          messages: [...(order.messages || []), dealMsg]
        };

        return updatedOrder;
      }
      return order;
    });
  });

  if (updatedOrder) {
    // Pastikan invoice terdaftar di store invoices
    invoices.update((invList) => {
      const exists = invList.some((i) => (i.invoiceNumber || i.invoice_number) === updatedOrder.invoiceNumber);
      if (!exists) {
        const newInv = generateInvoice(updatedOrder, invList.length + 1);
        return [newInv, ...invList];
      }
      return invList;
    });

    // Sync ke backend
    updateOrderStatusApi(orderId, ORDER_STATUSES.IN_PROGRESS, 25).catch(() => {});
    sendOrderMessageApi(orderId, employeeName, 'agency', `Projek deal diterima oleh staf: ${employeeName}`).catch(() => {});
  }

  showToast(`Projek ${orderId} resmi DITERIMA & DEAL oleh ${employeeName}! Invoice siap diterbitkan.`, 'success');
  return updatedOrder;
}

/**
 * Fitur Pegawai: Tambah Projek Baru Hasil Kesepakatan (Deal) Langsung dari Klien
 */
export async function createPegawaiDealOrder(formInput, employeeName = 'Bagas Pratama (Staff Operasional)') {
  const currentOrders = get(orders);
  const nextCounter = currentOrders.length + 1;

  const payload = {
    ...formInput,
    assignedTeam: employeeName,
    paymentStatus: formInput.paymentStatus || 'PAID'
  };

  const { order: localOrder, invoice: localInvoice } = createOrderEntity(payload, nextCounter);

  // Tandai deal diterima langsung oleh pegawai
  localOrder.projectStatus = ORDER_STATUSES.IN_PROGRESS;
  localOrder.progress = 25;
  localOrder.assignedTeam = employeeName;

  try {
    const backendResult = await createOrderToApi(payload);
    if (backendResult && backendResult.order) {
      const savedOrder = {
        ...backendResult.order,
        assignedTeam: employeeName
      };
      orders.update((list) => [savedOrder, ...list.filter((o) => o.id !== savedOrder.id)]);
      selectedOrderId.set(savedOrder.id);

      if (backendResult.invoice) {
        invoices.update((list) => [backendResult.invoice, ...list]);
      }

      showToast(`Projek deal ${savedOrder.id} berhasil ditambahkan oleh pegawai!`, 'success');
      return savedOrder;
    }
  } catch (err) {
    console.warn('[Nexa Pegawai] Offline mode save:', err.message);
  }

  orders.update((list) => [localOrder, ...list]);
  selectedOrderId.set(localOrder.id);
  if (localInvoice) {
    invoices.update((list) => [localInvoice, ...list]);
  }

  showToast(`Projek deal ${localOrder.id} berhasil dicatat & invoice siap digunakan!`, 'success');
  return localOrder;
}

/**
 * Simpan / perbarui invoice kustom dari editor template invoice pegawai
 */
export function saveCustomInvoice(customInvoice) {
  if (!customInvoice || !customInvoice.invoiceNumber) return;

  invoices.update((list) => {
    const filtered = list.filter(
      (i) => (i.invoiceNumber || i.invoice_number) !== customInvoice.invoiceNumber
    );
    return [customInvoice, ...filtered];
  });

  // Sinkronkan juga nomor invoice dan rincian ke orders jika orderId cocok
  if (customInvoice.orderId) {
    orders.update((list) => {
      return list.map((ord) => {
        if (ord.id === customInvoice.orderId) {
          return {
            ...ord,
            invoiceNumber: customInvoice.invoiceNumber,
            total: customInvoice.financial?.total || ord.total,
            price: customInvoice.financial?.subtotal || ord.price,
            tax: customInvoice.financial?.tax || ord.tax,
            discount: customInvoice.financial?.discount || ord.discount,
            paymentStatus: customInvoice.payment?.status || ord.paymentStatus
          };
        }
        return ord;
      });
    });
  }

  showToast(`Invoice ${customInvoice.invoiceNumber} berhasil disimpan ke sistem!`, 'success');
}
