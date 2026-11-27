<script>
  import {
    isClientLoggedIn,
    clientUser,
    logoutClient,
    loginAdmin
  } from '../stores/authStore';
  import { navigateTo, showToast } from '../stores/marketplaceStore';

  let email = 'admin@nexadigital.id';
  let password = 'admin123';
  let isLoading = false;
  let isPasswordVisible = false;

  let simulatedClientState = false;

  async function handleAdminSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Mohon masukkan kredensial administrator.', 'error');
      return;
    }

    isLoading = true;
    try {
      if (email.trim() === 'admin@nexadigital.id' && password.trim() === 'admin123') {
        await loginAdmin(email.trim(), password.trim());
        showToast('Autentikasi Berhasil!', 'success');
      } else {
        showToast('Kredensial tidak valid!', 'error');
      }
    } finally {
      isLoading = false;
    }
  }

  function fillDemoAdmin() {
    email = 'admin@nexadigital.id';
    password = 'admin123';
    showToast('Kredensial demo terisi!', 'info');
  }

  function togglePasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
  }

  function toggleClientSession(status) {
    simulatedClientState = status;
    if (simulatedClientState) {
      showToast('Simulasi: Sesi Klien aktif.', 'info');
    } else {
      showToast('Sesi Klien di-logout.', 'success');
    }
  }
</script>

<svelte:head>
  <!-- Google Fonts: Poppins -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<style>
  :global(body) {
    font-family: 'Poppins', sans-serif !important;
  }
</style>

{#if $isClientLoggedIn || simulatedClientState}
  <!-- ==================== RESTRICTED ACCESS SCREEN (LIGHT MODE) ==================== -->
  <div class="min-h-screen bg-[#f8fafc] text-slate-800 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white border border-rose-200 p-8 rounded-3xl shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl mx-auto flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
      </div>

      <div class="space-y-2">
        <span class="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold uppercase tracking-wider">
          Akses Dibatasi
        </span>
        <h1 class="text-xl font-semibold text-slate-900 tracking-tight">Sesi Klien Aktif</h1>
        <p class="text-xs text-slate-500 leading-relaxed">
          Anda masuk sebagai <strong class="text-slate-700">{$clientUser?.name || 'Klien'}</strong>. Keluar terlebih dahulu untuk mengakses area Administrator.
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
          on:click={() => { logoutClient(); toggleClientSession(false); }}
          class="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-all cursor-pointer"
        >
          Logout dari Sesi Klien
        </button>
      </div>
    </div>
  </div>
{:else}
  <!-- ==================== MODERN CLEAN LIGHT MODE LOGIN LAYOUT ==================== -->
  <div class="min-h-screen w-full flex items-center justify-center relative font-['Poppins'] antialiased text-slate-800 p-4 overflow-hidden bg-[#f8fafc]">
    
    <!-- Subtle Ambient Glow Orbs -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>
      <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[150px]"></div>
    </div>

    <!-- Tombol Navigasi Kecil di Pojok Atas -->
    <div class="absolute top-6 left-6 z-20">
      <button
        type="button"
        on:click={() => navigateTo('home')}
        class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-sm border border-slate-200 transition-all cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        <span>Kembali</span>
      </button>
    </div>

    <div class="absolute top-6 right-6 z-20">
      <button
        type="button"
        on:click={() => toggleClientSession(true)}
        class="text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-sm border border-slate-200 transition-all cursor-pointer"
      >
        Simulasi Sesi Klien
      </button>
    </div>

    <!-- Kartu Login Utama di Tengah -->
    <div class="w-full max-w-md bg-white/90 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 relative z-10 space-y-6">
      
      <!-- Top Icon Box dengan Aksen Oranye -->
      <div class="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl mx-auto flex items-center justify-center text-orange-600 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
      </div>

      <!-- Header Teks -->
      <div class="text-center space-y-1.5">
        <span class="text-[10px] font-semibold text-orange-600 uppercase tracking-widest block">
          [ KONSOL ADMINISTRATOR ]
        </span>
        <h1 class="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Sign in to Admin Console
        </h1>
        <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Kelola sistem digital dan pantau operasional Nexa Studio dengan aman.
        </p>
      </div>

      <!-- Tombol Demo Auto-Fill -->
      <div class="p-3 bg-orange-50/60 border border-orange-100 rounded-xl flex items-center justify-between text-xs">
        <span class="text-orange-900 font-medium pl-1">Gunakan Akun Demo Admin</span>
        <button
          type="button"
          on:click={fillDemoAdmin}
          class="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-all cursor-pointer shadow-sm text-[11px]"
        >
          Isi Otomatis
        </button>
      </div>

      <!-- Form Input -->
      <form on:submit={handleAdminSubmit} class="space-y-4 text-xs">
        
        <!-- Input Email -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <input
            id="admin-email"
            type="email"
            bind:value={email}
            placeholder="Email address"
            required
            class="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <!-- Input Password -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <input
            id="admin-password"
            type={isPasswordVisible ? 'text' : 'password'}
            bind:value={password}
            placeholder="Password"
            required
            class="w-full pl-10 pr-11 py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-orange-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            on:click={togglePasswordVisibility}
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none p-0 flex items-center"
          >
            {#if isPasswordVisible}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 1.267-.076c7 0 10 7 10 7a13.16 13.16 0 0 1-1.670 2.677"/><path d="M17.27 17.27A10.73 10.73 0 0 1 12 19c-7 0-10-7-10-7a13.16 13.16 0 0 1 2.673-3.664"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            {/if}
          </button>
        </div>

        <!-- Forgot Password Link -->
        <div class="text-right pt-0.5">
          <button
            type="button"
            on:click={() => showToast('Hubungi DevOps untuk reset password.', 'info')}
            class="text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-transparent border-none p-0 cursor-pointer transition"
          >
            Forgot password?
          </button>
        </div>

        <!-- Tombol Submit Utama -->
        <button
          type="submit"
          disabled={isLoading}
          class="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
        >
          {#if isLoading}
            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Signing in...</span>
          {:else}
            <span>Sign In to Dashboard</span>
          {/if}
        </button>
      </form>

      <!-- Pemisah / Divider -->
      <div class="relative flex py-1 items-center">
        <div class="flex-grow border-t border-slate-200"></div>
        <span class="flex-shrink mx-4 text-[11px] text-slate-400">Or sign in with</span>
        <div class="flex-grow border-t border-slate-200"></div>
      </div>

      <!-- Tombol Login Sosial Media -->
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          on:click={() => showToast('Login dengan Google belum dikonfigurasi.', 'info')}
          class="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          on:click={() => showToast('Login dengan Apple belum dikonfigurasi.', 'info')}
          class="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.66-.8 1.11-1.92.99-3.04-.96.04-2.13.64-2.82 1.44-.61.71-1.14 1.86-.99 2.96 1.07.08 2.16-.55 2.82-1.36Z"/></svg>
          <span>Apple</span>
        </button>
      </div>

      <!-- Footer Bawah Kartu -->
      <div class="text-center pt-2">
        <p class="text-xs text-slate-500">
          Bukan Administrator? 
          <button
            type="button"
            on:click={() => navigateTo('client-login')}
            class="font-semibold text-orange-600 hover:underline cursor-pointer ml-1 bg-transparent border-none p-0"
          >
            Sign up as client
          </button>
        </p>
      </div>

    </div>
  </div>
{/if}