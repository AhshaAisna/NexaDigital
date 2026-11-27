<script>
  import {
    orders,
    selectedOrderId,
    navigateTo,
    formatRupiah,
    showToast,
  } from "../stores/marketplaceStore";
  import { companyInfo } from "../data/team";
  import StatusBadge from "../components/StatusBadge.svelte";
  import Icon from "../components/Icon.svelte";
  import { INVOICE_TEMPLATES, buildInvoiceDataFromOrder } from "../data/invoiceTemplates";
  import InvoiceTemplateRenderer from "../components/InvoiceTemplateRenderer.svelte";
  import { isPegawaiLoggedIn, isAdminLoggedIn } from "../stores/authStore";
  import { sendInvoiceEmailApi } from "../lib/services/apiService";
  import {
    startMidtransPaymentForOrder,
    syncOrderPaymentAndStore
  } from "../lib/services/midtransService";

  let selectedTemplate = "default"; // 'default' or one of 16 template IDs
  let isSendingEmail = false;
  let isPayingMidtrans = false;
  let isSyncingPayment = false;

  $: currentOrder =
    $orders.find((o) => o.id === $selectedOrderId) || $orders[0];

  $: templateInvoiceData = currentOrder ? buildInvoiceDataFromOrder(currentOrder) : null;

  function handleGoBack() {
    if ($isPegawaiLoggedIn) {
      navigateTo("pegawai-dashboard");
    } else if ($isAdminLoggedIn) {
      navigateTo("admin-dashboard");
    } else {
      navigateTo("customer-dashboard");
    }
  }

  function printInvoice() {
    window.print();
  }

  function downloadPdfSimulation() {
    showToast(
      `Mengunduh berkas ${currentOrder.invoiceNumber}.pdf...`,
      "success",
    );
    setTimeout(() => {
      window.print();
    }, 500);
  }

  function copyInvoiceLink() {
    navigator.clipboard?.writeText(window.location.href);
    showToast("Tautan invoice berhasil disalin ke clipboard.", "success");
  }

  async function sendViaEmail() {
    if (!currentOrder || isSendingEmail) return;
    const invoiceKey = currentOrder.invoiceNumber || currentOrder.invoice_number || currentOrder.id;
    const recipient = currentOrder.customer?.email || currentOrder.customer_email;

    if (!recipient) {
      showToast("Email klien pada faktur ini tidak tersedia.", "error");
      return;
    }

    isSendingEmail = true;
    try {
      const res = await sendInvoiceEmailApi(invoiceKey, recipient);
      showToast(
        res?.message || `Invoice ${invoiceKey} berhasil dikirim ke ${recipient}!`,
        "success",
      );
    } catch (err) {
      showToast(
        err.message || "Gagal mengirim email invoice melalui SMTP backend.",
        "error",
      );
    } finally {
      isSendingEmail = false;
    }
  }

  async function payViaMidtrans() {
    if (!currentOrder || isPayingMidtrans) return;
    isPayingMidtrans = true;
    try {
      await startMidtransPaymentForOrder(currentOrder, {
        onSuccess: () => {
          isPayingMidtrans = false;
          showToast("Pembayaran Midtrans berhasil! Status invoice otomatis diperbarui ke PAID.", "success");
        },
        onPending: () => {
          isPayingMidtrans = false;
          showToast("Transaksi Midtrans dibuat (PENDING). Selesaikan pembayaran Anda.", "info");
        },
        onError: () => {
          isPayingMidtrans = false;
          showToast("Pembayaran Midtrans gagal atau dibatalkan.", "error");
        },
        onClose: () => {
          isPayingMidtrans = false;
        }
      });
    } catch (err) {
      isPayingMidtrans = false;
      showToast(err.message || "Gagal memproses pembayaran Midtrans.", "error");
    }
  }

  async function syncPaymentStatus() {
    if (!currentOrder || isSyncingPayment) return;
    isSyncingPayment = true;
    try {
      const synced = await syncOrderPaymentAndStore(currentOrder.id);
      if (synced) {
        showToast(`Status pembayaran terbaru: ${synced.paymentStatus}`, "success");
      }
    } catch (err) {
      showToast(err.message || "Gagal memeriksa status pembayaran ke Midtrans.", "error");
    } finally {
      isSyncingPayment = false;
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
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Poppins', sans-serif !important;
  }

  @media print {
    :global(body) {
      background-color: white !important;
    }
    .no-print {
      display: none !important;
    }
    .invoice-container {
      border: 1px solid #e2e8f0 !important;
      box-shadow: none !important;
      padding: 0 !important;
    }
  }
</style>

<div
  class="min-h-screen bg-[#f8fafc] text-slate-800 selection:bg-slate-900 selection:text-orange-400 font-['Poppins'] py-10 px-4 sm:px-6 lg:px-8 pb-24 antialiased"
>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Top Invoice Action Bar (No-Print Console) -->
    <div
      class="no-print bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium"
    >
      <div class="flex items-center gap-3 w-full sm:w-auto flex-wrap">
        <button
          on:click={handleGoBack}
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 uppercase font-semibold transition cursor-pointer rounded-xl"
        >
          <Icon name="arrow-left" size={14} />
          <span>Kembali</span>
        </button>

        <!-- Selector Switch Invoice -->
        <select
          bind:value={$selectedOrderId}
          class="px-3.5 py-2 bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-orange-500 cursor-pointer rounded-xl"
        >
          {#each $orders as ord}
            <option value={ord.id}
              >{ord.invoiceNumber} ({ord.customer.name})</option
            >
          {/each}
        </select>

        <!-- Selector Switch 16 Templates -->
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400 font-semibold text-[11px] hidden sm:inline">Desain:</span>
          <select
            bind:value={selectedTemplate}
            class="px-3 py-2 bg-orange-50 border border-orange-200 text-orange-950 font-semibold focus:outline-none focus:border-orange-500 cursor-pointer rounded-xl"
            title="Ganti Desain Template Invoice"
          >
            <option value="default">Desain Standar Nexa</option>
            <optgroup label="16 Template Resmi">
              {#each INVOICE_TEMPLATES as tpl}
                <option value={tpl.id}>{tpl.name} ({tpl.category})</option>
              {/each}
            </optgroup>
          </select>
        </div>
      </div>

      <!-- Action Buttons -->
      <div
        class="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto font-semibold"
      >
        <button
          on:click={copyInvoiceLink}
          class="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 uppercase transition flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-200 shadow-2xs"
          title="Salin Tautan"
        >
          <Icon name="share-2" size={14} />
          <span>Bagikan</span>
        </button>

        {#if currentOrder && currentOrder.paymentStatus !== "PAID"}
          <button
            on:click={payViaMidtrans}
            disabled={isPayingMidtrans}
            class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white uppercase transition flex items-center gap-1.5 cursor-pointer rounded-xl shadow-xs"
            title="Bayar Tagihan via Midtrans"
          >
            <Icon name="credit-card" size={14} />
            <span>{isPayingMidtrans ? "Memuat..." : "Bayar Midtrans"}</span>
          </button>

          <button
            on:click={syncPaymentStatus}
            disabled={isSyncingPayment}
            class="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 uppercase transition flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-200 shadow-2xs"
            title="Cek Status Pembayaran dari Midtrans"
          >
            <Icon name="refresh-cw" size={14} className={isSyncingPayment ? "animate-spin" : ""} />
            <span>Cek Status</span>
          </button>
        {/if}

        <button
          on:click={sendViaEmail}
          disabled={isSendingEmail}
          class="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-700 uppercase transition flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-200 shadow-2xs"
          title="Kirim via Email SMTP"
        >
          <Icon name="mail" size={14} />
          <span>{isSendingEmail ? "Mengirim..." : "Email"}</span>
        </button>

        <button
          on:click={downloadPdfSimulation}
          class="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 uppercase transition flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-200 shadow-2xs"
        >
          <Icon name="download" size={14} />
          <span>Unduh</span>
        </button>

        <button
          on:click={printInvoice}
          class="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white uppercase transition flex items-center gap-1.5 cursor-pointer rounded-xl shadow-md shadow-orange-600/30"
        >
          <Icon name="printer" size={14} />
          <span>Cetak</span>
        </button>
      </div>
    </div>

    <!-- ==================== OFFICIAL BUSINESS INVOICE DOCUMENT ==================== -->
    {#if selectedTemplate === 'default'}
      <div
        class="invoice-container bg-white border border-slate-200 shadow-sm p-8 sm:p-12 text-slate-800 space-y-8 relative rounded-3xl"
      >
        <!-- Invoice Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8"
        >
        <!-- Company Information -->
        <div class="space-y-3">
          <div class="flex items-center gap-3.5">
            <div
              class="w-10 h-10 bg-slate-900 text-white font-bold text-sm flex items-center justify-center rounded-xl shadow-xs"
            >
              NX
            </div>
            <div>
              <div
                class="text-xl font-bold tracking-tight text-slate-900 leading-none"
              >
                Nexa Digital
              </div>
              <div
                class="text-[10px] uppercase tracking-widest text-slate-400 mt-1 block font-semibold"
              >
                {companyInfo.legalName}
              </div>
            </div>
          </div>
          <div
            class="text-xs text-slate-500 max-w-sm leading-relaxed font-normal"
          >
            <p>{companyInfo.address}</p>
            <p class="pt-1 text-slate-700 font-semibold">
              NPWP Badan: 01.234.567.8-012.000
            </p>
            <p>Email: {companyInfo.email} | WA: {companyInfo.whatsapp}</p>
          </div>
        </div>

        <!-- Invoice Metadata & Official Title -->
        <div class="text-left sm:text-right space-y-2">
          <h1
            class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight uppercase"
          >
            INVOICE
          </h1>

          <div class="space-y-1 text-xs text-slate-500 font-normal">
            <div>
              <span class="text-slate-400 uppercase font-medium">Nomor Faktur:</span>
              <strong class="text-slate-900 ml-1 font-semibold"
                >{currentOrder.invoiceNumber}</strong
              >
            </div>
            <div>
              <span class="text-slate-400 uppercase font-medium">Nomor Pesanan:</span>
              <span class="text-slate-700 ml-1 font-semibold">{currentOrder.id}</span>
            </div>
            <div>
              <span class="text-slate-400 uppercase font-medium">Tanggal Terbit:</span>
              <span class="text-slate-700 ml-1 font-semibold"
                >{currentOrder.orderDate || "22 September 2026"}</span
              >
            </div>
            <div>
              <span class="text-slate-400 uppercase font-medium">Jatuh Tempo:</span>
              <span class="text-slate-700 ml-1 font-semibold">{currentOrder.deadline}</span>
            </div>
          </div>

          <div class="pt-2">
            <span
              class="inline-block px-3 py-1 border text-xs font-semibold uppercase tracking-wider rounded-lg {currentOrder.paymentStatus === 'PAID'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'}"
            >
              STATUS: {currentOrder.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <!-- Billed To & Project Brief -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2 text-xs border-b border-slate-100 pb-8"
      >
        <div class="space-y-1.5 bg-slate-50/80 border border-slate-200 p-5 rounded-2xl">
          <span
            class="text-[10px] uppercase font-bold text-slate-400 block tracking-widest"
            >[ DITERBITKAN UNTUK KLIEN ]</span
          >
          <div class="font-bold text-base text-slate-900">
            {currentOrder.customer.name}
          </div>
          <div class="text-slate-700 font-semibold">
            {currentOrder.customer.company || "Entitas Personal / Startup"}
          </div>
          <div class="text-slate-500">{currentOrder.customer.email}</div>
          <div class="text-slate-500">{currentOrder.customer.phone}</div>
        </div>

        <div class="space-y-1.5 bg-slate-50/80 border border-slate-200 p-5 rounded-2xl">
          <span
            class="text-[10px] uppercase font-bold text-slate-400 block tracking-widest"
            >[ INFORMASI PROYEK ]</span
          >
          <div class="font-bold text-sm text-slate-900">
            {currentOrder.requirements?.title || currentOrder.serviceName}
          </div>
          <div class="text-slate-600 font-normal">
            Layanan: <strong class="text-slate-900 font-semibold"
              >{currentOrder.serviceName}</strong
            >
          </div>
          <div class="text-slate-600 font-normal">
            Paket: <strong class="text-slate-900 font-semibold"
              >{currentOrder.packageName}</strong
            >
          </div>
          <div class="text-slate-600 font-normal">
            Metode Bayar: <strong class="text-slate-900 font-semibold"
              >{currentOrder.paymentMethod}</strong
            >
          </div>
        </div>
      </div>

      <!-- ITEM DETAILS TABLE -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]"
            >
              <th class="py-3.5 px-4 rounded-l-xl">Deskripsi Layanan / Item</th>
              <th class="py-3.5 px-4 text-center w-20">Qty</th>
              <th class="py-3.5 px-4 text-right w-36">Harga Satuan</th>
              <th class="py-3.5 px-4 text-right w-36 rounded-r-xl">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr>
              <td class="py-4 px-4 space-y-1">
                <div class="font-bold text-sm text-slate-900">
                  {currentOrder.serviceName} — {currentOrder.packageName}
                </div>
                <p
                  class="text-slate-500 text-[11px] leading-relaxed max-w-lg font-normal"
                >
                  {currentOrder.requirements?.description ||
                    "Pengembangan produk digital profesional sesuai spesifikasi scope yang disepakati."}
                </p>
                <div class="text-[11px] text-orange-600 font-semibold pt-1">
                  Estimasi Serah Terima: {currentOrder.deadline} (Termasuk sesi revisi)
                </div>
              </td>
              <td class="py-4 px-4 text-center font-bold text-slate-900">1</td>
              <td class="py-4 px-4 text-right font-semibold text-slate-900 font-mono"
                >{formatRupiah(currentOrder.price)}</td
              >
              <td class="py-4 px-4 text-right font-bold text-slate-900 font-mono"
                >{formatRupiah(currentOrder.price)}</td
              >
            </tr>
          </tbody>
        </table>
      </div>

      <!-- FINANCIAL SUMMARY & BARCODE VERIFICATION -->
      <div
        class="grid grid-cols-1 sm:grid-cols-12 gap-8 pt-6 border-t border-slate-100 items-start"
      >
        <!-- Verification & Payment Details -->
        <div class="sm:col-span-7 space-y-4 text-xs font-normal">
          <div
            class="flex items-center gap-4 bg-slate-50/80 p-4 border border-slate-200 rounded-2xl"
          >
            <!-- Barcode Stamp -->
            <div
              class="h-16 w-20 bg-white border border-slate-200 p-1.5 flex flex-col items-center justify-center shrink-0 rounded-xl shadow-2xs"
            >
              <svg
                viewBox="0 0 48 24"
                width="100%"
                height="100%"
                class="text-slate-800"
              >
                <rect x="1" y="2" width="2" height="18" fill="currentColor" />
                <rect x="5" y="2" width="1" height="18" fill="currentColor" />
                <rect x="8" y="2" width="3" height="18" fill="currentColor" />
                <rect x="13" y="2" width="1" height="18" fill="currentColor" />
                <rect x="16" y="2" width="2" height="18" fill="currentColor" />
                <rect x="20" y="2" width="4" height="18" fill="currentColor" />
                <rect x="26" y="2" width="1" height="18" fill="currentColor" />
                <rect x="29" y="2" width="2" height="18" fill="currentColor" />
                <rect x="33" y="2" width="3" height="18" fill="currentColor" />
                <rect x="38" y="2" width="1" height="18" fill="currentColor" />
                <rect x="41" y="2" width="2" height="18" fill="currentColor" />
                <rect x="45" y="2" width="2" height="18" fill="currentColor" />
              </svg>
              <span
                class="text-[7px] text-slate-400 tracking-widest leading-none mt-0.5 font-semibold"
                >VERIFIED</span
              >
            </div>

            <div class="space-y-1">
              <strong
                class="font-bold text-slate-900 block text-[11px] uppercase"
                >Validasi Digital Sah</strong
              >
              <p class="text-[11px] text-slate-500 leading-tight">
                Dokumen ini diterbitkan secara elektronik oleh sistem Nexa
                Digital dan diakui sah tanpa tanda tangan basah.
              </p>
              <div
                class="text-[10px] text-slate-400 break-all pt-1 border-t border-slate-200 font-mono"
              >
                Auth Hash: SHA256-NXD-{currentOrder.id}-VERIFIED
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-500 leading-relaxed">
            <strong class="text-slate-700">Syarat Pembayaran:</strong>
            {#if currentOrder.paymentStatus === "PAID"}
              Pembayaran telah dilunasi penuh. Hak kekayaan intelektual (IPR) dialihkan sepenuhnya setelah serah terima selesai.
            {:else}
              Tagihan ini menunggu pembayaran sebelum tanggal jatuh tempo {currentOrder.deadline} melalui Midtrans Payment Gateway.
            {/if}
          </div>
        </div>

        <!-- Financial Calculations Table -->
        <div class="sm:col-span-5 space-y-2.5 text-xs font-normal">
          <div class="flex justify-between py-1 text-slate-500">
            <span>Subtotal Item:</span>
            <span class="font-semibold text-slate-900 font-mono"
              >{formatRupiah(currentOrder.price)}</span
            >
          </div>

          {#if currentOrder.discount > 0}
            <div class="flex justify-between py-1 text-emerald-600 font-semibold">
              <span>Potongan Diskon:</span>
              <span class="font-mono">- {formatRupiah(currentOrder.discount)}</span>
            </div>
          {/if}

          <div class="flex justify-between py-1 text-slate-500">
            <span>Pajak PPN (11%):</span>
            <span class="font-semibold text-slate-900 font-mono"
              >{formatRupiah(currentOrder.tax)}</span
            >
          </div>

          <div
            class="pt-4 border-t border-slate-200 flex justify-between items-baseline"
          >
            <div>
              <span
                class="text-xs uppercase font-bold text-slate-700 block"
                >TOTAL TAGIHAN:</span
              >
              <span class="text-[10px] text-slate-400 font-normal"
                >Termasuk faktur PPN 11%</span
              >
            </div>
            <div class="text-2xl font-bold text-slate-900 font-mono">
              {formatRupiah(currentOrder.total)}
            </div>
          </div>
        </div>
      </div>

      <!-- Official Stamp & Signatory -->
      <div
        class="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-slate-500 font-normal"
      >
        <div>
          <p>
            Terima kasih atas kepercayaan Anda bermitra dengan Nexa Digital.
          </p>
          <p>Bantuan teknis: {companyInfo.email} | {companyInfo.whatsapp}</p>
        </div>

        <div class="text-center sm:text-right space-y-2">
          <div class="font-bold text-slate-900">{companyInfo.legalName}</div>
          <div class="text-[10px] text-slate-400 uppercase font-medium">
            Divisi Operasional & Akuntansi
          </div>
          <div class="pt-1 flex items-center justify-end">
            <!-- Corporate Seal (Clean Rounded Badge) -->
            <div
              class="border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-center shrink-0 rounded-2xl shadow-2xs space-y-0.5"
            >
              <span
                class="text-[9px] uppercase font-bold text-slate-400 block tracking-widest"
                >OTORISASI DIGITAL</span
              >
              <span class="text-xs font-bold text-slate-900 block mt-0.5"
                >PT NEXA DIGITAL SOLUSINDO</span
              >
              <span class="text-[10px] font-semibold block {currentOrder.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}"
                >{currentOrder.paymentStatus === "PAID" ? "LUNAS / TERVERIFIKASI" : "MENUNGGU PEMBAYARAN"}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    {:else}
      <div class="rounded-3xl overflow-hidden shadow-sm">
        <InvoiceTemplateRenderer
          templateId={selectedTemplate}
          invoice={templateInvoiceData}
        />
      </div>
    {/if}

    <!-- Bottom Shortcut to Project Tracking -->
    <div class="no-print pt-4 flex justify-center">
      <button
        on:click={() =>
          navigateTo("project-tracker", { orderId: currentOrder.id })}
        class="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white text-xs uppercase font-semibold shadow-md shadow-orange-600/30 transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer rounded-2xl"
      >
        <Icon name="clock" size={16} />
        <span>Lacak Progres Proyek Ini Secara Real-time</span>
        <Icon name="arrow-right" size={14} />
      </button>
    </div>
  </div>
</div>