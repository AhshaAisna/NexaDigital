<script>
  import {
    loginClient,
    registerClient,
    postLoginRedirect,
    isAdminLoggedIn,
    adminUser,
    logoutAdmin
  } from '../stores/authStore';
  import { navigateTo, showToast } from '../stores/marketplaceStore';
  import Icon from '../components/Icon.svelte';

  let activeTab = 'login'; // 'login' | 'register'
  let isLoading = false;

  // Login form state
  let loginEmail = 'rian.hidayat@startupkita.id';
  let loginPassword = 'client123';

  // Register form state
  let regName = '';
  let regCompany = '';
  let regEmail = '';
  let regPhone = '';
  let regPassword = '';
  let regConfirmPassword = '';

  $: isFromCheckout = $postLoginRedirect === 'checkout';

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showToast('Mohon masukkan email dan kata sandi.', 'error');
      return;
    }

    isLoading = true;
    try {
      await loginClient(loginEmail.trim(), loginPassword.trim());
    } finally {
      isLoading = false;
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast('Nama, email, dan kata sandi wajib diisi.', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok.', 'error');
      return;
    }
    if (regPassword.length < 6) {
      showToast('Kata sandi minimal 6 karakter.', 'error');
      return;
    }

    isLoading = true;
    try {
      await registerClient({
        name: regName.trim(),
        company: regCompany.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword.trim()
      });
    } finally {
      isLoading = false;
    }
  }

  function fillDemoClient() {
    activeTab = 'login';
    loginEmail = 'rian.hidayat@startupkita.id';
    loginPassword = 'client123';
    showToast('Kredensial demo Klien terisi! Klik "Masuk ke Portal Klien".', 'info');
  }
</script>

<svelte:head>
  <!-- Google Fonts: Poppins -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<style>
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Poppins', sans-serif !important;
  }
</style>

{#if $isAdminLoggedIn}
  <!-- ==================== ACCESS RESTRICTED: ADMIN SESSION ACTIVE ==================== -->
  <div class="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center py-16 px-4 font-['Poppins']">
    <div class="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6 text-center">
      <div class="w-14 h-14 bg-slate-900 text-orange-400 rounded-2xl mx-auto flex items-center justify-center shadow-md">
        <Icon name="shield" size={26} />
      </div>
      <div class="space-y-1.5">
        <span class="text-xs uppercase text-slate-400 tracking-widest font-bold block">[ SESI ADMIN SEDANG AKTIF ]</span>
        <h1 class="text-2xl font-bold text-slate-900">Anda Login sebagai Admin</h1>
        <p class="text-xs text-slate-500 leading-relaxed font-normal">
          Anda saat ini sedang mengelola sistem sebagai Administrator (<strong class="text-slate-800 font-semibold">{$adminUser?.name}</strong>). Sesi Klien dan Admin dibuat saling terpisah secara eksklusif. Silakan logout terlebih dahulu jika ingin beralih ke akun Klien.
        </p>
      </div>
      <div class="pt-2 space-y-2.5 text-xs">
        <button
          on:click={() => navigateTo('admin-dashboard')}
          class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-orange-400 font-semibold uppercase rounded-xl transition cursor-pointer shadow-xs"
        >
          Kembali ke Dashboard Admin &rarr;
        </button>
        <button
          on:click={logoutAdmin}
          class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold uppercase rounded-xl transition cursor-pointer border border-slate-200"
        >
          Keluar dari Sesi Administrator
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-slate-900 selection:text-orange-400 font-['Poppins'] py-12 px-4 sm:px-6 lg:px-8 antialiased">
    <div class="max-w-xl mx-auto space-y-8">
      
      <!-- Top Breadcrumb / Return Navigation -->
      <div class="flex items-center justify-between">
        <button
          on:click={() => navigateTo('home')}
          class="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group font-medium"
        >
          <Icon name="arrow-left" size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Kembali ke Beranda</span>
        </button>

        <span class="text-xs uppercase tracking-widest text-slate-400 font-bold">
          [ NEXA CLIENT PORTAL ]
        </span>
      </div>

      <!-- Alert Context if Redirected From Checkout (Sudah Diperbaiki Desainnya) -->
      {#if isFromCheckout}
        <div class="bg-orange-50/90 border border-orange-200 p-5 rounded-2xl shadow-xs flex items-start gap-4">
          <div class="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Icon name="alert-circle" size={20} />
          </div>
          <div class="space-y-1 text-xs leading-relaxed text-slate-700 font-normal">
            <strong class="uppercase text-orange-950 font-bold block">
              Verifikasi Identitas Klien Diperlukan
            </strong>
            <p class="text-slate-600">
              Sebelum menerbitkan invoice resmi dan melanjutkan brief pesanan proyek, Anda perlu masuk ke akun Klien Anda. Data keranjang dan spesifikasi pesanan Anda tetap tersimpan dengan aman[cite: 16].
            </p>
          </div>
        </div>
      {/if}

      <!-- Main Card Container -->
      <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        
        <!-- Card Header -->
        <div class="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div class="flex items-center gap-3.5">
            <div class="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="user" size={20} />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                Portal Klien Nexa Digital
              </h1>
              <p class="text-xs text-slate-500 font-normal mt-0.5">
                Akses pelacakan proyek, riwayat faktur, dan manajemen pemesanan resmi.
              </p>
            </div>
          </div>

          <!-- Quick 1-Click Demo Button -->
          <div class="mt-5 p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div class="space-y-0.5">
              <span class="font-bold text-slate-900 block">Akun Uji Coba Klien:</span>
              <span class="text-slate-500 block text-[11px] font-normal">rian.hidayat@startupkita.id (Password: client123)</span>
            </div>
            <button
              type="button"
              on:click={fillDemoClient}
              class="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-semibold uppercase transition-all shrink-0 rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Icon name="zap" size={13} />
              <span>Gunakan Akun Demo</span>
            </button>
          </div>

          <!-- Tabs Navigation -->
          <div class="grid grid-cols-2 gap-2.5 mt-6 text-xs uppercase font-semibold">
            <button
              type="button"
              on:click={() => activeTab = 'login'}
              class="py-3 px-4 text-center border transition-all cursor-pointer rounded-xl {activeTab === 'login' ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"
            >
              [ 01. Masuk / Sign In ]
            </button>
            <button
              type="button"
              on:click={() => activeTab = 'register'}
              class="py-3 px-4 text-center border transition-all cursor-pointer rounded-xl {activeTab === 'register' ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"
            >
              [ 02. Daftar Akun Baru ]
            </button>
          </div>
        </div>

        <!-- Tab 1: Form Login -->
        {#if activeTab === 'login'}
          <form on:submit={handleLoginSubmit} class="p-6 sm:p-8 space-y-5">
            <div>
              <label for="client-email" class="block text-xs uppercase font-semibold text-slate-700 mb-1.5">
                Email Bisnis / Akun Klien <span class="text-orange-600">*</span>
              </label>
              <input
                id="client-email"
                type="email"
                bind:value={loginEmail}
                placeholder="nama@perusahaan.com"
                required
                class="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition rounded-xl"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="client-password" class="block text-xs uppercase font-semibold text-slate-700">
                  Kata Sandi <span class="text-orange-600">*</span>
                </label>
                <button
                  type="button"
                  on:click={() => showToast('Gunakan kata sandi: client123 untuk akun demo.', 'info')}
                  class="text-[11px] text-slate-400 hover:text-orange-600 transition underline cursor-pointer font-normal"
                >
                  Lupa sandi?
                </button>
              </div>
              <input
                id="client-password"
                type="password"
                bind:value={loginPassword}
                placeholder="••••••••"
                required
                class="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              class="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs uppercase font-semibold shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 rounded-xl"
            >
              {#if isLoading}
                <Icon name="refresh-cw" size={16} className="animate-spin" />
                <span>Memverifikasi Akun Klien...</span>
              {:else}
                <span>Masuk ke Portal Klien</span>
                <Icon name="arrow-right" size={16} />
              {/if}
            </button>
          </form>
        {/if}

        <!-- Tab 2: Form Register -->
        {#if activeTab === 'register'}
          <form on:submit={handleRegisterSubmit} class="p-6 sm:p-8 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="reg-name" class="block text-xs uppercase font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap Penanggung Jawab <span class="text-orange-600">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  bind:value={regName}
                  placeholder="cth. Rian Hidayat"
                  required
                  class="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition rounded-xl"
                />
              </div>
              <div>
                <label for="reg-company" class="block text-xs uppercase font-semibold text-slate-700 mb-1.5">
                  Nama Perusahaan / Startup
                </label>
                <input
                  id="reg-company"
                  type="text"
                  bind:value={regCompany}
                  placeholder="cth. PT Logistik Kita"
                  class="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition rounded-xl"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="reg-email" class="block text-xs uppercase font-semibold text-slate-700 mb-1.5">
                  Email Bisnis <span class="text-orange-600">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  bind:value={regEmail}
                  placeholder="rian@startupkita.id"
                  required
                  class="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition rounded-xl"
                />
              </div>
              <div>
                <label for="reg-phone" class="block text-xs uppercase font-semibold text-slate-700 mb-1.5">
                  No. WhatsApp / Telepon
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  bind:value={regPhone}
                  placeholder="+62 812-xxxx-xxxx"
                  class="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition rounded-xl"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="reg-password" class="block text-xs uppercase font-semibold text-slate-700 mb-1.5">
                  Kata Sandi <span class="text-orange-600">*</span>
                </label>
                <input
                  id="reg-password"
                  type="password"
                  bind:value={regPassword}
                  placeholder="Min. 6 Karakter"
                  required
                  class="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition rounded-xl"
                />
              </div>
              <div>
                <label for="reg-confirm" class="block text-xs uppercase font-semibold text-slate-700 mb-1.5">
                  Ulangi Kata Sandi <span class="text-orange-600">*</span>
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  bind:value={regConfirmPassword}
                  placeholder="Ketik ulang sandi"
                  required
                  class="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition rounded-xl"
                />
              </div>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                class="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 text-white text-xs uppercase font-semibold shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 rounded-xl"
              >
                {#if isLoading}
                  <Icon name="refresh-cw" size={16} className="animate-spin" />
                  <span>Mendaftarkan Akun Klien...</span>
                {:else}
                  <span>Daftar Akun Klien & Lanjutkan</span>
                  <Icon name="arrow-right" size={16} />
                {/if}
              </button>
            </div>
          </form>
        {/if}

        <!-- Footer Info -->
        <div class="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 font-normal">
          Keamanan data klien dilindungi enkripsi standar industri PT Nexa Digital Solusindo.
        </div>

      </div>

      <!-- Switch to Admin Login Notice -->
      <div class="text-center">
        <p class="text-xs text-slate-500 font-normal">
          Anda tim teknis / manajemen PT Nexa Digital? 
          <button
            type="button"
            on:click={() => navigateTo('admin-login')}
            class="font-semibold text-slate-800 hover:text-orange-600 transition underline cursor-pointer ml-1"
          >
            Masuk ke Portal Administrator Di Sini &rarr;
          </button>
        </p>
      </div>

    </div>
  </div>
{/if}