<script>
  import {
    orders,
    invoices,
    selectedOrderId,
    updateOrderStatusByAdmin,
    updatePaymentStatusByAdmin,
    navigateTo,
    formatRupiah,
    showToast,
    createNewOrder
  } from "../stores/marketplaceStore";
  import {
    products,
    clients,
    autoSchedulerActive,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    addClient,
    updateClient,
    deleteClient,
    toggleClientRenewal,
    sendAutoInvoiceToClient,
    sendBatchAutoInvoices,
    syncClientsWithBackend
  } from "../stores/adminStore";
  import { services } from "../data/services";
  import StatusBadge from "../components/StatusBadge.svelte";
  import Icon from "../components/Icon.svelte";
  import {
    isClientLoggedIn,
    clientUser,
    logoutClient,
    isAdminLoggedIn,
    adminUser,
    logoutAdmin
  } from "../stores/authStore";
  import { sendInvoiceEmailApi } from "../lib/services/apiService";
  import { onMount } from "svelte";

  // Active Tab State
  let currentAdminTab = "overview";

  // Dark Mode State
  let isDarkMode = false;

  // Foto Profil Admin (Menggunakan Foto Unsplash Professional Profile)
  const adminAvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  onMount(() => {
    syncClientsWithBackend();
    const savedTheme = localStorage.getItem("nexa_admin_theme");
    if (savedTheme) {
      isDarkMode = savedTheme === "dark";
    } else {
      isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  });

  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem("nexa_admin_theme", isDarkMode ? "dark" : "light");
  }

  // Search & Filter States
  let orderSearchQuery = "";
  let statusFilter = "all";
  let productSearchQuery = "";
  let productCategoryFilter = "all";
  let productViewMode = "grid"; // Pilihan: 'grid' (Kotak) | 'list' (Horizontal)
  let productCurrentPage = 1;
  let productItemsPerPage = 6; // Minimal 6 produk per halaman (pas untuk 2 baris x 3 kolom)
  let clientSearchQuery = "";
  let clientFilter = "all";

  // Modal States
  let showProductModal = false;
  let isEditingProduct = false;
  let editingProductId = null;
  let productForm = {
    name: "",
    category: "Development",
    tagline: "",
    billingType: "subscription",
    billingCycle: "Bulanan",
    price: 1500000,
    sla: "SLA Respons < 2 Jam",
    deliverables: "",
    status: "active"
  };

  let showClientModal = false;
  let isEditingClient = false;
  let editingClientId = null;
  let clientForm = {
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    serviceId: "prod-ui-ux",
    serviceName: "UI/UX Design & Product Retainer",
    package: "Standard Retainer",
    billingAmount: 1500000,
    billingCycle: "Bulanan",
    startDate: new Date().toISOString().split("T")[0],
    currentPeriodEnd: "",
    wantsRenewal: true,
    renewalNotes: ""
  };

  let showInvoicePreviewModal = false;
  let lastGeneratedInvoiceResult = null;
  let activePreviewMode = "whatsapp";

  // Statistics
  $: totalOrders = $orders.length;
  $: activeProjects = $orders.filter(
    (o) => o.projectStatus !== "Selesai" && o.projectStatus !== "Dibatalkan"
  ).length;
  $: totalRevenue = $orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Renewal & Client Statistics
  $: clientsWantingRenewal = $clients.filter((c) => c.wantsRenewal === true);
  $: renewalDueClients = $clients.filter(
    (c) => c.wantsRenewal === true && (!c.autoInvoiceSent || c.subscriptionStatus === "renewal_due")
  );
  $: totalRecurringMRR = $clients
    .filter((c) => c.wantsRenewal === true)
    .reduce((sum, c) => sum + (Number(c.billingAmount) || 0), 0);
  $: totalActiveProducts = $products.filter((p) => p.status === "active").length;

  // Filtered Orders
  $: filteredOrders = $orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o.customer?.name || "").toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o.serviceName || "").toLowerCase().includes(orderSearchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || o.projectStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered & Paginated Products
  $: filteredProducts = $products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (p.tagline || "").toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(productSearchQuery.toLowerCase());
    const matchCat = productCategoryFilter === "all" || p.category === productCategoryFilter;
    return matchSearch && matchCat;
  });

  $: totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / productItemsPerPage));
  $: if (productCurrentPage > totalProductPages) {
    productCurrentPage = totalProductPages;
  }
  $: paginatedProducts = filteredProducts.slice(
    (productCurrentPage - 1) * productItemsPerPage,
    productCurrentPage * productItemsPerPage
  );

  // Filtered Clients
  $: filteredClients = $clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      c.serviceName.toLowerCase().includes(clientSearchQuery.toLowerCase());

    let matchCondition = true;
    if (clientFilter === "renewal_yes") {
      matchCondition = c.wantsRenewal === true;
    } else if (clientFilter === "renewal_due") {
      matchCondition = c.wantsRenewal === true && (!c.autoInvoiceSent || c.subscriptionStatus === "renewal_due");
    } else if (clientFilter === "active") {
      matchCondition = c.subscriptionStatus === "active";
    }

    return matchSearch && matchCondition;
  });

  function handleStatusChange(orderId, newStatus) {
    let progress = 10;
    if (newStatus === "Sedang Dikerjakan") progress = 50;
    if (newStatus === "Tahap Revisi") progress = 85;
    if (newStatus === "Selesai") progress = 100;
    updateOrderStatusByAdmin(orderId, newStatus, progress);
  }

  function handlePaymentToggle(orderId, currentStatus) {
    const nextStatus = currentStatus === "PAID" ? "PENDING" : "PAID";
    updatePaymentStatusByAdmin(orderId, nextStatus);
  }

  function openAddProductModal() {
    isEditingProduct = false;
    editingProductId = null;
    productForm = {
      name: "",
      category: "Development",
      tagline: "",
      billingType: "subscription",
      billingCycle: "Bulanan",
      price: 1500000,
      sla: "SLA Respons < 2 Jam",
      deliverables: "Source code bersih & terstruktur\nOptimasi performa & responsive\nDokumentasi handoff",
      status: "active"
    };
    showProductModal = true;
  }

  function openEditProductModal(product) {
    isEditingProduct = true;
    editingProductId = product.id;
    productForm = {
      name: product.name,
      category: product.category,
      tagline: product.tagline || "",
      billingType: product.billingType || "subscription",
      billingCycle: product.billingCycle || "Bulanan",
      price: product.price,
      sla: product.sla || "",
      deliverables: Array.isArray(product.deliverables)
        ? product.deliverables.join("\n")
        : product.deliverables || "",
      status: product.status || "active"
    };
    showProductModal = true;
  }

  function handleSaveProduct() {
    if (!productForm.name.trim()) {
      showToast("Nama produk/layanan wajib diisi!", "error");
      return;
    }
    if (!productForm.price || Number(productForm.price) <= 0) {
      showToast("Harga produk harus lebih besar dari 0!", "error");
      return;
    }

    if (isEditingProduct) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm);
      currentAdminTab = "products";
      productCurrentPage = 1;
    }
    showProductModal = false;
  }

  function openAddClientModal() {
    isEditingClient = false;
    editingClientId = null;
    const today = new Date();
    const periodEnd = new Date(today);
    periodEnd.setDate(periodEnd.getDate() + 30);

    const firstProduct = $products[0] || {
      id: "prod-default",
      name: "UI/UX Design & Retainer",
      price: 1500000
    };

    clientForm = {
      name: "",
      company: "",
      email: "",
      phone: "+62 ",
      address: "",
      serviceId: firstProduct.id,
      serviceName: firstProduct.name,
      package: "Standard Retainer",
      billingAmount: firstProduct.price,
      billingCycle: "Bulanan",
      startDate: today.toISOString().split("T")[0],
      currentPeriodEnd: periodEnd.toISOString().split("T")[0],
      wantsRenewal: true,
      renewalNotes: "Klien menghendaki perpanjangan rutin bulanan."
    };
    showClientModal = true;
  }

  function openEditClientModal(client) {
    isEditingClient = true;
    editingClientId = client.id;
    clientForm = {
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      address: client.address || "",
      serviceId: client.serviceId,
      serviceName: client.serviceName,
      package: client.package,
      billingAmount: client.billingAmount,
      billingCycle: client.billingCycle || "Bulanan",
      startDate: client.startDate,
      currentPeriodEnd: client.currentPeriodEnd,
      wantsRenewal: client.wantsRenewal,
      renewalNotes: client.renewalNotes || ""
    };
    showClientModal = true;
  }

  function handleProductSelectForClient(e) {
    const selectedProdId = e.target.value;
    const prod = $products.find((p) => p.id === selectedProdId);
    if (prod) {
      clientForm.serviceId = prod.id;
      clientForm.serviceName = prod.name;
      clientForm.billingAmount = prod.price;
      clientForm.billingCycle = prod.billingCycle || "Bulanan";
    }
  }

  function handleSaveClient() {
    if (!clientForm.name.trim()) {
      showToast("Nama klien wajib diisi!", "error");
      return;
    }
    if (!clientForm.email.trim()) {
      showToast("Email klien wajib diisi!", "error");
      return;
    }
    if (!clientForm.phone.trim()) {
      showToast("Nomor WhatsApp/Telepon wajib diisi!", "error");
      return;
    }

    if (isEditingClient) {
      updateClient(editingClientId, clientForm);
    } else {
      addClient(clientForm);
    }
    showClientModal = false;
  }

  let isSendingPreviewEmail = false;

  async function triggerSingleAutoInvoice(clientId) {
    const result = await sendAutoInvoiceToClient(clientId);
    if (result) {
      lastGeneratedInvoiceResult = result;
      activePreviewMode = "whatsapp";
      showInvoicePreviewModal = true;
    }
  }

  async function triggerBatchAutoInvoicing() {
    const results = await sendBatchAutoInvoices();
    if (results && results.length > 0) {
      lastGeneratedInvoiceResult = results[0];
      activePreviewMode = "whatsapp";
      showInvoicePreviewModal = true;
    }
  }

  async function sendPreviewInvoiceViaSmtp() {
    if (!lastGeneratedInvoiceResult || isSendingPreviewEmail) return;
    const invNum =
      lastGeneratedInvoiceResult.invoice?.invoiceNumber ||
      lastGeneratedInvoiceResult.order?.invoiceNumber ||
      lastGeneratedInvoiceResult.order?.id;
    const recipient = lastGeneratedInvoiceResult.client?.email;
    if (!invNum || !recipient) {
      showToast("Nomor invoice atau email tujuan tidak tersedia.", "error");
      return;
    }

    isSendingPreviewEmail = true;
    try {
      const res = await sendInvoiceEmailApi(invNum, recipient);
      lastGeneratedInvoiceResult = {
        ...lastGeneratedInvoiceResult,
        emailSent: true,
        emailNotice: null
      };
      showToast(res?.message || `Email invoice ${invNum} terkirim ke ${recipient}!`, "success");
    } catch (err) {
      showToast(err.message || "Gagal mengirim email via SMTP.", "error");
    } finally {
      isSendingPreviewEmail = false;
    }
  }

  function copyTextToClipboard(text, msg = "Berhasil disalin ke clipboard!") {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(msg, "success");
    }
  }

  function openGeneratedInvoiceView(orderId) {
    showInvoicePreviewModal = false;
    selectedOrderId.set(orderId);
    navigateTo("invoice", { orderId });
  }

  // ==================== MODAL: TAMBAH PESANAN BARU (ADMIN) ====================
  let showNewOrderModal = false;
  let isSubmittingOrder = false;
  let selectedClientId = "";
  let selectedProductId = "";
  let availablePackages = [];

  let newOrderForm = {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerCompany: "",
    serviceId: "",
    serviceName: "",
    packageId: "standard",
    packageName: "Standard",
    price: 1500000,
    discount: 0,
    deliveryDays: 7,
    paymentMethod: "Bank Transfer BCA",
    paymentStatus: "PAID",
    projectStatus: "Sedang Dikerjakan",
    projectTitle: "",
    projectDescription: "",
    notes: ""
  };

  $: calculatedTaxable = Math.max(0, (Number(newOrderForm.price) || 0) - (Number(newOrderForm.discount) || 0));
  $: calculatedTax = Math.round(calculatedTaxable * 0.11);
  $: calculatedTotal = calculatedTaxable + calculatedTax;

  function openNewOrderModal() {
    selectedClientId = "";
    selectedProductId = "";
    availablePackages = [];

    newOrderForm = {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerCompany: "",
      serviceId: "",
      serviceName: "",
      packageId: "standard",
      packageName: "Standard",
      price: 1500000,
      discount: 0,
      deliveryDays: 7,
      paymentMethod: "Bank Transfer BCA",
      paymentStatus: "PAID",
      projectStatus: "Sedang Dikerjakan",
      projectTitle: "",
      projectDescription: "",
      notes: ""
    };

    if ($clients && $clients.length > 0) {
      handleClientSelect($clients[0].id || $clients[0].email);
    }

    if ($products && $products.length > 0) {
      handleProductSelect($products[0].id);
    }

    showNewOrderModal = true;
  }

  function handleClientSelect(clientId) {
    selectedClientId = clientId;
    const target = $clients.find((c) => (c.id === clientId || c.email === clientId));
    if (target) {
      newOrderForm.customerName = target.name || "";
      newOrderForm.customerEmail = target.email || "";
      newOrderForm.customerPhone = target.phone || "-";
      newOrderForm.customerCompany = target.company || "-";
      if (newOrderForm.serviceName) {
        newOrderForm.projectTitle = `Proyek ${newOrderForm.serviceName} - ${target.name}`;
      }
    }
  }

  function handleProductSelect(prodId) {
    selectedProductId = prodId;
    const prod = $products.find((p) => p.id === prodId);
    if (!prod) return;

    newOrderForm.serviceId = prod.id;
    newOrderForm.serviceName = prod.name;
    newOrderForm.price = Number(prod.price) || 1500000;

    const srv = services.find((s) => s.id === prod.id || s.name.toLowerCase() === prod.name.toLowerCase());
    if (srv && Array.isArray(srv.packages) && srv.packages.length > 0) {
      availablePackages = srv.packages;
      const defaultPkg = srv.packages.find((p) => p.id === 'standard') || srv.packages[0];
      newOrderForm.packageId = defaultPkg.id;
      newOrderForm.packageName = defaultPkg.name;
      newOrderForm.price = Number(defaultPkg.price) || Number(prod.price) || 1500000;
    } else {
      availablePackages = [
        { id: "basic", name: "Basic", price: Math.round(prod.price * 0.7) },
        { id: "standard", name: "Standard", price: prod.price },
        { id: "premium", name: "Premium", price: Math.round(prod.price * 1.5) }
      ];
      newOrderForm.packageId = "standard";
      newOrderForm.packageName = "Standard";
      newOrderForm.price = prod.price;
    }

    if (newOrderForm.customerName) {
      newOrderForm.projectTitle = `Proyek ${prod.name} - ${newOrderForm.customerName}`;
    } else {
      newOrderForm.projectTitle = `Proyek ${prod.name}`;
    }
  }

  function handlePackageSelect(pkgId) {
    const pkg = availablePackages.find((p) => p.id === pkgId);
    if (pkg) {
      newOrderForm.packageId = pkg.id;
      newOrderForm.packageName = pkg.name;
      if (pkg.price) {
        newOrderForm.price = Number(pkg.price);
      }
    }
  }

  async function handleCreateOrderSubmit() {
    if (!newOrderForm.customerName.trim() || !newOrderForm.customerEmail.trim()) {
      showToast("Silakan pilih data klien yang terdaftar di database terlebih dahulu!", "error");
      return;
    }
    if (!newOrderForm.serviceId) {
      showToast("Silakan pilih data produk / layanan dari database terlebih dahulu!", "error");
      return;
    }

    if (!newOrderForm.projectTitle.trim()) {
      newOrderForm.projectTitle = `Proyek ${newOrderForm.serviceName} - ${newOrderForm.customerName}`;
    }

    isSubmittingOrder = true;
    try {
      const taxable = Math.max(0, Number(newOrderForm.price) - Number(newOrderForm.discount));
      const tax = Math.round(taxable * 0.11);
      const total = taxable + tax;

      const payload = {
        serviceId: newOrderForm.serviceId,
        serviceName: newOrderForm.serviceName,
        packageId: newOrderForm.packageId,
        packageName: newOrderForm.packageName,
        customerName: newOrderForm.customerName,
        customerEmail: newOrderForm.customerEmail,
        customerPhone: newOrderForm.customerPhone,
        customerCompany: newOrderForm.customerCompany,
        customer: {
          name: newOrderForm.customerName,
          email: newOrderForm.customerEmail,
          phone: newOrderForm.customerPhone,
          company: newOrderForm.customerCompany
        },
        price: Number(newOrderForm.price),
        discount: Number(newOrderForm.discount) || 0,
        tax: tax,
        total: total,
        deliveryDays: Number(newOrderForm.deliveryDays) || 7,
        paymentMethod: newOrderForm.paymentMethod,
        paymentStatus: newOrderForm.paymentStatus,
        projectStatus: newOrderForm.projectStatus,
        progress: newOrderForm.projectStatus === "Selesai" ? 100 : (newOrderForm.projectStatus === "Sedang Dikerjakan" ? 25 : 0),
        assignedTeam: "Admin Nexa Digital",
        requirements: {
          title: newOrderForm.projectTitle,
          description: newOrderForm.projectDescription || `Pesanan baru layanan ${newOrderForm.serviceName} (${newOrderForm.packageName}) dibuat langsung oleh Administrator.`,
          referenceUrl: "",
          notes: newOrderForm.notes || "Dibuat langsung oleh Administrator melalui panel manajemen pesanan."
        },
        projectTitle: newOrderForm.projectTitle,
        projectDescription: newOrderForm.projectDescription,
        notes: newOrderForm.notes
      };

      const created = await createNewOrder(payload);
      if (created) {
        showToast(`Pesanan ${created.id || ''} berhasil dibuat dan disimpan ke database!`, "success");
        showNewOrderModal = false;
      }
    } catch (err) {
      console.error("Gagal menambahkan pesanan:", err);
      showToast("Gagal menyimpan pesanan: " + (err.message || "Kesalahan server"), "error");
    } finally {
      isSubmittingOrder = false;
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

{#if $isClientLoggedIn}
  <div class="min-h-screen bg-[#f4f4f5] text-[#09090b] flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white border border-[#ececee] p-8 rounded-[36px] shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-[24px] mx-auto flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
      </div>
      <div class="space-y-2">
        <span class="px-3 py-1 rounded-[12px] bg-rose-500/10 text-rose-500 text-[11px] font-semibold uppercase tracking-wider">
          Akses Ditolak
        </span>
        <h1 class="text-xl font-semibold tracking-tight text-[#09090b]">Akun Klien Tidak Diizinkan</h1>
        <p class="text-[13px] text-[#52525b] leading-relaxed">
          Anda masuk sebagai <strong class="text-[#09090b]">{$clientUser?.name}</strong>. Area ini dikhususkan untuk Administrator Studio.
        </p>
      </div>
      <div class="space-y-3 pt-2">
        <button
          type="button"
          on:click={() => navigateTo('customer-dashboard')}
          class="w-full py-3.5 px-4 bg-[#ff5a00] hover:bg-[#e05000] text-white font-medium text-[13px] rounded-[14px] transition shadow-md cursor-pointer"
        >
          Kembali ke Dashboard Klien
        </button>
        <button
          type="button"
          on:click={logoutClient}
          class="w-full py-3.5 px-4 bg-[#fafafa] hover:bg-[#ececee] text-[#18181b] font-medium text-[13px] border border-[#ececee] rounded-[14px] transition cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
{:else if !$isAdminLoggedIn}
  <div class="min-h-screen bg-[#f4f4f5] text-[#09090b] flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white border border-[#ececee] p-8 rounded-[36px] shadow-xl space-y-6 text-center">
      <div class="w-16 h-16 bg-[#ff5a00]/10 text-[#ff5a00] rounded-[24px] mx-auto flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <div class="space-y-2">
        <span class="px-3 py-1 rounded-[12px] bg-[#ff5a00]/10 text-[#ff5a00] text-[11px] font-semibold uppercase tracking-wider">
          Otorisasi Diperlukan
        </span>
        <h1 class="text-xl font-semibold tracking-tight text-[#09090b]">Konsol Administrator</h1>
        <p class="text-[13px] text-[#52525b] leading-relaxed">
          Autentikasi diperlukan untuk mengakses manajemen operasional Nexa Digital Studio.
        </p>
      </div>
      <div class="space-y-3 pt-2">
        <button
          type="button"
          on:click={() => navigateTo('admin-login')}
          class="w-full py-3.5 px-4 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold uppercase tracking-wider text-[13px] rounded-[14px] transition shadow-md shadow-[#ff5a00]/30 cursor-pointer"
        >
          Masuk sebagai Admin
        </button>
        <button
          type="button"
          on:click={() => navigateTo('home')}
          class="w-full py-3.5 px-4 bg-[#fafafa] hover:bg-[#ececee] text-[#18181b] font-medium text-[13px] border border-[#ececee] rounded-[14px] transition cursor-pointer"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  </div>
{:else}

<!-- ==================== MAIN DASHBOARD CONTAINER ==================== -->
<div class="{isDarkMode ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#f4f4f5] text-[#09090b]'} min-h-screen font-['Plus_Jakarta_Sans',sans-serif] antialiased py-12 pb-24 relative transition-colors duration-300 w-full selection:bg-[#ff5a00] selection:text-white">
  
  <!-- Ambient Glow Orbs -->
  <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#ff5a00]/5 rounded-full blur-[120px]"></div>
    <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[150px]"></div>
  </div>

  <div class="w-full px-6 sm:px-12 lg:px-20 relative z-10 space-y-10">

    <!-- ==================== STICKY TOP NAVIGATION BAR ==================== -->
    <header class="sticky top-6 z-50 {isDarkMode ? 'bg-[#18181b]/90 border-[#27272a] text-[#f4f4f5] shadow-2xl' : 'bg-white/90 border-[#ececee] text-[#09090b] shadow-xl'} backdrop-blur-2xl border px-6 py-4 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 w-full">
      
      <!-- Admin Identity & Profile Badge -->
      <div class="flex items-center gap-3.5 w-full md:w-auto">
        <div class="w-10 h-10 rounded-[14px] overflow-hidden shrink-0 shadow-xs border {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
          <img 
            src={$adminUser?.avatar || adminAvatarUrl} 
            alt="Foto Profil Admin" 
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <div class="font-semibold text-[13px] tracking-wide {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{$adminUser?.name || "Administrator IT Nexa"}</div>
          <div class="text-[11px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'}">{$adminUser?.email || "admin@nexadigital.id"}</div>
        </div>
      </div>

      <!-- Horizontal Navigation Tabs & Actions -->
      <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto justify-end">
        <nav class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-[13px] font-medium">
          <button
            type="button"
            on:click={() => (currentAdminTab = "overview")}
            class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentAdminTab === 'overview' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
          >
            Overview
          </button>
          <button
            type="button"
            on:click={() => (currentAdminTab = "products")}
            class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentAdminTab === 'products' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
          >
            Produk ({$products.length})
          </button>
          <button
            type="button"
            on:click={() => (currentAdminTab = "clients")}
            class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentAdminTab === 'clients' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
          >
            Klien ({$clients.length})
          </button>
          <button
            type="button"
            on:click={() => (currentAdminTab = "renewals")}
            class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 {currentAdminTab === 'renewals' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
          >
            <span>Tagihan Otomatis</span>
            {#if renewalDueClients.length > 0}
              <span class="px-1.5 py-0.5 rounded-full bg-[#ff5a00] text-white text-[10px] font-bold animate-pulse">
                {renewalDueClients.length}
              </span>
            {/if}
          </button>
          <button
            type="button"
            on:click={() => (currentAdminTab = "orders")}
            class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentAdminTab === 'orders' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
          >
            Pesanan ({totalOrders})
          </button>
          <button
            type="button"
            on:click={() => (currentAdminTab = "invoices")}
            class="px-4 py-2 rounded-[14px] transition-all cursor-pointer whitespace-nowrap {currentAdminTab === 'invoices' ? 'bg-[#ff5a00] text-white font-semibold shadow-md' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]' : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#fafafa]')}"
          >
            Arsip Faktur
          </button>
        </nav>

        <!-- Action Buttons -->
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
            on:click={() => navigateTo("home")}
            class="px-4 py-2.5 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:text-white hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:text-[#09090b] hover:bg-[#ececee] border border-[#ececee]'} rounded-[14px] transition flex items-center gap-1.5 font-medium text-[13px] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Beranda</span>
          </button>

          <button
            type="button"
            on:click={logoutAdmin}
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
      {#if currentAdminTab === "overview"}
        <div class="space-y-8 animate-fade-in">
          <!-- Welcome Banner Card -->
          <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border p-8 sm:p-12 rounded-[36px] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
            <div class="space-y-3 max-w-2xl">
              <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-widest block">
                [ KONSOL ADMINISTRATOR ]
              </span>
              <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
                Ringkasan Operasional Studio
              </h1>
              <p class="text-[14px] sm:text-[16px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                Pantau performa layanan, manajemen klien, dan pembukuan secara real-time.
              </p>
            </div>
            <div class="flex items-center gap-3 flex-wrap shrink-0">
              <button
                type="button"
                on:click={openAddProductModal}
                class="px-6 py-3.5 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold text-[13px] rounded-[14px] shadow-lg shadow-[#ff5a00]/30 transition cursor-pointer flex items-center gap-2"
              >
                <Icon name="plus" size={16} />
                <span>Tambah Produk</span>
              </button>
              <button
                type="button"
                on:click={() => (currentAdminTab = "renewals")}
                class="px-6 py-3.5 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} font-semibold text-[13px] rounded-[14px] shadow-sm transition cursor-pointer flex items-center gap-2"
              >
                <Icon name="zap" size={16} />
                <span>Tagihan ({renewalDueClients.length})</span>
              </button>
            </div>
          </div>

          <!-- KPI Metric Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors">
              <span class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block">Total Pendapatan</span>
              <div class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} truncate">
                {formatRupiah(totalRevenue)}
              </div>
              <span class="text-[11px] text-emerald-500 font-medium">Terverifikasi Kas</span>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors">
              <span class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block">Nilai Retainer MRR</span>
              <div class="text-2xl sm:text-3xl font-semibold text-[#ff5a00] truncate">
                {formatRupiah(totalRecurringMRR)}
              </div>
              <span class="text-[11px] text-[#71717a]">Langganan Aktif</span>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors">
              <span class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block">Siap Tagih</span>
              <div class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
                {renewalDueClients.length} Klien
              </div>
              <span class="text-[11px] text-[#ff5a00] font-medium">Perpanjangan Kontrak</span>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-6 rounded-[28px] shadow-xs space-y-1.5 transition-colors">
              <span class="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider block">Produk & Jasa</span>
              <div class="text-2xl sm:text-3xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
                {totalActiveProducts} Aktif
              </div>
              <span class="text-[11px] text-emerald-500 font-medium">Katalog Studio</span>
            </div>
          </div>

          <!-- Quick Action Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-3 transition-colors hover:border-[#ff5a00]/40">
              <div class="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-[18px] flex items-center justify-center">
                <Icon name="package" size={22} />
              </div>
              <h3 class="font-semibold text-lg {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Katalog Produk</h3>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                Kelola daftar penawaran layanan studio, atur harga retainer, dan spesifikasi SLA.
              </p>
              <button
                type="button"
                on:click={() => (currentAdminTab = "products")}
                class="text-[13px] font-semibold text-[#ff5a00] hover:text-[#e05000] flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>Buka Katalog &rarr;</span>
              </button>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-3 transition-colors hover:border-[#ff5a00]/40">
              <div class="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-[18px] flex items-center justify-center">
                <Icon name="users" size={22} />
              </div>
              <h3 class="font-semibold text-lg {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Basis Data Klien</h3>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                Daftarkan klien baru, pantau status kontrak berlangganan, dan riwayat pesanan.
              </p>
              <button
                type="button"
                on:click={() => (currentAdminTab = "clients")}
                class="text-[13px] font-semibold text-[#ff5a00] hover:text-[#e05000] flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>Kelola Klien &rarr;</span>
              </button>
            </div>

            <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-3 transition-colors hover:border-[#ff5a00]/40">
              <div class="w-12 h-12 bg-[#ff5a00]/10 text-[#ff5a00] rounded-[18px] flex items-center justify-center">
                <Icon name="zap" size={22} />
              </div>
              <h3 class="font-semibold text-lg {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Tagihan Otomatis</h3>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} leading-relaxed">
                Kirim faktur perpanjangan berkala otomatis via WhatsApp dan Email ke klien.
              </p>
              <button
                type="button"
                on:click={() => (currentAdminTab = "renewals")}
                class="text-[13px] font-semibold text-[#ff5a00] hover:text-[#e05000] flex items-center gap-1 cursor-pointer pt-2"
              >
                <span>Proses Tagihan &rarr;</span>
              </button>
            </div>
          </div>

          <!-- Recent Orders Preview Table -->
          <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-5 transition-colors">
            <div class="flex items-center justify-between border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-5">
              <h3 class="text-lg font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Pesanan & Transaksi Terbaru</h3>
              <button
                type="button"
                on:click={() => (currentAdminTab = "orders")}
                class="text-[13px] font-semibold text-[#ff5a00] hover:text-[#e05000] cursor-pointer"
              >
                Lihat Semua ({totalOrders}) &rarr;
              </button>
            </div>

            <div class="overflow-x-auto text-[13px]">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b {isDarkMode ? 'border-[#27272a] text-[#71717a]' : 'border-[#ececee] text-[#71717a]'} font-semibold">
                    <th class="py-3.5 px-4">Order ID</th>
                    <th class="py-3.5 px-4">Klien</th>
                    <th class="py-3.5 px-4">Modul Layanan</th>
                    <th class="py-3.5 px-4">Nilai Total</th>
                    <th class="py-3.5 px-4">Status</th>
                    <th class="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y {isDarkMode ? 'divide-[#27272a]' : 'divide-[#ececee]'}">
                  {#each $orders.slice(0, 4) as o}
                    <tr class="{isDarkMode ? 'hover:bg-[#27272a]/30' : 'hover:bg-[#fafafa]'} transition-colors">
                      <td class="py-4 px-4 font-semibold font-mono text-[#ff5a00]">{o.id}</td>
                      <td class="py-4 px-4 font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{o.customer?.name || "-"}</td>
                      <td class="py-4 px-4 {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{o.serviceName}</td>
                      <td class="py-4 px-4 font-semibold font-mono {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{formatRupiah(o.total)}</td>
                      <td class="py-4 px-4"><StatusBadge status={o.projectStatus} size="sm" /></td>
                      <td class="py-4 px-4 text-right">
                        <button
                          type="button"
                          on:click={() => {
                            selectedOrderId.set(o.id);
                            navigateTo("invoice", { orderId: o.id });
                          }}
                          class="px-4 py-2 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} font-medium rounded-[12px] text-[12px] transition cursor-pointer shadow-xs"
                        >
                          Faktur
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {/if}

      <!-- TAB 2: PRODUCTS (DENGAN VIEW KOTAK/HORIZONTAL & PAGINATION NEXT/BACK) -->
      {#if currentAdminTab === "products"}
        <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-6 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-6">
            <div>
              <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-wider block">[ KATALOG ]</span>
              <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">Kelola Produk & Layanan Studio</h2>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mt-1">Atur paket langganan, harga dasar, dan SLA deliverable.</p>
            </div>
            <button
              type="button"
              on:click={openAddProductModal}
              class="px-5 py-3 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold text-[13px] rounded-[14px] shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Icon name="plus" size={16} />
              <span>Tambah Produk</span>
            </button>
          </div>

          <!-- Search, Filter, Per-Page & View Switcher Bar -->
          <div class="flex flex-col lg:flex-row items-center gap-3.5 text-[13px]">
            <div class="relative flex-1 w-full">
              <Icon name="search" size={16} className="absolute left-3.5 top-3.5 text-[#71717a]" />
              <input
                type="text"
                placeholder="Cari nama produk atau kategori..."
                bind:value={productSearchQuery}
                on:input={() => (productCurrentPage = 1)}
                class="w-full pl-10 pr-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
              />
            </div>

            <div class="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
              <select
                bind:value={productCategoryFilter}
                on:change={() => (productCurrentPage = 1)}
                class="flex-1 sm:w-auto px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-semibold focus:outline-none focus:border-[#ff5a00] cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="Design">UI/UX Design</option>
                <option value="Development">Web Development</option>
                <option value="Mobile App">Mobile App</option>
                <option value="DevOps">Cloud & DevOps</option>
              </select>

              <!-- Jumlah Tampil per Halaman
              <select
                bind:value={productItemsPerPage}
                on:change={() => (productCurrentPage = 1)}
                title="Jumlah produk per halaman"
                class="px-3.5 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-semibold focus:outline-none focus:border-[#ff5a00] cursor-pointer"
              >
                <option value={6}>6 / hal</option>
                <option value={9}>9 / hal</option>
                <option value={12}>12 / hal</option>
              </select> -->

              <!-- View Mode Toggle (Kotak vs Horizontal) -->
              <div class="flex items-center p-1 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border rounded-[16px] shrink-0">
                <button
                  type="button"
                  on:click={() => (productViewMode = "grid")}
                  title="Tampilan Kotak (Grid)"
                  class="p-2 rounded-[12px] transition-all cursor-pointer flex items-center gap-1.5 {productViewMode === 'grid' ? 'bg-[#ff5a00] text-white shadow-xs' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white' : 'text-[#71717a] hover:text-[#09090b]')}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
                </button>
                <button
                  type="button"
                  on:click={() => (productViewMode = "list")}
                  title="Tampilan Horizontal (List)"
                  class="p-2 rounded-[12px] transition-all cursor-pointer flex items-center gap-1.5 {productViewMode === 'list' ? 'bg-[#ff5a00] text-white shadow-xs' : (isDarkMode ? 'text-[#a1a1aa] hover:text-white' : 'text-[#71717a] hover:text-[#09090b]')}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          {#if filteredProducts.length === 0}
            <div class="py-16 text-center space-y-2 border {isDarkMode ? 'border-[#27272a] bg-[#27272a]/20' : 'border-[#ececee] bg-[#fafafa]'} rounded-[28px]">
              <p class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Tidak ada produk ditemukan</p>
              <p class="text-[13px] text-[#71717a]">Coba ubah kata kunci pencarian atau filter kategori.</p>
            </div>
          {:else if productViewMode === "grid"}
            <!-- ==================== TAMPILAN KOTAK (GRID VIEW) ==================== -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each paginatedProducts as prod}
                <div class="{isDarkMode ? 'bg-[#27272a]/40 border-[#27272a] hover:border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee] hover:border-[#d4d4d8]'} border p-6 rounded-[28px] shadow-xs space-y-4 flex flex-col justify-between transition-all">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="px-3 py-1 {isDarkMode ? 'bg-[#27272a] text-[#f4f4f5]' : 'bg-white border border-[#ececee] text-[#09090b]'} text-[11px] font-semibold rounded-[12px] uppercase">
                        {prod.category}
                      </span>
                      <button
                        type="button"
                        on:click={() => toggleProductStatus(prod.id)}
                        class="px-3 py-1 text-[11px] font-semibold rounded-[12px] border transition cursor-pointer {prod.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#27272a] text-[#71717a] border-[#3f3f46]'}"
                      >
                        {prod.status === "active" ? "Aktif" : "Draft"}
                      </button>
                    </div>

                    <h3 class="font-semibold text-lg {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{prod.name}</h3>
                    <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} line-clamp-2">{prod.tagline}</p>

                    <div class="p-4 {isDarkMode ? 'bg-[#09090b] border-[#3f3f46]' : 'bg-white border-[#ececee]'} rounded-[20px] border space-y-1">
                      <div class="flex items-baseline justify-between text-[13px]">
                        <span class="{isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'} font-medium">Harga / Retainer:</span>
                        <div class="text-right">
                          <span class="font-semibold font-mono {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{formatRupiah(prod.price)}</span>
                          <span class="text-[11px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'}">/{prod.billingCycle || "Bulan"}</span>
                        </div>
                      </div>
                      <div class="text-[12px] text-[#ff5a00] font-medium">
                        SLA: {prod.sla}
                      </div>
                    </div>
                  </div>

                  <div class="pt-4 border-t {isDarkMode ? 'border-[#3f3f46]' : 'border-[#ececee]'} flex items-center justify-between text-[13px]">
                    <span class="text-[#71717a] text-[12px]">{prod.activeSubscribers || 0} Klien aktif</span>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        on:click={() => openEditProductModal(prod)}
                        class="px-3.5 py-2 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5]' : 'bg-white hover:bg-[#fafafa] border border-[#ececee] text-[#18181b]'} font-medium rounded-[12px] text-[12px] transition cursor-pointer shadow-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        on:click={() => deleteProduct(prod.id)}
                        class="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-medium rounded-[12px] text-[12px] transition cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <!-- ==================== TAMPILAN HORIZONTAL (LIST VIEW) ==================== -->
            <div class="space-y-3.5">
              {#each paginatedProducts as prod}
                <div class="{isDarkMode ? 'bg-[#27272a]/40 border-[#27272a] hover:border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee] hover:border-[#d4d4d8]'} border p-5 sm:p-6 rounded-[24px] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all">
                  
                  <!-- Kiri: Info Produk & Kategori -->
                  <div class="space-y-2 flex-1 min-w-0">
                    <div class="flex items-center gap-2.5 flex-wrap">
                      <span class="px-3 py-1 {isDarkMode ? 'bg-[#27272a] text-[#f4f4f5]' : 'bg-white border border-[#ececee] text-[#09090b]'} text-[11px] font-semibold rounded-[10px] uppercase">
                        {prod.category}
                      </span>
                      <button
                        type="button"
                        on:click={() => toggleProductStatus(prod.id)}
                        class="px-3 py-1 text-[11px] font-semibold rounded-[10px] border transition cursor-pointer {prod.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#27272a] text-[#71717a] border-[#3f3f46]'}"
                      >
                        {prod.status === "active" ? "Aktif" : "Draft"}
                      </button>
                      <span class="text-[12px] text-[#71717a]">&bull; {prod.activeSubscribers || 0} Klien berlangganan</span>
                    </div>

                    <div>
                      <h3 class="font-semibold text-lg {isDarkMode ? 'text-white' : 'text-[#09090b]'} truncate">{prod.name}</h3>
                      <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} line-clamp-1">{prod.tagline}</p>
                    </div>
                  </div>

                  <!-- Tengah & Kanan: SLA, Harga, dan Tombol Aksi -->
                  <div class="flex flex-col sm:flex-row lg:items-center gap-4 lg:gap-8 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 {isDarkMode ? 'border-[#3f3f46]' : 'border-[#ececee]'}">
                    <div class="lg:text-right">
                      <span class="text-[11px] uppercase tracking-wider text-[#71717a] block font-semibold">Kecepatan Layanan</span>
                      <span class="text-[12px] text-[#ff5a00] font-medium">{prod.sla}</span>
                    </div>

                    <div class="px-4 py-2.5 {isDarkMode ? 'bg-[#09090b] border-[#3f3f46]' : 'bg-white border-[#ececee]'} rounded-[16px] border lg:text-right min-w-[170px]">
                      <span class="text-[10px] uppercase tracking-wider text-[#71717a] block">Biaya Retainer</span>
                      <div>
                        <span class="font-semibold font-mono text-[14px] {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{formatRupiah(prod.price)}</span>
                        <span class="text-[11px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'}">/{prod.billingCycle || "Bulan"}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 justify-end">
                      <button
                        type="button"
                        on:click={() => openEditProductModal(prod)}
                        class="px-4 py-2.5 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5]' : 'bg-white hover:bg-[#fafafa] border border-[#ececee] text-[#18181b]'} font-medium rounded-[12px] text-[12px] transition cursor-pointer shadow-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        on:click={() => deleteProduct(prod.id)}
                        class="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-medium rounded-[12px] text-[12px] transition cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                </div>
              {/each}
            </div>
          {/if}

          <!-- ==================== PAGINATION CONTROLS (BACK / NEXT) ==================== -->
          {#if filteredProducts.length > 0}
            <div class="pt-5 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px]">
              <div class="{isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'}">
                Menampilkan <strong class="{isDarkMode ? 'text-white' : 'text-[#09090b]'}">{(productCurrentPage - 1) * productItemsPerPage + 1}</strong>
                –
                <strong class="{isDarkMode ? 'text-white' : 'text-[#09090b]'}">{Math.min(productCurrentPage * productItemsPerPage, filteredProducts.length)}</strong>
                dari <strong class="{isDarkMode ? 'text-white' : 'text-[#09090b]'}">{filteredProducts.length}</strong> produk
              </div>

              <div class="flex items-center gap-2">
                <!-- Tombol Back -->
                <button
                  type="button"
                  disabled={productCurrentPage === 1}
                  on:click={() => (productCurrentPage = Math.max(1, productCurrentPage - 1))}
                  class="px-4 py-2.5 rounded-[14px] font-semibold flex items-center gap-1.5 border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white hover:bg-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b] hover:bg-[#ececee]'}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  <span>Back</span>
                </button>

                <!-- Nomor Halaman -->
                <div class="flex items-center gap-1">
                  {#each Array(totalProductPages) as _, idx}
                    {@const pageNum = idx + 1}
                    <button
                      type="button"
                      on:click={() => (productCurrentPage = pageNum)}
                      class="w-9 h-9 rounded-[12px] font-semibold text-[12px] transition cursor-pointer {productCurrentPage === pageNum ? 'bg-[#ff5a00] text-white shadow-sm' : (isDarkMode ? 'text-[#a1a1aa] hover:bg-[#27272a] hover:text-white' : 'text-[#52525b] hover:bg-[#fafafa] hover:text-[#09090b]')}"
                    >
                      {pageNum}
                    </button>
                  {/each}
                </div>

                <!-- Tombol Next -->
                <button
                  type="button"
                  disabled={productCurrentPage === totalProductPages}
                  on:click={() => (productCurrentPage = Math.min(totalProductPages, productCurrentPage + 1))}
                  class="px-4 py-2.5 rounded-[14px] font-semibold flex items-center gap-1.5 border transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white hover:bg-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b] hover:bg-[#ececee]'}"
                >
                  <span>Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- TAB 3: CLIENTS -->
      {#if currentAdminTab === "clients"}
        <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-6 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-6">
            <div>
              <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-wider block">[ KLIEN ]</span>
              <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">Basis Data Klien & Langganan</h2>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mt-1">Kelola data kontak, masa aktif layanan, dan perpanjangan rutin.</p>
            </div>
            <button
              type="button"
              on:click={openAddClientModal}
              class="px-5 py-3 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold text-[13px] rounded-[14px] shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Icon name="plus" size={16} />
              <span>Tambah Klien</span>
            </button>
          </div>

          <!-- Search & Filter -->
          <div class="flex flex-col sm:flex-row items-center gap-3.5 text-[13px]">
            <div class="relative flex-1 w-full">
              <Icon name="search" size={16} className="absolute left-3.5 top-3.5 text-[#71717a]" />
              <input
                type="text"
                placeholder="Cari nama klien, perusahaan, atau email..."
                bind:value={clientSearchQuery}
                class="w-full pl-10 pr-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
              />
            </div>
            <select
              bind:value={clientFilter}
              class="w-full sm:w-auto px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-semibold focus:outline-none focus:border-[#ff5a00] cursor-pointer"
            >
              <option value="all">Semua Klien ({$clients.length})</option>
              <option value="renewal_yes">Ingin Lanjut ({clientsWantingRenewal.length})</option>
              <option value="renewal_due">Siap Tagih ({renewalDueClients.length})</option>
            </select>
          </div>

          <!-- Clients Table -->
          <div class="overflow-x-auto text-[13px]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b {isDarkMode ? 'border-[#27272a] text-[#71717a]' : 'border-[#ececee] text-[#71717a]'} font-semibold">
                  <th class="py-3.5 px-4">Klien & Perusahaan</th>
                  <th class="py-3.5 px-4">Kontak</th>
                  <th class="py-3.5 px-4">Layanan & Retainer</th>
                  <th class="py-3.5 px-4">Masa Aktif</th>
                  <th class="py-3.5 px-4">Status Kontrak</th>
                  <th class="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y {isDarkMode ? 'divide-[#27272a]' : 'divide-[#ececee]'}">
                {#each filteredClients as cli}
                  <tr class="{isDarkMode ? 'hover:bg-[#27272a]/30' : 'hover:bg-[#fafafa]'} transition-colors">
                    <td class="py-4 px-4">
                      <div class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{cli.name}</div>
                      <div class="text-[11px] text-[#71717a]">{cli.company}</div>
                    </td>
                    <td class="py-4 px-4 {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">
                      <div>{cli.email}</div>
                      <a href="https://wa.me/{cli.phone.replace(/[^0-9]/g, '')}" target="_blank" rel="noreferrer" class="text-emerald-500 hover:underline font-medium">
                        {cli.phone}
                      </a>
                    </td>
                    <td class="py-4 px-4">
                      <div class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{cli.serviceName}</div>
                      <div class="font-mono font-bold text-[#ff5a00] mt-0.5">{formatRupiah(cli.billingAmount)}/{cli.billingCycle || "Bulan"}</div>
                    </td>
                    <td class="py-4 px-4 {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} font-mono">
                      s/d {cli.currentPeriodEnd}
                    </td>
                    <td class="py-4 px-4">
                      <button
                        type="button"
                        on:click={() => toggleClientRenewal(cli.id)}
                        class="px-3 py-1 text-[11px] font-bold rounded-[12px] border transition cursor-pointer {cli.wantsRenewal ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#27272a] text-[#71717a] border-[#3f3f46]'}"
                      >
                        {cli.wantsRenewal ? "✓ Ingin Lanjut" : "Tidak Lanjut"}
                      </button>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        {#if cli.wantsRenewal}
                          <button
                            type="button"
                            on:click={() => triggerSingleAutoInvoice(cli.id)}
                            class="px-3.5 py-2 bg-[#ff5a00] hover:bg-[#e05000] text-white font-medium rounded-[12px] text-[12px] transition cursor-pointer shadow-xs"
                          >
                            Kirim Tagihan
                          </button>
                        {/if}
                        <button
                          type="button"
                          on:click={() => openEditClientModal(cli)}
                          class="px-3.5 py-2 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-[#f4f4f5]' : 'bg-white hover:bg-[#fafafa] border border-[#ececee] text-[#18181b]'} font-medium rounded-[12px] text-[12px] transition cursor-pointer shadow-xs"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          on:click={() => deleteClient(cli.id)}
                          class="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-medium rounded-[12px] text-[12px] transition cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <!-- TAB 4: RENEWALS -->
      {#if currentAdminTab === "renewals"}
        <div class="space-y-6 animate-fade-in">
          <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-6 transition-colors">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-6">
              <div>
                <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-wider block">[ AUTOMATED BILLING ]</span>
                <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">Kirim Tagihan Otomatis Perpanjangan</h2>
                <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mt-1 max-w-2xl leading-relaxed">
                  Sistem mendeteksi klien yang ingin memperpanjang kontrak layanan. Menerbitkan e-Faktur resmi (PPN 11%) dan mengirimkan notifikasi penagihan ke WhatsApp serta Email.
                </p>
              </div>
              <button
                type="button"
                on:click={triggerBatchAutoInvoicing}
                disabled={renewalDueClients.length === 0}
                class="px-6 py-3.5 bg-[#ff5a00] hover:bg-[#e05000] disabled:opacity-50 text-white font-semibold text-[13px] rounded-[14px] shadow-lg shadow-[#ff5a00]/30 transition cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Icon name="zap" size={16} />
                <span>Kirim Semua Tagihan ({renewalDueClients.length})</span>
              </button>
            </div>

            <!-- Metrics -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
              <div class="p-5 {isDarkMode ? 'bg-[#27272a]/50 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border rounded-[22px] space-y-1">
                <span class="text-[#71717a] font-medium text-[11px] uppercase tracking-wider">Klien Ingin Lanjut</span>
                <div class="text-xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{clientsWantingRenewal.length} Klien</div>
              </div>
              <div class="p-5 {isDarkMode ? 'bg-[#27272a]/50 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border rounded-[22px] space-y-1">
                <span class="text-[#71717a] font-medium text-[11px] uppercase tracking-wider">Siap Dikirimi Tagihan</span>
                <div class="text-xl font-semibold text-[#ff5a00]">{renewalDueClients.length} Klien</div>
              </div>
              <div class="p-5 {isDarkMode ? 'bg-[#27272a]/50 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border rounded-[22px] space-y-1">
                <span class="text-[#71717a] font-medium text-[11px] uppercase tracking-wider">Potensi MRR Baru</span>
                <div class="text-xl font-semibold font-mono {isDarkMode ? 'text-white' : 'text-[#09090b]'} truncate">{formatRupiah(totalRecurringMRR)}</div>
              </div>
              <div class="p-5 {isDarkMode ? 'bg-[#27272a]/50 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border rounded-[22px] space-y-1">
                <span class="text-[#71717a] font-medium text-[11px] uppercase tracking-wider">Faktur Terbit</span>
                <div class="text-xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{$invoices.length} Faktur</div>
              </div>
            </div>
          </div>

          <!-- List Klien Antrean Tagihan -->
          <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-4 transition-colors">
            <h3 class="text-lg font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Antrean Pengiriman Tagihan Otomatis</h3>
            <div class="space-y-3">
              {#each clientsWantingRenewal as client}
                <div class="p-5 border {isDarkMode ? 'border-[#27272a] bg-[#27272a]/30' : 'border-[#ececee] bg-[#fafafa]'} rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4 text-[13px]">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2.5 flex-wrap">
                      <span class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{client.name}</span>
                      <span class="text-[#71717a]">&bull; {client.company}</span>
                      <span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full">Konfirmasi Lanjut</span>
                    </div>
                    <div class="{isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">Layanan: <strong class="{isDarkMode ? 'text-white' : 'text-[#09090b]'}">{client.serviceName}</strong></div>
                    <div class="text-[12px] text-[#71717a]">WhatsApp: {client.phone} &bull; Berakhir: {client.currentPeriodEnd}</div>
                  </div>
                  <div class="flex items-center gap-4 shrink-0">
                    <div class="text-right">
                      <div class="text-sm font-bold font-mono text-[#ff5a00]">{formatRupiah(client.billingAmount)}</div>
                      <div class="text-[11px] text-[#71717a]">+ PPN 11%</div>
                    </div>
                    <button
                      type="button"
                      on:click={() => triggerSingleAutoInvoice(client.id)}
                      class="px-4 py-2.5 bg-[#ff5a00] hover:bg-[#e05000] text-white font-medium text-[13px] rounded-[14px] transition cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Icon name="zap" size={14} />
                      <span>Kirim Tagihan</span>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- TAB 5: ORDERS -->
      {#if currentAdminTab === "orders"}
        <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-6 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-5">
            <div>
              <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Manajemen Pesanan Masuk</h2>
              <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mt-1">Perbarui tahapan pengerjaan dan status pembayaran pesanan.</p>
            </div>
            <button
              type="button"
              on:click={openNewOrderModal}
              class="px-5 py-2.5 bg-[#ff5a00] hover:bg-[#e04f00] text-white font-semibold text-[13px] rounded-[16px] transition cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#ff5a00]/20 shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              <span>Tambah Pesanan Baru</span>
            </button>
          </div>

          <!-- Search & Filter -->
          <div class="flex flex-col sm:flex-row items-center gap-3.5 text-[13px]">
            <div class="relative flex-1 w-full">
              <Icon name="search" size={16} className="absolute left-3.5 top-3.5 text-[#71717a]" />
              <input
                type="text"
                placeholder="Cari ID pesanan atau klien..."
                bind:value={orderSearchQuery}
                class="w-full pl-10 pr-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
              />
            </div>
            <select
              bind:value={statusFilter}
              class="w-full sm:w-auto px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-semibold focus:outline-none focus:border-[#ff5a00] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="Menunggu Kebutuhan">Menunggu Kebutuhan</option>
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
              <option value="Tahap Revisi">Tahap Revisi</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div class="overflow-x-auto text-[13px]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b {isDarkMode ? 'border-[#27272a] text-[#71717a]' : 'border-[#ececee] text-[#71717a]'} font-semibold">
                  <th class="py-3.5 px-4">Order ID</th>
                  <th class="py-3.5 px-4">Klien</th>
                  <th class="py-3.5 px-4">Layanan & Nilai</th>
                  <th class="py-3.5 px-4">Status Bayar</th>
                  <th class="py-3.5 px-4">Tahap Proyek</th>
                  <th class="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y {isDarkMode ? 'divide-[#27272a]' : 'divide-[#ececee]'}">
                {#each filteredOrders as ord}
                  <tr class="{isDarkMode ? 'hover:bg-[#27272a]/30' : 'hover:bg-[#fafafa]'} transition-colors">
                    <td class="py-4 px-4 font-semibold font-mono text-[#ff5a00]">{ord.id}</td>
                    <td class="py-4 px-4">
                      <div class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{ord.customer?.name || "-"}</div>
                      <div class="text-[11px] text-[#71717a]">{ord.customer?.phone || "-"}</div>
                    </td>
                    <td class="py-4 px-4">
                      <div class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{ord.serviceName}</div>
                      <div class="font-mono font-bold text-[#ff5a00] mt-0.5">{formatRupiah(ord.total)}</div>
                    </td>
                    <td class="py-4 px-4">
                      <button type="button" on:click={() => handlePaymentToggle(ord.id, ord.paymentStatus)} class="cursor-pointer">
                        <StatusBadge status={ord.paymentStatus} size="sm" />
                      </button>
                    </td>
                    <td class="py-4 px-4">
                      <select
                        value={ord.projectStatus}
                        on:change={(e) => handleStatusChange(ord.id, e.target.value)}
                        class="px-3.5 py-2 text-[13px] border {isDarkMode ? 'border-[#3f3f46] bg-[#27272a] text-white' : 'border-[#ececee] bg-white text-[#09090b]'} rounded-[12px] font-semibold focus:outline-none focus:border-[#ff5a00] cursor-pointer"
                      >
                        <option value="Menunggu Kebutuhan">Menunggu Kebutuhan</option>
                        <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                        <option value="Tahap Revisi">Tahap Revisi</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <button
                        type="button"
                        on:click={() => {
                          selectedOrderId.set(ord.id);
                          navigateTo("project-tracker", { orderId: ord.id });
                        }}
                        class="px-4 py-2 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} font-medium rounded-[12px] text-[12px] transition cursor-pointer shadow-xs"
                      >
                        Workspace
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

      <!-- TAB 6: INVOICES -->
      {#if currentAdminTab === "invoices"}
        <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a]' : 'bg-white border-[#ececee]'} border p-8 rounded-[36px] shadow-xs space-y-6 transition-colors">
          <div class="border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-5">
            <h2 class="text-2xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">Arsip e-Faktur & Perpajakan</h2>
            <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mt-1">Dokumen tagihan elektronik sah dengan PPN 11%.</p>
          </div>

          <div class="overflow-x-auto text-[13px]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b {isDarkMode ? 'border-[#27272a] text-[#71717a]' : 'border-[#ececee] text-[#71717a]'} font-semibold">
                  <th class="py-3.5 px-4">No. Invoice</th>
                  <th class="py-3.5 px-4">Order ID</th>
                  <th class="py-3.5 px-4">Nama Klien</th>
                  <th class="py-3.5 px-4">Layanan</th>
                  <th class="py-3.5 px-4">Total (PPN 11%)</th>
                  <th class="py-3.5 px-4">Status Bayar</th>
                  <th class="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y {isDarkMode ? 'divide-[#27272a]' : 'divide-[#ececee]'}">
                {#each $orders as inv}
                  <tr class="{isDarkMode ? 'hover:bg-[#27272a]/30' : 'hover:bg-[#fafafa]'} transition-colors">
                    <td class="py-4 px-4 font-bold font-mono text-[#ff5a00]">{inv.invoiceNumber}</td>
                    <td class="py-4 px-4 font-mono text-[#71717a]">{inv.id}</td>
                    <td class="py-4 px-4 font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{inv.customer?.name || "-"}</td>
                    <td class="py-4 px-4 {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{inv.serviceName}</td>
                    <td class="py-4 px-4 font-mono font-bold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{formatRupiah(inv.total)}</td>
                    <td class="py-4 px-4">
                      <button type="button" on:click={() => handlePaymentToggle(inv.id, inv.paymentStatus)} class="cursor-pointer">
                        <StatusBadge status={inv.paymentStatus} size="sm" />
                      </button>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <button
                        type="button"
                        on:click={() => navigateTo("invoice", { orderId: inv.id })}
                        class="px-4 py-2 {isDarkMode ? 'bg-[#27272a] hover:bg-[#3f3f46] text-white' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} font-medium rounded-[12px] text-[12px] transition cursor-pointer shadow-xs"
                      >
                        Buka Faktur
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

    </main>

  </div>
</div>

<!-- ==================== MODAL: ADD / EDIT PRODUCT ==================== -->
{#if showProductModal}
  <div class="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border shadow-2xl rounded-[36px] max-w-xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6 text-[13px] transition-colors">
      <div class="flex items-center justify-between border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-4">
        <h3 class="text-lg font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
          {isEditingProduct ? "Edit Produk Jasa" : "Tambah Produk Jasa Baru"}
        </h3>
        <button type="button" on:click={() => (showProductModal = false)} class="p-1.5 {isDarkMode ? 'hover:bg-[#27272a]' : 'hover:bg-[#fafafa]'} rounded-full cursor-pointer transition text-[#71717a]">
          <Icon name="x" size={18} />
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label for="prod_name" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Nama Produk / Layanan *</label>
          <input
            id="prod_name"
            type="text"
            bind:value={productForm.name}
            placeholder="Contoh: Cloud Hosting & DevOps"
            class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="prod_category" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Kategori *</label>
            <select
              id="prod_category"
              bind:value={productForm.category}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00] cursor-pointer"
            >
              <option value="Design">UI/UX Design</option>
              <option value="Development">Web Development</option>
              <option value="Mobile App">Mobile App</option>
              <option value="DevOps">Cloud & DevOps</option>
            </select>
          </div>
          <div>
            <label for="prod_billing_cycle" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Siklus Penagihan *</label>
            <select
              id="prod_billing_cycle"
              bind:value={productForm.billingCycle}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00] cursor-pointer"
            >
              <option value="Bulanan">Bulanan (Monthly Retainer)</option>
              <option value="Tahunan">Tahunan (Annual)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="prod_price" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Harga Dasar (Rp) *</label>
            <input
              id="prod_price"
              type="number"
              bind:value={productForm.price}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-mono font-semibold focus:outline-none focus:border-[#ff5a00]"
            />
          </div>
          <div>
            <label for="prod_sla" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">SLA & Kecepatan Respons</label>
            <input
              id="prod_sla"
              type="text"
              bind:value={productForm.sla}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00]"
            />
          </div>
        </div>

        <div>
          <label for="prod_tagline" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Tagline Singkat</label>
          <input
            id="prod_tagline"
            type="text"
            bind:value={productForm.tagline}
            class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00]"
          />
        </div>

        <div>
          <label for="prod_deliverables" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Deliverables (Satu baris per poin)</label>
          <textarea
            id="prod_deliverables"
            rows="3"
            bind:value={productForm.deliverables}
            class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00]"
          ></textarea>
        </div>
      </div>

      <div class="pt-4 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} flex items-center justify-end gap-3">
        <button
          type="button"
          on:click={() => (showProductModal = false)}
          class="px-5 py-3 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} font-medium rounded-[14px] transition cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          on:click={handleSaveProduct}
          class="px-6 py-3 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold rounded-[14px] transition cursor-pointer shadow-md"
        >
          Simpan Produk
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ==================== MODAL: ADD / EDIT CLIENT ==================== -->
{#if showClientModal}
  <div class="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border shadow-2xl rounded-[36px] max-w-xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6 text-[13px] transition-colors">
      <div class="flex items-center justify-between border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-4">
        <h3 class="text-lg font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">
          {isEditingClient ? "Edit Data Klien" : "Tambah Klien Baru"}
        </h3>
        <button type="button" on:click={() => (showClientModal = false)} class="p-1.5 {isDarkMode ? 'hover:bg-[#27272a]' : 'hover:bg-[#fafafa]'} rounded-full cursor-pointer transition text-[#71717a]">
          <Icon name="x" size={18} />
        </button>
      </div>

      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="cli_name" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Nama Lengkap Klien *</label>
            <input
              id="cli_name"
              type="text"
              bind:value={clientForm.name}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00]"
            />
          </div>
          <div>
            <label for="cli_company" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Perusahaan / Bisnis</label>
            <input
              id="cli_company"
              type="text"
              bind:value={clientForm.company}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="cli_email" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Email Klien *</label>
            <input
              id="cli_email"
              type="email"
              bind:value={clientForm.email}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00]"
            />
          </div>
          <div>
            <label for="cli_phone" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Nomor WhatsApp *</label>
            <input
              id="cli_phone"
              type="text"
              bind:value={clientForm.phone}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00]"
            />
          </div>
        </div>

        <div>
          <label for="cli_service" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Pilih Produk Jasa *</label>
          <select
            id="cli_service"
            on:change={handleProductSelectForClient}
            value={clientForm.serviceId}
            class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00] cursor-pointer"
          >
            {#each $products as p}
              <option value={p.id}>{p.name} — {formatRupiah(p.price)}/{p.billingCycle || "Bulan"}</option>
            {/each}
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="cli_billing_amount" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Biaya Retainer (Rp) *</label>
            <input
              id="cli_billing_amount"
              type="number"
              bind:value={clientForm.billingAmount}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-mono font-semibold focus:outline-none focus:border-[#ff5a00]"
            />
          </div>
          <div>
            <label for="cli_current_period_end" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'} mb-1.5">Jatuh Tempo / Selesai *</label>
            <input
              id="cli_current_period_end"
              type="date"
              bind:value={clientForm.currentPeriodEnd}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00]"
            />
          </div>
        </div>

        <div class="p-4 {isDarkMode ? 'bg-[#ff5a00]/10 border-[#ff5a00]/30 text-white' : 'bg-orange-50 border-orange-200 text-[#09090b]'} border rounded-[20px] space-y-2">
          <label class="flex items-center gap-2.5 cursor-pointer font-medium">
            <input type="checkbox" bind:checked={clientForm.wantsRenewal} class="w-4 h-4 text-[#ff5a00] rounded border-[#71717a] accent-[#ff5a00] cursor-pointer" />
            <span>Klien Ingin Melanjutkan Langganan (Renewal Opt-In)</span>
          </label>
          <p class="text-[11px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'} pl-6">
            Otomatis memasukkan klien ke antrean penagihan berkala berikutnya.
          </p>
        </div>
      </div>

      <div class="pt-4 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} flex items-center justify-end gap-3">
        <button
          type="button"
          on:click={() => (showClientModal = false)}
          class="px-5 py-3 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} font-medium rounded-[14px] transition cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          on:click={handleSaveClient}
          class="px-6 py-3 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold rounded-[14px] transition cursor-pointer shadow-md"
        >
          Simpan Klien
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- ==================== MODAL: INVOICE PREVIEW / SUCCESS ==================== -->
{#if showInvoicePreviewModal && lastGeneratedInvoiceResult}
  <div class="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border shadow-2xl rounded-[36px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6 text-[13px] transition-colors">
      <div class="flex items-start justify-between border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-4">
        <div>
          <span class="text-[12px] font-semibold text-emerald-500 uppercase tracking-wider block">[ FAKTUR BERHASIL DITERBITKAN ]</span>
          <h3 class="text-xl font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} mt-1">
            e-Faktur #{lastGeneratedInvoiceResult.invoice.invoiceNumber}
          </h3>
          <p class="text-[13px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'}">Untuk: {lastGeneratedInvoiceResult.client.name} ({lastGeneratedInvoiceResult.client.company})</p>
        </div>
        <button type="button" on:click={() => (showInvoicePreviewModal = false)} class="p-1.5 {isDarkMode ? 'hover:bg-[#27272a]' : 'hover:bg-[#fafafa]'} rounded-full cursor-pointer transition text-[#71717a]">
          <Icon name="x" size={18} />
        </button>
      </div>

      <div class="p-5 {isDarkMode ? 'bg-[#27272a]/50 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border rounded-[22px] grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span class="text-[11px] text-[#71717a] font-semibold uppercase block">No. Faktur</span>
          <div class="font-mono font-bold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{lastGeneratedInvoiceResult.invoice.invoiceNumber}</div>
        </div>
        <div>
          <span class="text-[11px] text-[#71717a] font-semibold uppercase block">Periode</span>
          <div class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'} truncate">{lastGeneratedInvoiceResult.periodLabel}</div>
        </div>
        <div>
          <span class="text-[11px] text-[#71717a] font-semibold uppercase block">Total + PPN</span>
          <div class="font-mono font-bold text-[#ff5a00]">{formatRupiah(lastGeneratedInvoiceResult.invoice.financial.total)}</div>
        </div>
        <div>
          <span class="text-[11px] text-[#71717a] font-semibold uppercase block">Status</span>
          <div class="font-bold text-amber-500">PENDING</div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="flex items-center gap-2 border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'}">
        <button
          type="button"
          on:click={() => (activePreviewMode = "whatsapp")}
          class="px-4 py-2 font-semibold border-b-2 transition cursor-pointer {activePreviewMode === 'whatsapp' ? 'border-[#ff5a00] text-[#ff5a00]' : 'border-transparent text-[#71717a]'}"
        >
          Notifikasi WhatsApp
        </button>
        <button
          type="button"
          on:click={() => (activePreviewMode = "email")}
          class="px-4 py-2 font-semibold border-b-2 transition cursor-pointer {activePreviewMode === 'email' ? 'border-[#ff5a00] text-[#ff5a00]' : 'border-transparent text-[#71717a]'}"
        >
          Template Email
        </button>
      </div>

      {#if activePreviewMode === "whatsapp"}
        <div class="space-y-4">
          <div class="p-5 {isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200' : 'bg-emerald-50/50 border-emerald-200/60 text-[#09090b]'} border rounded-[22px] text-[13px] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-mono">
            {lastGeneratedInvoiceResult.waTemplate}
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              on:click={() => copyTextToClipboard(lastGeneratedInvoiceResult.waTemplate, "Pesan WhatsApp disalin!")}
              class="px-4 py-2.5 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} font-medium rounded-[14px] transition cursor-pointer"
            >
              Salin Pesan WA
            </button>
            <a
              href="https://wa.me/{lastGeneratedInvoiceResult.client.phone.replace(/[^0-9]/g, '')}?text={encodeURIComponent(lastGeneratedInvoiceResult.waTemplate)}"
              target="_blank"
              rel="noreferrer"
              class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-[14px] transition shadow-md flex items-center gap-1.5"
            >
              <span>Buka WhatsApp Web</span>
            </a>
          </div>
        </div>
      {/if}

      {#if activePreviewMode === "email"}
        <div class="space-y-4">
          <div class="p-5 {isDarkMode ? 'bg-[#27272a]/50 border-[#3f3f46] text-[#a1a1aa]' : 'bg-[#fafafa] border-[#ececee] text-[#52525b]'} border rounded-[22px] space-y-2">
            <div><strong>Tujuan:</strong> {lastGeneratedInvoiceResult.client.email}</div>
            <div><strong>Subject:</strong> {lastGeneratedInvoiceResult.emailSubject}</div>
            <div class="pt-3 border-t {isDarkMode ? 'border-[#3f3f46]' : 'border-[#ececee]'} leading-relaxed text-[13px]">
              Halo {lastGeneratedInvoiceResult.client.name}, faktur perpanjangan kontrak untuk layanan <strong>{lastGeneratedInvoiceResult.client.serviceName}</strong> sebesar <strong>{formatRupiah(lastGeneratedInvoiceResult.invoice.financial.total)}</strong> telah terbit.
            </div>
            {#if lastGeneratedInvoiceResult.emailSent}
              <div class="text-[12px] text-emerald-500 font-semibold pt-2">
                ✓ Terkirim ke inbox klien via SMTP.
              </div>
            {:else if lastGeneratedInvoiceResult.emailNotice}
              <div class="text-[12px] text-amber-500 pt-2">
                Status SMTP: {lastGeneratedInvoiceResult.emailNotice}
              </div>
            {/if}
          </div>
          <div class="flex justify-end">
            <button
              type="button"
              disabled={isSendingPreviewEmail}
              on:click={sendPreviewInvoiceViaSmtp}
              class="px-5 py-2.5 bg-[#09090b] hover:bg-[#ff5a00] disabled:opacity-50 text-white font-semibold rounded-[14px] transition cursor-pointer flex items-center gap-2"
            >
              <Icon name="mail" size={14} />
              <span>{isSendingPreviewEmail ? "Mengirim..." : "Kirim Email via SMTP Sekarang"}</span>
            </button>
          </div>
        </div>
      {/if}

      <div class="pt-4 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} flex flex-col sm:flex-row items-center justify-between gap-4">
        <span class="text-[12px] text-[#71717a]">*Tercatat otomatis di pembukuan arsip studio.</span>
        <div class="flex items-center gap-3">
          <button
            type="button"
            on:click={() => (showInvoicePreviewModal = false)}
            class="px-5 py-3 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} font-medium rounded-[14px] transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            on:click={() => openGeneratedInvoiceView(lastGeneratedInvoiceResult.order.id)}
            class="px-6 py-3 bg-[#ff5a00] hover:bg-[#e05000] text-white font-semibold rounded-[14px] transition cursor-pointer shadow-md"
          >
            Lihat Faktur Lengkap
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- ==================== MODAL: ADD NEW ORDER (ADMIN) ==================== -->
{#if showNewOrderModal}
  <div class="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="{isDarkMode ? 'bg-[#18181b] border-[#27272a] text-[#f4f4f5]' : 'bg-white border-[#ececee] text-[#09090b]'} border shadow-2xl rounded-[36px] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-[13px] transition-colors">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} pb-4">
        <div>
          <h3 class="text-xl font-bold {isDarkMode ? 'text-white' : 'text-[#09090b]'} flex items-center gap-2">
            <span class="p-2 rounded-[12px] bg-[#ff5a00]/10 text-[#ff5a00]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
            </span>
            <span>Tambah Pesanan Baru (Admin)</span>
          </h3>
          <p class="text-[12px] {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'} mt-1">
            Pilih langsung data nama klien & produk dari database untuk membuat pesanan resmi.
          </p>
        </div>
        <button
          type="button"
          on:click={() => (showNewOrderModal = false)}
          class="p-2 {isDarkMode ? 'hover:bg-[#27272a]' : 'hover:bg-[#fafafa]'} rounded-full cursor-pointer transition text-[#71717a]"
        >
          <Icon name="x" size={20} />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="space-y-5">
        
        <!-- SECTION 1: PILIH KLIEN DARI DATABASE -->
        <div class="p-5 rounded-[24px] {isDarkMode ? 'bg-[#27272a]/40 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border space-y-3">
          <div class="flex items-center justify-between">
            <label for="select_client_db" class="font-semibold text-sm {isDarkMode ? 'text-white' : 'text-[#09090b]'} flex items-center gap-2">
              <Icon name="user" size={16} className="text-[#ff5a00]" />
              <span>1. Data Klien (Pilih dari Database) *</span>
            </label>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium">
              Database Terhubung ({$clients.length} Klien)
            </span>
          </div>

          <select
            id="select_client_db"
            bind:value={selectedClientId}
            on:change={(e) => handleClientSelect(e.target.value)}
            class="w-full px-4 py-3 {isDarkMode ? 'bg-[#18181b] border-[#3f3f46] text-white' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium text-[13px] focus:outline-none focus:border-[#ff5a00] cursor-pointer shadow-xs"
          >
            <option value="" disabled>-- Pilih Klien Terdaftar dari Database --</option>
            {#each $clients as c}
              <option value={c.id || c.email}>
                {c.name} — {c.company && c.company !== '-' ? c.company : (c.email || 'Klien')}
              </option>
            {/each}
          </select>

          <!-- Kartu Info Klien Terpilih -->
          {#if newOrderForm.customerName}
            <div class="p-4 rounded-[18px] {isDarkMode ? 'bg-[#18181b]/80 border-[#3f3f46]' : 'bg-white border-[#ececee]'} border grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
              <div>
                <span class="text-[#71717a] block">Nama Lengkap:</span>
                <span class="font-semibold {isDarkMode ? 'text-white' : 'text-[#09090b]'}">{newOrderForm.customerName}</span>
              </div>
              <div>
                <span class="text-[#71717a] block">Email Aktif:</span>
                <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{newOrderForm.customerEmail}</span>
              </div>
              <div>
                <span class="text-[#71717a] block">Perusahaan / Instansi:</span>
                <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{newOrderForm.customerCompany || '-'}</span>
              </div>
              <div>
                <span class="text-[#71717a] block">No. WhatsApp / HP:</span>
                <span class="font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">{newOrderForm.customerPhone || '-'}</span>
              </div>
            </div>
          {/if}
        </div>

        <!-- SECTION 2: PILIH PRODUK & PAKET DARI DATABASE -->
        <div class="p-5 rounded-[24px] {isDarkMode ? 'bg-[#27272a]/40 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border space-y-3">
          <div class="flex items-center justify-between">
            <label for="select_product_db" class="font-semibold text-sm {isDarkMode ? 'text-white' : 'text-[#09090b]'} flex items-center gap-2">
              <Icon name="briefcase" size={16} className="text-[#ff5a00]" />
              <span>2. Produk & Paket Layanan (Pilih dari Database) *</span>
            </label>
            <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
              Katalog ({$products.length} Layanan)
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <span class="text-[12px] font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'}">Pilih Produk Layanan *</span>
              <select
                id="select_product_db"
                bind:value={selectedProductId}
                on:change={(e) => handleProductSelect(e.target.value)}
                class="w-full px-4 py-3 {isDarkMode ? 'bg-[#18181b] border-[#3f3f46] text-white' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium text-[13px] focus:outline-none focus:border-[#ff5a00] cursor-pointer shadow-xs"
              >
                <option value="" disabled>-- Pilih Produk Jasa --</option>
                {#each $products as p}
                  <option value={p.id}>
                    {p.name} ({p.category || 'Layanan'})
                  </option>
                {/each}
              </select>
            </div>

            <div class="space-y-1">
              <span class="text-[12px] font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#71717a]'}">Pilihan Paket Layanan</span>
              <select
                bind:value={newOrderForm.packageId}
                on:change={(e) => handlePackageSelect(e.target.value)}
                class="w-full px-4 py-3 {isDarkMode ? 'bg-[#18181b] border-[#3f3f46] text-white' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium text-[13px] focus:outline-none focus:border-[#ff5a00] cursor-pointer shadow-xs"
              >
                {#each availablePackages as pkg}
                  <option value={pkg.id}>
                    {pkg.name} — {formatRupiah(pkg.price)}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <!-- SECTION 3: DETAIL PROJEK & ESTIMASI -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2 space-y-1.5">
            <label for="order_project_title" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">
              Judul Proyek / Deliverables
            </label>
            <input
              id="order_project_title"
              type="text"
              bind:value={newOrderForm.projectTitle}
              placeholder="Contoh: Redesain Mobile App & UI Kit"
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
            />
          </div>

          <div class="space-y-1.5">
            <label for="order_delivery_days" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">
              Estimasi Pengerjaan
            </label>
            <div class="relative">
              <input
                id="order_delivery_days"
                type="number"
                min="1"
                bind:value={newOrderForm.deliveryDays}
                class="w-full px-4 py-3 pr-16 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-mono font-semibold"
              />
              <span class="absolute right-4 top-3 text-[12px] text-[#71717a]">Hari</span>
            </div>
          </div>
        </div>

        <!-- SECTION 4: PEMBAYARAN, STATUS & FINANSIAL -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label for="order_payment_method" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">
              Metode Pembayaran
            </label>
            <select
              id="order_payment_method"
              bind:value={newOrderForm.paymentMethod}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-medium focus:outline-none focus:border-[#ff5a00] cursor-pointer"
            >
              <option value="Bank Transfer BCA">Bank Transfer BCA (VA)</option>
              <option value="Bank Transfer Mandiri">Bank Mandiri</option>
              <option value="Bank BNI">Bank BNI</option>
              <option value="QRIS / Instant Payment">QRIS Instant</option>
              <option value="Auto-Billing Invoice">Auto-Billing e-Faktur</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="order_payment_status" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">
              Status Bayar
            </label>
            <select
              id="order_payment_status"
              bind:value={newOrderForm.paymentStatus}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-semibold focus:outline-none focus:border-[#ff5a00] cursor-pointer"
            >
              <option value="PAID">PAID (Lunas Terverifikasi)</option>
              <option value="PENDING">PENDING (Menunggu Pembayaran)</option>
              <option value="DP">DP (Uang Muka 50%)</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="order_project_status" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">
              Status Pengerjaan
            </label>
            <select
              id="order_project_status"
              bind:value={newOrderForm.projectStatus}
              class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] font-semibold focus:outline-none focus:border-[#ff5a00] cursor-pointer"
            >
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
              <option value="Menunggu Kebutuhan">Menunggu Kebutuhan</option>
              <option value="Tahap Revisi">Tahap Revisi</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        <!-- Ringkasan Biaya & Pajak PPN 11% -->
        <div class="p-5 rounded-[24px] {isDarkMode ? 'bg-[#27272a]/50 border-[#3f3f46]' : 'bg-[#fafafa] border-[#ececee]'} border space-y-3">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]">
            <div>
              <span class="text-[#71717a] block">Harga Layanan:</span>
              <span class="font-mono font-bold {isDarkMode ? 'text-white' : 'text-[#09090b]'} text-[13px]">
                {formatRupiah(newOrderForm.price)}
              </span>
            </div>
            <div>
              <label for="order_discount" class="text-[#71717a] block">Diskon (Rp):</label>
              <input
                id="order_discount"
                type="number"
                min="0"
                bind:value={newOrderForm.discount}
                class="w-full px-2.5 py-1 mt-0.5 {isDarkMode ? 'bg-[#18181b] border-[#3f3f46] text-white' : 'bg-white border-[#ececee] text-[#09090b]'} border rounded-[10px] font-mono text-[12px] focus:outline-none focus:border-[#ff5a00]"
              />
            </div>
            <div>
              <span class="text-[#71717a] block">PPN 11%:</span>
              <span class="font-mono font-bold {isDarkMode ? 'text-white' : 'text-[#09090b]'} text-[13px]">
                {formatRupiah(calculatedTax)}
              </span>
            </div>
            <div>
              <span class="text-[#ff5a00] font-semibold block">Total Tagihan:</span>
              <span class="font-mono font-extrabold text-[#ff5a00] text-base">
                {formatRupiah(calculatedTotal)}
              </span>
            </div>
          </div>
        </div>

        <!-- Catatan Tambahan (Opsional) -->
        <div class="space-y-1.5">
          <label for="order_notes" class="block font-medium {isDarkMode ? 'text-[#a1a1aa]' : 'text-[#52525b]'}">
            Catatan Tambahan untuk Tim (Opsional)
          </label>
          <input
            id="order_notes"
            type="text"
            bind:value={newOrderForm.notes}
            placeholder="Contoh: Klien meminta penyerahan source code via GitHub Repo privat."
            class="w-full px-4 py-3 {isDarkMode ? 'bg-[#27272a] border-[#3f3f46] text-white placeholder-[#71717a]' : 'bg-[#fafafa] border-[#ececee] text-[#09090b]'} border rounded-[16px] focus:outline-none focus:border-[#ff5a00] font-medium"
          />
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="pt-4 border-t {isDarkMode ? 'border-[#27272a]' : 'border-[#ececee]'} flex items-center justify-end gap-3">
        <button
          type="button"
          on:click={() => (showNewOrderModal = false)}
          disabled={isSubmittingOrder}
          class="px-5 py-3 {isDarkMode ? 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]' : 'bg-[#fafafa] text-[#52525b] hover:bg-[#ececee] border border-[#ececee]'} font-medium rounded-[14px] transition cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          on:click={handleCreateOrderSubmit}
          disabled={isSubmittingOrder}
          class="px-6 py-3 bg-[#ff5a00] hover:bg-[#e05000] disabled:opacity-50 text-white font-semibold rounded-[14px] transition cursor-pointer shadow-md shadow-[#ff5a00]/30 flex items-center gap-2"
        >
          {#if isSubmittingOrder}
            <span class="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span>Menyimpan ke Database...</span>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Simpan & Buat Pesanan</span>
          {/if}
        </button>
      </div>

    </div>
  </div>
{/if}

{/if}