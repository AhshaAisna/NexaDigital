<script>
  import {
    orders,
    invoices,
    selectedOrderId,
    formatRupiah,
    navigateTo,
    showToast,
    acceptDealProject,
    createPegawaiDealOrder,
    saveCustomInvoice,
    addMessageToOrder,
    updateOrderStatusByAdmin,
    updatePaymentStatusByAdmin
  } from "../stores/marketplaceStore";
  import {
    isPegawaiLoggedIn,
    pegawaiUser,
    logoutPegawai,
    isClientLoggedIn,
    clientUser,
    logoutClient
  } from "../stores/authStore";
  import { clients, products, syncClientsWithBackend, syncProductsWithBackend } from "../stores/adminStore";
  import { services } from "../data/services";
  import { INVOICE_TEMPLATES, buildInvoiceDataFromOrder } from "../data/invoiceTemplates";
  import InvoiceTemplateRenderer from "../components/InvoiceTemplateRenderer.svelte";
  import StatusBadge from "../components/StatusBadge.svelte";
  import Icon from "../components/Icon.svelte";
  import { onMount } from "svelte";

  let currentTab = "overview";
  let isDarkMode = false;
  const pegawaiAvatarUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80";

  onMount(() => {
    syncClientsWithBackend();
    syncProductsWithBackend();
    const saved = localStorage.getItem("nexa_pegawai_theme");
    if (saved) {
      isDarkMode = saved === "dark";
    } else {
      isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  });

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem("nexa_pegawai_theme", isDarkMode ? "dark" : "light");
  }

  let orderSearchQuery = "";
  let orderStatusFilter = "all";

  $: filteredOrders = $orders.filter((o) => {
    const q = orderSearchQuery.toLowerCase();
    const matchQuery =
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.customer?.name || "").toLowerCase().includes(q) ||
      (o.customer?.company || "").toLowerCase().includes(q) ||
      (o.serviceName || "").toLowerCase().includes(q) ||
      (o.invoiceNumber || "").toLowerCase().includes(q);

    const matchStatus =
      orderStatusFilter === "all" ||
      (orderStatusFilter === "need-deal" && (o.projectStatus === "Menunggu Kebutuhan" || o.projectStatus === "Menunggu Pembayaran" || o.paymentStatus === "PENDING")) ||
      (orderStatusFilter === "in-progress" && o.projectStatus === "Sedang Dikerjakan") ||
      (orderStatusFilter === "revision" && o.projectStatus === "Tahap Revisi") ||
      (orderStatusFilter === "completed" && o.projectStatus === "Selesai");

    return matchQuery && matchStatus;
  });

  $: totalOrdersCount = $orders.length;
  $: dealOrdersCount = $orders.filter((o) => o.projectStatus !== "Menunggu Pembayaran" && o.projectStatus !== "Dibatalkan").length;
  $: needDealCount = $orders.filter((o) => o.projectStatus === "Menunggu Kebutuhan" || o.projectStatus === "Menunggu Pembayaran" || o.paymentStatus === "PENDING").length;
  $: activeSprintCount = $orders.filter((o) => o.projectStatus === "Sedang Dikerjakan" || o.projectStatus === "Tahap Revisi").length;
  $: totalInvoicesCount = $invoices.length;

  let newDealForm = {
    customerName: "",
    customerCompany: "",
    customerEmail: "",
    customerPhone: "+62 ",
    customerAddress: "",
    serviceId: "ui-ux-design",
    serviceName: "UI/UX Design",
    packageId: "standard",
    packageName: "Standard",
    projectTitle: "",
    projectDescription: "",
    price: 1500000,
    discount: 0,
    deliveryDays: 7,
    paymentMethod: "Bank Transfer BCA",
    paymentStatus: "PAID",
    notes: "Projek resmi disepakati via konsultasi staf operasional."
  };

  let selectedClientId = "";

  function handleDealClientSelect(clientId) {
    selectedClientId = clientId;
    const target = $clients.find((c) => (c.id === clientId || c.email === clientId));
    if (target) {
      newDealForm.customerName = target.name || "";
      newDealForm.customerCompany = target.company || "-";
      newDealForm.customerEmail = target.email || "";
      newDealForm.customerPhone = target.phone || "-";
      newDealForm.customerAddress = target.address || "";
      if (newDealForm.serviceName) {
        newDealForm.projectTitle = `Projek ${newDealForm.serviceName} - ${target.name}`;
      }
    }
  }

  $: if ($clients && $clients.length > 0 && !selectedClientId && !newDealForm.customerName) {
    handleDealClientSelect($clients[0].id || $clients[0].email);
  }

  function handleServiceChange(e) {
    const sid = e.target.value;
    const s = services.find((srv) => srv.id === sid);
    if (s) {
      newDealForm.serviceId = s.id;
      newDealForm.serviceName = s.name;
      newDealForm.price = s.startingPrice;
      newDealForm.projectTitle = `Projek ${s.name} Klien`;
    }
  }

  async function handleCreateNewDeal() {
    if (!newDealForm.customerName.trim() || !newDealForm.customerEmail.trim()) {
      showToast("Pilih data klien dari database terlebih dahulu!", "error");
      return;
    }
    if (!newDealForm.projectTitle.trim()) {
      newDealForm.projectTitle = `Projek ${newDealForm.serviceName} - ${newDealForm.customerName}`;
    }

    const employeeName = $pegawaiUser?.name || "Bagas Pratama (Staff Operasional)";
    const created = await createPegawaiDealOrder(newDealForm, employeeName);
    if (created) {
      loadOrderIntoInvoiceBuilder(created.id);
    }
  }

  function handleAcceptDeal(orderId) {
    const employeeName = $pegawaiUser?.name || "Bagas Pratama (Staff Operasional)";
    const updated = acceptDealProject(orderId, employeeName);
    if (updated) {
      loadOrderIntoInvoiceBuilder(orderId);
    }
  }

  let showChatModal = false;
  let activeChatOrderId = null;
  let chatMessageText = "";

  function openChatModal(orderId) {
    activeChatOrderId = orderId;
    chatMessageText = "";
    showChatModal = true;
  }

  function handleSendChatMessage() {
    if (!chatMessageText.trim() || !activeChatOrderId) return;
    const employeeName = $pegawaiUser?.name || "Bagas Pratama (Staff Operasional)";
    addMessageToOrder(activeChatOrderId, chatMessageText.trim(), employeeName, "agency");
    showToast("Pesan terkirim ke klien di dalam thread proyek!", "success");
    showChatModal = false;
  }

  let showProgressModal = false;
  let activeProgressOrderId = null;
  let activeProgressValue = 25;
  let activeStatusValue = "Sedang Dikerjakan";

  function openProgressModal(order) {
    activeProgressOrderId = order.id;
    activeProgressValue = order.progress || 25;
    activeStatusValue = order.projectStatus || "Sedang Dikerjakan";
    showProgressModal = true;
  }

  function handleSaveProgress() {
    if (!activeProgressOrderId) return;
    updateOrderStatusByAdmin(activeProgressOrderId, activeStatusValue);
    orders.update((list) =>
      list.map((o) => (o.id === activeProgressOrderId ? { ...o, progress: activeProgressValue } : o))
    );
    showToast(`Progres pesanan ${activeProgressOrderId} berhasil diperbarui!`, "success");
    showProgressModal = false;
  }

  let selectedTemplateId = "modern-corporate";
  let builderOrderId = "";
  let templateCategoryFilter = "all";

  let builderInvoice = {
    invoiceNumber: "INV-2026-00001",
    orderId: "NXD-2026-081",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    paymentStatus: "PAID",
    paymentMethod: "Bank Transfer BCA",
    customer: {
      name: "Rian Hidayat",
      company: "PT Logistik Kita Bersama",
      email: "rian.hidayat@startupkita.id",
      phone: "+62 812-9988-7766",
      address: "SCBD Lot 9, Jakarta Selatan"
    },
    project: {
      title: "Redesain Aplikasi Mobile Kurir On-Demand",
      serviceName: "UI/UX Design",
      packageName: "Standard",
      notes: "Pembayaran telah disepakati dan diverifikasi lunas oleh staf operasional."
    },
    items: [
      {
        description: "UI/UX Design — Standard (7 Layar Responsif)",
        details: "Wireframe, rancangan visual Figma, prototipe interaktif",
        qty: 1,
        price: 1500000
      }
    ],
    financial: {
      subtotal: 1500000,
      discount: 0,
      tax: 165000,
      isTaxEnabled: true,
      total: 1665000
    },
    signatory: {
      employeeName: "Bagas Pratama",
      employeeTitle: "Staff Operasional & PIC Proyek",
      signDate: new Date().toISOString().split("T")[0],
      digitalAuthHash: "SHA256-NXD-081-VERIFIED-PEG"
    },
    company: {
      name: "Nexa Digital",
      legalName: "PT Nexa Digital Solusindo",
      npwp: "01.234.567.8-012.000",
      address: "Menara Cyber 2 Lt. 14, Jl. H.R. Rasuna Said, Jakarta Selatan 12950",
      email: "operasional@nexadigital.id",
      phone: "+62 812-8921-3344",
      bankInfo: "BCA: 800-1234-567 a/n PT Nexa Digital Solusindo"
    }
  };

  $: productOptions = $products && $products.length > 0
    ? $products
    : services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category || "Development",
        price: s.startingPrice || 1500000
      }));

  let builderSelectedClientId = "";

  function handleBuilderClientSelect(clientId) {
    builderSelectedClientId = clientId;
    const target = $clients.find((c) => (c.id === clientId || c.email === clientId));
    if (target) {
      builderInvoice.customer.name = target.name || "";
      builderInvoice.customer.company = target.company || "-";
      builderInvoice.customer.email = target.email || "";
      builderInvoice.customer.phone = target.phone || "-";
      if (target.address) {
        builderInvoice.customer.address = target.address;
      }
      showToast(`Data klien ${target.name} berhasil dimuat ke template invoice!`, "info");
    }
  }

  function handleItemProductSelect(idx, prodName) {
    const prod = productOptions.find((p) => p.name === prodName);
    if (!prod) return;
    builderInvoice.items[idx].description = prod.name;
    builderInvoice.items[idx].price = Number(prod.price) || 1500000;
    recalculateBuilderFinancials();
  }

  function recalculateBuilderFinancials() {
    const sub = builderInvoice.items.reduce(
      (acc, it) => acc + (Number(it.qty) || 1) * (Number(it.price) || 0),
      0
    );
    const disc = Number(builderInvoice.financial.discount) || 0;
    const taxable = Math.max(0, sub - disc);
    const tax = builderInvoice.financial.isTaxEnabled ? Math.round(taxable * 0.11) : 0;
    builderInvoice.financial.subtotal = sub;
    builderInvoice.financial.tax = tax;
    builderInvoice.financial.total = taxable + tax;
  }

  function addItemRow() {
    const defaultProd = (productOptions && productOptions.length > 0) ? productOptions[0] : null;
    builderInvoice.items = [
      ...builderInvoice.items,
      {
        description: defaultProd ? defaultProd.name : "Layanan Tambahan / Modul Ekstensi",
        details: "Deliverables pendukung sesuai kesepakatan",
        qty: 1,
        price: defaultProd ? Number(defaultProd.price) : 500000
      }
    ];
    recalculateBuilderFinancials();
  }

  function removeItemRow(index) {
    if (builderInvoice.items.length <= 1) {
      showToast("Minimal harus ada 1 item di dalam invoice!", "error");
      return;
    }
    builderInvoice.items = builderInvoice.items.filter((_, i) => i !== index);
    recalculateBuilderFinancials();
  }

  function loadOrderIntoInvoiceBuilder(orderId) {
    const target = $orders.find((o) => o.id === orderId) || $orders[0];
    if (!target) return;

    builderOrderId = target.id;
    const built = buildInvoiceDataFromOrder(target, {
      employeeName: $pegawaiUser?.name || "Bagas Pratama"
    });
    if (built) {
      builderInvoice = built;
    }
    currentTab = "invoice-builder";
    showToast(`Data pesanan ${target.id} dimuat ke Generator Invoice! Pilih template yang sesuai.`, "info");
  }

  function handleSaveInvoiceFromBuilder() {
    saveCustomInvoice(builderInvoice);
  }

  function printCurrentInvoice() {
    window.print();
  }

  function copyWhatsAppFormat() {
    const text = `*FAKTUR RESMI NEXA DIGITAL*\n` +
      `No. Invoice: ${builderInvoice.invoiceNumber}\n` +
      `Pesanan: ${builderInvoice.orderId}\n` +
      `Klien: ${builderInvoice.customer.name} (${builderInvoice.customer.company})\n` +
      `Proyek: ${builderInvoice.project.title}\n` +
      `Total Tagihan: ${formatRupiah(builderInvoice.financial.total)}\n` +
      `Status: ${builderInvoice.paymentStatus}\n` +
      `PIC Pegawai: ${builderInvoice.signatory.employeeName}\n` +
      `Pembayaran via: ${builderInvoice.company.bankInfo}\n\n` +
      `Dokumen invoice resmi telah diterbitkan. Terima kasih telah bermitra dengan PT Nexa Digital Solusindo!`;

    navigator.clipboard?.writeText(text);
    showToast("Format ringkasan WhatsApp berhasil disalin ke clipboard!", "success");
  }

  $: filteredTemplates = INVOICE_TEMPLATES.filter((tpl) => {
    if (templateCategoryFilter === "all") return true;
    return tpl.category.toLowerCase() === templateCategoryFilter.toLowerCase();
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

{#if $isClientLoggedIn}
  <div class="min-h-screen bg-[#f4f4f5] text-[#09090b] flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
    <div class="max-w-md w-full bg-white border border-[#ececee] p-8 rounded-[36px] shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 bg-[#ff5a00]/10 text-[#ff5a00] rounded-[24px] mx-auto flex items-center justify-center">
        <Icon name="alert-circle" size={32} />
      </div>
      <div class="space-y-2">
        <span class="px-3 py-1 rounded-[12px] bg-[#ff5a00]/10 text-[#ff5a00] text-[11px] font-semibold uppercase tracking-wider">
          Akses Dibatasi
        </span>
        <h1 class="text-xl font-semibold text-[#09090b]">Akun Klien Tidak Memiliki Akses Pegawai</h1>
        <p class="text-[13px] text-[#52525b] leading-relaxed">
          Area ini dikhususkan bagi staf operasional Nexa Digital. Keluar dari akun Klien (<strong class="text-[#09090b]">{$clientUser?.name}</strong>) untuk masuk sebagai Pegawai.
        </p>
      </div>
      <div class="space-y-3 pt-2">
        <button
          type="button"
          on:click={() => navigateTo('customer-dashboard')}
          class="w-full py-3.5 px-4 bg-[#09090b] hover:bg-[#ff5a00] text-white font-normal text-[13px] rounded-[14px] transition cursor-pointer"
        >
          Kembali ke Dashboard Klien
        </button>
        <button
          type="button"
          on:click={logoutClient}
          class="w-full py-3.5 px-4 bg-[#fafafa] hover:bg-[#ececee] text-[#18181b] font-normal text-[13px] border border-[#ececee] rounded-[14px] transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
{:else if !$isPegawaiLoggedIn}
  <div class="min-h-screen bg-[#f4f4f5] text-[#09090b] flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif]">
    <div class="max-w-md w-full bg-white border border-[#ececee] p-8 rounded-[36px] shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 bg-[#ff5a00]/10 text-[#ff5a00] rounded-[24px] mx-auto flex items-center justify-center">
        <Icon name="user-check" size={28} />
      </div>
      <div class="space-y-2">
        <span class="px-3 py-1 rounded-[12px] bg-[#ff5a00]/10 text-[#ff5a00] text-[11px] font-semibold uppercase tracking-wider">
          Otorisasi Diperlukan
        </span>
        <h1 class="text-xl font-semibold text-[#09090b]">Portal Khusus Pegawai</h1>
        <p class="text-[13px] text-[#52525b] leading-relaxed">
          Masuk dengan akun Pegawai / Staf Operasional untuk menerima projek deal dari klien dan mengelola template invoice tanpa akun Admin Utama.
        </p>
      </div>
      <div class="space-y-3 pt-2 text-xs">
        <button
          type="button"
          on:click={() => navigateTo('pegawai-login')}
          class="w-full py-3.5 px-4 bg-[#09090b] hover:bg-[#ff5a00] text-white font-semibold uppercase tracking-wider rounded-[14px] transition cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          <span>Masuk ke Akun Pegawai</span>
          <Icon name="arrow-right" size={14} />
        </button>
        <button
          type="button"
          on:click={() => navigateTo('home')}
          class="w-full py-3.5 px-4 bg-[#fafafa] hover:bg-[#ececee] text-[#18181b] font-normal uppercase rounded-[14px] transition cursor-pointer border border-[#ececee]"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="{isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f4f4f5] text-[#09090b]'} min-h-screen font-['Plus_Jakarta_Sans',sans-serif] antialiased py-12 pb-24 relative transition-colors duration-300 w-full selection:bg-[#ff5a00] selection:text-white">
    
    <div class="no-print absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#ff5a00]/5 rounded-full blur-[120px]"></div>
      <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[150px]"></div>
    </div>

    <div class="w-full px-6 sm:px-12 lg:px-20 relative z-10 space-y-10">

      <!-- STICKY TOP NAVIGATION BAR (Menu & Actions moved to the right side) -->
      <header class="no-print sticky top-6 z-50 {isDarkMode ? 'bg-[#18181b]/90 border-[#27272a] text-[#f4f4f5] shadow-2xl' : 'bg-white/90 border-[#ececee] text-[#09090b] shadow-xl'} backdrop-blur-2xl border px-6 py-4 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 w-full">
        
        <div class="flex items-center gap-3.5 w-full md:w-auto">
          <div class="w-10 h-10 rounded-[14px] overflow-hidden shrink-0 shadow-xs border {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
            <img 
              src={$pegawaiUser?.avatar || pegawaiAvatarUrl} 
              alt="Foto Pegawai" 
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <div class="font-semibold text-[13px] tracking-wide {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{$pegawaiUser?.name || "Bagas Pratama"}</div>
            <div class="text-[11px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'}">{$pegawaiUser?.email || "pegawai@nexadigital.id"}</div>
          </div>
        </div>

        <!-- Right Side Container holding both Navigation Tabs and Action Buttons -->
        <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-end">
          <nav class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-[13px] font-medium">
            <button
              type="button"
              on:click={() => (currentTab = "overview")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentTab === 'overview' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              Overview
            </button>
            <button
              type="button"
              on:click={() => (currentTab = "orders")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 {currentTab === 'orders' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              <span>Pesanan & Deal</span>
              {#if needDealCount > 0}
                <span class="px-1.5 py-0.5 rounded-full bg-[#ff5a00] text-white text-[10px] font-bold animate-pulse">
                  {needDealCount}
                </span>
              {/if}
            </button>
            <button
              type="button"
              on:click={() => (currentTab = "new-deal")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentTab === 'new-deal' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              + Tambah Projek Deal
            </button>
            <button
              type="button"
              on:click={() => (currentTab = "invoice-builder")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 {currentTab === 'invoice-builder' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              <span>Template Invoice</span>
              <span class="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">16</span>
            </button>
            <button
              type="button"
              on:click={() => (currentTab = "invoices")}
              class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentTab === 'invoices' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
            >
              Arsip Faktur ({totalInvoicesCount})
            </button>
          </nav>

          <div class="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              on:click={toggleDarkMode}
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
              on:click={() => navigateTo('home')}
              class="px-4 py-2.5 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:text-white hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:text-[#09090b] hover:bg-[#ececee] border border-[#ececee]'} rounded-[14px] transition flex items-center gap-1.5 font-medium text-[13px] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Beranda</span>
            </button>
            <button
              type="button"
              on:click={logoutPegawai}
              class="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-[14px] transition flex items-center gap-1.5 font-medium text-[13px] cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

      </header>

      {#if currentTab === "overview"}
        <div class="no-print space-y-8 animate-fade-in w-full">
          <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border p-8 sm:p-12 rounded-[36px] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors w-full">
            <div class="space-y-3 max-w-2xl z-10">
              <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-widest block">
                [ WORKSPACE PEGAWAI OPERASIONAL ]
              </span>
              <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
                Halo, {$pegawaiUser?.name || "Bagas Pratama"}!
              </h2>
              <p class="text-[14px] sm:text-[16px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                Anda memiliki wewenang penuh untuk menerima dan menyepakati deal projek dari klien, memperbarui progres pengerjaan tim teknis, serta menerbitkan dan mengisi invoice dengan 16 template pilihan tanpa login ke akun Admin Utama.
              </p>
            </div>
            <div class="flex flex-wrap gap-3 z-10">
              <button
                type="button"
                on:click={() => (currentTab = "orders")}
                class="px-6 py-3.5 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold text-[13px] rounded-[14px] shadow-lg shadow-[#ff5a00]/30 transition cursor-pointer flex items-center gap-2"
              >
                <Icon name="check-circle" size={16} />
                <span>Lihat Pesanan Masuk ({needDealCount})</span>
              </button>
              <button
                type="button"
                on:click={() => (currentTab = "new-deal")}
                class="px-6 py-3.5 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} font-semibold text-[13px] rounded-[14px] transition cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Icon name="plus" size={16} />
                <span>Input Deal Klien Baru</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors">
              <span class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block">Total Pesanan Masuk</span>
              <div class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{totalOrdersCount}</div>
              <span class="text-[11px] text-[#71717a]">Seluruh pesanan dari klien</span>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors">
              <span class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block">Menunggu Deal</span>
              <div class="text-2xl sm:text-3xl font-semibold text-amber-500">{needDealCount}</div>
              <span class="text-[11px] text-[#71717a]">Siap diterima & disepakati</span>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors">
              <span class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block">Proyek Berjalan</span>
              <div class="text-2xl sm:text-3xl font-semibold text-blue-500">{activeSprintCount}</div>
              <span class="text-[11px] text-[#71717a]">Sedang dikerjakan / revisi</span>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors">
              <span class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block">Template Invoice</span>
              <div class="text-2xl sm:text-3xl font-semibold text-emerald-500">16 Model</div>
              <span class="text-[11px] text-[#71717a]">Siap diisi & dicetak</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-3 transition-colors hover:border-[#ff5a00]/40">
              <div class="w-12 h-12 bg-[#ff5a00]/10 text-[#ff5a00] rounded-[18px] flex items-center justify-center">
                <Icon name="check-circle" size={22} />
              </div>
              <h3 class="font-semibold text-lg {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Terima Deal Projek</h3>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                Konfirmasi pesanan baru klien, tandai sebagai deal, dan langsung siapkan invoice otomatis.
              </p>
              <button
                type="button"
                on:click={() => (currentTab = "orders")}
                class="text-[13px] font-semibold text-[#ff5a00] hover:text-[#e05000] flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>Kelola Pesanan &rarr;</span>
              </button>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-3 transition-colors hover:border-[#ff5a00]/40">
              <div class="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-[18px] flex items-center justify-center">
                <Icon name="plus" size={22} />
              </div>
              <h3 class="font-semibold text-lg {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Input Deal Klien Baru</h3>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                Catat kesepakatan projek klien dari meeting atau WhatsApp langsung ke sistem Nexa Digital.
              </p>
              <button
                type="button"
                on:click={() => (currentTab = "new-deal")}
                class="text-[13px] font-semibold text-[#ff5a00] hover:text-[#e05000] flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>Buat Deal Baru &rarr;</span>
              </button>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-3 transition-colors hover:border-[#ff5a00]/40">
              <div class="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-[18px] flex items-center justify-center">
                <Icon name="file-text" size={22} />
              </div>
              <h3 class="font-semibold text-lg {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Generator 16 Template</h3>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                Gunakan 16 template invoice profesional yang dapat disesuaikan item, harga, dan dicetak.
              </p>
              <button
                type="button"
                on:click={() => (currentTab = "invoice-builder")}
                class="text-[13px] font-semibold text-[#ff5a00] hover:text-[#e05000] flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>Buka Generator &rarr;</span>
              </button>
            </div>
          </div>

        </div>

      {:else if currentTab === "orders"}
        <div class="no-print space-y-6 animate-fade-in w-full">
          <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 sm:p-10 rounded-[36px] shadow-xs space-y-6 transition-colors w-full">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-6">
              <div>
                <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-wider block">[ PESANAN ]</span>
                <h2 class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">
                  Manajemen Pesanan & Kesepakatan Klien
                </h2>
                <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mt-1">
                  Staf dapat menyetujui deal proyek klien dan menerbitkan invoice resmi tanpa perlu akun Admin Utama.
                </p>
              </div>
              <button
                type="button"
                on:click={() => (currentTab = "new-deal")}
                class="px-5 py-3 bg-[#ff5a00] hover:bg-[#e05000] text-white font-medium text-[13px] rounded-[14px] shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Icon name="plus" size={16} />
                <span>Input Projek Deal Baru</span>
              </button>
            </div>

            <div class="flex flex-col md:flex-row gap-4 items-center justify-between text-[13px]">
              <div class="relative w-full md:w-96">
                <input
                  type="text"
                  bind:value={orderSearchQuery}
                  placeholder="Cari ID pesanan, nama klien, atau layanan..."
                  class="w-full pl-10 pr-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
                />
                <span class="absolute left-3.5 top-3.5 text-[#71717a]">
                  <Icon name="search" size={16} />
                </span>
              </div>

              <div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <button
                  type="button"
                  on:click={() => (orderStatusFilter = "all")}
                  class="px-4 py-2.5 rounded-[14px] font-semibold transition cursor-pointer whitespace-nowrap {orderStatusFilter === 'all' ? 'bg-[#ff5a00] text-white shadow-sm' : (isDarkMode ? 'bg-[#27272a] text-[#a1a1aa]' : 'bg-[#fafafa] text-[#52525b] border border-[#ececee]')}"
                >
                  Semua ({$orders.length})
                </button>
                <button
                  type="button"
                  on:click={() => (orderStatusFilter = "need-deal")}
                  class="px-4 py-2.5 rounded-[14px] font-semibold transition cursor-pointer whitespace-nowrap {orderStatusFilter === 'need-deal' ? 'bg-[#ff5a00] text-white shadow-sm' : (isDarkMode ? 'bg-[#27272a] text-[#a1a1aa]' : 'bg-[#fafafa] text-[#52525b] border border-[#ececee]')}"
                >
                  Menunggu Deal ({needDealCount})
                </button>
                <button
                  type="button"
                  on:click={() => (orderStatusFilter = "in-progress")}
                  class="px-4 py-2.5 rounded-[14px] font-semibold transition cursor-pointer whitespace-nowrap {orderStatusFilter === 'in-progress' ? 'bg-[#ff5a00] text-white shadow-sm' : (isDarkMode ? 'bg-[#27272a] text-[#a1a1aa]' : 'bg-[#fafafa] text-[#52525b] border border-[#ececee]')}"
                >
                  Sedang Dikerjakan ({activeSprintCount})
                </button>
                <button
                  type="button"
                  on:click={() => (orderStatusFilter = "completed")}
                  class="px-4 py-2.5 rounded-[14px] font-semibold transition cursor-pointer whitespace-nowrap {orderStatusFilter === 'completed' ? 'bg-[#ff5a00] text-white shadow-sm' : (isDarkMode ? 'bg-[#27272a] text-[#a1a1aa]' : 'bg-[#fafafa] text-[#52525b] border border-[#ececee]')}"
                >
                  Selesai
                </button>
              </div>
            </div>

            <div class="space-y-4 pt-2 w-full">
              {#if filteredOrders.length === 0}
                <div class="text-center py-16 {isDarkMode ? 'bg-[#27272a]/50 border-[#27272a]' : 'bg-[#fafafa] border-[#ececee]'} border rounded-[36px] space-y-3">
                  <Icon name="inbox" size={40} className="mx-auto text-[#71717a]" />
                  <h4 class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Tidak Ada Pesanan Ditemukan</h4>
                  <p class="text-[13px] text-[#71717a]">Coba ubah kata kunci pencarian atau filter status.</p>
                </div>
              {:else}
                {#each filteredOrders as order (order.id)}
                  <div class="{isDarkMode ? 'bg-[#27272a]/40 border-[#27272a]' : 'bg-[#fafafa] border-[#ececee]'} border p-6 sm:p-8 rounded-[28px] shadow-xs space-y-5 transition hover:border-[#ff5a00]/50 w-full">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b {isDarkMode ? 'border-[#3f3f46]' : 'border-[#ececee]'} pb-5">
                      <div class="space-y-1.5">
                        <div class="flex items-center gap-2.5 flex-wrap">
                          <span class="font-mono font-bold text-sm text-[#ff5a00]">{order.id}</span>
                          <StatusBadge status={order.projectStatus} size="sm" />
                          <span class="px-2.5 py-0.5 rounded-[12px] text-[11px] font-bold uppercase {order.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}">
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div class="text-[13px] text-[#71717a]">
                          Invoice: <strong class="font-mono {isDarkMode ? 'text-[#f4f4f5]' : 'text-[#09090b]'}">{order.invoiceNumber || 'Belum Diterbitkan'}</strong> &bull; Terbit: {order.orderDate}
                        </div>
                      </div>

                      <div class="flex items-center gap-2.5 flex-wrap">
                        {#if order.projectStatus === "Menunggu Kebutuhan" || order.projectStatus === "Menunggu Pembayaran" || order.paymentStatus === "PENDING"}
                          <button
                            type="button"
                            on:click={() => handleAcceptDeal(order.id)}
                            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[13px] rounded-[14px] shadow-xs transition cursor-pointer flex items-center gap-1.5"
                            title="Terima projek dan sepakati deal"
                          >
                            <Icon name="check-circle" size={15} />
                            <span>Terima Deal & Buat Invoice</span>
                          </button>
                        {/if}

                        <button
                          type="button"
                          on:click={() => loadOrderIntoInvoiceBuilder(order.id)}
                          class="px-4 py-2.5 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5]' : 'bg-white hover:bg-[#fafafa] border border-[#ececee] text-[#18181b]'} font-medium text-[13px] rounded-[14px] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Buka Template Invoice"
                        >
                          <Icon name="file-text" size={15} />
                          <span>Pilih Template Invoice</span>
                        </button>

                        <button
                          type="button"
                          on:click={() => openChatModal(order.id)}
                          class="px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa]' : 'bg-white hover:bg-[#fafafa] border border-[#ececee] text-[#52525b]'} rounded-[14px] text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Kirim pesan ke klien"
                        >
                          <Icon name="message-square" size={15} />
                          <span>Chat</span>
                        </button>

                        <button
                          type="button"
                          on:click={() => openProgressModal(order)}
                          class="px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa]' : 'bg-white hover:bg-[#fafafa] border border-[#ececee] text-[#52525b]'} rounded-[14px] text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          title="Update Progres & Status"
                        >
                          <Icon name="sliders" size={15} />
                          <span>Progres</span>
                        </button>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[13px]">
                      <div class="space-y-1.5">
                        <span class="text-[11px] uppercase font-semibold text-[#71717a] block tracking-wider">KLIEN</span>
                        <div class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{order.customer?.name}</div>
                        <div class="text-[#71717a]">{order.customer?.company}</div>
                        <div class="text-[#71717a]">{order.customer?.email} &bull; {order.customer?.phone}</div>
                      </div>

                      <div class="space-y-1.5">
                        <span class="text-[11px] uppercase font-semibold text-[#71717a] block tracking-wider">PROYEK & LAYANAN</span>
                        <div class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{order.requirements?.title || order.serviceName}</div>
                        <div class="text-[#71717a]">{order.serviceName} ({order.packageName})</div>
                        <div class="text-[#71717a]">PIC Pegawai: <strong class="{isDarkMode ? 'text-[#f4f4f5]' : 'text-[#09090b]'}">{order.assignedTeam || 'Belum Ditugaskan'}</strong></div>
                      </div>

                      <div class="space-y-1.5 sm:text-right">
                        <span class="text-[11px] uppercase font-semibold text-[#71717a] block tracking-wider">NILAI KESEPAKATAN (DEAL)</span>
                        <div class="text-xl font-bold font-mono text-[#ff5a00]">{formatRupiah(order.total || order.price)}</div>
                        <div class="text-[#71717a]">Metode: {order.paymentMethod}</div>
                        <div class="text-[12px] text-[#71717a]">Jatuh Tempo: {order.deadline}</div>
                      </div>
                    </div>

                    <div class="space-y-2 pt-2">
                      <div class="flex justify-between items-center text-[12px]">
                        <span class="text-[#71717a] font-medium">Progres Pengerjaan Sprint:</span>
                        <span class="font-semibold font-mono {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{order.progress || 0}%</span>
                      </div>
                      <div class="w-full h-2.5 rounded-full {isDarkMode ? 'bg-[#3f3f46]' : 'bg-[#ececee]'} overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-[#ff5a00] to-amber-500 rounded-full transition-all duration-500"
                          style="width: {order.progress || 0}%"
                        ></div>
                      </div>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </div>

      {:else if currentTab === "new-deal"}
        <div class="no-print space-y-6 animate-fade-in w-full">
          <div class="w-full max-w-4xl mx-auto space-y-6">
            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border p-8 sm:p-12 rounded-[36px] shadow-xl space-y-8 text-[13px] transition-colors w-full">
              <div class="border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-6 text-center space-y-2">
                <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-wider block">[ ENTRY KESEPAKATAN ]</span>
                <h2 class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Input Projek Baru Hasil Deal dengan Klien</h2>
                <p class="text-[14px] text-[#71717a] max-w-xl mx-auto">Catat pesanan proyek yang sudah disepakati (deal) langsung tanpa melalui form checkout utama.</p>
              </div>

              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'} flex items-center gap-2.5">
                    <Icon name="user" size={18} className="text-[#ff5a00]" />
                    <span>1. Data Identitas Klien (Pilih dari Database)</span>
                  </h3>
                  <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                    Database ({$clients.length} Klien)
                  </span>
                </div>

                <div class="space-y-1.5">
                  <label for="pegawai_client_select" class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">
                    Pilih Klien Terdaftar dari Database *
                  </label>
                  <select
                    id="pegawai_client_select"
                    bind:value={selectedClientId}
                    on:change={(e) => handleDealClientSelect(e.target.value)}
                    class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium cursor-pointer shadow-xs"
                  >
                    <option value="" disabled>-- Pilih Klien Terdaftar dari Database --</option>
                    {#each $clients as c}
                      <option value={c.id || c.email}>
                        {c.name} — {c.company && c.company !== '-' ? c.company : (c.email || 'Klien')}
                      </option>
                    {/each}
                  </select>
                </div>

                <!-- Kartu Info Klien Terpilih dari Database (Otomatis tanpa ketik manual) -->
                {#if newDealForm.customerName}
                  <div class="p-4 rounded-[20px] {isDarkMode ? 'bg-[#27272a]/60 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] animate-fade-in">
                    <div>
                      <span class="text-[#71717a] text-[12px] block">Nama Lengkap Klien:</span>
                      <span class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{newDealForm.customerName}</span>
                    </div>
                    <div>
                      <span class="text-[#71717a] text-[12px] block">Perusahaan / Startup:</span>
                      <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{newDealForm.customerCompany || '-'}</span>
                    </div>
                    <div>
                      <span class="text-[#71717a] text-[12px] block">Email Aktif Klien:</span>
                      <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{newDealForm.customerEmail}</span>
                    </div>
                    <div>
                      <span class="text-[#71717a] text-[12px] block">Nomor WhatsApp / HP:</span>
                      <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{newDealForm.customerPhone || '-'}</span>
                    </div>
                  </div>
                {:else}
                  <div class="p-4 rounded-[16px] {isDarkMode ? 'bg-[#27272a]/30 border-[#3f3f46] text-[#a1a1aa]' : 'bg-[#f4f4f5] border-[#ececee] text-[#71717a]'} border text-center text-[12px]">
                    Silakan pilih salah satu data klien di atas untuk mengisi identitas klien secara otomatis dari database.
                  </div>
                {/if}
              </div>

              <div class="space-y-4 pt-6 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
                <h3 class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'} flex items-center gap-2.5">
                  <Icon name="briefcase" size={18} className="text-[#ff5a00]" />
                  <span>2. Spesifikasi Layanan & Proyek Deal</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div class="space-y-1.5">
                    <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Pilih Bidang Layanan</span>
                    <select
                      on:change={handleServiceChange}
                      bind:value={newDealForm.serviceId}
                      class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium cursor-pointer"
                    >
                      {#each services as s}
                        <option value={s.id}>{s.name}</option>
                      {/each}
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Nama Paket Layanan</span>
                    <input
                      type="text"
                      bind:value={newDealForm.packageName}
                      placeholder="Contoh: Standard Retainer / MVP"
                      class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
                    />
                  </div>
                </div>
                <div class="space-y-1.5">
                  <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Judul Proyek *</span>
                  <input
                    type="text"
                    bind:value={newDealForm.projectTitle}
                    placeholder="Contoh: Pembuatan Website E-Commerce & Payment Gateway"
                    class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
                  />
                </div>
                <div class="space-y-1.5">
                  <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Catatan Scope & Deliverables</span>
                  <textarea
                    rows="3"
                    bind:value={newDealForm.projectDescription}
                    placeholder="Kebutuhan deliverables yang disepakati bersama klien..."
                    class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
                  ></textarea>
                </div>
              </div>

              <div class="space-y-4 pt-6 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
                <h3 class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'} flex items-center gap-2.5">
                  <Icon name="credit-card" size={18} className="text-[#ff5a00]" />
                  <span>3. Nilai Kesepakatan (Biaya & Pembayaran)</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div class="space-y-1.5">
                    <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Harga Kesepakatan (Rp) *</span>
                    <input
                      type="number"
                      bind:value={newDealForm.price}
                      step="50000"
                      class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-mono font-semibold"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Potongan Diskon (Rp)</span>
                    <input
                      type="number"
                      bind:value={newDealForm.discount}
                      step="50000"
                      class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-mono"
                    />
                  </div>
                  <div class="space-y-1.5">
                    <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Estimasi Pengerjaan (Hari)</span>
                    <input
                      type="number"
                      bind:value={newDealForm.deliveryDays}
                      min="1"
                      class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div class="space-y-1.5">
                    <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Metode Pembayaran</span>
                    <select
                      bind:value={newDealForm.paymentMethod}
                      class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium cursor-pointer"
                    >
                      <option value="Bank Transfer BCA">Bank Transfer BCA</option>
                      <option value="Bank Mandiri Virtual Account">Bank Mandiri Virtual Account</option>
                      <option value="QRIS / E-Wallet">QRIS / E-Wallet</option>
                      <option value="Termin Pembayaran (DP 50%)">Termin Pembayaran (DP 50%)</option>
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Status Pembayaran</span>
                    <select
                      bind:value={newDealForm.paymentStatus}
                      class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium cursor-pointer"
                    >
                      <option value="PAID">PAID (Lunas / Terverifikasi)</option>
                      <option value="PENDING">PENDING (Menunggu Pembayaran)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="pt-6 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} flex flex-col sm:flex-row justify-end gap-3.5">
                <button
                  type="button"
                  on:click={() => (currentTab = "orders")}
                  class="px-6 py-3.5 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} font-medium rounded-[14px] transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  on:click={handleCreateNewDeal}
                  class="px-8 py-3.5 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold uppercase tracking-wider rounded-[14px] shadow-lg shadow-[#ff5a00]/30 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Icon name="check-circle" size={16} />
                  <span>Simpan Projek Deal & Buka Generator Invoice</span>
                </button>
              </div>

            </div>
          </div>
        </div>

      {:else if currentTab === "invoice-builder"}
        <div class="space-y-6 animate-fade-in w-full">
          
          <div class="no-print {isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border p-8 rounded-[36px] shadow-xs space-y-5 transition-colors w-full">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span class="text-[12px] font-semibold text-emerald-500 uppercase tracking-wider block">[ GENERATOR 16 TEMPLATE ]</span>
                <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">
                  Katalog Template & Editor Faktur Pegawai
                </h2>
                <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mt-1">
                  Pilih salah satu dari 16 template invoice resmi, sesuaikan rincian tagihan, dan cetak atau kirimkan ke klien.
                </p>
              </div>

              <div class="flex items-center gap-2.5 flex-wrap text-[13px] font-medium">
                <button
                  type="button"
                  on:click={copyWhatsAppFormat}
                  class="px-4 py-2.5 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5]' : 'bg-[#fafafa] hover:bg-[#ececee] border border-[#ececee] text-[#18181b]'} rounded-[14px] transition cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Icon name="share-2" size={15} />
                  <span>Format WA</span>
                </button>
                <button
                  type="button"
                  on:click={handleSaveInvoiceFromBuilder}
                  class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[14px] shadow-sm transition cursor-pointer flex items-center gap-2"
                >
                  <Icon name="save" size={15} />
                  <span>Simpan Invoice</span>
                </button>
                <button
                  type="button"
                  on:click={printCurrentInvoice}
                  class="px-5 py-2.5 bg-[#ff5a00] hover:bg-[#e05000] text-white rounded-[14px] shadow-md shadow-[#ff5a00]/30 transition cursor-pointer flex items-center gap-2"
                >
                  <Icon name="printer" size={15} />
                  <span>Cetak / Unduh PDF</span>
                </button>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-3.5 pt-4 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} text-[13px]">
              <span class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} shrink-0">Muat Data Projek Deal:</span>
              <select
                bind:value={builderOrderId}
                on:change={(e) => loadOrderIntoInvoiceBuilder(e.target.value)}
                class="px-4 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border font-semibold rounded-[14px] focus:outline-none focus:border-[#ff5a00] cursor-pointer w-full sm:w-auto"
              >
                {#each $orders as ord}
                  <option value={ord.id}>
                    {ord.id} — {ord.customer?.name} ({ord.serviceName})
                  </option>
                {/each}
              </select>
            </div>
          </div>

          <div class="no-print {isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border p-8 rounded-[36px] shadow-xs space-y-5 transition-colors w-full">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'} flex items-center gap-2.5">
                  <span>Pilih Desain Template Invoice (16 Pilihan)</span>
                  <span class="px-2.5 py-0.5 rounded-full bg-[#ff5a00]/10 text-[#ff5a00] text-[11px] font-bold">
                    {INVOICE_TEMPLATES.length} Template
                  </span>
                </h3>
                <p class="text-[13px] text-[#71717a] mt-1">Klik pada template untuk melihat pratinjau live secara instan.</p>
              </div>

              <div class="flex items-center gap-2 overflow-x-auto text-[12px] font-semibold">
                {#each ['all', 'Corporate', 'Minimalis', 'Kreatif', 'Teknologi', 'Eksklusif', 'Formal'] as cat}
                  <button
                    type="button"
                    on:click={() => (templateCategoryFilter = cat)}
                    class="px-3.5 py-2 rounded-[12px] transition cursor-pointer whitespace-nowrap {templateCategoryFilter === cat ? 'bg-[#ff5a00] text-white' : (isDarkMode ? 'bg-[#27272a] text-[#a1a1aa]' : 'bg-[#fafafa] text-[#52525b] border border-[#ececee]')}"
                  >
                    {cat === 'all' ? 'Semua (16)' : cat}
                  </button>
                {/each}
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 pt-2 w-full">
              {#each filteredTemplates as tpl}
                <button
                  type="button"
                  on:click={() => (selectedTemplateId = tpl.id)}
                  class="p-3.5 rounded-[22px] border text-left transition-all cursor-pointer relative group flex flex-col justify-between h-40 {selectedTemplateId === tpl.id ? 'ring-2 ring-[#ff5a00] border-[#ff5a00] bg-[#ff5a00]/5 shadow-md' : (isDarkMode ? 'border-[#27272a] bg-[#09090b] hover:border-[#3f3f46]' : 'border-[#ececee] bg-[#fafafa] hover:border-[#a1a1aa]')}"
                >
                  {#if selectedTemplateId === tpl.id}
                    <span class="absolute top-2.5 right-2.5 w-5 h-5 bg-[#ff5a00] text-white rounded-full flex items-center justify-center text-[10px] shadow-xs">
                      ✓
                    </span>
                  {/if}

                  <div class="w-full h-14 rounded-[14px] {tpl.previewBg} p-2.5 flex flex-col justify-between text-[10px] shadow-xs">
                    <span class="font-bold truncate">{tpl.name}</span>
                    <span class="text-[9px] opacity-75">{tpl.badge}</span>
                  </div>

                  <div class="mt-2 space-y-1">
                    <div class="font-semibold text-[12px] {selectedTemplateId === tpl.id ? 'text-[#ff5a00]' : (isDarkMode ? 'text-white' : 'text-[#09090b]')} truncate">
                      {tpl.name}
                    </div>
                    <span class="text-[10px] text-[#71717a] block font-medium uppercase tracking-wider">{tpl.category}</span>
                  </div>
                </button>
              {/each}
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            <div class="no-print lg:col-span-5 {isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border p-8 rounded-[36px] shadow-xs space-y-6 text-[13px] transition-colors w-full">
              <div class="border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-4 flex justify-between items-center">
                <h4 class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Sesuaikan Isi Invoice</h4>
                <span class="text-[11px] font-mono text-[#71717a]">Template: {selectedTemplateId}</span>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <span class="font-medium text-[#71717a] block">Nomor Invoice</span>
                  <input
                    type="text"
                    bind:value={builderInvoice.invoiceNumber}
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px] font-mono font-semibold"
                  />
                </div>
                <div class="space-y-1.5">
                  <span class="font-medium text-[#71717a] block">Status Pembayaran</span>
                  <select
                    bind:value={builderInvoice.paymentStatus}
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px] font-semibold cursor-pointer"
                  >
                    <option value="PAID">PAID (Lunas)</option>
                    <option value="PENDING">PENDING</option>
                    <option value="DP 50%">DP 50% (Termin)</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <span class="font-medium text-[#71717a] block">Tanggal Terbit</span>
                  <input
                    type="date"
                    bind:value={builderInvoice.issueDate}
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px] font-medium"
                  />
                </div>
                <div class="space-y-1.5">
                  <span class="font-medium text-[#71717a] block">Jatuh Tempo</span>
                  <input
                    type="date"
                    bind:value={builderInvoice.dueDate}
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px] font-medium"
                  />
                </div>
              </div>

              <div class="space-y-3 pt-3 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-sm {isDarkMode ? 'text-white' : 'text-[#09090b]'} block">Informasi Klien</span>
                  <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
                    Database ({$clients.length} Klien)
                  </span>
                </div>

                <div class="space-y-1">
                  <label for="builder_client_select" class="text-[11px] font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'} block">
                    Pilih Klien Terdaftar dari Database:
                  </label>
                  <select
                    id="builder_client_select"
                    bind:value={builderSelectedClientId}
                    on:change={(e) => handleBuilderClientSelect(e.target.value)}
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px] font-medium text-[12px] cursor-pointer shadow-xs"
                  >
                    <option value="" disabled selected={!builderInvoice.customer?.name}>-- Pilih Klien Terdaftar dari Database --</option>
                    {#each $clients as c}
                      <option value={c.id || c.email}>
                        {c.name} — {c.company && c.company !== '-' ? c.company : (c.email || 'Klien')}
                      </option>
                    {/each}
                  </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    bind:value={builderInvoice.customer.name}
                    placeholder="Nama Klien"
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px]"
                  />
                  <input
                    type="text"
                    bind:value={builderInvoice.customer.company}
                    placeholder="Perusahaan"
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px]"
                  />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    bind:value={builderInvoice.customer.email}
                    placeholder="Email Klien"
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px]"
                  />
                  <input
                    type="text"
                    bind:value={builderInvoice.customer.phone}
                    placeholder="No. Telepon / WA"
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px]"
                  />
                </div>
              </div>

              <div class="space-y-3 pt-3 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
                <div class="flex justify-between items-center">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Rincian Item & Deliverables</span>
                    <span class="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                      Pilih dari Produk Database
                    </span>
                  </div>
                  <button
                    type="button"
                    on:click={addItemRow}
                    class="text-[12px] text-[#ff5a00] hover:text-[#e05000] font-semibold cursor-pointer"
                  >
                    + Tambah Item
                  </button>
                </div>

                <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {#each builderInvoice.items as item, idx}
                    <div class="p-4 {isDarkMode ? 'bg-[#27272a]/50 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border rounded-[20px] space-y-2.5">
                      <div class="flex justify-between items-center">
                        <span class="font-bold text-[11px] text-[#ff5a00]">ITEM #{idx + 1}</span>
                        {#if builderInvoice.items.length > 1}
                          <button
                            type="button"
                            on:click={() => removeItemRow(idx)}
                            class="text-rose-400 hover:text-rose-500 text-[11px] font-medium cursor-pointer"
                          >
                            Hapus
                          </button>
                        {/if}
                      </div>

                      <!-- Dropdown Pilih Produk dari Database -->
                      <div class="space-y-1">
                        <span class="text-[11px] text-[#71717a] block">Pilih Produk / Layanan dari Database:</span>
                        <select
                          on:change={(e) => handleItemProductSelect(idx, e.target.value)}
                          class="w-full px-3 py-2 {isDarkMode ? 'bg-[#09090b] border-[#3f3f46] text-white' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[12px] font-medium text-[12px] cursor-pointer shadow-xs"
                        >
                          <option value="" disabled selected={!item.description}>-- Pilih Produk / Layanan dari Database --</option>
                          {#each productOptions as prod}
                            <option value={prod.name} selected={item.description.includes(prod.name)}>
                              {prod.name} ({prod.category || 'Layanan'}) — {formatRupiah(prod.price)}
                            </option>
                          {/each}
                        </select>
                      </div>

                      <input
                        type="text"
                        bind:value={item.description}
                        placeholder="Nama Layanan / Modul"
                        class="w-full px-3.5 py-2 {isDarkMode ? 'bg-[#09090b] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[12px] font-medium"
                      />
                      <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                          <span class="text-[11px] text-[#71717a]">Qty</span>
                          <input
                            type="number"
                            min="1"
                            bind:value={item.qty}
                            on:input={recalculateBuilderFinancials}
                            class="w-full px-3 py-1.5 {isDarkMode ? 'bg-[#09090b] border-[#3f3f46] text-white' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[12px] text-center font-semibold"
                          />
                        </div>
                        <div class="space-y-1">
                          <span class="text-[11px] text-[#71717a]">Harga Satuan (Rp)</span>
                          <input
                            type="number"
                            step="50000"
                            bind:value={item.price}
                            on:input={recalculateBuilderFinancials}
                            class="w-full px-3 py-1.5 {isDarkMode ? 'bg-[#09090b] border-[#3f3f46] text-white' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[12px] font-mono font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>

              <div class="space-y-4 pt-3 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5">
                    <span class="font-medium text-[#71717a] block">Diskon (Rp)</span>
                    <input
                      type="number"
                      step="50000"
                      bind:value={builderInvoice.financial.discount}
                      on:input={recalculateBuilderFinancials}
                      class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px] font-mono font-semibold"
                    />
                  </div>
                  <div class="space-y-1.5 flex flex-col justify-end">
                    <label class="flex items-center gap-2.5 font-medium {isDarkMode ? 'text-[#f4f4f5]' : 'text-[#09090b]'} cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        bind:checked={builderInvoice.financial.isTaxEnabled}
                        on:change={recalculateBuilderFinancials}
                        class="w-4 h-4 text-[#ff5a00] rounded border-[#71717a] accent-[#ff5a00]"
                      />
                      <span>Terapkan PPN 11%</span>
                    </label>
                  </div>
                </div>

                <div class="space-y-1.5">
                  <span class="font-medium text-[#71717a] block">Nama PIC Pegawai Penandatangan</span>
                  <input
                    type="text"
                    bind:value={builderInvoice.signatory.employeeName}
                    class="w-full px-3.5 py-2.5 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[14px] font-medium"
                  />
                </div>
              </div>

            </div>

            <div class="lg:col-span-7 space-y-4 w-full">
              <div class="no-print flex justify-between items-center text-[13px]">
                <div class="flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="font-semibold {isDarkMode ? 'text-[#f4f4f5]' : 'text-[#09090b]'}">
                    Pratinjau Live: {INVOICE_TEMPLATES.find((t) => t.id === selectedTemplateId)?.name}
                  </span>
                </div>
                <button
                  type="button"
                  on:click={printCurrentInvoice}
                  class="text-[#ff5a00] font-semibold hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <Icon name="printer" size={14} />
                  <span>Cetak Tampilan Ini</span>
                </button>
              </div>

              <div class="overflow-x-auto shadow-xl rounded-[36px] w-full border {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
                <InvoiceTemplateRenderer
                  templateId={selectedTemplateId}
                  invoice={builderInvoice}
                />
              </div>
            </div>

          </div>

        </div>

      {:else if currentTab === "invoices"}
        <div class="no-print space-y-6 animate-fade-in w-full">
          <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 sm:p-10 rounded-[36px] shadow-xs space-y-6 transition-colors w-full">
            <div class="border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-6">
              <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-wider block">[ ARSIP FAKTUR ]</span>
              <h2 class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">Arsip Faktur & Riwayat Tagihan</h2>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mt-1">Daftar seluruh faktur yang telah diterbitkan untuk pesanan dan deal klien.</p>
            </div>

            <div class="overflow-x-auto w-full">
              <table class="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr class="border-b {isDarkMode ? 'border-[#27272a] text-[#71717a]' : 'border-[#ececee] text-[#71717a]'} font-semibold">
                    <th class="py-3.5 px-4">No. Faktur</th>
                    <th class="py-3.5 px-4">ID Pesanan</th>
                    <th class="py-3.5 px-4">Klien / Perusahaan</th>
                    <th class="py-3.5 px-4">Layanan</th>
                    <th class="py-3.5 px-4 text-right">Total Tagihan</th>
                    <th class="py-3.5 px-4 text-center">Status</th>
                    <th class="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y {isDarkMode ? 'divide-[#27272a]' : 'divide-[#ececee]'}">
                  {#each $orders as ord}
                    {#if ord.invoiceNumber}
                      <tr class="{isDarkMode ? 'hover:bg-[#27272a]/30' : 'hover:bg-[#fafafa]'} transition-colors">
                        <td class="py-4 px-4 font-mono font-bold text-[#ff5a00]">
                          {ord.invoiceNumber}
                        </td>
                        <td class="py-4 px-4 font-mono text-[#71717a]">{ord.id}</td>
                        <td class="py-4 px-4">
                          <div class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{ord.customer?.name}</div>
                          <div class="text-[11px] text-[#71717a]">{ord.customer?.company}</div>
                        </td>
                        <td class="py-4 px-4 {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{ord.serviceName}</td>
                        <td class="py-4 px-4 text-right font-mono font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
                          {formatRupiah(ord.total || ord.price)}
                        </td>
                        <td class="py-4 px-4 text-center">
                          <span class="px-3 py-1 rounded-[12px] text-[11px] font-bold uppercase {ord.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}">
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td class="py-4 px-4 text-center">
                          <button
                            type="button"
                            on:click={() => loadOrderIntoInvoiceBuilder(ord.id)}
                            class="px-4 py-2 bg-[#ff5a00] hover:bg-[#e05000] text-white font-medium text-[12px] rounded-[12px] transition cursor-pointer shadow-xs"
                          >
                            Buka di 16 Template
                          </button>
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/if}

    </div>
  </div>

  {#if showChatModal}
    <div class="no-print fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[36px] p-8 max-w-lg w-full space-y-5 shadow-2xl text-[13px] transition-colors">
        <div class="flex justify-between items-center border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-4">
          <div class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
            Kirim Pesan ke Klien ({activeChatOrderId})
          </div>
          <button type="button" on:click={() => (showChatModal = false)} class="text-[#71717a] hover:text-[#09090b] cursor-pointer">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div class="space-y-2">
          <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Pesan dari Staf Nexa Digital:</span>
          <textarea
            rows="4"
            bind:value={chatMessageText}
            placeholder="Tuliskan perkembangan proyek, konfirmasi deal, atau tautan revisi..."
            class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
          ></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-3">
          <button
            type="button"
            on:click={() => (showChatModal = false)}
            class="px-5 py-2.5 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} rounded-[14px] cursor-pointer font-medium transition"
          >
            Batal
          </button>
          <button
            type="button"
            on:click={handleSendChatMessage}
            class="px-5 py-2.5 bg-[#ff5a00] hover:bg-[#e05000] text-white font-medium rounded-[14px] cursor-pointer shadow-md"
          >
            Kirim Pesan
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if showProgressModal}
    <div class="no-print fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[36px] p-8 max-w-md w-full space-y-6 shadow-2xl text-[13px] transition-colors">
        <div class="flex justify-between items-center border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-4">
          <div class="font-semibold text-base {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
            Perbarui Progres & Status ({activeProgressOrderId})
          </div>
          <button type="button" on:click={() => (showProgressModal = false)} class="text-[#71717a] hover:text-[#09090b] cursor-pointer">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} block">Status Proyek</span>
            <select
              bind:value={activeStatusValue}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium cursor-pointer"
            >
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
              <option value="Tahap Revisi">Tahap Revisi</option>
              <option value="Selesai">Selesai & Serah Terima</option>
            </select>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-[13px]">
              <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">Persentase Progres Sprint</span>
              <strong class="font-mono text-[#ff5a00]">{activeProgressValue}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              bind:value={activeProgressValue}
              class="w-full accent-[#ff5a00] cursor-pointer"
            />
            <div class="flex justify-between text-[11px] text-[#71717a]">
              <span>0% Kickoff</span>
              <span>50% Dev</span>
              <span>100% Selesai</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
          <button
            type="button"
            on:click={() => (showProgressModal = false)}
            class="px-5 py-2.5 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} rounded-[14px] cursor-pointer font-medium transition"
          >
            Batal
          </button>
          <button
            type="button"
            on:click={handleSaveProgress}
            class="px-5 py-2.5 bg-[#ff5a00] hover:bg-[#e05000] text-white font-medium rounded-[14px] cursor-pointer shadow-md"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  {/if}
{/if}

<!-- SINGLE TOP-LEVEL STYLE BLOCK -->
<style>
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  :global(body) {
    margin: 0 !important;
    padding: 0 !important;
  }

  @media print {
    :global(body) {
      background-color: white !important;
    }
    .no-print {
      display: none !important;
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
</style>