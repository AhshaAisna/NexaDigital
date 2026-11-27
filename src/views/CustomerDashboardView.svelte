<script>
  import {
    orders,
    selectedOrderId,
    navigateTo,
    formatRupiah,
    showToast,
  } from "../stores/marketplaceStore";
  import {
    isClientLoggedIn,
    clientUser,
    logoutClient
  } from "../stores/authStore";
  import StatusBadge from "../components/StatusBadge.svelte";
  import Icon from "../components/Icon.svelte";
  import { startMidtransPaymentForOrder } from "../lib/services/midtransService";
  import { onMount } from "svelte";

  // Active Tab State
  let currentClientTab = "overview"; // 'overview' | 'orders' | 'invoices' | 'support'

  // Dark Mode State
  let isDarkMode = false;

  // Foto Profil Klien (Menggunakan foto profesional dari Unsplash)
  const clientAvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";

  onMount(() => {
    const savedTheme = localStorage.getItem("nexa_client_theme");
    if (savedTheme) {
      isDarkMode = savedTheme === "dark";
    } else {
      isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  });

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem("nexa_client_theme", isDarkMode ? "dark" : "light");
  }

  let invoiceSearchQuery = "";
  let invoiceStatusFilter = "all";

  // Calculations
  $: totalOrdersCount = $orders.length;
  $: activeOrdersCount = $orders.filter(
    (o) => o.projectStatus !== "Selesai" && o.projectStatus !== "Dibatalkan",
  ).length;
  $: completedOrdersCount = $orders.filter(
    (o) => o.projectStatus === "Selesai",
  ).length;
  $: pendingPaymentCount = $orders.filter(
    (o) => o.paymentStatus === "PENDING",
  ).length;
  $: totalSpending = $orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Filtered invoices
  $: filteredInvoices = $orders.filter((o) => {
    const matchQuery =
      o.invoiceNumber
        .toLowerCase()
        .includes(invoiceSearchQuery.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(invoiceSearchQuery.toLowerCase());
    const matchStatus =
      invoiceStatusFilter === "all" ||
      o.paymentStatus.toLowerCase() === invoiceStatusFilter.toLowerCase();
    return matchQuery && matchStatus;
  });

  function openOrderTracking(orderId) {
    selectedOrderId.set(orderId);
    navigateTo("project-tracker", { orderId });
  }

  function openInvoice(orderId) {
    selectedOrderId.set(orderId);
    navigateTo("invoice", { orderId });
  }

  let payingOrderId = null;
  async function payPendingOrder(order) {
    if (!order || payingOrderId) return;
    payingOrderId = order.id;
    try {
      await startMidtransPaymentForOrder(order, {
        onSuccess: () => {
          payingOrderId = null;
          showToast(`Pembayaran untuk ${order.invoiceNumber || order.id} berhasil diverifikasi!`, "success");
        },
        onPending: () => {
          payingOrderId = null;
          showToast("Pembayaran berstatus PENDING. Selesaikan sesuai instruksi Midtrans.", "info");
        },
        onError: () => {
          payingOrderId = null;
          showToast("Pembayaran Midtrans gagal diproses.", "error");
        },
        onClose: () => {
          payingOrderId = null;
        }
      });
    } catch (err) {
      payingOrderId = null;
      showToast(err.message || "Gagal membuka Midtrans Snap.", "error");
    }
  }
</script>

<svelte:head>
  <!-- Google Fonts: Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<style>
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
  :global(body) {
    margin: 0 !important;
    padding: 0 !important;
  }
</style>

{#if !$isClientLoggedIn}
  <!-- ==================== CLIENT AUTH REQUIRED GATE ==================== -->
  <div class="min-h-screen bg-[#f4f4f5] text-[#09090b] flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white border border-[#ececee] p-8 rounded-[36px] shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 bg-[#ff5a00]/10 text-[#ff5a00] rounded-[24px] mx-auto flex items-center justify-center shadow-xs">
        <Icon name="user" size={28} />
      </div>

      <div class="space-y-2">
        <span class="px-3 py-1 rounded-[12px] bg-[#ff5a00]/10 text-[#ff5a00] text-[11px] font-semibold uppercase tracking-wider">
          Portal Klien Resmi
        </span>
        <h1 class="text-xl font-semibold text-[#09090b] tracking-tight">
          Akses Dashboard Klien
        </h1>
        <p class="text-[13px] text-[#52525b] leading-relaxed">
          Silakan masuk ke akun Klien Anda untuk memantau progres sprint pengerjaan, berdiskusi dengan tim teknis, dan mengunduh faktur resmi.
        </p>
      </div>

      <div class="space-y-3 pt-2 text-xs">
        <button
          type="button"
          onclick={() => navigateTo('client-login')}
          class="w-full py-3.5 px-4 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold uppercase tracking-wider transition cursor-pointer rounded-[14px] shadow-md shadow-[#ff5a00]/30 flex items-center justify-center gap-2"
        >
          <span>Masuk / Daftar Akun Klien</span>
          <Icon name="arrow-right" size={14} />
        </button>

        <button
          type="button"
          onclick={() => navigateTo('home')}
          class="w-full py-3.5 px-4 bg-[#fafafa] hover:bg-[#ececee] text-[#18181b] font-medium uppercase border border-[#ececee] transition cursor-pointer rounded-[14px]"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  </div>
{:else}
  <!-- ==================== AUTHORIZED CLIENT WORKSPACE ==================== -->
  <div
    class="{isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f4f4f5] text-[#09090b]'} min-h-screen font-['Plus_Jakarta_Sans',sans-serif] antialiased py-12 pb-24 relative transition-colors duration-300 w-full selection:bg-[#ff5a00] selection:text-white"
  >
    <!-- Ambient Glow Orbs -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#ff5a00]/5 rounded-full blur-[120px]"></div>
      <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[150px]"></div>
    </div>

    <div class="w-full px-6 sm:px-12 lg:px-20 relative z-10 space-y-10">

      <!-- ==================== STICKY TOP NAVIGATION BAR ==================== -->
      <header class="sticky top-6 z-50 {isDarkMode ? 'bg-[#18181b]/90 border-[#27272a] text-[#f4f4f5] shadow-2xl' : 'bg-white/90 border-[#ececee] text-[#09090b] shadow-xl'} backdrop-blur-2xl border px-6 py-4 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 w-full">
        
        <!-- Client Identity & Profile Badge (Menggunakan Foto Profil Asli) -->
        <div class="flex items-center gap-3.5 w-full md:w-auto">
          <div class="w-10 h-10 rounded-[14px] overflow-hidden shrink-0 shadow-xs border {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
            <img 
              src={$clientUser?.avatar || clientAvatarUrl} 
              alt="Foto Profil Klien" 
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <div class="font-semibold text-[13px] tracking-wide {isDarkMode ? 'text-white' : 'text-[#09090b]'} truncate">
              {$clientUser?.name || 'Rian Hidayat'}
            </div>
            <div class="text-[11px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'} truncate">
              {$clientUser?.email || 'rian.hidayat@startupkita.id'}
            </div>
          </div>
        </div>

        <!-- Horizontal Navigation Tabs (Dipindah ke Sisi Kanan Sebelum Tombol Aksi) -->
        <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-end">
          <nav class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-[13px] font-medium">
            <button
              type="button"
              onclick={() => (currentClientTab = "overview")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentClientTab === 'overview' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              Dashboard
            </button>
            <button
              type="button"
              onclick={() => (currentClientTab = "orders")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 {currentClientTab === 'orders' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              <span>Pesanan Saya</span>
              <span class="px-1.5 py-0.5 rounded-full bg-[#ff5a00] text-white text-[10px] font-bold">
                {totalOrdersCount}
              </span>
            </button>
            <button
              type="button"
              onclick={() => (currentClientTab = "invoices")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentClientTab === 'invoices' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              Riwayat Invoice
            </button>
            <button
              type="button"
              onclick={() => (currentClientTab = "support")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentClientTab === 'support' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              Pusat Bantuan PIC
            </button>
          </nav>

          <!-- Action Buttons (Theme Toggle, Home, Logout) -->
          <div class="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onclick={toggleDarkMode}
              title={isDarkMode ? "Ubah ke Light Mode" : "Ubah ke Dark Mode"}
              class="p-2.5 {isDarkMode ? 'bg-[#27272a] text-amber-400 hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} rounded-[14px] transition cursor-pointer flex items-center justify-center shadow-xs"
            >
              {#if isDarkMode}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              {/if}
            </button>

            <button
              type="button"
              onclick={() => navigateTo("home")}
              class="px-4 py-2.5 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:text-white hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:text-[#09090b] hover:bg-[#ececee] border border-[#ececee]'} rounded-[14px] transition flex items-center gap-1.5 font-medium text-[13px] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onclick={logoutClient}
              class="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-[14px] transition flex items-center gap-1.5 font-medium text-[13px] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

      </header>

      <!-- ==================== MAIN CONTENT AREA ==================== -->
      <main class="space-y-8">

        <!-- ==================== TAB 1: OVERVIEW ==================== -->
        {#if currentClientTab === "overview"}
          <div class="space-y-8 animate-fade-in">
            <!-- Welcome Header Console -->
            <div
              class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border p-8 sm:p-12 rounded-[36px] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300"
            >
              <div class="space-y-3 max-w-2xl">
                <span
                  class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-widest block"
                  >[ PORTAL KLIEN RESMI ]</span
                >
                <h1
                  class="text-3xl sm:text-4xl font-semibold tracking-tight {isDarkMode ? 'text-white' : 'text-[#09090b]'}"
                >
                  Selamat Datang Kembali, {$clientUser?.name || 'Rian'}
                </h1>
                <p class="text-[14px] sm:text-[16px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                  Pantau seluruh status eksekusi sprint dan status pelunasan faktur secara berkala.
                </p>
              </div>
              <button
                type="button"
                onclick={() => navigateTo("checkout")}
                class="px-6 py-3.5 bg-[#ff5a00] hover:bg-[#e05000] text-white text-[13px] uppercase font-semibold transition flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 rounded-[14px] shadow-lg shadow-[#ff5a00]/30"
              >
                <span>+ Pesan Layanan Baru</span>
              </button>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors"
              >
                <span
                  class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block"
                  >Proyek Aktif</span
                >
                <div class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} font-mono">
                  {activeOrdersCount}
                </div>
                <span
                  class="text-[11px] text-[#ff5a00] font-medium block"
                  >Dalam Pengerjaan</span
                >
              </div>

              <div
                class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors"
              >
                <span
                  class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block"
                  >Proyek Selesai</span
                >
                <div class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} font-mono">
                  {completedOrdersCount}
                </div>
                <span
                  class="text-[11px] text-emerald-500 font-medium block"
                  >Serah Terima Selesai</span
                >
              </div>

              <div
                class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors"
              >
                <span
                  class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block"
                  >Tagihan Tertunda</span
                >
                <div
                  class="text-2xl sm:text-3xl font-semibold font-mono {pendingPaymentCount > 0
                    ? 'text-[#ff5a00]'
                    : (isDarkMode ? 'text-white' : 'text-[#09090b]')}"
                >
                  {pendingPaymentCount}
                </div>
                <span class="text-[11px] text-[#71717a] block"
                  >Menunggu Pelunasan</span
                >
              </div>

              <div
                class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors"
              >
                <span
                  class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block"
                  >Total Belanja</span
                >
                <div
                  class="text-xl sm:text-2xl font-semibold font-mono {isDarkMode ? 'text-white' : 'text-[#09090b]'} truncate mt-1"
                >
                  {formatRupiah(totalSpending)}
                </div>
                <span class="text-[11px] text-[#71717a] block"
                  >Invoice Terbayar</span
                >
              </div>
            </div>

            <!-- Active Projects Highlight -->
            <div
              class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 space-y-6 rounded-[36px] shadow-xs transition-colors"
            >
              <div
                class="flex items-center justify-between border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-5"
              >
                <div>
                  <span
                    class="text-[12px] text-[#ff5a00] font-semibold uppercase tracking-widest block"
                    >[ MILESTONE RUNNING ]</span
                  >
                  <h3 class="text-lg font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">
                    Proyek yang Sedang Berjalan
                  </h3>
                </div>
                <button
                  type="button"
                  onclick={() => (currentClientTab = "orders")}
                  class="text-[13px] uppercase font-semibold text-[#ff5a00] hover:text-[#e05000] transition cursor-pointer"
                >
                  Lihat Semua ({totalOrdersCount}) &rarr;
                </button>
              </div>

              <div class="space-y-4">
                {#each $orders.slice(0, 3) as ord}
                  <div
                    class="p-6 border {isDarkMode ? 'border-[#27272a] bg-[#27272a]/30' : 'border-[#ececee] bg-[#fafafa]'} space-y-4 rounded-[24px]"
                  >
                    <div
                      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div class="flex items-center gap-2.5">
                          <span
                            class="px-2.5 py-0.5 bg-[#ff5a00] text-white text-[11px] font-bold rounded-[12px] font-mono"
                            >{ord.id}</span
                          >
                          <h4
                            class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} text-base"
                          >
                            {ord.serviceName}
                          </h4>
                        </div>
                        <p class="text-[13px] text-[#71717a] mt-1">
                          {ord.packageName} &bull; Target Rilis:
                          <strong class="{isDarkMode ? 'text-[#f4f4f5]' : 'text-[#09090b]'} font-semibold">{ord.deadline}</strong>
                        </p>
                      </div>

                      <div class="flex items-center gap-2.5 flex-wrap">
                        <StatusBadge status={ord.projectStatus} />
                        <StatusBadge status={ord.paymentStatus} size="sm" />
                      </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="space-y-2 pt-1">
                      <div
                        class="flex justify-between text-[12px] font-semibold {isDarkMode ? 'text-[#f4f4f5]' : 'text-[#09090b]'}"
                      >
                        <span class="text-[#71717a]">PROGRES PENGERJAAN SPRINT</span>
                        <span class="text-[#ff5a00] font-mono">{ord.progress}%</span>
                      </div>
                      <div
                        class="w-full h-2.5 {isDarkMode ? 'bg-[#3f3f46]' : 'bg-[#ececee]'} rounded-full overflow-hidden"
                      >
                        <div
                          class="h-full bg-gradient-to-r from-[#ff5a00] to-amber-500 rounded-full transition-all duration-500 ease-out"
                          style="width: {ord.progress}%"
                        ></div>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div
                      class="pt-4 border-t {isDarkMode ? 'border-[#3f3f46]' : 'border-[#ececee]'} flex items-center justify-end gap-3 text-[13px] font-medium"
                    >
                      <button
                        type="button"
                        onclick={() => openInvoice(ord.id)}
                        class="px-4 py-2.5 border {isDarkMode ? 'border-[#3f3f46] bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5]' : 'border-[#ececee] bg-white hover:bg-[#fafafa] text-[#18181b]'} transition flex items-center gap-1.5 cursor-pointer rounded-[14px] shadow-xs"
                      >
                        <Icon name="file-text" size={14} />
                        <span>Invoice</span>
                      </button>
                      <button
                        type="button"
                        onclick={() => openOrderTracking(ord.id)}
                        class="px-5 py-2.5 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} transition flex items-center gap-1.5 cursor-pointer rounded-[14px] shadow-sm"
                      >
                        <Icon name="clock" size={14} />
                        <span>Lacak Milestone & Chat</span>
                      </button>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <!-- ==================== TAB 2: MY ORDERS TABLE ==================== -->
        {#if currentClientTab === "orders"}
          <div
            class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 space-y-6 rounded-[36px] shadow-xs animate-fade-in transition-colors"
          >
            <div class="border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-5">
              <span
                class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-widest block"
                >[ DAFTAR KONTRAK ]</span
              >
              <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">
                Daftar Pesanan Layanan Anda
              </h2>
              <p class="text-[13px] text-[#71717a] mt-1">
                Seluruh arsip pesanan digital beserta status penyelesaian milestone.
              </p>
            </div>

            <div class="overflow-x-auto text-[13px]">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr
                    class="{isDarkMode ? 'border-[#27272a] text-[#71717a]' : 'border-[#ececee] text-[#71717a]'} border-b font-semibold uppercase tracking-wider text-[11px]"
                  >
                    <th class="py-3.5 px-4">Order ID</th>
                    <th class="py-3.5 px-4">Layanan & Paket</th>
                    <th class="py-3.5 px-4">Tanggal</th>
                    <th class="py-3.5 px-4">Biaya</th>
                    <th class="py-3.5 px-4">Progres</th>
                    <th class="py-3.5 px-4">Status</th>
                    <th class="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y {isDarkMode ? 'divide-[#27272a]' : 'divide-[#ececee]'}">
                  {#each $orders as o}
                    <tr class="{isDarkMode ? 'hover:bg-[#27272a]/30' : 'hover:bg-[#fafafa]'} transition-colors">
                      <td class="py-4 px-4 font-semibold font-mono text-[#ff5a00]">{o.id}</td>
                      <td class="py-4 px-4">
                        <div class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
                          {o.serviceName}
                        </div>
                        <div
                          class="text-[11px] text-[#71717a] mt-0.5"
                        >
                          {o.packageName}
                        </div>
                      </td>
                      <td class="py-4 px-4 text-[#71717a]">{o.orderDate}</td>
                      <td class="py-4 px-4 font-semibold font-mono {isDarkMode ? 'text-white' : 'text-[#09090b]'}"
                        >{formatRupiah(o.total)}</td
                      >
                      <td class="py-4 px-4">
                        <div class="w-28 space-y-1">
                          <div class="text-[11px] text-[#ff5a00] font-semibold font-mono">
                            {o.progress}%
                          </div>
                          <div
                            class="h-2 {isDarkMode ? 'bg-[#3f3f46]' : 'bg-[#ececee]'} rounded-full overflow-hidden"
                          >
                            <div
                              class="h-full bg-gradient-to-r from-[#ff5a00] to-amber-500 rounded-full"
                              style="width: {o.progress}%"
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td class="py-4 px-4">
                        <StatusBadge status={o.projectStatus} size="sm" />
                      </td>
                      <td class="py-4 px-4 text-right">
                        <button
                          type="button"
                          onclick={() => openOrderTracking(o.id)}
                          class="px-4 py-2 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} font-medium uppercase text-[12px] transition cursor-pointer rounded-[12px] shadow-xs"
                        >
                          Lacak
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/if}

        <!-- ==================== TAB 3: INVOICES ==================== -->
        {#if currentClientTab === "invoices"}
          <div
            class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 space-y-6 rounded-[36px] shadow-xs animate-fade-in transition-colors"
          >
            <div
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-5"
            >
              <div>
                <span
                  class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-widest block"
                  >[ BUKTI BAYAR & E-FAKTUR ]</span
                >
                <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">
                  Riwayat Invoice & Faktur Pajak
                </h2>
                <p class="text-[13px] text-[#71717a] mt-1">
                  Dokumen tagihan resmi untuk pencatatan akuntansi dan perpajakan Anda.
                </p>
              </div>

              <button
                type="button"
                onclick={() => window.print()}
                class="px-4 py-2.5 border {isDarkMode ? 'border-[#3f3f46] bg-[#27272a] text-[#f4f4f5] hover:bg-[#3f3f46]' : 'border-[#ececee] bg-[#fafafa] text-[#52525b] hover:bg-[#ececee]'} text-[13px] font-medium uppercase flex items-center gap-2 cursor-pointer shrink-0 rounded-[14px]"
              >
                <Icon name="printer" size={14} />
                <span>Cetak Laporan</span>
              </button>
            </div>

            <!-- Search & Filter Console -->
            <div class="flex flex-col sm:flex-row gap-3.5 text-[13px]">
              <div class="relative flex-1">
                <Icon
                  name="search"
                  size={16}
                  className="absolute left-3.5 top-3.5 text-[#71717a]"
                />
                <input
                  type="text"
                  placeholder="Cari nomor invoice (INV-...) atau layanan..."
                  bind:value={invoiceSearchQuery}
                  class="w-full pl-10 pr-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium transition"
                />
              </div>

              <select
                bind:value={invoiceStatusFilter}
                class="px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} font-semibold focus:outline-none focus:border-[#ff5a00] cursor-pointer rounded-[16px]"
              >
                <option value="all">Semua Status Pembayaran</option>
                <option value="paid">Lunas (PAID)</option>
                <option value="pending">Menunggu (PENDING)</option>
              </select>
            </div>

            <!-- Invoices Table -->
            <div class="overflow-x-auto text-[13px]">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr
                    class="{isDarkMode ? 'border-[#27272a] text-[#71717a]' : 'border-[#ececee] text-[#71717a]'} border-b font-semibold uppercase tracking-wider text-[11px]"
                  >
                    <th class="py-3.5 px-4">No. Invoice</th>
                    <th class="py-3.5 px-4">Order ID</th>
                    <th class="py-3.5 px-4">Layanan</th>
                    <th class="py-3.5 px-4">Tanggal Terbit</th>
                    <th class="py-3.5 px-4">Total Bayar</th>
                    <th class="py-3.5 px-4">Status</th>
                    <th class="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y {isDarkMode ? 'divide-[#27272a]' : 'divide-[#ececee]'}">
                  {#each filteredInvoices as inv}
                    <tr class="{isDarkMode ? 'hover:bg-[#27272a]/30' : 'hover:bg-[#fafafa]'} transition-colors">
                      <td class="py-4 px-4 font-bold font-mono text-[#ff5a00]"
                        >{inv.invoiceNumber}</td
                      >
                      <td class="py-4 px-4 font-mono text-[#71717a]">{inv.id}</td>
                      <td class="py-4 px-4 font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}"
                        >{inv.serviceName}</td
                      >
                      <td class="py-4 px-4 text-[#71717a]">{inv.orderDate}</td>
                      <td class="py-4 px-4 font-mono font-bold {isDarkMode ? 'text-white' : 'text-[#09090b]'}"
                        >{formatRupiah(inv.total)}</td
                      >
                      <td class="py-4 px-4">
                        <StatusBadge status={inv.paymentStatus} size="sm" />
                      </td>
                      <td class="py-4 px-4 text-right">
                        <div class="inline-flex items-center justify-end gap-2">
                          {#if inv.paymentStatus !== "PAID"}
                            <button
                              type="button"
                              disabled={payingOrderId === inv.id}
                              onclick={() => payPendingOrder(inv)}
                              class="px-3.5 py-2 bg-[#ff5a00] hover:bg-[#e05000] disabled:opacity-50 text-white font-semibold uppercase text-[12px] transition rounded-[12px] shadow-xs cursor-pointer"
                            >
                              {payingOrderId === inv.id ? "..." : "Bayar"}
                            </button>
                          {/if}
                          <button
                            type="button"
                            onclick={() => openInvoice(inv.id)}
                            class="px-4 py-2 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} font-medium uppercase text-[12px] transition rounded-[12px] shadow-xs cursor-pointer"
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  {/each}

                  {#if filteredInvoices.length === 0}
                    <tr>
                      <td
                        colspan="7"
                        class="py-12 text-center text-[#71717a]"
                      >
                        Tidak ada invoice yang sesuai dengan parameter pencarian.
                      </td>
                    </tr>
                  {/if}
                </tbody>
              </table>
            </div>
          </div>
        {/if}

        <!-- ==================== TAB 4: SUPPORT & COMMUNICATION ==================== -->
        {#if currentClientTab === "support"}
          <div
            class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 space-y-6 rounded-[36px] shadow-xs animate-fade-in transition-colors"
          >
            <div class="border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-5">
              <span
                class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-widest block"
                >[ PUSAT BANTUAN KLIEN ]</span
              >
              <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">
                Pusat Komunikasi & Layanan PIC
              </h2>
              <p class="text-[13px] text-[#71717a] mt-1">
                Hubungi PIC teknis atau Project Manager studio secara langsung untuk konsultasi cepat.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="p-8 border {isDarkMode ? 'border-[#27272a] bg-[#27272a]/30' : 'border-[#ececee] bg-[#fafafa]'} rounded-[28px] space-y-4">
                <div class="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-[18px] flex items-center justify-center">
                  <Icon name="phone" size={22} />
                </div>
                <div class="space-y-1.5">
                  <h3 class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} text-lg">WhatsApp Official PIC</h3>
                  <p class="text-[13px] text-[#71717a] leading-relaxed">
                    Respon cepat dalam jam operasional (Senin - Jumat, 09:00 - 17:00 WIB).
                  </p>
                </div>
                <a
                  href="https://wa.me/628581203034"
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[13px] uppercase transition rounded-[14px] shadow-md"
                >
                  <Icon name="phone" size={14} />
                  <span>Chat WhatsApp Sekarang</span>
                </a>
              </div>

              <div class="p-8 border {isDarkMode ? 'border-[#27272a] bg-[#27272a]/30' : 'border-[#ececee] bg-[#fafafa]'} rounded-[28px] space-y-4">
                <div class="w-12 h-12 bg-[#ff5a00]/10 text-[#ff5a00] rounded-[18px] flex items-center justify-center">
                  <Icon name="message-square" size={22} />
                </div>
                <div class="space-y-1.5">
                  <h3 class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} text-lg">Workspace & Chat Milestone</h3>
                  <p class="text-[13px] text-[#71717a] leading-relaxed">
                    Diskusikan revisi langsung pada masing-masing modul proyek yang sedang dikerjakan.
                  </p>
                </div>
                <button
                  type="button"
                  onclick={() => {
                    if ($orders.length > 0) {
                      selectedOrderId.set($orders[0].id);
                      navigateTo("project-tracker", { orderId: $orders[0].id });
                    } else {
                      showToast("Belum ada proyek aktif.", "info");
                    }
                  }}
                  class="w-full py-3.5 bg-[#ff5a00] hover:bg-[#e05000] text-white font-medium text-[13px] uppercase transition rounded-[14px] shadow-md cursor-pointer"
                >
                  Buka Ruang Diskusi Proyek
                </button>
              </div>
            </div>
          </div>
        {/if}

      </main>

    </div>
  </div>
{/if}