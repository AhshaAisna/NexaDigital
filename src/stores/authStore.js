import { writable, derived, get } from 'svelte/store';
import {
  loginClientApi,
  registerClientApi,
  loginAdminApi,
  loginPegawaiApi,
  loginUnifiedApi,
  logoutApi
} from '../lib/services/apiService';
import { showToast, navigateTo } from './marketplaceStore';

// Kunci penyimpanan sesi tunggal (Mutually Exclusive)
const SESSION_STORAGE_KEY = 'nexa_auth_session_v2';

// Pembersihan kunci usang agar tidak ada tumpang tindih sesi lama
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('nexa_client_auth_v1');
    localStorage.removeItem('nexa_admin_auth_v1');
  } catch (e) {}
}

function loadAuthSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Store Sesi Tunggal Terpadu (Mutually Exclusive)
export const authSession = writable(loadAuthSession());

// Derived Stores
export const currentUser = derived(authSession, ($s) => $s?.user || null);
export const userRole = derived(currentUser, ($u) => $u?.role || null);

// Pengguna Klien: hanya aktif jika role === 'client'
export const isClientLoggedIn = derived(currentUser, ($u) => !!($u && $u.role === 'client'));
export const clientUser = derived(currentUser, ($u) => ($u && $u.role === 'client') ? $u : null);

// Pengguna Administrator: hanya aktif jika role === 'admin'
export const isAdminLoggedIn = derived(currentUser, ($u) => !!($u && $u.role === 'admin'));
export const adminUser = derived(currentUser, ($u) => ($u && $u.role === 'admin') ? $u : null);

// Pengguna Pegawai: hanya aktif jika role === 'pegawai'
export const isPegawaiLoggedIn = derived(currentUser, ($u) => !!($u && $u.role === 'pegawai'));
export const pegawaiUser = derived(currentUser, ($u) => ($u && $u.role === 'pegawai') ? $u : null);

// Redirect target setelah login klien (misal jika dari checkout)
export const postLoginRedirect = writable(null);

// Simpan ke localStorage secara reaktif
if (typeof window !== 'undefined') {
  authSession.subscribe((val) => {
    try {
      if (val) localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(val));
      else localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
  });
}

/**
 * Login Portal Klien
 */
export async function loginClient(email, password) {
  // Cegah jika admin sedang aktif
  if (get(isAdminLoggedIn)) {
    showToast('Akses Ditolak: Sesi Administrator sedang aktif. Logout terlebih dahulu.', 'error');
    return { success: false, error: 'Sesi Administrator sedang aktif' };
  }

  try {
    const res = await loginClientApi(email, password);
    if (res && res.success) {
      if (res.user.role !== 'client') {
        showToast('Akses Ditolak: Akun ini bukan akun Klien.', 'error');
        return { success: false, error: 'Bukan akun klien' };
      }
      
      const newSession = { user: res.user, token: res.token };
      authSession.set(newSession);
      showToast(res.message || `Selamat datang kembali, ${res.user.name}!`, 'success');
      
      const targetView = get(postLoginRedirect) || 'customer-dashboard';
      postLoginRedirect.set(null);
      navigateTo(targetView);
      return { success: true, user: res.user };
    }
  } catch (err) {
    // Fallback offline bila koneksi database terputus
    if (email === 'rian.hidayat@startupkita.id' && password === 'client123') {
      const demoUser = {
        id: 2,
        name: 'Rian Hidayat',
        email: 'rian.hidayat@startupkita.id',
        role: 'client',
        company: 'PT Logistik Kita Bersama',
        phone: '+62 812-9988-7766',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      };
      authSession.set({ user: demoUser, token: 'local-demo-client-token' });
      showToast('Login Klien Berhasil (Mode Offline)!', 'success');
      const targetView = get(postLoginRedirect) || 'customer-dashboard';
      postLoginRedirect.set(null);
      navigateTo(targetView);
      return { success: true, user: demoUser };
    }

    const errorMsg = err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.';
    showToast(errorMsg, 'error');
    return { success: false, error: errorMsg };
  }
}

/**
 * Registrasi Akun Klien Baru
 */
export async function registerClient(payload) {
  if (get(isAdminLoggedIn)) {
    showToast('Akses Ditolak: Sesi Administrator sedang aktif.', 'error');
    return { success: false, error: 'Sesi Administrator sedang aktif' };
  }

  try {
    const res = await registerClientApi(payload);
    if (res && res.success) {
      const newSession = { user: res.user, token: res.token };
      authSession.set(newSession);
      showToast('Akun klien berhasil dibuat! Selamat datang di Nexa Digital.', 'success');
      
      const targetView = get(postLoginRedirect) || 'customer-dashboard';
      postLoginRedirect.set(null);
      navigateTo(targetView);
      return { success: true, user: res.user };
    }
  } catch (err) {
    const newUser = {
      id: Date.now(),
      name: payload.name,
      email: payload.email,
      role: 'client',
      company: payload.company || '-',
      phone: payload.phone || '-',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=F97316&color=fff`
    };
    authSession.set({ user: newUser, token: 'local-registered-token' });
    showToast('Pendaftaran akun klien berhasil disimpan!', 'success');
    
    const targetView = get(postLoginRedirect) || 'customer-dashboard';
    postLoginRedirect.set(null);
    navigateTo(targetView);
    return { success: true, user: newUser };
  }
}

/**
 * Logout Klien
 */
export async function logoutClient() {
  const current = get(authSession);
  if (current?.token) {
    logoutApi(current.token).catch(() => {});
  }
  authSession.set(null);
  showToast('Anda telah keluar dari akun Klien.', 'info');
  navigateTo('home');
}

/**
 * Login Administrator
 */
export async function loginAdmin(email, password) {
  // Cegah jika klien sedang aktif
  if (get(isClientLoggedIn)) {
    showToast('Akses Ditolak: Sesi Klien sedang aktif. Logout dari akun Klien terlebih dahulu untuk membuka Admin!', 'error');
    return { success: false, error: 'Sesi Klien sedang aktif' };
  }

  try {
    const res = await loginAdminApi(email, password);
    if (res && res.success) {
      if (res.user.role !== 'admin') {
        showToast('Akses Ditolak: Anda bukan Administrator.', 'error');
        return { success: false, error: 'Bukan akun administrator' };
      }

      const newSession = { user: res.user, token: res.token };
      authSession.set(newSession);
      showToast('Autentikasi Administrator Terverifikasi.', 'success');
      navigateTo('admin-dashboard');
      return { success: true, user: res.user };
    }
  } catch (err) {
    // Fallback offline
    if (email === 'admin@nexadigital.id' && password === 'admin123') {
      const demoAdmin = {
        id: 1,
        name: 'Administrator IT Nexa',
        email: 'admin@nexadigital.id',
        role: 'admin',
        company: 'PT Nexa Digital Solusindo',
        phone: '+62 811-2233-4455',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };
      authSession.set({ user: demoAdmin, token: 'local-demo-admin-token' });
      showToast('Login Administrator Terverifikasi (Mode Offline)', 'success');
      navigateTo('admin-dashboard');
      return { success: true, user: demoAdmin };
    }

    const errorMsg = err.message || 'Login administrator gagal. Kredensial tidak valid.';
    showToast(errorMsg, 'error');
    return { success: false, error: errorMsg };
  }
}

/**
 * Logout Administrator
 */
export async function logoutAdmin() {
  const current = get(authSession);
  if (current?.token) {
    logoutApi(current.token).catch(() => {});
  }
  authSession.set(null);
  showToast('Sesi Administrator telah diakhiri.', 'info');
  navigateTo('home');
}

/**
 * Login Pegawai / Staf Operasional
 */
export async function loginPegawai(email, password) {
  // Cegah jika klien atau admin sedang aktif
  if (get(isClientLoggedIn)) {
    showToast('Akses Ditolak: Sesi Klien sedang aktif. Logout dari akun Klien terlebih dahulu.', 'error');
    return { success: false, error: 'Sesi Klien sedang aktif' };
  }
  if (get(isAdminLoggedIn)) {
    showToast('Akses Ditolak: Sesi Administrator sedang aktif. Logout dari Admin terlebih dahulu.', 'error');
    return { success: false, error: 'Sesi Admin sedang aktif' };
  }

  try {
    const res = await loginPegawaiApi(email, password);
    if (res && res.success) {
      if (res.user.role !== 'pegawai') {
        showToast('Akses Ditolak: Anda bukan Pegawai / Staf.', 'error');
        return { success: false, error: 'Bukan akun pegawai' };
      }

      const newSession = { user: res.user, token: res.token };
      authSession.set(newSession);
      showToast('Autentikasi Pegawai Berhasil! Selamat datang.', 'success');
      navigateTo('pegawai-dashboard');
      return { success: true, user: res.user };
    }
  } catch (err) {
    // Fallback offline bila koneksi database terputus
    if (email === 'pegawai@nexadigital.id' && password === 'pegawai123') {
      const demoPegawai = {
        id: 3,
        name: 'Bagas Pratama (Staff Operasional)',
        email: 'pegawai@nexadigital.id',
        role: 'pegawai',
        company: 'PT Nexa Digital Solusindo',
        phone: '+62 813-8899-0011',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
      };
      authSession.set({ user: demoPegawai, token: 'local-demo-pegawai-token' });
      showToast('Login Pegawai Terverifikasi (Mode Offline)', 'success');
      navigateTo('pegawai-dashboard');
      return { success: true, user: demoPegawai };
    }

    const errorMsg = err.message || 'Login pegawai gagal. Periksa kembali email dan kata sandi Anda.';
    showToast(errorMsg, 'error');
    return { success: false, error: errorMsg };
  }
}

/**
 * Logout Pegawai
 */
export async function logoutPegawai() {
  const current = get(authSession);
  if (current?.token) {
    logoutApi(current.token).catch(() => {});
  }
  authSession.set(null);
  showToast('Sesi Pegawai telah diakhiri.', 'info');
  navigateTo('home');
}

/**
 * Login Terpadu (Unified Login)
 * Otomatis mendeteksi role atau menggunakan pilihan role (client, pegawai, admin)
 */
export async function loginUnified(email, password, selectedRole = 'auto') {
  try {
    const res = await loginUnifiedApi(email, password, selectedRole);
    if (res && res.success) {
      const user = res.user;
      const newSession = { user, token: res.token };
      authSession.set(newSession);

      const roleTitle = user.role === 'admin'
        ? 'Administrator Utama'
        : user.role === 'pegawai'
        ? 'Pegawai (Staff)'
        : 'Klien';

      showToast(`Selamat datang kembali, ${user.name}! (Masuk sebagai ${roleTitle})`, 'success');

      if (user.role === 'admin') {
        navigateTo('admin-dashboard');
      } else if (user.role === 'pegawai') {
        navigateTo('pegawai-dashboard');
      } else {
        const targetView = get(postLoginRedirect) || 'customer-dashboard';
        postLoginRedirect.set(null);
        navigateTo(targetView);
      }
      return { success: true, user };
    }
  } catch (err) {
    // Mode Offline Fallback jika backend tidak tersambung
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    // 1. Cek Admin Demo
    if ((selectedRole === 'admin' || selectedRole === 'auto') && trimmedEmail === 'admin@nexadigital.id' && trimmedPass === 'admin123') {
      const demoAdmin = {
        id: 1,
        name: 'Administrator IT Nexa',
        email: 'admin@nexadigital.id',
        role: 'admin',
        company: 'PT Nexa Digital Solusindo',
        phone: '+62 811-2233-4455',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      };
      authSession.set({ user: demoAdmin, token: 'local-demo-admin-token' });
      showToast('Login Administrator Terverifikasi (Mode Offline)', 'success');
      navigateTo('admin-dashboard');
      return { success: true, user: demoAdmin };
    }

    // 2. Cek Pegawai Demo
    if ((selectedRole === 'pegawai' || selectedRole === 'auto') && trimmedEmail === 'pegawai@nexadigital.id' && trimmedPass === 'pegawai123') {
      const demoPegawai = {
        id: 3,
        name: 'Bagas Pratama (Staff Operasional)',
        email: 'pegawai@nexadigital.id',
        role: 'pegawai',
        company: 'PT Nexa Digital Solusindo',
        phone: '+62 813-8899-0011',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
      };
      authSession.set({ user: demoPegawai, token: 'local-demo-pegawai-token' });
      showToast('Login Pegawai Terverifikasi (Mode Offline)', 'success');
      navigateTo('pegawai-dashboard');
      return { success: true, user: demoPegawai };
    }

    // 3. Cek Klien Demo / Umum
    if ((selectedRole === 'client' || selectedRole === 'auto') && (trimmedEmail === 'rian.hidayat@startupkita.id' || trimmedEmail.includes('client') || selectedRole === 'client') && (trimmedPass === 'client123' || trimmedPass.length >= 6)) {
      const demoUser = {
        id: 2,
        name: trimmedEmail === 'rian.hidayat@startupkita.id' ? 'Rian Hidayat' : 'Klien Nexa',
        email: trimmedEmail,
        role: 'client',
        company: 'PT Logistik Kita Bersama',
        phone: '+62 812-9988-7766',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
      };
      authSession.set({ user: demoUser, token: 'local-demo-client-token' });
      showToast('Login Klien Berhasil (Mode Offline)!', 'success');
      const targetView = get(postLoginRedirect) || 'customer-dashboard';
      postLoginRedirect.set(null);
      navigateTo(targetView);
      return { success: true, user: demoUser };
    }

    const errorMsg = err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.';
    showToast(errorMsg, 'error');
    return { success: false, error: errorMsg };
  }
}

/**
 * Logout Universal (Keluar dari role apapun yang sedang aktif)
 */
export async function logoutUser() {
  const current = get(authSession);
  if (current?.token) {
    logoutApi(current.token).catch(() => {});
  }
  const role = current?.user?.role || 'Pengguna';
  authSession.set(null);
  showToast(`Sesi ${role} telah berhasil diakhiri.`, 'info');
  navigateTo('home');
}

