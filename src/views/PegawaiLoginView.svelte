<script>
  import {
    isClientLoggedIn,
    isAdminLoggedIn,
    isPegawaiLoggedIn,
    clientUser,
    adminUser,
    logoutClient,
    logoutAdmin,
    loginPegawai
  } from '../stores/authStore';
  import { navigateTo, showToast } from '../stores/marketplaceStore';
  import Icon from '../components/Icon.svelte';

  let email = 'pegawai@nexadigital.id';
  let password = 'pegawai123';
  let isLoading = false;
  let isPasswordVisible = false;

  async function handlePegawaiSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Mohon masukkan email dan kata sandi pegawai.', 'error');
      return;
    }

    isLoading = true;
    try {
      await loginPegawai(email.trim(), password.trim());
    } finally {
      isLoading = false;
    }
  }

  function fillDemoPegawai() {
    email = 'pegawai@nexadigital.id';
    password = 'pegawai123';
    showToast('Kredensial demo Staf Pegawai terisi! Klik Masuk.', 'info');
  }

  function togglePasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<style>
  :global(body) {
    font-family: 'Poppins', sans-serif !important;
  }
</style>

{#if $isClientLoggedIn}
  <!-- Sesi Klien Sedang Aktif -->
  <div class="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white border border-rose-200 p-8 rounded-3xl shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl mx-auto flex items-center justify-center">
        <Icon name="alert-circle" size={32} />
      </div>
      <div class="space-y-2">
        <span class="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold uppercase tracking-wider">
          Akses Terbatas
        </span>
        <h1 class="text-xl font-semibold text-slate-900 tracking-tight">Sesi Klien Sedang Aktif</h1>
        <p class="text-xs text-slate-500 leading-relaxed">
          Anda saat ini masuk sebagai Klien (<strong class="text-slate-800">{$clientUser?.name}</strong>). Silakan keluar terlebih dahulu untuk membuka Portal Pegawai.
        </p>
      </div>
      <div class="space-y-3 pt-2">
        <button
          type="button"
          on:click={() => navigateTo('customer-dashboard')}
          class="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-orange-600/25"
        >
          Kembali ke Dashboard Klien
        </button>
        <button
          type="button"
          on:click={logoutClient}
          class="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all cursor-pointer"
        >
          Logout dari Akun Klien
        </button>
      </div>
    </div>
  </div>
{:else if $isAdminLoggedIn}
  <!-- Sesi Admin Sedang Aktif -->
  <div class="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 bg-slate-900 text-orange-400 rounded-2xl mx-auto flex items-center justify-center">
        <Icon name="shield" size={32} />
      </div>
      <div class="space-y-2">
        <span class="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider">
          Sesi Admin Aktif
        </span>
        <h1 class="text-xl font-semibold text-slate-900 tracking-tight">Anda Masuk sebagai Admin Utama</h1>
        <p class="text-xs text-slate-500 leading-relaxed">
          Anda saat ini mengelola sistem sebagai Administrator Utama (<strong class="text-slate-800">{$adminUser?.name}</strong>).
        </p>
      </div>
      <div class="space-y-3 pt-2">
        <button
          type="button"
          on:click={() => navigateTo('admin-dashboard')}
          class="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-orange-400 font-medium text-xs rounded-xl transition-all cursor-pointer shadow-md"
        >
          Buka Dashboard Admin Utama
        </button>
        <button
          type="button"
          on:click={logoutAdmin}
          class="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all cursor-pointer"
        >
          Logout Admin untuk Masuk sebagai Pegawai
        </button>
      </div>
    </div>
  </div>
{:else}
  <!-- Formulir Login Pegawai -->
  <div class="min-h-screen w-full flex items-center justify-center relative font-['Poppins'] antialiased text-slate-800 p-4 overflow-hidden bg-[#f8fafc]">
    
    <!-- Subtle Ambient Glow Orbs -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>
      <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[150px]"></div>
    </div>

    <!-- Navigation Header Shortcut -->
    <div class="absolute top-6 left-6 z-20">
      <button
        type="button"
        on:click={() => navigateTo('home')}
        class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-xs border border-slate-200 transition-all cursor-pointer"
      >
        <Icon name="arrow-left" size={14} />
        <span>Kembali ke Beranda</span>
      </button>
    </div>

    <!-- Login Card -->
    <div class="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 relative z-10 space-y-6">
      
      <!-- Card Header -->
      <div class="text-center space-y-2">
        <div class="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Icon name="user-check" size={26} />
        </div>
        <div class="pt-1">
          <span class="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-bold uppercase tracking-wider rounded-full">
            PORTAL KHUSUS PEGAWAI / STAF
          </span>
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Workspace Operasional
          </h1>
          <p class="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            Terima projek kesepakatan (deal) dari klien, kelola progres sprint, dan terbitkan invoice dengan 16 template tanpa melalui Admin Utama.
          </p>
        </div>
      </div>

      <!-- Demo Credentials 1-Click Button -->
      <div class="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div class="space-y-0.5">
          <span class="font-bold text-slate-900 block text-[11px]">Akun Demo Pegawai:</span>
          <span class="text-slate-600 text-[10px] block font-mono">pegawai@nexadigital.id / pegawai123</span>
        </div>
        <button
          type="button"
          on:click={fillDemoPegawai}
          class="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-semibold uppercase rounded-xl transition cursor-pointer shadow-xs whitespace-nowrap"
        >
          Isi Cepat
        </button>
      </div>

      <!-- Form Inputs -->
      <form on:submit={handlePegawaiSubmit} class="space-y-4 text-xs">
        <div class="space-y-1.5">
          <label for="pegawai-email" class="font-semibold text-slate-700 block">Email Pegawai / Staf</label>
          <input
            id="pegawai-email"
            type="email"
            bind:value={email}
            required
            placeholder="nama@nexadigital.id"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium transition"
          />
        </div>

        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <label for="pegawai-password" class="font-semibold text-slate-700">Kata Sandi</label>
            <button
              type="button"
              on:click={togglePasswordVisibility}
              class="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              {isPasswordVisible ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </div>
          <input
            id="pegawai-password"
            type={isPasswordVisible ? 'text' : 'password'}
            bind:value={password}
            required
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          class="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold uppercase tracking-wider rounded-xl shadow-lg shadow-orange-600/25 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {#if isLoading}
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Memverifikasi...</span>
          {:else}
            <span>Masuk ke Dashboard Pegawai</span>
            <Icon name="arrow-right" size={14} />
          {/if}
        </button>
      </form>

      <!-- Bottom Quick Links -->
      <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <button
          type="button"
          on:click={() => navigateTo('client-login')}
          class="hover:text-slate-900 transition underline cursor-pointer"
        >
          Portal Klien
        </button>
        <button
          type="button"
          on:click={() => navigateTo('admin-login')}
          class="hover:text-slate-900 transition underline cursor-pointer"
        >
          Portal Admin Utama
        </button>
      </div>

    </div>
  </div>
{/if}
