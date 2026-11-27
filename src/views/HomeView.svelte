<script>
  import { allServices, featuredPackages } from "../stores/servicesStore";
  import { portfolioProjects } from "../data/portfolio";
  import { clientTestimonials } from "../data/team";
  import {
    navigateTo,
    formatRupiah,
    customProjectQuote,
    showToast,
  } from "../stores/marketplaceStore";
  import Icon from "../components/Icon.svelte";
  import ServiceCard from "../lib/components/services/ServiceCard.svelte";
  import ProjectCard from "../lib/components/portfolio/ProjectCard.svelte";

  function openService(serviceId) {
    navigateTo("service-detail", { serviceId });
  }

  function openCaseStudy(project) {
    navigateTo("portfolio", { caseStudy: project });
  }

  function scrollToEstimator() {
    const el = document.getElementById("project-estimator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }

  // ==================== KALKULATOR ESTIMASI PROYEK ====================
  let calcServiceId = "ui-ux-design";
  let calcScale = "standard";
  let addonDesignSystem = false;
  let addonPayment = false;
  let addonCloud = false;
  let addonMaintenance = true;
  let addonFastTrack = false;

  const basePriceMatrix = {
    "ui-ux-design": {
      mvp: 750000,
      standard: 1500000,
      enterprise: 2500000,
      daysMvp: 3,
      daysStd: 5,
      daysEnt: 7,
    },
    "front-end-development": {
      mvp: 1500000,
      standard: 2750000,
      enterprise: 4500000,
      daysMvp: 5,
      daysStd: 8,
      daysEnt: 12,
    },
    "backend-development": {
      mvp: 2000000,
      standard: 3500000,
      enterprise: 6000000,
      daysMvp: 6,
      daysStd: 10,
      daysEnt: 15,
    },
    "mobile-app-development": {
      mvp: 3000000,
      standard: 5500000,
      enterprise: 9000000,
      daysMvp: 8,
      daysStd: 14,
      daysEnt: 21,
    },
    "digital-marketing": {
      mvp: 1200000,
      standard: 2200000,
      enterprise: 3800000,
      daysMvp: 4,
      daysStd: 7,
      daysEnt: 10,
    },
  };

  $: currentCalcService =
    $allServices.find((s) => s.id === calcServiceId) || $allServices[0];

  let calculatedPrice = 1850000;
  let calculatedDays = 5;

  $: {
    const matrix =
      basePriceMatrix[calcServiceId] || basePriceMatrix["ui-ux-design"];
    let base = matrix[calcScale] || matrix.standard;
    let days =
      calcScale === "mvp"
        ? matrix.daysMvp
        : calcScale === "enterprise"
          ? matrix.daysEnt
          : matrix.daysStd;

    let addonsCost = 0;
    if (addonDesignSystem) {
      addonsCost += 500000;
      days += 1;
    }
    if (addonPayment) {
      addonsCost += 750000;
      days += 2;
    }
    if (addonCloud) {
      addonsCost += 500000;
      days += 1;
    }
    if (addonMaintenance) {
      addonsCost += 350000;
    }

    let subtotal = base + addonsCost;
    if (addonFastTrack) {
      subtotal = Math.round(subtotal * 1.25);
      days = Math.max(2, Math.round(days * 0.65));
    }

    calculatedPrice = subtotal;
    calculatedDays = days;
  }

  function proceedWithCalculatedQuote() {
    const selectedAddonsList = [];
    if (addonDesignSystem) selectedAddonsList.push("Design System & Tokens");
    if (addonPayment) selectedAddonsList.push("Payment Gateway Integration");
    if (addonCloud) selectedAddonsList.push("Cloud Deploy & CI/CD");
    if (addonMaintenance) selectedAddonsList.push("SLA Pemeliharaan 30 Hari");
    if (addonFastTrack) selectedAddonsList.push("Prioritas Fast-Track (Kilat)");

    const scaleName =
      calcScale === "mvp"
        ? "Paket MVP / Sederhana"
        : calcScale === "enterprise"
          ? "Paket Enterprise Skala Penuh"
          : "Paket Standar Komersial";

    customProjectQuote.set({
      serviceId: calcServiceId,
      serviceName: currentCalcService.name,
      scale: calcScale,
      scaleName: scaleName,
      price: calculatedPrice,
      deliveryDays: calculatedDays,
      addons: selectedAddonsList,
      title: `Kustom ${currentCalcService.name} (${scaleName})`,
    });

    showToast(
      `Estimasi ${currentCalcService.name} berhasil diterapkan ke form checkout!`,
      "success",
    );
    navigateTo("checkout", {
      serviceId: calcServiceId,
      packageId:
        calcScale === "mvp"
          ? "basic"
          : calcScale === "enterprise"
            ? "premium"
            : "standard",
    });
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div
  class="bg-[#f4f4f5] text-[#09090b] selection:bg-[#ff5a00] selection:text-white font-['Plus_Jakarta_Sans',sans-serif] min-h-screen antialiased overflow-x-hidden animate-fade-in"
>
  <!-- ==================== HERO SECTION ==================== -->
  <section class="bg-[#f4f4f5] pt-16 pb-16 lg:pt-24 lg:pb-24 relative overflow-hidden">
    <!-- Background Glow Dekoratif -->
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-[#ff5a00]/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

    <div class="w-full px-6 sm:px-12 lg:px-20 space-y-10 relative z-10">
      <!-- Top Meta Badge -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ececee] text-[12px] font-medium text-[#71717a] animate-slide-down">
        <div class="flex items-center gap-2.5">
          <span class="px-2.5 py-1 bg-[#ff5a00] text-white rounded-[12px] text-[11px] font-semibold animate-bounce-subtle shadow-xs">
            YC BATCH CREDENTIAL
          </span>
          <span class="text-[#09090b] font-semibold">PT NEXA DIGITAL SOLUSINDO</span>
          <span>/</span>
          <span>SURABAYA & JAKARTA</span>
        </div>
        <div class="hidden sm:block text-[#52525b]">
          STATUS: <strong class="text-[#09090b]">PENERIMAAN Q4 AKTIF</strong>
        </div>
      </div>

      <div class="space-y-8 max-w-5xl animate-slide-up">
        <h1 class="text-4xl sm:text-6xl lg:text-[64px] font-semibold tracking-normal text-[#09090b] leading-[1.12]">
          Rekayasa produk digital & UI/UX dengan <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#09090b] via-[#3f3f46] to-[#ff5a00]">presisi tinggi.</span>
        </h1>

        <p class="text-[16px] sm:text-[18px] text-[#52525b] leading-[1.45] max-w-3xl font-normal">
          Kami membangun sistem perangkat lunak, arsitektur aplikasi mobile, dan desain antarmuka komersial. Setiap proyek dikawal kontrak PKS resmi, faktur PPN, dan kepemilikan source code mutlak.
        </p>

        <!-- Action Triggers -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
          <button
            type="button"
            onclick={() => navigateTo("services")}
            class="px-6 py-3.5 bg-[#09090b] hover:bg-[#18181b] text-white font-normal text-[14px] rounded-[14px] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg inline-flex items-center justify-center gap-2 cursor-pointer border border-[#2c2e34]"
          >
            <span>Lihat Katalog Spesifikasi</span>
            <span class="transition-transform duration-300 hover:translate-x-1">
              <Icon name="arrow-right" size={16} />
            </span>
          </button>
          <button
            type="button"
            onclick={scrollToEstimator}
            class="px-6 py-3.5 bg-[#ffffff] hover:bg-[#fafafa] text-[#18181b] font-normal text-[14px] border border-[#ececee] rounded-[14px] transition-all duration-300 hover:scale-[1.02] hover:border-[#a1a1aa] inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Icon name="sliders" size={16} className="text-[#71717a]" />
            <span>Simulasi Budget Proyek</span>
          </button>
        </div>

        <!-- Solid Assurances Grid -->
        <div class="pt-6 border-t border-[#ececee] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px]">
          <div class="bg-white border border-[#ececee] p-4 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
            <span class="text-[#71717a] block uppercase text-[11px]">Entitas</span>
            <strong class="text-[#09090b] text-[14px] block font-semibold mt-1">PT Terdaftar</strong>
          </div>
          <div class="bg-white border border-[#ececee] p-4 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
            <span class="text-[#71717a] block uppercase text-[11px]">Pajak</span>
            <strong class="text-[#09090b] text-[14px] block font-semibold mt-1">e-Faktur PPN</strong>
          </div>
          <div class="bg-white border border-[#ececee] p-4 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
            <span class="text-[#71717a] block uppercase text-[11px]">Legalitas</span>
            <strong class="text-[#09090b] text-[14px] block font-semibold mt-1">NDA Standar</strong>
          </div>
          <div class="bg-white border border-[#ececee] p-4 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
            <span class="text-[#71717a] block uppercase text-[11px]">Garansi</span>
            <strong class="text-[#09090b] text-[14px] block font-semibold mt-1">30 Hari SLA</strong>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== ANIMATED CLIENT TICKER STRIP ==================== -->
  <section class="py-5 bg-white border-y border-[#ececee] overflow-hidden select-none shadow-xs">
    <div class="flex items-center w-full">
      <div class="shrink-0 px-6 sm:px-12 z-20 bg-white border-r border-[#ececee] flex items-center gap-2.5">
        <span class="w-1.5 h-1.5 bg-[#ff5a00] rounded-full animate-ping"></span>
        <span class="text-[11px] uppercase tracking-widest text-[#71717a] font-bold whitespace-nowrap">
          DIKEPERCAYA OLEH:
        </span>
      </div>

      <div class="marquee-wrapper flex-1 overflow-hidden relative">
        <div class="marquee-group flex items-center gap-12 text-[14px] font-bold text-[#71717a] tracking-tight whitespace-nowrap pr-12">
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">FRESHMART ID</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">CAREPAL HEALTH</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">PAYINDO FINTECH</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">YAYASAN BILYATIMI</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">BINA CENDEKIA</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">KOPISAKU</span>
          <span class="text-[#ececee]">/</span>
        </div>
        <!-- Duplikat untuk animasi looping tanpa jeda -->
        <div class="marquee-group flex items-center gap-12 text-[14px] font-bold text-[#71717a] tracking-tight whitespace-nowrap pr-12" aria-hidden="true">
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">FRESHMART ID</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">CAREPAL HEALTH</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">PAYINDO FINTECH</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">YAYASAN BILYATIMI</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">BINA CENDEKIA</span>
          <span class="text-[#ececee]">/</span>
          <span class="hover:text-[#ff5a00] transition-colors cursor-pointer">KOPISAKU</span>
          <span class="text-[#ececee]">/</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== CORE SERVICES SECTION ==================== -->
  <section class="py-16 w-full px-6 sm:px-12 lg:px-20">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#ececee] pb-6">
      <div>
        <span class="text-[12px] uppercase tracking-widest text-[#ff5a00] font-semibold">
          [ 01 / SPESIALISASI ]
        </span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090b] mt-2">
          Katalog Layanan Digital
        </h2>
      </div>
      <p class="text-[14px] text-[#52525b] max-w-md leading-relaxed">
        Spesifikasi teknis terperinci dengan batasan ruang lingkup yang disepakati secara transparan sejak hari pertama.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each $allServices as service}
        <div class="bg-white border border-[#ececee] p-4 rounded-[36px] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#ff5a00]/50 group">
          <ServiceCard {service} onSelect={openService} />
        </div>
      {/each}
    </div>
  </section>

  <!-- ==================== INTERACTIVE CALCULATOR ==================== -->
  <section id="project-estimator" class="py-16 bg-white border-y border-[#ececee]">
    <div class="w-full px-6 sm:px-12 lg:px-20">
      <div class="border-b border-[#ececee] pb-6 mb-10">
        <span class="text-[12px] uppercase tracking-widest text-[#ff5a00] font-semibold">
          [ 02 / SIMULATOR INVESTASI ]
        </span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090b] mt-2">
          Hitung Kebutuhan & Durasi Kerja
        </h2>
        <p class="text-[14px] text-[#52525b] mt-2">
          Sesuaikan komponen modul proyek Anda untuk melihat estimasi biaya dasar serta timeline pengerjaan.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Controls Column -->
        <div class="lg:col-span-7 bg-[#fafafa] border border-[#ececee] p-6 sm:p-8 rounded-[36px] space-y-8 shadow-sm">
          <!-- Step 1: Select Service -->
          <div class="space-y-3">
            <span class="text-[12px] uppercase font-semibold text-[#09090b] block">
              1. Pilih Bidang Layanan:
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {#each $allServices as s}
                <button
                  type="button"
                  onclick={() => (calcServiceId = s.id)}
                  class="p-3.5 text-left border text-[13px] rounded-[16px] transition-all duration-200 cursor-pointer {calcServiceId === s.id
                    ? 'border-[#09090b] bg-[#09090b] text-white font-medium shadow-md scale-[1.02]'
                    : 'border-[#ececee] bg-white hover:border-[#ff5a00]/50 hover:bg-[#fafafa] text-[#18181b]'}"
                >
                  <div class="truncate font-medium">{s.name}</div>
                  <div class="text-[11px] mt-1 opacity-80">{formatRupiah(s.startingPrice)}</div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Step 2: Select Project Scale -->
          <div class="space-y-3 pt-6 border-t border-[#ececee]">
            <span class="text-[12px] uppercase font-semibold text-[#09090b] block">
              2. Skala & Kesiapan Rilis:
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onclick={() => (calcScale = "mvp")}
                class="p-4 border text-left rounded-[16px] transition-all duration-200 cursor-pointer {calcScale === 'mvp'
                  ? 'border-[#09090b] bg-[#09090b] text-white shadow-md'
                  : 'border-[#ececee] bg-white hover:border-[#ff5a00]/50 text-[#18181b]'}"
              >
                <div class="text-[12px] font-semibold uppercase">Paket MVP</div>
                <p class="text-[11px] text-[#71717a] mt-1 leading-snug">Validasi konsep & alur inti.</p>
              </button>

              <button
                type="button"
                onclick={() => (calcScale = "standard")}
                class="p-4 border text-left rounded-[16px] transition-all duration-200 cursor-pointer {calcScale === 'standard'
                  ? 'border-[#09090b] bg-[#09090b] text-white shadow-md'
                  : 'border-[#ececee] bg-white hover:border-[#ff5a00]/50 text-[#18181b]'}"
              >
                <div class="text-[12px] font-semibold uppercase text-[#ff5a00]">Standar Pasar</div>
                <p class="text-[11px] text-[#71717a] mt-1 leading-snug">Fitur komersial siap rilis.</p>
              </button>

              <button
                type="button"
                onclick={() => (calcScale = "enterprise")}
                class="p-4 border text-left rounded-[16px] transition-all duration-200 cursor-pointer {calcScale === 'enterprise'
                  ? 'border-[#09090b] bg-[#09090b] text-white shadow-md'
                  : 'border-[#ececee] bg-white hover:border-[#ff5a00]/50 text-[#18181b]'}"
              >
                <div class="text-[12px] font-semibold uppercase">Enterprise</div>
                <p class="text-[11px] text-[#71717a] mt-1 leading-snug">Sistem modular kompleks.</p>
              </button>
            </div>
          </div>

          <!-- Step 3: Addons -->
          <div class="space-y-3 pt-6 border-t border-[#ececee]">
            <span class="text-[12px] uppercase font-semibold text-[#09090b] block">
              3. Opsi Tambahan (Add-ons):
            </span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <label class="flex items-start gap-3 p-3.5 border border-[#ececee] bg-white hover:border-[#ff5a00]/40 rounded-[16px] cursor-pointer transition-all duration-200">
                <input type="checkbox" bind:checked={addonDesignSystem} class="mt-0.5 accent-[#ff5a00] cursor-pointer" />
                <div>
                  <strong class="text-[#09090b] font-semibold block text-[13px]">Design System & Token</strong>
                  <span class="text-[11px] text-[#52525b]">+Rp 500.000 (+1 Hari)</span>
                </div>
              </label>

              <label class="flex items-start gap-3 p-3.5 border border-[#ececee] bg-white hover:border-[#ff5a00]/40 rounded-[16px] cursor-pointer transition-all duration-200">
                <input type="checkbox" bind:checked={addonPayment} class="mt-0.5 accent-[#ff5a00] cursor-pointer" />
                <div>
                  <strong class="text-[#09090b] font-semibold block text-[13px]">Payment Gateway</strong>
                  <span class="text-[11px] text-[#52525b]">+Rp 750.000 (Midtrans/Xendit)</span>
                </div>
              </label>

              <label class="flex items-start gap-3 p-3.5 border border-[#ececee] bg-white hover:border-[#ff5a00]/40 rounded-[16px] cursor-pointer transition-all duration-200">
                <input type="checkbox" bind:checked={addonCloud} class="mt-0.5 accent-[#ff5a00] cursor-pointer" />
                <div>
                  <strong class="text-[#09090b] font-semibold block text-[13px]">Cloud CI/CD Deploy</strong>
                  <span class="text-[11px] text-[#52525b]">+Rp 500.000 (AWS/Vercel)</span>
                </div>
              </label>

              <label class="flex items-start gap-3 p-3.5 border border-[#ececee] bg-white hover:border-[#ff5a00]/40 rounded-[16px] cursor-pointer transition-all duration-200">
                <input type="checkbox" bind:checked={addonMaintenance} class="mt-0.5 accent-[#ff5a00] cursor-pointer" />
                <div>
                  <strong class="text-[#09090b] font-semibold block text-[13px]">SLA Maintenance 30 Hari</strong>
                  <span class="text-[11px] text-[#52525b]">+Rp 350.000 (Garansi Bug)</span>
                </div>
              </label>
            </div>

            <!-- Fast Track Option -->
            <label class="flex items-center gap-3 p-4 border border-[#ececee] bg-white hover:border-[#ff5a00]/40 rounded-[16px] cursor-pointer text-[13px] mt-3 transition-all duration-200">
              <input type="checkbox" bind:checked={addonFastTrack} class="accent-[#ff5a00] cursor-pointer" />
              <div>
                <strong class="text-[#09090b] uppercase block font-semibold text-[13px]">Prioritas Fast-Track (Pengerjaan 35% Lebih Cepat)</strong>
                <span class="text-[#52525b] text-[11px]">+25% penyesuaian alokasi resource tim inti secara terfokus.</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Output Column -->
        <div class="lg:col-span-5 bg-white border border-[#ececee] p-6 sm:p-8 rounded-[36px] space-y-6 sticky top-24 shadow-md transition-all duration-300 hover:shadow-xl">
          <div class="border-b border-[#ececee] pb-4 space-y-1">
            <span class="text-[11px] uppercase text-[#ff5a00] font-semibold tracking-wider">
              DRAF ESTIMASI
            </span>
            <div class="text-xl font-semibold text-[#09090b]">
              {currentCalcService.name}
            </div>
            <div class="text-[12px] text-[#52525b]">
              Skala: {calcScale.toUpperCase()}
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <span class="text-[11px] uppercase text-[#71717a] font-semibold block">Proyeksi Investasi Total:</span>
              <div class="text-3xl font-semibold tracking-tight text-[#09090b] mt-1 animate-pulse">
                {formatRupiah(calculatedPrice)}
              </div>
              <span class="text-[11px] text-[#71717a] mt-0.5 block">Belum termasuk PPN e-Faktur resmi</span>
            </div>

            <div class="pt-3 border-t border-[#ececee] flex items-center justify-between text-[13px]">
              <span class="text-[#52525b] font-medium">ALOKASI WAKTU:</span>
              <span class="bg-[#09090b] text-white font-bold px-3 py-1 rounded-[12px] text-[12px]">
                {calculatedDays} Hari Kerja
              </span>
            </div>
          </div>

          <div class="pt-4 border-t border-[#ececee] space-y-2 text-[13px] text-[#52525b]">
            <span class="font-semibold uppercase text-[#09090b] text-[11px] block">Cakupan Pokok:</span>
            <ul class="space-y-1 text-[12px] text-[#52525b]">
              <li>✓ Repository Git & Master Figma Lengkap</li>
              <li>✓ Sesi review iterasi terjadwal</li>
              <li>✓ Dokumentasi handoff resmi</li>
            </ul>
          </div>

          <button
            type="button"
            onclick={proceedWithCalculatedQuote}
            class="w-full py-3.5 bg-[#09090b] hover:bg-[#ff5a00] text-white text-[13px] uppercase font-medium transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 rounded-[14px] shadow-md"
          >
            <span>Terapkan ke Checkout</span>
            <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== FEATURED BUNDLED PACKAGES ==================== -->
  <section class="py-16 w-full px-6 sm:px-12 lg:px-20">
    <div class="border-b border-[#ececee] pb-6 mb-10">
      <span class="text-[12px] uppercase tracking-widest text-[#ff5a00] font-semibold">
        [ 03 / PAKET KOMBINASI ]
      </span>
      <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090b] mt-2">
        Bundling Layanan Terintegrasi
      </h2>
      <p class="text-[14px] text-[#52525b] mt-2">
        Kombinasi desain dan rekayasa kode siap rilis dengan efisiensi biaya optimal.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each featuredPackages as pkg}
        <div class="bg-white border border-[#ececee] p-6 rounded-[36px] flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#ff5a00]/50 group">
          <div class="space-y-4">
            <div class="flex items-center justify-between text-[12px]">
              <span class="bg-[#fafafa] border border-[#ececee] px-2.5 py-1 font-medium text-[#18181b] rounded-[12px]">
                {pkg.combo}
              </span>
              {#if pkg.popular}
                <span class="bg-[#ff5a00] text-white font-semibold px-2.5 py-1 rounded-[12px] text-[10px] animate-pulse">
                  REKOMENDASI
                </span>
              {/if}
            </div>

            <div>
              <h3 class="text-xl font-semibold text-[#09090b]">{pkg.name}</h3>
              <p class="text-[13px] text-[#52525b] mt-1 leading-relaxed">{pkg.description}</p>
            </div>

            <div class="pt-2">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-semibold text-[#09090b]">{formatRupiah(pkg.price)}</span>
                <span class="text-[13px] text-[#a1a1aa] line-through">{formatRupiah(pkg.originalPrice)}</span>
              </div>
              <span class="text-[11px] text-[#ff5a00] font-semibold block mt-1">{pkg.discountBadge}</span>
            </div>

            <ul class="pt-4 border-t border-[#ececee] space-y-2 text-[13px] text-[#52525b]">
              {#each pkg.includedServices as feat}
                <li class="flex items-center gap-2">
                  <span class="text-[#ff5a00] font-bold">▪</span>
                  <span>{feat}</span>
                </li>
              {/each}
            </ul>
          </div>

          <div class="pt-4">
            <button
              type="button"
              onclick={() => navigateTo("checkout")}
              class="w-full py-3 bg-[#09090b] hover:bg-[#ff5a00] text-white text-[13px] uppercase font-medium transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-[14px]"
            >
              Pilih Paket Bundle
            </button>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- ==================== 4 PILLARS GUARANTEE ==================== -->
  <section class="py-16 bg-white border-y border-[#ececee]">
    <div class="w-full px-6 sm:px-12 lg:px-20">
      <div class="border-b border-[#ececee] pb-6 mb-10">
        <span class="text-[12px] uppercase tracking-widest text-[#ff5a00] font-semibold">
          [ 04 / STANDAR KONTRAK ]
        </span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090b] mt-2">
          Jaminan Mutu & Hukum Nexa Digital
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-[#fafafa] border border-[#ececee] p-6 rounded-[36px] space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#ff5a00]/40">
          <div class="text-[11px] font-semibold text-[#ff5a00] mb-2">[ STANDAR 01 ]</div>
          <h3 class="font-semibold text-[15px] text-[#09090b]">Ruang Lingkup Terkunci</h3>
          <p class="text-[13px] text-[#52525b] leading-relaxed">Deliverables dan batas revisi dituangkan dalam lampiran perjanjian kerja sama resmi.</p>
        </div>

        <div class="bg-[#fafafa] border border-[#ececee] p-6 rounded-[36px] space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#ff5a00]/40">
          <div class="text-[11px] font-semibold text-[#ff5a00] mb-2">[ STANDAR 02 ]</div>
          <h3 class="font-semibold text-[15px] text-[#09090b]">Faktur Pajak Elektronik</h3>
          <p class="text-[13px] text-[#52525b] leading-relaxed">Diterbitkan langsung oleh PT Nexa Digital Solusindo dengan faktur PPN sah.</p>
        </div>

        <div class="bg-[#fafafa] border border-[#ececee] p-6 rounded-[36px] space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#ff5a00]/40">
          <div class="text-[11px] font-semibold text-[#ff5a00] mb-2">[ STANDAR 03 ]</div>
          <h3 class="font-semibold text-[15px] text-[#09090b]">100% Hak Intelektual</h3>
          <p class="text-[13px] text-[#52525b] leading-relaxed">Seluruh hak cipta source code dan master Figma dipindahtangankan sepenuhnya.</p>
        </div>

        <div class="bg-[#fafafa] border border-[#ececee] p-6 rounded-[36px] space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#ff5a00]/40">
          <div class="text-[11px] font-semibold text-[#ff5a00] mb-2">[ STANDAR 04 ]</div>
          <h3 class="font-semibold text-[15px] text-[#09090b]">Garansi SLA Purna-Jual</h3>
          <p class="text-[13px] text-[#52525b] leading-relaxed">Dukungan perbaikan bug dan pendampingan implementasi selama 30 hari.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== SELECTED CASE STUDIES ==================== -->
  <section class="py-16 w-full px-6 sm:px-12 lg:px-20">
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-[#ececee] pb-6">
      <div>
        <span class="text-[12px] uppercase tracking-widest text-[#ff5a00] font-semibold">
          [ 05 / ARSIP KERJA ]
        </span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090b] mt-2">
          Studi Kasus Nyata
        </h2>
      </div>
      <button
        type="button"
        onclick={() => navigateTo("portfolio")}
        class="text-[13px] uppercase font-semibold text-[#09090b] hover:text-[#ff5a00] inline-flex items-center gap-2 cursor-pointer transition-colors duration-200 group"
      >
        <span>Buka Semua Portofolio</span>
        <span class="transition-transform duration-300 group-hover:translate-x-1">
          <Icon name="arrow-right" size={14} />
        </span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each portfolioProjects.slice(0, 3) as proj}
        <div class="bg-white border border-[#ececee] p-3 rounded-[36px] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#ff5a00]/40">
          <ProjectCard project={proj} onViewCaseStudy={openCaseStudy} />
        </div>
      {/each}
    </div>
  </section>

  <!-- ==================== TESTIMONIALS ==================== -->
  <section class="py-16 bg-white border-y border-[#ececee]">
    <div class="w-full px-6 sm:px-12 lg:px-20">
      <div class="border-b border-[#ececee] pb-6 mb-10">
        <span class="text-[12px] uppercase tracking-widest text-[#ff5a00] font-semibold">
          [ 06 / ULASAN KLIEN ]
        </span>
        <h2 class="text-3xl font-semibold tracking-tight text-[#09090b] mt-2">
          Catatan Pengalaman Kolaborasi
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each clientTestimonials as t}
          <div class="bg-[#fafafa] border border-[#ececee] p-6 rounded-[36px] flex flex-col justify-between space-y-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#ff5a00]/40">
            <div class="space-y-3">
              <div class="flex items-center gap-1 text-[#ff5a00]">
                {#each Array(t.rating) as _}
                  <Icon name="star" size={14} />
                {/each}
              </div>
              <p class="text-[13px] text-[#52525b] leading-relaxed">
                "{t.quote}"
              </p>
            </div>

            <div class="flex items-center gap-3 pt-4 border-t border-[#ececee]">
              <img src={t.avatar} alt={t.name} class="w-10 h-10 object-cover rounded-[14px] border border-[#ececee]" />
              <div>
                <div class="text-[13px] font-semibold text-[#09090b]">{t.name}</div>
                <div class="text-[11px] text-[#71717a]">{t.role}, {t.company}</div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ==================== FINAL CALL TO ACTION (DARK SURFACE #18181b) ==================== -->
  <section class="py-16 w-full px-6 sm:px-12 lg:px-20">
    <div class="bg-[#18181b] text-white border border-[#27272a] p-8 sm:p-14 rounded-[36px] relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
      <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff5a00]/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div class="max-w-3xl space-y-4 relative z-10">
        <span class="text-[12px] text-[#ff5a00] uppercase tracking-widest font-semibold">
          MULAI PROYEK BARU
        </span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Siap mewujudkan sistem digital Anda?
        </h2>
        <p class="text-[14px] text-[#a1a1aa] leading-relaxed">
          Konsultasikan kebutuhan Anda bersama tim teknis Nexa Digital. Kami akan menyusun matriks ruang lingkup pengerjaan yang konkret tanpa komitmen awal.
        </p>

        <div class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
          <button
            type="button"
            onclick={() => navigateTo("checkout")}
            class="px-6 py-3.5 bg-white text-[#09090b] hover:bg-[#ff5a00] hover:text-white text-[13px] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-[14px] shadow-md"
          >
            Mulai Order Proyek
          </button>
          <button
            type="button"
            onclick={() => navigateTo("contact")}
            class="px-6 py-3.5 bg-transparent hover:bg-white/10 text-white text-[13px] uppercase font-semibold border border-[#3f3f46] transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-[14px]"
          >
            Jadwalkan Diskusi Brief
          </button>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  /* Keyframe Animasi Halus & Menarik Mata */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes bounceSubtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .animate-slide-up {
    animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .animate-slide-down {
    animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .animate-bounce-subtle {
    animation: bounceSubtle 3s ease-in-out infinite;
  }

  /* Animasi Ticker Berjalan */
  .marquee-wrapper {
    display: flex;
    overflow: hidden;
    user-select: none;
    mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 3%,
      black 97%,
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0%,
      black 3%,
      black 97%,
      transparent 100%
    );
  }

  .marquee-group {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-around;
    min-width: 100%;
    animation: scroll-left 25s linear infinite;
  }

  .marquee-wrapper:hover .marquee-group {
    animation-play-state: paused;
  }

  @keyframes scroll-left {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }
</style>