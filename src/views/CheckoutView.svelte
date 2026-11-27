<script>
  import { services } from "../data/services";
  import {
    selectedServiceId,
    selectedPackageId,
    createNewOrder,
    navigateTo,
    formatRupiah,
    showToast,
    customProjectQuote,
  } from "../stores/marketplaceStore";
  import {
    isClientLoggedIn,
    clientUser,
    loginClient,
    postLoginRedirect
  } from "../stores/authStore";
  import {
    startMidtransPaymentForOrder,
    syncOrderPaymentAndStore
  } from "../lib/services/midtransService";
  import Icon from "../components/Icon.svelte";

  // State
  let serviceId = $selectedServiceId || "ui-ux-design";
  let packageId = $selectedPackageId || "standard";

  $: currentService = services.find((s) => s.id === serviceId) || services[0];
  $: currentPackage =
    currentService.packages.find((p) => p.id === packageId) ||
    currentService.packages[0];

  $: hasCustomQuote =
    $customProjectQuote && $customProjectQuote.serviceId === serviceId;

  // Customer Form - diisi otomatis dari Akun Klien jika sudah login
  let customerName = $clientUser?.name || "";
  let customerEmail = $clientUser?.email || "";
  let customerPhone = $clientUser?.phone || "";
  let customerCompany = $clientUser?.company || "";

  // Auto-sync jika clientUser berubah
  $: if ($clientUser) {
    if (!customerName) customerName = $clientUser.name || "";
    if (!customerEmail) customerEmail = $clientUser.email || "";
    if (!customerPhone) customerPhone = $clientUser.phone || "";
    if (!customerCompany) customerCompany = $clientUser.company || "";
  }

  function goToClientLogin() {
    postLoginRedirect.set('checkout');
    navigateTo('client-login');
  }

  async function quickLoginDemoClient() {
    postLoginRedirect.set('checkout');
    await loginClient('rian.hidayat@startupkita.id', 'client123');
  }

  // Project Requirements
  let projectTitle = "Redesain Aplikasi Mobile Delivery & Kurir";
  let projectDescription =
    "Membutuhkan perancangan antarmuka aplikasi kurir lokal dengan alur pelacakan real-time, estimasi ongkir otomatis, dan kemudahan bagi driver di luar ruangan.";
  let referenceUrl = "https://dribbble.com/tags/logistics-app";
  let expectedDeadline = "7 Hari Kerja";
  let additionalNotes =
    "Mohon disiapkan master file Figma dengan sistem auto-layout.";
  let uploadedDocName = "";

  // Initialize from custom quote if available
  if ($customProjectQuote) {
    projectTitle = $customProjectQuote.title || projectTitle;
    expectedDeadline = `${$customProjectQuote.deliveryDays} Hari Kerja`;
  }

  // Payment method & promo
  let paymentMethod = "Bank Transfer BCA (VA)";
  let promoCode = "";
  let discountAmount = 0;
  let promoApplied = false;
  let termsAccepted = true;

  // Processing & Success states
  let isProcessing = false;
  let processingStep = "";
  let paymentSuccessOrder = null;

  function applyPromo() {
    if (promoCode.trim().toUpperCase() === "NEXA10") {
      discountAmount = Math.round(subtotal * 0.1);
      promoApplied = true;
      showToast("Kupon diskon 10% berhasil digunakan!", "success");
    } else if (promoCode.trim().toUpperCase() === "STARTUP") {
      discountAmount = 150000;
      promoApplied = true;
      showToast("Kupon diskon Rp150.000 berhasil digunakan!", "success");
    } else {
      showToast(
        'Kode promo tidak valid. Coba "NEXA10" atau "STARTUP"',
        "error",
      );
    }
  }

  $: subtotal = hasCustomQuote
    ? $customProjectQuote.price
    : currentPackage.price;
  $: taxableAmount = Math.max(0, subtotal - discountAmount);
  $: tax = Math.round(taxableAmount * 0.11); // PPN 11%
  $: finalTotal = taxableAmount + tax;

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      uploadedDocName = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    }
  }

  async function handleProcessPayment() {
    if (!$isClientLoggedIn) {
      postLoginRedirect.set('checkout');
      showToast('Wajib login ke akun Klien terlebih dahulu sebelum memulai pemesanan proyek.', 'warning');
      navigateTo('client-login');
      return;
    }

    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim()
    ) {
      showToast("Mohon lengkapi informasi nama, email, dan WhatsApp.", "error");
      return;
    }
    if (!projectDescription.trim()) {
      showToast("Mohon isi deskripsi kebutuhan proyek.", "error");
      return;
    }
    if (!termsAccepted) {
      showToast("Anda harus menyetujui syarat & ketentuan layanan.", "error");
      return;
    }

    isProcessing = true;
    processingStep = "Menyimpan pesanan & menyiapkan transaksi Midtrans...";

    try {
      const newOrder = await createNewOrder({
        requireBackend: true,
        serviceId: currentService.id,
        serviceName: currentService.name,
        packageId: currentPackage.id,
        packageName: hasCustomQuote
          ? $customProjectQuote.scaleName
          : `${currentPackage.name} (${currentPackage.screens})`,
        customerName,
        customerEmail,
        customerPhone,
        customerCompany,
        price: subtotal,
        discount: discountAmount,
        paymentMethod,
        paymentStatus: "PENDING",
        projectTitle,
        projectDescription,
        referenceUrl,
        notes: additionalNotes,
        deliveryDays: hasCustomQuote
          ? $customProjectQuote.deliveryDays
          : parseInt(currentPackage.deliveryTime) || 5,
      });

      if (hasCustomQuote) {
        customProjectQuote.set(null);
      }

      const meta = newOrder._paymentMeta || {};
      if (meta.snapToken) {
        processingStep = "Membuka jendela pembayaran Midtrans...";
        await startMidtransPaymentForOrder(newOrder, {
          onSuccess: (syncedOrder) => {
            isProcessing = false;
            paymentSuccessOrder = syncedOrder;
            showToast("Pembayaran Midtrans terverifikasi lunas!", "success");
          },
          onPending: (pendingOrder) => {
            isProcessing = false;
            paymentSuccessOrder = pendingOrder;
            showToast(
              "Pesanan tersimpan (PENDING). Silakan selesaikan pembayaran sesuai instruksi Midtrans.",
              "info"
            );
          },
          onError: (failedOrder) => {
            isProcessing = false;
            paymentSuccessOrder = failedOrder;
            showToast(
              "Pembayaran belum berhasil. Anda dapat mencoba bayar ulang lewat tombol Midtrans.",
              "error"
            );
          },
          onClose: (closedOrder) => {
            isProcessing = false;
            paymentSuccessOrder = closedOrder;
            showToast(
              "Jendela Midtrans ditutup. Pesanan berstatus PENDING dan bisa dibayar kapan saja dari halaman Invoice.",
              "info"
            );
          }
        });
        return;
      }

      isProcessing = false;
      paymentSuccessOrder = newOrder;
      if (meta.midtransError) {
        showToast(`Pesanan disimpan (PENDING), namun Midtrans gagal: ${meta.midtransError}`, "warning");
      } else if (!meta.midtransConfigured) {
        showToast(
          "Pesanan & invoice tersimpan (PENDING). Isi kredensial Midtrans di backend .env untuk membuka Snap pembayaran.",
          "info"
        );
      } else {
        showToast("Pesanan berhasil dibuat dengan status PENDING.", "success");
      }
    } catch (err) {
      isProcessing = false;
      showToast(err.message || "Terjadi kendala saat menghubungkan ke server pembayaran.", "error");
    }
  }

  async function retryMidtransFromConfirmation() {
    if (!paymentSuccessOrder) return;
    isProcessing = true;
    processingStep = "Membuka pembayaran Midtrans...";
    try {
      await startMidtransPaymentForOrder(paymentSuccessOrder, {
        onSuccess: (synced) => {
          isProcessing = false;
          paymentSuccessOrder = synced;
          showToast("Pembayaran Midtrans berhasil dikonfirmasi!", "success");
        },
        onPending: (pendingOrder) => {
          isProcessing = false;
          paymentSuccessOrder = pendingOrder;
          showToast("Status pembayaran masih PENDING.", "info");
        },
        onError: () => {
          isProcessing = false;
          showToast("Pembayaran gagal diproses oleh Midtrans.", "error");
        },
        onClose: () => {
          isProcessing = false;
        }
      });
    } catch (err) {
      isProcessing = false;
      showToast(err.message || "Gagal membuka Midtrans Snap.", "error");
    }
  }

  async function syncMidtransFromConfirmation() {
    if (!paymentSuccessOrder) return;
    try {
      const synced = await syncOrderPaymentAndStore(paymentSuccessOrder.id);
      if (synced) {
        paymentSuccessOrder = synced;
        showToast(`Status pembayaran terbaru: ${synced.paymentStatus}`, "success");
      }
    } catch (err) {
      showToast(err.message || "Gagal sinkron status dari Midtrans.", "error");
    }
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Padding pinggir dikurangi dan disamakan dengan navbar/footer utama (px-6 sm:px-12 lg:px-20) -->
<div
  class="min-h-screen bg-[#f4f4f5] text-[#09090b] selection:bg-[#ff5a00] selection:text-white font-['Plus_Jakarta_Sans',sans-serif] py-10 px-6 sm:px-12 lg:px-20 pb-24 antialiased overflow-x-hidden"
>
  <div class="w-full space-y-12">
    {#if paymentSuccessOrder}
      <!-- ==================== PAYMENT SUCCESS & CONFIRMATION SCREEN ==================== -->
      <div
        class="max-w-2xl mx-auto bg-white border border-[#ececee] p-8 sm:p-12 text-center rounded-[36px] shadow-xs space-y-6 my-8"
      >
        <div
          class="w-16 h-16 bg-[#ff5a00] text-white rounded-[20px] flex items-center justify-center mx-auto shadow-md shadow-[#ff5a00]/30"
        >
          <Icon name="check" size={32} />
        </div>

        <div class="space-y-2">
          <span
            class="inline-block text-[11px] uppercase font-semibold tracking-wider px-3 py-1 rounded-[12px] border {paymentSuccessOrder.paymentStatus === 'PAID'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-[#ff5a00] bg-[#ff5a00]/10 border-[#ff5a00]/20'}"
          >
            {paymentSuccessOrder.paymentStatus === "PAID"
              ? "PEMBAYARAN DIVERIFIKASI RESMI (PAID)"
              : `MENUNGGU PEMBAYARAN (${paymentSuccessOrder.paymentStatus || "PENDING"})`}
          </span>
          <h1
            class="text-2xl sm:text-4xl font-semibold text-[#09090b] tracking-tight"
          >
            {paymentSuccessOrder.paymentStatus === "PAID"
              ? "Transaksi Selesai & Tervalidasi"
              : "Pesanan & Invoice Berhasil Dibuat"}
          </h1>
          <p
            class="text-[13px] sm:text-[14px] text-[#52525b] max-w-md mx-auto leading-relaxed font-normal"
          >
            {#if paymentSuccessOrder.paymentStatus === "PAID"}
              Pesanan Anda telah dialokasikan ke antrean pengerjaan dan invoice resmi berstatus lunas telah diterbitkan.
            {:else}
              Silakan selesaikan pembayaran melalui Midtrans agar pesanan segera diproses oleh tim Nexa Digital.
            {/if}
          </p>
        </div>

        <!-- Receipt Ledger Box -->
        <div
          class="bg-[#fafafa] border border-[#ececee] p-5 rounded-[24px] text-left text-[13px] space-y-3 font-normal"
        >
          <div class="flex justify-between border-b border-[#ececee] pb-2">
            <span class="text-[#71717a] uppercase font-medium">Nomor Pesanan:</span>
            <span class="text-[#09090b] font-semibold"
              >{paymentSuccessOrder.id}</span
            >
          </div>
          <div class="flex justify-between border-b border-[#ececee] pb-2">
            <span class="text-[#71717a] uppercase font-medium">Nomor Invoice:</span>
            <span class="text-[#09090b] font-semibold"
              >{paymentSuccessOrder.invoiceNumber || paymentSuccessOrder.invoice_number || '-'}</span
            >
          </div>
          <div class="flex justify-between border-b border-[#ececee] pb-2">
            <span class="text-[#71717a] uppercase font-medium">Layanan Terpilih:</span>
            <span class="text-[#09090b] font-medium"
              >{paymentSuccessOrder.serviceName || paymentSuccessOrder.service_name || currentService.name} ({paymentSuccessOrder.packageName || paymentSuccessOrder.package_name || currentPackage.name})</span
            >
          </div>
          <div class="flex justify-between border-b border-[#ececee] pb-2">
            <span class="text-[#71717a] uppercase font-medium">Metode Pembayaran:</span>
            <span class="text-[#09090b]"
              >{paymentSuccessOrder.paymentMethod || paymentSuccessOrder.payment_method || paymentMethod}</span
            >
          </div>
          <div
            class="flex justify-between pt-1 font-semibold text-[15px] text-[#09090b]"
          >
            <span>TOTAL DIBAYARKAN:</span>
            <span class="text-[#ff5a00]"
              >{formatRupiah(paymentSuccessOrder.total)}</span
            >
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 text-[13px] font-medium flex-wrap"
        >
          {#if paymentSuccessOrder.paymentStatus !== "PAID"}
            <button
              type="button"
              on:click={retryMidtransFromConfirmation}
              disabled={isProcessing}
              class="w-full sm:w-auto px-6 py-3.5 bg-[#ff5a00] hover:bg-[#e04f00] disabled:opacity-50 text-white uppercase font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer rounded-[14px]"
            >
              <Icon name="credit-card" size={14} />
              <span>Bayar via Midtrans</span>
            </button>
            <button
              type="button"
              on:click={syncMidtransFromConfirmation}
              class="w-full sm:w-auto px-5 py-3.5 bg-[#fafafa] hover:bg-[#ececee] text-[#09090b] uppercase font-semibold border border-[#ececee] transition flex items-center justify-center gap-2 cursor-pointer rounded-[14px]"
            >
              <Icon name="refresh-cw" size={14} />
              <span>Cek Status</span>
            </button>
          {/if}
          <button
            type="button"
            on:click={() =>
              navigateTo("invoice", { orderId: paymentSuccessOrder.id })}
            class="w-full sm:w-auto px-6 py-3.5 bg-[#fafafa] hover:bg-[#ececee] text-[#09090b] uppercase font-semibold border border-[#ececee] transition flex items-center justify-center gap-2 cursor-pointer rounded-[14px]"
          >
            <Icon name="file-text" size={14} />
            <span>Buka Dokumen Invoice</span>
          </button>
          <button
            type="button"
            on:click={() =>
              navigateTo("project-tracker", {
                orderId: paymentSuccessOrder.id,
              })}
            class="w-full sm:w-auto px-6 py-3.5 bg-[#09090b] hover:bg-[#ff5a00] text-white uppercase font-semibold shadow-md transition flex items-center justify-center gap-2 cursor-pointer rounded-[14px]"
          >
            <Icon name="clock" size={14} />
            <span>Lacak Milestone Proyek</span>
          </button>
        </div>

        <div class="text-[12px] text-[#71717a] font-normal">
          {#if paymentSuccessOrder._paymentMeta?.emailSent}
            Invoice telah dikirim via SMTP ke <strong class="text-[#09090b] font-semibold"
              >{paymentSuccessOrder.customer?.email || paymentSuccessOrder.customer_email || customerEmail}</strong
            >
          {:else}
            Invoice diterbitkan untuk email <strong class="text-[#09090b] font-semibold"
              >{paymentSuccessOrder.customer?.email || paymentSuccessOrder.customer_email || customerEmail}</strong
            > (dapat dikirim ulang dari halaman Invoice)
          {/if}
        </div>
      </div>
    {:else}
      <!-- ==================== CHECKOUT FORM FLOW ==================== -->
      <div class="space-y-8">
        <!-- Header -->
        <div class="border-b border-[#ececee] pb-6 space-y-2">
          <div
            class="flex items-center gap-2 text-[12px] uppercase tracking-widest text-[#ff5a00] font-semibold"
          >
            <span>[ FORMULIR CHECKOUT & ALOKASI SPRINT ]</span>
            <span class="text-[#a1a1aa]">/</span>
            <span>PT NEXA DIGITAL SOLUSINDO</span>
          </div>
          <h1
            class="text-3xl sm:text-4xl font-semibold text-[#09090b] tracking-tight"
          >
            Pemesanan & Otorisasi Proyek
          </h1>
          <p class="text-[14px] text-[#52525b] font-normal">
            Lengkapi data penanggung jawab dan rincian teknis untuk pengerjaan instan tanpa proses birokrasi manual.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Main Form Column (8 cols) -->
          <div class="lg:col-span-8 space-y-6">
            <!-- STEP 1: SERVICE & PACKAGE SELECTION -->
            <div
              class="bg-white border border-[#ececee] p-6 sm:p-8 space-y-5 rounded-[36px] shadow-xs"
            >
              <div
                class="flex items-center justify-between border-b border-[#ececee] pb-4"
              >
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-6 h-6 bg-[#09090b] text-white text-[12px] font-semibold flex items-center justify-center rounded-[8px]"
                    >1</span
                  >
                  <h2
                    class="text-[13px] font-semibold uppercase text-[#09090b]"
                  >
                    Pilihan Layanan & Tingkat Paket
                  </h2>
                </div>
                <button
                  type="button"
                  on:click={() => navigateTo("services")}
                  class="text-[12px] uppercase font-semibold text-[#ff5a00] hover:text-[#e04f00] cursor-pointer transition-colors"
                >
                  Ganti Spesifikasi
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label class="block space-y-1.5">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Bidang Layanan</span
                  >
                  <select
                    bind:value={serviceId}
                    on:change={() => {
                      packageId = "standard";
                    }}
                    class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b] cursor-pointer font-medium"
                  >
                    {#each services as s}
                      <option value={s.id}>{s.name} ({s.category})</option>
                    {/each}
                  </select>
                </label>

                <label class="block space-y-1.5">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Tingkat Skala Paket</span
                  >
                  <select
                    bind:value={packageId}
                    class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b] cursor-pointer font-medium"
                  >
                    {#each currentService.packages as p}
                      <option value={p.id}
                        >{p.name} — {formatRupiah(p.price)} ({p.deliveryTime})</option
                      >
                    {/each}
                  </select>
                </label>
              </div>

              <!-- Selected package brief card -->
              <div
                class="p-4 border border-[#ececee] bg-[#fafafa] rounded-[20px] space-y-1.5 font-normal"
              >
                <div
                  class="flex items-center justify-between font-semibold text-[#09090b] text-[13px]"
                >
                  <span
                    >PAKET AKTIF: {currentService.name} ({currentPackage.name})</span
                  >
                  <span class="text-[#ff5a00]"
                    >{formatRupiah(currentPackage.price)}</span
                  >
                </div>
                <p class="text-[#52525b] text-[12px] leading-relaxed">
                  Cakupan: {currentPackage.screens}, estimasi durasi {currentPackage.deliveryTime}, batas revisi {currentPackage.revisions}.
                </p>
              </div>
            </div>

            <!-- STEP 2: CUSTOMER INFORMATION -->
            <div
              class="bg-white border border-[#ececee] p-6 sm:p-8 space-y-5 rounded-[36px] shadow-xs"
            >
              <div
                class="flex items-center justify-between border-b border-[#ececee] pb-4"
              >
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-6 h-6 bg-[#09090b] text-white text-[12px] font-semibold flex items-center justify-center rounded-[8px]"
                    >2</span
                  >
                  <h2
                    class="text-[13px] font-semibold uppercase text-[#09090b]"
                  >
                    Data Penanggung Jawab Proyek
                  </h2>
                </div>
                {#if $isClientLoggedIn}
                  <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-[10px] border border-emerald-100">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>KLIEN TERVERIFIKASI</span>
                  </span>
                {:else}
                  <span class="text-[11px] text-[#ff5a00] font-semibold flex items-center gap-1.5 bg-[#ff5a00]/10 px-2.5 py-1 rounded-[10px] border border-[#ff5a00]/20">
                    <span class="w-2 h-2 rounded-full bg-[#ff5a00] animate-pulse"></span>
                    <span>BELUM LOGIN</span>
                  </span>
                {/if}
              </div>

              <!-- Auth Status Box -->
              {#if $isClientLoggedIn}
                <div class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-[20px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                  <div>
                    <span class="text-emerald-950 font-semibold block text-[14px]">
                      Terautentikasi: {$clientUser?.name}
                    </span>
                    <span class="text-emerald-700/80 block text-[12px] mt-0.5 font-normal">
                      {$clientUser?.email} • {$clientUser?.company || 'Personal / Bisnis'}
                    </span>
                  </div>
                  <button
                    type="button"
                    on:click={goToClientLogin}
                    class="px-3.5 py-2 text-[12px] text-[#09090b] hover:text-[#ff5a00] border border-emerald-300 bg-white hover:bg-emerald-50 transition-all self-start sm:self-auto cursor-pointer rounded-[12px] font-semibold shadow-xs"
                  >
                    Ganti Akun Klien
                  </button>
                </div>
              {:else}
                <div class="p-5 bg-[#ff5a00]/5 border border-[#ff5a00]/20 rounded-[24px] space-y-3">
                  <div class="flex items-center gap-2 text-[12px] font-semibold uppercase text-[#09090b]">
                    <Icon name="lock" size={16} className="text-[#ff5a00] shrink-0" />
                    <span>Login Klien Diperlukan Sebelum Memulai Pemesanan</span>
                  </div>
                  <p class="text-[13px] text-[#52525b] leading-relaxed font-normal">
                    Untuk menjamin keamanan kontrak, privasi brief, dan kepemilikan faktur pajak, silakan login ke akun Klien Anda terlebih dahulu.
                  </p>
                  <div class="flex flex-wrap items-center gap-2.5 pt-1 text-[12px] font-semibold">
                    <button
                      type="button"
                      on:click={goToClientLogin}
                      class="px-4 py-3 bg-[#09090b] hover:bg-[#18181b] text-white uppercase transition-all cursor-pointer rounded-[14px] shadow-xs"
                    >
                      Masuk / Buat Akun Klien &rarr;
                    </button>
                    <button
                      type="button"
                      on:click={quickLoginDemoClient}
                      class="px-4 py-3 bg-[#ff5a00] hover:bg-[#e04f00] text-white uppercase transition-all cursor-pointer rounded-[14px] shadow-md flex items-center gap-2"
                    >
                      <Icon name="zap" size={14} />
                      <span>Login Cepat Demo Klien</span>
                    </button>
                  </div>
                </div>
              {/if}

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label class="block space-y-1.5">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Nama Lengkap Pemesan *</span
                  >
                  <input
                    type="text"
                    bind:value={customerName}
                    placeholder="Contoh: Rian Hidayat"
                    class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                  />
                </label>

                <label class="block space-y-1.5">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Email untuk Faktur & Notifikasi *</span
                  >
                  <input
                    type="email"
                    bind:value={customerEmail}
                    placeholder="email@bisnis.com"
                    class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                  />
                </label>

                <label class="block space-y-1.5">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Nomor WhatsApp Aktif *</span
                  >
                  <input
                    type="tel"
                    bind:value={customerPhone}
                    placeholder="+62 812-xxxx-xxxx"
                    class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                  />
                </label>

                <label class="block space-y-1.5">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Badan Usaha / Organisasi (Opsional)</span
                  >
                  <input
                    type="text"
                    bind:value={customerCompany}
                    placeholder="PT / CV / Startup Anda"
                    class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                  />
                </label>
              </div>
            </div>

            <!-- STEP 3: PROJECT REQUIREMENTS -->
            <div
              class="bg-white border border-[#ececee] p-6 sm:p-8 space-y-5 rounded-[36px] shadow-xs"
            >
              <div
                class="flex items-center gap-2.5 border-b border-[#ececee] pb-4"
              >
                <span
                  class="w-6 h-6 bg-[#09090b] text-white text-[12px] font-semibold flex items-center justify-center rounded-[8px]"
                  >3</span
                >
                <h2
                  class="text-[13px] font-semibold uppercase text-[#09090b]"
                >
                  Spesifikasi Kebutuhan Proyek
                </h2>
              </div>

              <div class="space-y-4">
                <label class="block space-y-1.5">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Judul Ringkas Proyek *</span
                  >
                  <input
                    type="text"
                    bind:value={projectTitle}
                    placeholder="Contoh: Redesain Aplikasi Mobile Kurir On-Demand"
                    class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                  />
                </label>

                <label class="block space-y-1.5">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Deskripsi & Ruang Lingkup Fitur *</span
                  >
                  <textarea
                    rows="3"
                    bind:value={projectDescription}
                    placeholder="Jelaskan kebutuhan fungsional, target audiens, dan ekspektasi yang Anda inginkan..."
                    class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b] leading-relaxed"
                  ></textarea>
                </label>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label class="block space-y-1.5">
                    <span
                      class="block text-[12px] text-[#52525b] font-medium"
                      >Tautan Referensi Desain/Sistem (Opsional)</span
                    >
                    <input
                      type="url"
                      bind:value={referenceUrl}
                      placeholder="https://dribbble.com/contoh"
                      class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                    />
                  </label>

                  <label class="block space-y-1.5">
                    <span
                      class="block text-[12px] text-[#52525b] font-medium"
                      >Ekspektasi Timeline</span
                    >
                    <input
                      type="text"
                      bind:value={expectedDeadline}
                      placeholder="Sesuai estimasi paket"
                      class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                    />
                  </label>
                </div>

                <!-- File Upload Simulation -->
                <div class="space-y-1.5 pt-1">
                  <span
                    class="block text-[12px] text-[#52525b] font-medium"
                    >Lampiran Dokumen Brief / Dokumen Pendukung (Opsional)</span
                  >
                  <label
                    class="border border-dashed border-[#ececee] p-5 bg-[#fafafa] text-center relative hover:bg-[#ececee]/50 hover:border-[#a1a1aa] transition cursor-pointer block rounded-[20px]"
                  >
                    <input
                      type="file"
                      on:change={handleFileSelect}
                      class="sr-only"
                    />
                    <div
                      class="text-[13px] text-[#52525b] flex items-center justify-center gap-2 font-normal"
                    >
                      <Icon
                        name="upload-cloud"
                        size={18}
                        className="text-[#71717a]"
                      />
                      {#if uploadedDocName}
                        <span class="font-semibold text-[#ff5a00]"
                          >{uploadedDocName}</span
                        >
                      {:else}
                        <div>
                          <span class="text-[#09090b] font-medium block">Klik atau seret dokumen ke sini</span>
                          <span class="text-[11px] text-[#71717a]">PDF, DOCX, ZIP, PNG (Maks. 25MB)</span>
                        </div>
                      {/if}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- STEP 4: PAYMENT METHODS -->
            <div
              class="bg-white border border-[#ececee] p-6 sm:p-8 space-y-5 rounded-[36px] shadow-xs"
            >
              <div
                class="flex items-center gap-2.5 border-b border-[#ececee] pb-4"
              >
                <span
                  class="w-6 h-6 bg-[#09090b] text-white text-[12px] font-semibold flex items-center justify-center rounded-[8px]"
                  >4</span
                >
                <h2
                  class="text-[13px] font-semibold uppercase text-[#09090b]"
                >
                  Metode Pembayaran Resmi
                </h2>
              </div>

              <div class="space-y-3 text-[13px]">
                <!-- Method 1: BCA VA -->
                <label
                  class="flex items-center justify-between p-4 border transition cursor-pointer rounded-[20px] {paymentMethod ===
                  'Bank Transfer BCA (VA)'
                    ? 'border-[#ff5a00] bg-[#ff5a00]/5 shadow-xs'
                    : 'border-[#ececee] bg-[#fafafa] hover:bg-[#ececee]/50'}"
                >
                  <div class="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymethod"
                      value="Bank Transfer BCA (VA)"
                      bind:group={paymentMethod}
                      class="text-[#ff5a00] focus:ring-[#ff5a00] accent-[#ff5a00] cursor-pointer"
                    />
                    <div>
                      <div class="font-semibold text-[#09090b]">
                        BCA Virtual Account
                      </div>
                      <div class="text-[12px] text-[#52525b] font-normal">
                        Verifikasi instan otomatis 24 jam
                      </div>
                    </div>
                  </div>
                  <span
                    class="text-[11px] font-semibold px-2.5 py-1 bg-white border border-[#ececee] text-[#09090b] rounded-[10px]"
                    >BCA</span
                  >
                </label>

                <!-- Method 2: Mandiri VA -->
                <label
                  class="flex items-center justify-between p-4 border transition cursor-pointer rounded-[20px] {paymentMethod ===
                  'Bank Mandiri Virtual Account'
                    ? 'border-[#ff5a00] bg-[#ff5a00]/5 shadow-xs'
                    : 'border-[#ececee] bg-[#fafafa] hover:bg-[#ececee]/50'}"
                >
                  <div class="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymethod"
                      value="Bank Mandiri Virtual Account"
                      bind:group={paymentMethod}
                      class="text-[#ff5a00] focus:ring-[#ff5a00] accent-[#ff5a00] cursor-pointer"
                    />
                    <div>
                      <div class="font-semibold text-[#09090b]">
                        Mandiri Virtual Account
                      </div>
                      <div class="text-[12px] text-[#52525b] font-normal">
                        Transfer dari Livin' by Mandiri atau ATM
                      </div>
                    </div>
                  </div>
                  <span
                    class="text-[11px] font-semibold px-2.5 py-1 bg-white border border-[#ececee] text-[#09090b] rounded-[10px]"
                    >MANDIRI</span
                  >
                </label>

                <!-- Method 3: QRIS -->
                <label
                  class="flex items-center justify-between p-4 border transition cursor-pointer rounded-[20px] {paymentMethod ===
                  'QRIS / E-Wallet'
                    ? 'border-[#ff5a00] bg-[#ff5a00]/5 shadow-xs'
                    : 'border-[#ececee] bg-[#fafafa] hover:bg-[#ececee]/50'}"
                >
                  <div class="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymethod"
                      value="QRIS / E-Wallet"
                      bind:group={paymentMethod}
                      class="text-[#ff5a00] focus:ring-[#ff5a00] accent-[#ff5a00] cursor-pointer"
                    />
                    <div>
                      <div class="font-semibold text-[#09090b]">
                        QRIS Instan Nasional (GoPay / OVO / Dana / BCA QR)
                      </div>
                      <div class="text-[12px] text-[#52525b] font-normal">
                        Pindai kode QR dari aplikasi m-banking apa pun
                      </div>
                    </div>
                  </div>
                  <span
                    class="text-[11px] font-semibold px-2.5 py-1 bg-white border border-[#ececee] text-[#09090b] rounded-[10px]"
                    >QRIS</span
                  >
                </label>

                <!-- Method 4: Kartu Kredit -->
                <label
                  class="flex items-center justify-between p-4 border transition cursor-pointer rounded-[20px] {paymentMethod ===
                  'Kartu Kredit / Debit Visa & Mastercard'
                    ? 'border-[#ff5a00] bg-[#ff5a00]/5 shadow-xs'
                    : 'border-[#ececee] bg-[#fafafa] hover:bg-[#ececee]/50'}"
                >
                  <div class="flex items-center gap-3.5">
                    <input
                      type="radio"
                      name="paymethod"
                      value="Kartu Kredit / Debit Visa & Mastercard"
                      bind:group={paymentMethod}
                      class="text-[#ff5a00] focus:ring-[#ff5a00] accent-[#ff5a00] cursor-pointer"
                    />
                    <div>
                      <div class="font-semibold text-[#09090b]">
                        Kartu Kredit / Debit (Visa & Mastercard)
                      </div>
                      <div class="text-[12px] text-[#52525b] font-normal">
                        Enkripsi standar 3D Secure 256-bit
                      </div>
                    </div>
                  </div>
                  <span
                    class="text-[11px] font-semibold px-2.5 py-1 bg-white border border-[#ececee] text-[#09090b] rounded-[10px]"
                    >VISA / MC</span
                  >
                </label>
              </div>
            </div>
          </div>

          <!-- Order Summary Sidebar Column (4 cols) -->
          <div class="lg:col-span-4 sticky top-24 space-y-6">
            <div
              class="bg-white border border-[#ececee] p-6 sm:p-8 rounded-[36px] shadow-xs space-y-6"
            >
              <div class="border-b border-[#ececee] pb-4">
                <span
                  class="text-[11px] text-[#ff5a00] font-semibold uppercase tracking-wider block"
                  >[ RINGKASAN TAGIHAN ]</span
                >
                <h3 class="text-lg font-semibold text-[#09090b] mt-0.5">
                  Order Summary
                </h3>
              </div>

              <!-- Package Item Detail -->
              <div class="space-y-3 text-[13px]">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-semibold text-[#09090b] text-[14px]">
                      {currentService.name}
                    </div>
                    <div class="text-[#52525b] mt-0.5 font-normal">
                      {#if hasCustomQuote}
                        <span class="text-[#ff5a00] font-semibold"
                          >★ {$customProjectQuote.scaleName}</span
                        >
                      {:else}
                        {currentPackage.name}
                      {/if}
                    </div>
                  </div>
                  <div class="font-semibold text-[#09090b] text-[15px]">
                    {formatRupiah(subtotal)}
                  </div>
                </div>

                {#if hasCustomQuote && $customProjectQuote.addons.length > 0}
                  <div
                    class="p-3.5 bg-[#fafafa] border border-[#ececee] rounded-[20px] space-y-1.5"
                  >
                    <span
                      class="text-[11px] font-semibold text-[#71717a] block uppercase"
                      >Modul Add-on Terpilih:</span
                    >
                    {#each $customProjectQuote.addons as add}
                      <div
                        class="text-[12px] text-[#52525b] flex items-center gap-2 font-normal"
                      >
                        <span class="text-[#ff5a00] font-bold">▪</span>
                        <span>{add}</span>
                      </div>
                    {/each}
                  </div>
                {/if}

                <div
                  class="p-4 bg-[#fafafa] border border-[#ececee] rounded-[20px] space-y-2 text-[#52525b] text-[12px] font-normal"
                >
                  <div class="flex justify-between">
                    <span class="text-[#71717a]">Estimasi Durasi:</span>
                    <strong class="text-[#09090b] font-semibold">
                      {hasCustomQuote
                        ? `${$customProjectQuote.deliveryDays} Hari Kerja`
                        : currentPackage.deliveryTime}
                    </strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-[#71717a]">Sesi Revisi:</span>
                    <strong class="text-[#09090b] font-semibold">
                      {hasCustomQuote
                        ? "3x Sesi Terjadwal"
                        : currentPackage.revisions}
                    </strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-[#71717a]">Faktur Resmi:</span>
                    <strong class="text-emerald-600 font-semibold">e-Faktur PPN 11%</strong>
                  </div>
                </div>
              </div>

              <!-- Promo Code Input -->
              <div
                class="space-y-2 pt-2 border-t border-[#ececee] text-[13px]"
              >
                <span
                  class="block font-semibold text-[#09090b] uppercase text-[11px]"
                  >Kupon Promo / Voucher</span
                >
                <div class="flex gap-2">
                  <input
                    type="text"
                    placeholder="KODE: NEXA10"
                    bind:value={promoCode}
                    class="flex-1 px-4 py-3 bg-[#fafafa] border border-[#ececee] rounded-[14px] uppercase focus:outline-none focus:border-[#09090b] text-[#09090b] text-[13px]"
                    aria-label="Kode Promo atau Voucher"
                  />
                  <button
                    type="button"
                    on:click={applyPromo}
                    class="px-4 py-3 bg-[#09090b] hover:bg-[#18181b] text-white font-medium uppercase transition cursor-pointer rounded-[14px] shrink-0 text-[12px]"
                  >
                    Terapkan
                  </button>
                </div>
                {#if promoApplied}
                  <div class="text-[12px] text-emerald-600 font-semibold">
                    ✓ Kupon diskon berhasil diterapkan!
                  </div>
                {/if}
              </div>

              <!-- Financial Breakdown Table -->
              <div
                class="pt-3 border-t border-[#ececee] space-y-2.5 text-[13px] font-normal"
              >
                <div class="flex justify-between text-[#52525b]">
                  <span>Subtotal</span>
                  <span class="font-semibold text-[#09090b]"
                    >{formatRupiah(subtotal)}</span
                  >
                </div>
                {#if discountAmount > 0}
                  <div class="flex justify-between text-emerald-600 font-semibold">
                    <span>Diskon Kupon</span>
                    <span>- {formatRupiah(discountAmount)}</span>
                  </div>
                {/if}
                <div class="flex justify-between text-[#52525b]">
                  <span>PPN 11% Resmi</span>
                  <span class="font-semibold text-[#09090b]"
                    >{formatRupiah(tax)}</span
                  >
                </div>

                <div
                  class="pt-4 border-t border-[#ececee] flex justify-between items-baseline"
                >
                  <div>
                    <span
                      class="text-[12px] uppercase font-semibold text-[#09090b] block"
                      >Total Akhir:</span
                    >
                    <span class="text-[11px] text-[#71717a] font-normal"
                      >Termasuk faktur pajak sah</span
                    >
                  </div>
                  <div class="text-2xl font-semibold text-[#09090b]">
                    {formatRupiah(finalTotal)}
                  </div>
                </div>
              </div>

              <!-- Terms Acceptance Checkbox -->
              <div class="pt-2">
                <label
                  class="flex items-start gap-2.5 text-[12px] text-[#52525b] cursor-pointer font-normal"
                >
                  <input
                    type="checkbox"
                    bind:checked={termsAccepted}
                    class="mt-0.5 rounded text-[#ff5a00] focus:ring-[#ff5a00] accent-[#ff5a00] cursor-pointer"
                  />
                  <span class="leading-relaxed">
                    Saya menyetujui parameter pengerjaan, SLA perbaikan bug 30 hari, dan kerahasiaan non-disclosure Nexa Digital.
                  </span>
                </label>
              </div>

              <!-- Main Submit Button -->
              <button
                type="button"
                on:click={handleProcessPayment}
                disabled={isProcessing}
                class="w-full py-4 px-4 {$isClientLoggedIn ? 'bg-[#ff5a00] hover:bg-[#e04f00] text-white shadow-md' : 'bg-[#09090b] hover:bg-[#18181b] text-white'} disabled:opacity-50 text-[13px] uppercase font-semibold transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer rounded-[14px]"
              >
                {#if isProcessing}
                  <Icon name="refresh-cw" size={15} className="animate-spin" />
                  <span>{processingStep || "Memproses Transaksi..."}</span>
                {:else if !$isClientLoggedIn}
                  <span>Masuk Akun Klien untuk Memesan</span>
                {:else}
                  <Icon name="credit-card" size={15} />
                  <span>Bayar & Proses Pesanan</span>
                {/if}
              </button>

              <div
                class="text-[11px] text-[#71717a] text-center flex items-center justify-center gap-1.5 font-normal"
              >
                <Icon name="shield" size={12} className="text-emerald-600" />
                <span>Enkripsi Pembayaran Aman 256-Bit SSL</span>
              </div>
            </div>

            <!-- Quick FAQ Box -->
            <div
              class="bg-[#fafafa] border border-[#ececee] p-5 text-[13px] text-[#52525b] space-y-1 rounded-[24px] shadow-xs font-normal"
            >
              <span class="font-semibold text-[#09090b] uppercase text-[11px] block"
                >[ ALUR SETELAH PEMBAYARAN ]</span
              >
              <p class="text-[12px] leading-relaxed text-[#52525b]">
                Invoice PDF dan e-Faktur terbit secara instan. Tim rekayasa Nexa Digital akan mengaktifkan kanal obrolan dan pelacakan milestone di Portal Klien Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
</style>