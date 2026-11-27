/**
 * Client Service untuk terhubung ke Backend Laravel RESTful API
 * Menggunakan VITE_API_BASE_URL untuk produksi atau fallback localhost saat development.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '');

function getStoredAuthToken() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('nexa_auth_session_v2');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const token = parsed?.token;
    if (!token || String(token).startsWith('local-')) return null;
    return token;
  } catch {
    return null;
  }
}

/**
 * Normalisasi data pesanan agar kompatibel dengan seluruh komponen UI frontend
 */
export function normalizeOrder(raw) {
  if (!raw) return raw;

  const customerObj = raw.customer && typeof raw.customer === 'object'
    ? raw.customer
    : {
        name: raw.customer_name || raw.customerName || 'Klien Nexa',
        email: raw.customer_email || raw.customerEmail || 'klien@example.com',
        phone: raw.customer_phone || raw.customerPhone || '-',
        company: raw.customer_company || raw.customerCompany || '-'
      };

  const invoiceNumber = raw.invoiceNumber || raw.invoice_number || raw.invoice?.invoice_number || '';
  const serviceName = raw.serviceName || raw.service_name || 'Layanan Digital';
  const packageName = raw.packageName || raw.package_name || 'Paket Standar';
  const paymentMethod = raw.paymentMethod || raw.payment_method || 'Bank Transfer BCA (VA)';
  const paymentStatus = raw.paymentStatus || raw.payment_status || 'PAID';
  const projectStatus = raw.projectStatus || raw.project_status || 'Sedang Dikerjakan';

  return {
    ...raw,
    id: raw.id,
    invoiceNumber,
    invoice_number: invoiceNumber,
    serviceId: raw.serviceId || raw.service_id,
    service_id: raw.service_id || raw.serviceId,
    serviceName,
    service_name: serviceName,
    packageId: raw.packageId || raw.package_id,
    package_id: raw.package_id || raw.packageId,
    packageName,
    package_name: packageName,
    customerName: customerObj.name,
    customer_name: customerObj.name,
    customerEmail: customerObj.email,
    customer_email: customerObj.email,
    customerPhone: customerObj.phone,
    customer_phone: customerObj.phone,
    customerCompany: customerObj.company,
    customer_company: customerObj.company,
    customer: {
      name: customerObj.name || 'Klien Nexa',
      email: customerObj.email || 'klien@example.com',
      phone: customerObj.phone || '-',
      company: customerObj.company || '-'
    },
    orderDate: raw.orderDate || raw.order_date,
    order_date: raw.order_date || raw.orderDate,
    deadline: raw.deadline,
    price: Number(raw.price) || 0,
    tax: Number(raw.tax) || 0,
    discount: Number(raw.discount) || 0,
    total: Number(raw.total) || 0,
    paymentMethod,
    payment_method: paymentMethod,
    paymentStatus,
    payment_status: paymentStatus,
    midtransOrderId: raw.midtransOrderId || raw.midtrans_order_id || null,
    midtrans_order_id: raw.midtrans_order_id || raw.midtransOrderId || null,
    snapToken: raw.snapToken || raw.snap_token || raw.invoice?.snap_token || null,
    snap_token: raw.snap_token || raw.snapToken || raw.invoice?.snap_token || null,
    paymentUrl: raw.paymentUrl || raw.payment_url || raw.invoice?.payment_url || null,
    payment_url: raw.payment_url || raw.paymentUrl || raw.invoice?.payment_url || null,
    paymentType: raw.paymentType || raw.payment_type || null,
    transactionStatus: raw.transactionStatus || raw.transaction_status || null,
    paidAt: raw.paidAt || raw.paid_at || null,
    projectStatus,
    project_status: projectStatus,
    progress: Number(raw.progress) || 0,
    assignedTeam: raw.assignedTeam || raw.assigned_team || 'Dimas Arya (Project Lead)',
    assigned_team: raw.assigned_team || raw.assignedTeam || 'Dimas Arya (Project Lead)',
    requirements: raw.requirements || {},
    timeline: Array.isArray(raw.timeline) ? raw.timeline : [],
    messages: Array.isArray(raw.messages) ? raw.messages : [],
    files: Array.isArray(raw.files) ? raw.files : []
  };
}

/**
 * Helper request dengan timeout dan error handling aman
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const storedToken = getStoredAuthToken();
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
    ...(options.headers || {})
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout untuk SMTP & Midtrans

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`[Nexa API] Gagal request ke ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Cek status koneksi backend Laravel
 */
export async function checkApiHealth() {
  try {
    const res = await request('/health', { method: 'GET' });
    return res?.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Ambil seluruh pesanan dari Database MySQL Laravel
 */
export async function fetchOrdersFromApi() {
  const res = await request('/orders', { method: 'GET' });
  const rawList = res.data || [];
  return Array.isArray(rawList) ? rawList.map(normalizeOrder) : [];
}

/**
 * Simpan pesanan baru ke Database MySQL Laravel
 */
export async function createOrderToApi(orderPayload) {
  const res = await request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderPayload)
  });
  if (res.data && res.data.order) {
    return {
      order: normalizeOrder(res.data.order),
      invoice: res.data.invoice,
      snapToken: res.data.snap_token || res.data.order.snap_token || null,
      redirectUrl: res.data.redirect_url || res.data.order.payment_url || null,
      midtransConfigured: Boolean(res.data.midtrans_configured),
      midtransError: res.data.midtrans_error || null,
      emailSent: Boolean(res.data.email_sent),
      emailNotice: res.data.email_notice || null
    };
  }
  return res.data;
}

/**
 * Ambil konfigurasi publik Midtrans dari backend
 */
export async function fetchMidtransConfigApi() {
  const res = await request('/midtrans/config', { method: 'GET' });
  return res.data || {};
}

/**
 * Buat atau perbarui Snap Token Midtrans untuk order PENDING
 */
export async function createMidtransTransactionApi(orderId) {
  const res = await request(`/orders/${encodeURIComponent(orderId)}/pay`, {
    method: 'POST'
  });
  return {
    order: res.data?.order ? normalizeOrder(res.data.order) : null,
    snapToken: res.data?.snap_token || null,
    redirectUrl: res.data?.redirect_url || null,
    midtransOrderId: res.data?.midtrans_order_id || null
  };
}

/**
 * Sinkronkan status pembayaran order langsung dari Midtrans
 */
export async function syncOrderPaymentStatusApi(orderId) {
  const res = await request(`/orders/${encodeURIComponent(orderId)}/payment-status`, {
    method: 'GET'
  });
  return res.data ? normalizeOrder(res.data) : null;
}

/**
 * Kirim invoice (atau reminder) ke email klien lewat SMTP backend
 */
export async function sendInvoiceEmailApi(invoiceOrOrderId, email = null, isReminder = false) {
  const payload = {};
  if (email) payload.email = email;
  if (isReminder) payload.is_reminder = true;

  const res = await request(`/invoices/${encodeURIComponent(invoiceOrOrderId)}/send-email`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res;
}

/**
 * Update status proyek pesanan (Admin)
 */
export async function updateOrderStatusApi(orderId, status, progress) {
  const res = await request(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, progress })
  });
  return res.data ? normalizeOrder(res.data) : res.data;
}

/**
 * Update status pembayaran pesanan (Admin)
 */
export async function updatePaymentStatusApi(orderId, paymentStatus) {
  const res = await request(`/orders/${encodeURIComponent(orderId)}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ payment_status: paymentStatus })
  });
  return res.data ? normalizeOrder(res.data) : res.data;
}

/**
 * Kirim pesan komunikasi di dalam proyek
 */
export async function sendOrderMessageApi(orderId, sender, role, text) {
  const res = await request(`/orders/${encodeURIComponent(orderId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ sender, role, text })
  });
  return res.data;
}

/**
 * Ambil seluruh faktur/invoice dari Database MySQL Laravel
 */
export async function fetchInvoicesFromApi() {
  const res = await request('/invoices', { method: 'GET' });
  return res.data || [];
}

/**
 * Kirim formulir kontak ke Backend Laravel
 */
export async function sendContactMessageToApi(contactData) {
  const res = await request('/contact', {
    method: 'POST',
    body: JSON.stringify(contactData)
  });
  return res.data;
}

/**
 * Ambil seluruh layanan / produk dari Backend Laravel Database MySQL
 */
export async function fetchServicesFromApi() {
  const res = await request('/services', { method: 'GET' });
  return res.data || [];
}

/**
 * Ambil seluruh klien dari Backend Laravel Database
 */
export async function fetchClientsFromApi() {
  try {
    const res = await request('/clients', { method: 'GET' });
    return res.data || [];
  } catch (err) {
    console.warn('[Nexa Digital] Gagal mengambil klien dari backend API:', err.message);
    return [];
  }
}

/**
 * Tambah produk / layanan baru ke Backend Laravel API
 */
export async function createServiceApi(serviceData) {
  const res = await request('/services', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  });
  return res.data;
}

/**
 * Update produk / layanan di Backend Laravel API
 */
export async function updateServiceApi(id, serviceData) {
  const res = await request(`/services/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
  });
  return res.data;
}

/**
 * Hapus produk / layanan dari Backend Laravel API
 */
export async function deleteServiceApi(id) {
  const res = await request(`/services/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  return res.data;
}


/**
 * Login Terpadu (Unified Login) - Otomatis deteksi atau dengan preferensi role
 */
export async function loginUnifiedApi(email, password, role = 'auto') {
  return await request('/auth/unified-login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role })
  });
}

/**
 * Login Portal Klien (Client Login)
 */
export async function loginClientApi(email, password) {
  return await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

/**
 * Register Akun Klien Baru
 */
export async function registerClientApi(payload) {
  return await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * Login Portal Administrator (Admin Console)
 */
export async function loginAdminApi(email, password) {
  return await request('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

/**
 * Login Portal Pegawai / Staf Operasional
 */
export async function loginPegawaiApi(email, password) {
  return await request('/auth/pegawai/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

/**
 * Ambil data profile user yang sedang aktif
 */
export async function getAuthMeApi(token) {
  return await request('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Logout dari API
 */
export async function logoutApi(token) {
  return await request('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
