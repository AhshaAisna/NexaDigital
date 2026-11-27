<script>
  import {
    orders,
    selectedOrderId,
    addMessageToOrder,
    submitRevisionRequest,
    navigateTo,
    formatRupiah,
    showToast,
  } from "../stores/marketplaceStore";
  import StatusBadge from "../components/StatusBadge.svelte";
  import Icon from "../components/Icon.svelte";
  import { onMount } from "svelte";

  // Dark Mode State
  let isDarkMode = false;

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

  $: currentOrder =
    $orders.find((o) => o.id === $selectedOrderId) || $orders[0];

  let chatInput = "";
  let activeTab = "timeline"; // 'timeline' | 'files' | 'messages' | 'revision'
  let revisionNotes = "";

  function handleSendMessage() {
    if (!chatInput.trim()) return;
    addMessageToOrder(
      currentOrder.id,
      chatInput,
      currentOrder.customer.name,
      "client",
    );
    chatInput = "";
  }

  function handleRevisionSubmit() {
    if (!revisionNotes.trim()) {
      showToast("Mohon tuliskan poin revisi yang dibutuhkan.", "error");
      return;
    }
    submitRevisionRequest(currentOrder.id, revisionNotes);
    revisionNotes = "";
    showToast("Tiket revisi berhasil dikirim ke tim rekayasa.", "success");
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

<div
  class="{isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-800'} min-h-screen font-['Poppins'] antialiased py-8 px-4 sm:px-6 lg:px-8 pb-24 relative transition-colors duration-300"
>
  <!-- Subtle Ambient Glow Orbs -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>
    <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[150px]"></div>
  </div>

  <div class="max-w-7xl mx-auto relative z-10 space-y-6">
    
    <!-- Top Bar Navigation & Actions -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b {isDarkMode ? 'border-slate-800' : 'border-slate-200'}"
    >
      <div class="space-y-1">
        <div
          class="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400 font-semibold"
        >
          <button
            onclick={() => navigateTo("customer-dashboard")}
            class="hover:text-orange-500 transition cursor-pointer"
          >
            PORTAL KLIEN
          </button>
          <span>/</span>
          <span class="text-orange-500 font-bold">PELACAKAN SPRINT</span>
        </div>
        <h1
          class="text-2xl sm:text-3xl font-semibold tracking-tight {isDarkMode ? 'text-white' : 'text-slate-900'} flex items-center gap-3 flex-wrap"
        >
          <span>{currentOrder.requirements?.title || currentOrder.serviceName}</span>
          <span
            class="font-mono text-xs px-3 py-1 bg-orange-600 text-white font-semibold rounded-lg"
          >
            {currentOrder.id}
          </span>
        </h1>
      </div>

      <!-- Quick Switcher for orders & Invoice Link & Theme Toggle -->
      <div class="flex items-center gap-2 flex-wrap text-xs">
        <select
          bind:value={$selectedOrderId}
          class="px-3.5 py-2.5 {isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'} border rounded-xl font-medium focus:outline-none focus:border-orange-500 cursor-pointer shadow-xs"
        >
          {#each $orders as ord}
            <option value={ord.id}>{ord.id} - {ord.serviceName}</option>
          {/each}
        </select>

        <button
          onclick={() => navigateTo("invoice", { orderId: currentOrder.id })}
          class="px-4 py-2.5 {isDarkMode ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'} border rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Icon name="file-text" size={14} />
          <span>Lihat Faktur</span>
        </button>

        <button
          type="button"
          onclick={toggleDarkMode}
          title="Ubah Tema"
          class="p-2.5 {isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'} border rounded-xl transition cursor-pointer flex items-center justify-center shadow-xs"
        >
          {#if isDarkMode}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          {/if}
        </button>
      </div>
    </div>

    <!-- Project Overview Ledger Console -->
    <div
      class="{isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} border p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 transition-colors"
    >
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
        <div class="space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-semibold block"
            >MODUL & PAKET</span
          >
          <div class="font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'} text-sm">
            {currentOrder.serviceName}
          </div>
          <span class="text-slate-400 block">{currentOrder.packageName}</span>
        </div>

        <div class="space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-semibold block"
            >LEAD SPECIALIST</span
          >
          <div class="font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'} text-sm">
            {currentOrder.assignedTeam}
          </div>
          <span class="text-orange-500 font-medium block">Tim Rekayasa Nexa</span>
        </div>

        <div class="space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-semibold block"
            >TARGET SERAH TERIMA</span
          >
          <div class="font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'} text-sm">
            {currentOrder.deadline}
          </div>
          <span class="text-slate-400 block"
            >Inisiasi: {currentOrder.orderDate}</span
          >
        </div>

        <div class="space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-semibold block"
            >STATUS OPERASIONAL</span
          >
          <div class="mt-1.5 flex items-center gap-2 flex-wrap">
            <StatusBadge status={currentOrder.projectStatus} />
            <StatusBadge status={currentOrder.paymentStatus} size="sm" />
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="pt-5 border-t {isDarkMode ? 'border-slate-800' : 'border-slate-100'} space-y-2">
        <div class="flex justify-between items-center text-xs font-semibold">
          <span class="{isDarkMode ? 'text-slate-300' : 'text-slate-700'} uppercase">AKUMULASI MILESTONE PROYEK</span>
          <span class="text-orange-500 font-mono font-bold text-sm"
            >{currentOrder.progress}% TERSELESAIKAN</span
          >
        </div>
        <div
          class="w-full h-3 {isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-orange-600 rounded-full transition-all duration-700 ease-out"
            style="width: {currentOrder.progress}%"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Console (Tabs) -->
    <div class="space-y-6">
      <div
        class="{isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} border p-2 rounded-2xl shadow-sm flex items-center gap-2 overflow-x-auto text-xs font-medium"
      >
        <button
          onclick={() => (activeTab = "timeline")}
          class="px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap {activeTab === 'timeline' ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20' : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}"
        >
          <span class="flex items-center gap-2">
            <Icon name="clock" size={15} />
            <span>Milestone Sprint</span>
          </span>
        </button>

        <button
          onclick={() => (activeTab = "messages")}
          class="px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-2 {activeTab === 'messages' ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20' : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}"
        >
          <span class="flex items-center gap-2">
            <Icon name="message-square" size={15} />
            <span>Kanal Obrolan PM</span>
            {#if currentOrder.messages && currentOrder.messages.length > 0}
              <span
                class="px-1.5 py-0.5 bg-orange-500 text-white rounded-md text-[10px] font-bold"
              >
                {currentOrder.messages.length}
              </span>
            {/if}
          </span>
        </button>

        <button
          onclick={() => (activeTab = "files")}
          class="px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap {activeTab === 'files' ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20' : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}"
        >
          <span class="flex items-center gap-2">
            <Icon name="file-text" size={15} />
            <span>Deliverables ({currentOrder.files?.length || 0})</span>
          </span>
        </button>

        <button
          onclick={() => (activeTab = "revision")}
          class="px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap {activeTab === 'revision' ? 'bg-orange-600 text-white font-semibold shadow-md shadow-orange-600/20' : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}"
        >
          <span class="flex items-center gap-2">
            <Icon name="refresh-cw" size={15} />
            <span>Ajukan Revisi</span>
          </span>
        </button>
      </div>

      <!-- TAB 1: TIMELINE -->
      {#if activeTab === "timeline"}
        <div
          class="{isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} border p-6 sm:p-8 space-y-6 rounded-3xl shadow-xl animate-fade-in transition-colors"
        >
          <div
            class="flex items-center justify-between border-b {isDarkMode ? 'border-slate-800' : 'border-slate-100'} pb-4"
          >
            <div>
              <span
                class="text-[10px] font-semibold text-orange-500 uppercase tracking-widest block"
                >[ LOG SPRINT RESMI ]</span
              >
              <h3 class="text-base font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'} mt-0.5">
                Daftar Milestone Pengerjaan
              </h3>
            </div>
            <span class="text-xs text-slate-400 font-medium"
              >UPDATE: <strong>HARI INI</strong></span
            >
          </div>

          <div
            class="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:h-full before:w-0.5 {isDarkMode ? 'before:bg-slate-800' : 'before:bg-slate-200'}"
          >
            {#each currentOrder.timeline as item, idx}
              <div class="relative flex items-start gap-5 pl-1">
                <!-- Dot marker -->
                <div
                  class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition {item.status ===
                  'completed'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : item.status === 'current'
                      ? 'bg-orange-600 text-white shadow-md animate-pulse'
                      : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')}"
                >
                  {#if item.status === "completed"}
                    <Icon name="check" size={13} />
                  {:else if item.status === "current"}
                    <span>●</span>
                  {:else}
                    <span class="text-[10px]">{idx + 1}</span>
                  {/if}
                </div>

                <!-- Content card -->
                <div
                  class="flex-1 {isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'} border p-4 space-y-1.5 rounded-2xl shadow-xs"
                >
                  <div
                    class="flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <span class="text-sm font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'}"
                      >{item.stage}</span
                    >
                    <span class="text-[11px] text-slate-400 font-medium"
                      >{item.date}</span
                    >
                  </div>
                  <p class="text-xs {isDarkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed">
                    {item.desc}
                  </p>
                  {#if item.status === "current"}
                    <div class="pt-1.5">
                      <span
                        class="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-lg"
                      >
                        <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                        TAHAPAN AKTIF DIKERJAKAN
                      </span>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- TAB 2: LIVE PM CHAT -->
      {#if activeTab === "messages"}
        <div
          class="{isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} border overflow-hidden rounded-3xl shadow-xl flex flex-col h-[580px] animate-fade-in transition-colors"
        >
          <!-- Chat Header -->
          <div
            class="px-6 py-4 {isDarkMode ? 'bg-slate-800/60 border-slate-800' : 'bg-slate-50 border-slate-100'} border-b flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-orange-600 text-white font-bold flex items-center justify-center rounded-xl text-xs shadow-md"
              >
                NX
              </div>
              <div>
                <div class="text-xs font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'}">
                  {currentOrder.assignedTeam}
                </div>
                <div
                  class="text-[11px] text-emerald-500 flex items-center gap-1.5 font-medium mt-0.5"
                >
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Kanal Langsung Aktif</span>
                </div>
              </div>
            </div>
            <span
              class="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:inline font-medium"
            >
              [ ENCRYPTED CHAT CHANNEL ]
            </span>
          </div>

          <!-- Chat Message Log -->
          <div class="flex-1 p-6 overflow-y-auto space-y-4 {isDarkMode ? 'bg-slate-950/40' : 'bg-slate-50/50'}">
            {#each currentOrder.messages || [] as msg}
              <div
                class="flex flex-col {msg.role === 'client'
                  ? 'items-end'
                  : 'items-start'} space-y-1"
              >
                <div
                  class="text-[10px] text-slate-400 font-medium px-1"
                >
                  {msg.sender} • {msg.time}
                </div>
                <div
                  class="max-w-md text-xs sm:text-sm p-4 leading-relaxed rounded-2xl shadow-xs {msg.role ===
                  'client'
                    ? 'bg-orange-600 text-white rounded-tr-xs'
                    : msg.role === 'system'
                      ? (isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')
                      : (isDarkMode ? 'bg-slate-800 text-white rounded-tl-xs' : 'bg-white text-slate-900 border border-slate-200 rounded-tl-xs')}"
                >
                  {msg.text}
                </div>
              </div>
            {/each}
          </div>

          <!-- Chat Input Form -->
          <div class="p-4 {isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-t">
            <form
              onsubmit.preventDefault={handleSendMessage}
              class="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ketik instruksi atau diskusi teknis untuk {currentOrder.assignedTeam}..."
                bind:value={chatInput}
                class="flex-1 px-4 py-3 text-xs {isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:border-orange-500 transition"
              />
              <button
                type="submit"
                class="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold uppercase transition flex items-center gap-1.5 cursor-pointer rounded-xl shadow-md shadow-orange-600/20"
              >
                <span>Kirim</span>
                <Icon name="send" size={13} />
              </button>
            </form>
            <div class="text-[10px] text-slate-400 mt-2 px-1">
              Setiap catatan obrolan akan terdokumentasi resmi di riwayat pengerjaan proyek.
            </div>
          </div>
        </div>
      {/if}

      <!-- TAB 3: FILES & DELIVERABLES -->
      {#if activeTab === "files"}
        <div
          class="{isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} border p-6 sm:p-8 space-y-6 rounded-3xl shadow-xl animate-fade-in transition-colors"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b {isDarkMode ? 'border-slate-800' : 'border-slate-100'} pb-4"
          >
            <div>
              <span
                class="text-[10px] font-semibold text-orange-500 uppercase tracking-widest block"
                >[ ARSIP BERKAS PRODUKSI ]</span
              >
              <h3 class="text-base font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'} mt-0.5">
                Berkas Deliverables & Aset Final
              </h3>
            </div>
            <button
              onclick={() =>
                showToast("Fitur unggah aset tambahan siap digunakan.", "info")}
              class="px-4 py-2.5 {isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} text-xs font-semibold uppercase transition flex items-center gap-1.5 cursor-pointer rounded-xl"
            >
              <Icon name="upload-cloud" size={14} />
              <span>Unggah Berkas Baru</span>
            </button>
          </div>

          <div class="divide-y {isDarkMode ? 'divide-slate-800 border-slate-800' : 'divide-slate-100 border-slate-200'} border rounded-2xl overflow-hidden">
            {#each currentOrder.files || [] as file}
              <div
                class="p-4 flex items-center justify-between {isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'} transition text-xs"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 border {isDarkMode ? 'border-slate-700 bg-slate-800 text-orange-400' : 'border-slate-200 bg-slate-100 text-slate-700'} rounded-xl flex items-center justify-center font-bold text-[10px] uppercase"
                  >
                    {file.type}
                  </div>
                  <div>
                    <div class="font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'} text-xs">
                      {file.name}
                    </div>
                    <div class="text-[11px] text-slate-400 mt-0.5">
                      {file.size} • Diunggah {file.date}
                    </div>
                  </div>
                </div>

                <button
                  onclick={() =>
                    showToast(`Mengunduh berkas ${file.name}...`, "success")}
                  class="px-3.5 py-2 {isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'} border font-semibold text-xs uppercase flex items-center gap-1.5 transition cursor-pointer rounded-xl shadow-xs"
                >
                  <Icon name="download" size={13} />
                  <span>Unduh</span>
                </button>
              </div>
            {/each}

            {#if !currentOrder.files || currentOrder.files.length === 0}
              <div class="p-8 text-center text-xs text-slate-400">
                Belum ada berkas produksi yang diunggah pada sesi ini.
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- TAB 4: SUBMIT REVISION REQUEST -->
      {#if activeTab === "revision"}
        <div
          class="{isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} border p-6 sm:p-8 space-y-6 rounded-3xl shadow-xl animate-fade-in max-w-2xl transition-colors"
        >
          <div class="border-b {isDarkMode ? 'border-slate-800' : 'border-slate-100'} pb-4 space-y-1">
            <span
              class="text-[10px] font-semibold uppercase tracking-widest text-orange-500 block"
              >[ JAMINAN SLA REVISI ]</span
            >
            <h3 class="text-base font-semibold {isDarkMode ? 'text-white' : 'text-slate-900'}">
              Formulir Pengajuan Revisi Proyek
            </h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Uraikan poin penyesuaian yang diperlukan agar tim rekayasa kami dapat langsung menjadwalkan perbaikan ke sprint berjalan.
            </p>
          </div>

          <div class="space-y-4">
            <div
              class="p-4 {isDarkMode ? 'bg-orange-950/20 border-orange-900/40 text-orange-200' : 'bg-orange-50 border-orange-200/60 text-slate-800'} border rounded-2xl text-xs space-y-1.5"
            >
              <span
                class="font-bold block uppercase text-orange-500 text-[11px]"
                >Sisa Kuota: Sesuai Ketentuan Paket {currentOrder.packageName}</span
              >
              <p class="text-[11px] {isDarkMode ? 'text-orange-300/80' : 'text-slate-600'} leading-relaxed">
                Revisi mencakup penyesuaian detail layout, copy, hierarki komponen, atau perbaikan bug yang berada dalam ruang lingkup awal (SoW).
              </p>
            </div>

            <label class="block space-y-1.5">
              <span
                class="block text-xs font-semibold {isDarkMode ? 'text-slate-300' : 'text-slate-700'} uppercase"
                >Rincian Catatan Revisi *</span
              >
              <textarea
                rows="5"
                bind:value={revisionNotes}
                placeholder="Tuliskan nomor halaman / komponen yang perlu disesuaikan serta instruksi perbaikan yang diharapkan..."
                class="w-full px-4 py-3 text-xs {isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:border-orange-500 transition"
              ></textarea>
            </label>

            <button
              onclick={handleRevisionSubmit}
              class="px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs uppercase rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <Icon name="refresh-cw" size={14} />
              <span>Kirim Tiket Revisi ke Tim Rekayasa</span>
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>