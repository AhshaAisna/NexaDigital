<script>
  import { activeView, navigateTo } from '../stores/marketplaceStore';
  import {
    isClientLoggedIn,
    clientUser,
    logoutClient,
    isAdminLoggedIn,
    adminUser,
    logoutAdmin,
    isPegawaiLoggedIn,
    pegawaiUser,
    logoutPegawai,
    currentUser,
    userRole,
    logoutUser
  } from '../stores/authStore';
  import Icon from './Icon.svelte';

  let mobileMenuOpen = false;

  function handleNav(view) {
    navigateTo(view);
    mobileMenuOpen = false;
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

<header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
  <div class="w-full px-6 sm:px-12 lg:px-20">
    <div class="flex items-center justify-between h-20">
      
      <!-- Brand Logo (Tetap di kiri) -->
      <button
        on:click={() => handleNav('home')}
        class="flex items-center gap-3.5 text-left group focus:outline-none cursor-pointer"
      >
        <div>
          <div class="font-bold text-lg text-slate-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors">
            Nexa Digital
          </div>
          <span class="text-[10px] font-medium text-slate-400 tracking-widest uppercase block mt-1">
            Studio Rekayasa & Desain
          </span>
        </div>
      </button>

      <!-- Desktop Navigation & Action Buttons (Digabung dan digeser ke Kanan) -->
      <div class="hidden md:flex items-center gap-4">
        <!-- Desktop Navigation Links -->
        <nav class="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium">
          <button
            on:click={() => handleNav('home')}
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer {$activeView === 'home' ? 'text-orange-600 font-semibold bg-orange-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
          >
            Beranda
          </button>
          <button
            on:click={() => handleNav('services')}
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer {$activeView === 'services' || $activeView === 'service-detail' ? 'text-orange-600 font-semibold bg-orange-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
          >
            Layanan
          </button>
          <button
            on:click={() => handleNav('portfolio')}
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer {$activeView === 'portfolio' ? 'text-orange-600 font-semibold bg-orange-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
          >
            Portofolio
          </button>
          <button
            on:click={() => handleNav('about')}
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer {$activeView === 'about' ? 'text-orange-600 font-semibold bg-orange-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
          >
            Tentang Kami
          </button>
          <button
            on:click={() => handleNav('contact')}
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer {$activeView === 'contact' ? 'text-orange-600 font-semibold bg-orange-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}"
          >
            Kontak
          </button>
        </nav>

        <div class="h-5 w-px bg-slate-200"></div>

        <!-- Desktop Action Buttons -->
        <div class="flex items-center gap-3">
          {#if $isClientLoggedIn}
            <!-- Client is Logged In -->
            <div class="flex items-center border border-slate-200 bg-white rounded-xl p-1 shadow-xs">
              <button
                on:click={() => handleNav('customer-dashboard')}
                class="px-3 py-1.5 text-xs uppercase font-semibold text-slate-800 hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer rounded-lg"
                title="Buka Dashboard Klien"
              >
                <div class="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {$clientUser?.name ? $clientUser.name.charAt(0) : 'K'}
                </div>
                <span class="max-w-[120px] truncate">{$clientUser?.name || 'Klien'}</span>
                <span class="text-[9px] bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded">KLIEN</span>
              </button>
              <div class="h-4 w-px bg-slate-200 my-auto mx-1"></div>
              <button
                on:click={logoutClient}
                title="Keluar dari akun Klien"
                class="px-2 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer text-xs rounded-lg"
              >
                <Icon name="log-out" size={14} />
              </button>
            </div>
          {:else if $isPegawaiLoggedIn}
            <!-- Pegawai is Logged In -->
            <div class="flex items-center border border-amber-200 bg-amber-50/70 rounded-xl p-1 shadow-xs">
              <button
                on:click={() => handleNav('pegawai-dashboard')}
                class="px-3 py-1.5 text-xs uppercase font-semibold text-amber-950 hover:bg-amber-100/60 transition-all flex items-center gap-2 cursor-pointer rounded-lg"
                title="Buka Dashboard Pegawai"
              >
                <div class="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {$pegawaiUser?.name ? $pegawaiUser.name.charAt(0) : 'P'}
                </div>
                <span class="max-w-[120px] truncate">{$pegawaiUser?.name || 'Pegawai'}</span>
                <span class="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">STAF</span>
              </button>
              <div class="h-4 w-px bg-amber-200 my-auto mx-1"></div>
              <button
                on:click={logoutPegawai}
                title="Keluar dari sesi Pegawai"
                class="px-2 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer text-xs rounded-lg"
              >
                <Icon name="log-out" size={14} />
              </button>
            </div>
          {:else if $isAdminLoggedIn}
            <!-- Admin is Logged In -->
            <div class="flex items-center border border-slate-800 bg-slate-900 rounded-xl p-1 shadow-xs">
              <button
                on:click={() => handleNav('admin-dashboard')}
                class="px-3 py-1.5 text-xs uppercase font-semibold text-orange-400 hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer rounded-lg"
                title="Buka Dashboard Admin"
              >
                <Icon name="shield" size={14} />
                <span class="max-w-[120px] truncate">{$adminUser?.name || 'Admin IT'}</span>
                <span class="text-[9px] bg-orange-500/20 text-orange-300 font-bold px-1.5 py-0.5 rounded">ADMIN</span>
              </button>
              <div class="h-4 w-px bg-slate-700 my-auto mx-1"></div>
              <button
                on:click={logoutAdmin}
                title="Keluar dari sesi Administrator"
                class="px-2 py-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all cursor-pointer text-xs rounded-lg"
              >
                <Icon name="log-out" size={14} />
              </button>
            </div>
          {:else}
            <!-- Guest: Tombol Masuk -->
            <button
              on:click={() => handleNav('login')}
              class="px-3.5 py-2.5 text-xs uppercase font-semibold text-slate-700 hover:text-orange-600 bg-white hover:bg-orange-50/60 border border-slate-200 hover:border-orange-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs {$activeView === 'login' ? 'border-orange-500 text-orange-600 bg-orange-50 font-bold' : ''}"
              title="Masuk ke Akun (Klien, Pegawai, Admin)"
            >
              <div class="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <Icon name="user" size={12} />
              </div>
              <span>Masuk</span>
            </button>
          {/if}

          <button
            on:click={() => handleNav('services')}
            class="px-4 py-2.5 text-xs uppercase font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-md shadow-orange-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Pesan Layanan</span>
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>

      <!-- Mobile Hamburger & User Button -->
      <div class="flex items-center md:hidden gap-2">
        <button
          on:click={() => handleNav($currentUser ? ($isClientLoggedIn ? 'customer-dashboard' : $isPegawaiLoggedIn ? 'pegawai-dashboard' : 'admin-dashboard') : 'login')}
          class="p-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-center cursor-pointer"
          aria-label="Akun Pengguna"
          title="Masuk / Dashboard Akun"
        >
          <Icon name="user" size={18} className="text-orange-600" />
        </button>
        <button
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          class="p-2 border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-all cursor-pointer rounded-xl"
          aria-label="Menu"
        >
          <Icon name={mobileMenuOpen ? 'x' : 'menu'} size={20} />
        </button>
      </div>

    </div>
  </div>

  <!-- Mobile Drawer / Dropdown -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-t border-slate-200 bg-white px-6 sm:px-12 pt-4 pb-6 space-y-2 shadow-xl rounded-b-3xl">
      <button
        on:click={() => handleNav('home')}
        class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs uppercase font-medium {$activeView === 'home' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'}"
      >
        Beranda
      </button>
      <button
        on:click={() => handleNav('services')}
        class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs uppercase font-medium {$activeView === 'services' || $activeView === 'service-detail' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'}"
      >
        Layanan
      </button>
      <button
        on:click={() => handleNav('portfolio')}
        class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs uppercase font-medium {$activeView === 'portfolio' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'}"
      >
        Portofolio
      </button>
      <button
        on:click={() => handleNav('about')}
        class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs uppercase font-medium {$activeView === 'about' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'}"
      >
        Tentang Kami
      </button>
      <button
        on:click={() => handleNav('contact')}
        class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs uppercase font-medium {$activeView === 'contact' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-700 hover:bg-slate-50'}"
      >
        Kontak
      </button>

      <div class="pt-4 border-t border-slate-100 space-y-2">
        {#if $currentUser}
          <!-- Logged In State for Mobile -->
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full {$isClientLoggedIn ? 'bg-orange-600' : $isPegawaiLoggedIn ? 'bg-amber-600' : 'bg-slate-900'} text-white flex items-center justify-center text-xs font-bold">
                  {$currentUser.name ? $currentUser.name.charAt(0) : 'U'}
                </div>
                <div>
                  <strong class="text-xs text-slate-900 block leading-tight">{$currentUser.name}</strong>
                  <span class="text-[10px] text-slate-500 block">
                    Peran: <strong class="uppercase text-orange-600">{$userRole}</strong>
                  </span>
                </div>
              </div>
              <button
                on:click={logoutUser}
                class="px-2.5 py-1 text-xs text-rose-600 border border-rose-200 bg-white hover:bg-rose-50 rounded-lg font-semibold cursor-pointer"
              >
                Logout
              </button>
            </div>
            <button
              on:click={() => handleNav($isClientLoggedIn ? 'customer-dashboard' : $isPegawaiLoggedIn ? 'pegawai-dashboard' : 'admin-dashboard')}
              class="w-full py-2.5 px-3 text-center text-xs uppercase font-bold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              Buka Dashboard {$isClientLoggedIn ? 'Klien' : $isPegawaiLoggedIn ? 'Pegawai' : 'Admin'}
            </button>
          </div>
        {:else}
          <!-- Guest: Tombol Masuk -->
          <button
            on:click={() => handleNav('login')}
            class="w-full py-3 px-3 text-center text-xs uppercase font-bold border border-slate-200 bg-white hover:bg-orange-50 text-slate-800 hover:text-orange-600 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <div class="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <Icon name="user" size={14} />
            </div>
            <span>Masuk ke Akun</span>
          </button>
        {/if}

        <button
          on:click={() => handleNav('services')}
          class="w-full py-3 px-3 text-center text-xs uppercase font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md shadow-orange-600/20 cursor-pointer"
        >
          Pesan Layanan Digital
        </button>
      </div>

    </div>
  {/if}
</header>