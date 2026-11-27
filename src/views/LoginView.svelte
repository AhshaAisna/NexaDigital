<script>
  import {
    loginUnified,
    registerClient,
    isClientLoggedIn,
    isAdminLoggedIn,
    isPegawaiLoggedIn,
    logoutClient,
    logoutAdmin,
    logoutPegawai,
    currentUser,
    userRole
  } from '../stores/authStore';
  import { navigateTo, showToast } from '../stores/marketplaceStore';

  let activeTab = 'login';
  
  let email = '';
  let password = '';
  let isPasswordVisible = false;
  let isLoading = false;
  let rememberMe = true;

  let regName = '';
  let regCompany = '';
  let regEmail = '';
  let regPhone = '';
  let regPassword = '';
  let regConfirmPassword = '';

  async function handleLoginSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Mohon masukkan email dan kata sandi.', 'error');
      return;
    }

    isLoading = true;
    try {
      await loginUnified(email.trim(), password.trim(), 'auto');
    } finally {
      isLoading = false;
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      showToast('Nama lengkap, email, dan kata sandi wajib diisi.', 'error');
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

  function handleLogoutActive() {
    if ($isClientLoggedIn) logoutClient();
    else if ($isPegawaiLoggedIn) logoutPegawai();
    else if ($isAdminLoggedIn) logoutAdmin();
  }

  function openActiveDashboard() {
    if ($isClientLoggedIn) navigateTo('customer-dashboard');
    else if ($isPegawaiLoggedIn) navigateTo('pegawai-dashboard');
    else if ($isAdminLoggedIn) navigateTo('admin-dashboard');
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <title>Masuk ke Akun — PT Nexa Digital Solusindo</title>
</svelte:head>

<div class="min-h-screen bg-[#f4f4f5] text-[#09090b] selection:bg-[#ff5a00] selection:text-white font-['Plus_Jakarta_Sans',sans-serif] py-12 px-6 sm:px-12 lg:px-20 flex flex-col justify-center items-center relative overflow-hidden">
  
  <!-- Ambient Background Glow -->
  <div class="absolute top-0 right-1/4 w-96 h-96 bg-[#ff5a00]/10 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-zinc-400/10 rounded-full blur-3xl pointer-events-none"></div>

  <!-- Top Bar Nav -->
  <div class="w-full max-w-xl mb-6 flex justify-between items-center relative z-10">
    <button
      type="button"
      on:click={() => navigateTo('home')}
      class="inline-flex items-center gap-2 text-[12px] font-semibold text-[#52525b] hover:text-[#09090b] transition-colors py-2 px-4 rounded-[14px] bg-white border border-[#ececee] hover:border-[#a1a1aa] cursor-pointer shadow-xs"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      <span>Kembali ke Beranda</span>
    </button>
    <div class="text-[11px] font-semibold tracking-wider text-[#71717a] uppercase hidden sm:block">
      PT NEXA DIGITAL SOLUSINDO
    </div>
  </div>

  <!-- Active Session Warning Bar -->
  {#if $currentUser}
    <div class="w-full max-w-xl mb-6 p-4 rounded-[24px] bg-white border border-[#ececee] shadow-sm flex items-center justify-between gap-3 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-[14px] bg-[#ff5a00] text-white flex items-center justify-center font-bold text-sm">
          {$currentUser.name ? $currentUser.name.charAt(0) : 'U'}
        </div>
        <div>
          <div class="text-[13px] text-[#09090b] font-semibold">
            {$currentUser.name}
          </div>
          <span class="text-[11px] text-[#52525b]">
            Sesi Aktif: <strong class="uppercase text-[#ff5a00]">{$userRole}</strong>
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          on:click={openActiveDashboard}
          class="px-4 py-2 bg-[#ff5a00] hover:bg-[#e04f00] text-white text-[12px] font-semibold rounded-[12px] transition cursor-pointer"
        >
          Dashboard
        </button>
        <button
          type="button"
          on:click={handleLogoutActive}
          class="px-3 py-2 bg-[#fafafa] border border-[#ececee] text-[#52525b] text-[12px] font-semibold rounded-[12px] hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  {/if}

  <!-- Main Authentication Card -->
  <div class="w-full max-w-xl bg-white rounded-[36px] border border-[#ececee] shadow-xl overflow-hidden relative z-10">

    <!-- Header Section -->
    <div class="p-8 sm:p-10 pb-6 text-center border-b border-[#ececee] bg-[#fafafa]">
      <!-- Box Icon dengan Background Oranye (#ff5a00) -->
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-[20px] bg-[#ff5a00] text-white shadow-md shadow-[#ff5a00]/30 mb-4">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
      </div>
      <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-[#09090b]">
        Portal Akses Pengguna
      </h1>
      <p class="text-[13px] text-[#52525b] mt-1.5 max-w-sm mx-auto">
        Masuk untuk mengelola pesanan atau daftar sebagai klien baru Nexa Digital.
      </p>

      <!-- Tab Switcher (Tombol Aktif menggunakan Background Oranye #ff5a00) -->
      <div class="mt-6 inline-flex p-1.5 bg-[#f4f4f5] rounded-[18px] border border-[#ececee]">
        <button
          type="button"
          on:click={() => activeTab = 'login'}
          class="px-6 py-2.5 text-[12px] font-semibold rounded-[12px] transition cursor-pointer {activeTab === 'login' ? 'bg-[#ff5a00] text-white shadow-xs' : 'text-[#52525b] hover:text-[#09090b]'}"
        >
          Masuk Akun
        </button>
        <button
          type="button"
          on:click={() => activeTab = 'register'}
          class="px-6 py-2.5 text-[12px] font-semibold rounded-[12px] transition cursor-pointer {activeTab === 'register' ? 'bg-[#ff5a00] text-white shadow-xs' : 'text-[#52525b] hover:text-[#09090b]'}"
        >
          Daftar Klien Baru
        </button>
      </div>
    </div>

    <!-- Login Form Tab -->
    {#if activeTab === 'login'}
      <div class="p-8 sm:p-10 pt-6 space-y-6">
        <form on:submit={handleLoginSubmit} class="space-y-4">
          
          <!-- Email Field -->
          <div>
            <label class="block text-[12px] font-semibold text-[#09090b] mb-1.5">
              Alamat Email Kredensial
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#71717a]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <input
                type="email"
                bind:value={email}
                required
                placeholder="nama@perusahaan.com"
                class="w-full pl-11 pr-4 py-3.5 border border-[#ececee] rounded-[14px] text-[13px] focus:outline-none focus:border-[#ff5a00] focus:bg-white bg-[#fafafa] transition text-[#09090b] placeholder:text-[#a1a1aa]"
              />
            </div>
          </div>

          <!-- Password Field with Working SVG Toggle -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-[12px] font-semibold text-[#09090b]">
                Kata Sandi
              </label>
              <button
                type="button"
                on:click={() => showToast('Gunakan kata sandi akun Anda.', 'info')}
                class="text-[11px] text-[#ff5a00] hover:underline font-semibold cursor-pointer"
              >
                Lupa sandi?
              </button>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#71717a]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                bind:value={password}
                required
                placeholder="••••••••"
                class="w-full pl-11 pr-12 py-3.5 border border-[#ececee] rounded-[14px] text-[13px] focus:outline-none focus:border-[#ff5a00] focus:bg-white bg-[#fafafa] transition text-[#09090b] placeholder:text-[#a1a1aa]"
              />
              <!-- Inline SVG Eye Toggle -->
              <button
                type="button"
                on:click={() => isPasswordVisible = !isPasswordVisible}
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-[#71717a] hover:text-[#09090b] cursor-pointer"
                title={isPasswordVisible ? 'Sembunyikan sandi' : 'Lihat sandi'}
              >
                {#if isPasswordVisible}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                {:else}
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                {/if}
              </button>
            </div>
          </div>

          <!-- Remember Me Checkbox -->
          <div class="flex items-center text-[12px] pt-1">
            <label class="flex items-center gap-2.5 cursor-pointer text-[#52525b]">
              <input
                type="checkbox"
                bind:checked={rememberMe}
                class="w-4 h-4 rounded-[6px] text-[#ff5a00] focus:ring-[#ff5a00] border-[#ececee]"
              />
              <span>Ingat perangkat ini</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            disabled={isLoading}
            class="w-full py-4 px-4 rounded-[14px] text-[13px] uppercase font-semibold text-white bg-[#ff5a00] hover:bg-[#e04f00] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
          >
            {#if isLoading}
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Memverifikasi Akses...</span>
            {:else}
              <span>Masuk ke Sistem</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            {/if}
          </button>
        </form>

        <!-- Switch Link -->
        <div class="text-center pt-2 text-[13px] text-[#52525b]">
          Belum memiliki akun klien?
          <button
            type="button"
            on:click={() => activeTab = 'register'}
            class="font-semibold text-[#ff5a00] hover:underline cursor-pointer ml-1"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>

    <!-- Register Form Tab -->
    {:else}
      <form on:submit={handleRegisterSubmit} class="p-8 sm:p-10 pt-6 space-y-4">
        <div class="p-4 bg-[#fafafa] border border-[#ececee] rounded-[18px] text-[12px] text-[#52525b] leading-relaxed">
          <strong class="font-semibold text-[#09090b] block mb-0.5">Pendaftaran Akun Klien Baru</strong>
          Daftarkan akun untuk memesan layanan rekayasa perangkat lunak, memantau sprint pengerjaan, dan menerima faktur resmi.
        </div>

        <div>
          <label class="block text-[12px] font-semibold text-[#09090b] mb-1">Nama Lengkap *</label>
          <input
            type="text"
            bind:value={regName}
            required
            placeholder="Contoh: Rian Hidayat"
            class="w-full px-4 py-3.5 border border-[#ececee] rounded-[14px] text-[13px] focus:outline-none focus:border-[#ff5a00] bg-[#fafafa] text-[#09090b]"
          />
        </div>

        <div>
          <label class="block text-[12px] font-semibold text-[#09090b] mb-1">Email Aktif *</label>
          <input
            type="email"
            bind:value={regEmail}
            required
            placeholder="klien@perusahaan.com"
            class="w-full px-4 py-3.5 border border-[#ececee] rounded-[14px] text-[13px] focus:outline-none focus:border-[#ff5a00] bg-[#fafafa] text-[#09090b]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[12px] font-semibold text-[#09090b] mb-1">Perusahaan (Opsional)</label>
            <input
              type="text"
              bind:value={regCompany}
              placeholder="PT Contoh Maju"
              class="w-full px-4 py-3.5 border border-[#ececee] rounded-[14px] text-[13px] focus:outline-none focus:border-[#ff5a00] bg-[#fafafa] text-[#09090b]"
            />
          </div>
          <div>
            <label class="block text-[12px] font-semibold text-[#09090b] mb-1">No. WhatsApp *</label>
            <input
              type="tel"
              bind:value={regPhone}
              placeholder="081234567890"
              class="w-full px-4 py-3.5 border border-[#ececee] rounded-[14px] text-[13px] focus:outline-none focus:border-[#ff5a00] bg-[#fafafa] text-[#09090b]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[12px] font-semibold text-[#09090b] mb-1">Kata Sandi *</label>
            <input
              type="password"
              bind:value={regPassword}
              required
              placeholder="Min. 6 karakter"
              class="w-full px-4 py-3.5 border border-[#ececee] rounded-[14px] text-[13px] focus:outline-none focus:border-[#ff5a00] bg-[#fafafa] text-[#09090b]"
            />
          </div>
          <div>
            <label class="block text-[12px] font-semibold text-[#09090b] mb-1">Konfirmasi Sandi *</label>
            <input
              type="password"
              bind:value={regConfirmPassword}
              required
              placeholder="Ulangi sandi"
              class="w-full px-4 py-3.5 border border-[#ececee] rounded-[14px] text-[13px] focus:outline-none focus:border-[#ff5a00] bg-[#fafafa] text-[#09090b]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          class="w-full py-4 px-4 rounded-[14px] text-[13px] uppercase font-semibold text-white bg-[#ff5a00] hover:bg-[#e04f00] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-60"
        >
          {#if isLoading}
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Mendaftarkan Akun...</span>
          {:else}
            <span>Daftar Akun Klien</span>
          {/if}
        </button>
      </form>
    {/if}

    <!-- Footer Bar -->
    <div class="px-8 py-5 bg-[#fafafa] border-t border-[#ececee] flex items-center justify-between text-[11px] text-[#71717a]">
      <div class="flex items-center gap-1.5 font-medium">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Koneksi Aman TLS 256-bit</span>
      </div>
      <div>
        Nexa Digital © 2026
      </div>
    </div>

  </div>
</div>

<style>
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
</style>