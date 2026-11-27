<script>
  import { onMount } from "svelte";
  import { allServices } from "../stores/servicesStore";
  import {
    selectedServiceId,
    navigateTo,
    formatRupiah,
  } from "../stores/marketplaceStore";
  import Icon from "../components/Icon.svelte";
  import PricingCard from "../lib/components/services/PricingCard.svelte";

  $: currentService =
    $allServices.find((s) => s.id === $selectedServiceId) || $allServices[0] || {};
  $: otherServices = $allServices.filter((s) => s.id !== currentService?.id);

  let openFaq = null;

  function toggleFaq(index) {
    openFaq = openFaq === index ? null : index;
  }

  function orderPackage(pkg) {
    const packageId = typeof pkg === "object" && pkg !== null ? pkg.id : pkg;
    navigateTo("checkout", {
      serviceId: currentService.id,
      packageId: packageId,
    });
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<!-- Menggunakan padding w-full px-6 sm:px-12 lg:px-20 agar sejajar presisi dengan Navbar & Footer -->
<div
  class="min-h-screen bg-[#f4f4f5] text-[#09090b] selection:bg-[#ff5a00] selection:text-white font-['Plus_Jakarta_Sans',sans-serif] py-10 px-6 sm:px-12 lg:px-20 pb-24 antialiased overflow-x-hidden"
>
  <div class="w-full space-y-16">
    <!-- Breadcrumb & Header Hero -->
    <div class="space-y-6">
      <div
        class="flex items-center gap-2 text-[12px] uppercase tracking-widest text-[#71717a] font-semibold"
      >
        <button
          type="button"
          on:click={() => navigateTo("home")}
          class="hover:text-[#09090b] transition cursor-pointer">BERANDA</button
        >
        <span>/</span>
        <button
          type="button"
          on:click={() => navigateTo("services")}
          class="hover:text-[#09090b] transition cursor-pointer"
          >KATALOG LAYANAN</button
        >
        <span>/</span>
        <span class="text-[#ff5a00] font-bold">[{currentService.name}]</span>
      </div>

      <!-- Hero Console -->
      <div
        class="bg-white border border-[#ececee] p-8 sm:p-12 rounded-[36px] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 reveal-on-scroll"
      >
        <div class="space-y-5 max-w-4xl">
          <div
            class="inline-flex items-center gap-2 px-3 py-1 bg-[#ff5a00]/10 text-[#ff5a00] border border-[#ff5a00]/20 text-[11px] font-semibold uppercase tracking-widest rounded-[12px]"
          >
            <span class="w-1.5 h-1.5 bg-[#ff5a00] rounded-full"></span>
            SPESIFIKASI: {currentService.category}
          </div>
          <h1
            class="text-3xl sm:text-5xl font-semibold text-[#09090b] tracking-tight leading-[1.12]"
          >
            {currentService.name}
          </h1>
          <p
            class="text-[14px] sm:text-[16px] text-[#52525b] leading-relaxed font-normal"
          >
            {currentService.description}
          </p>

          <div
            class="flex flex-wrap items-center gap-6 pt-2 text-[12px] text-[#52525b] font-medium"
          >
            <div class="flex items-center gap-2">
              <Icon name="clock" size={15} className="text-[#ff5a00]" />
              <span
                >ESTIMASI: <strong class="text-[#09090b] font-semibold"
                  >{currentService.estimatedDelivery}</strong
                ></span
              >
            </div>
            <div class="flex items-center gap-2">
              <Icon name="shield" size={15} className="text-[#09090b]" />
              <span>GARANSI BUG SLA 30 HARI</span>
            </div>
            <div class="flex items-center gap-2">
              <Icon name="file-text" size={15} className="text-[#09090b]" />
              <span>E-FAKTUR PPN 11% RESMI</span>
            </div>
          </div>
        </div>

        <!-- Quick CTA card -->
        <div
          class="w-full lg:w-80 shrink-0 bg-[#fafafa] border border-[#ececee] p-6 text-center space-y-4 rounded-[28px] shadow-xs"
        >
          <div>
            <span
              class="text-[11px] text-[#71717a] uppercase tracking-wider font-semibold block"
              >[ TARIF DASAR ]</span
            >
            <div class="text-3xl font-semibold text-[#09090b] mt-1">
              {formatRupiah(currentService.startingPrice)}
            </div>
            <span class="text-[12px] text-[#71717a] block mt-0.5 font-normal"
              >Penetapan sesuai skala paket</span
            >
          </div>

          <button
            type="button"
            on:click={() => {
              const standardPkg =
                currentService.packages?.find((p) => p.id === "standard") ||
                currentService.packages?.[0];
              orderPackage(standardPkg);
            }}
            class="w-full py-3.5 px-4 bg-[#09090b] hover:bg-[#ff5a00] text-white font-medium text-[13px] uppercase transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-[14px]"
          >
            <span>Pesan Modul Ini</span>
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
    </div>

    <!-- WHAT YOU GET & DELIVERABLES -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch reveal-on-scroll">
      <!-- What you get -->
      <div
        class="bg-white border border-[#ececee] p-8 sm:p-10 space-y-5 rounded-[36px] shadow-xs"
      >
        <div class="flex items-center gap-3.5 border-b border-[#ececee] pb-4">
          <div
            class="w-10 h-10 bg-[#ff5a00]/10 text-[#ff5a00] border border-[#ff5a00]/20 flex items-center justify-center rounded-[14px]"
          >
            <Icon name="sparkles" size={18} />
          </div>
          <div>
            <span
              class="text-[11px] text-[#ff5a00] font-semibold uppercase tracking-wider block"
              >[ BATASAN MUTU ]</span
            >
            <h2 class="text-xl font-semibold text-[#09090b]">Yang Anda Dapatkan</h2>
          </div>
        </div>
        <p class="text-[13px] text-[#52525b] leading-relaxed font-normal">
          Standar rekayasa Nexa Digital mencakup artefak lengkap terukur sehingga produk Anda langsung siap diuji pengguna maupun diintegrasikan ke codebase internal.
        </p>

        <ul class="space-y-3 pt-2 text-[13px] text-[#09090b] font-normal">
          {#each (currentService.deliverables || []) as item}
            <li class="flex items-start gap-3">
              <span class="text-[#ff5a00] font-bold shrink-0 mt-0.5">▪</span>
              <span class="leading-relaxed">{item}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Deliverables Formats -->
      <div
        class="bg-white border border-[#ececee] p-8 sm:p-10 space-y-6 flex flex-col justify-between rounded-[36px] shadow-xs"
      >
        <div class="space-y-4">
          <div class="flex items-center gap-3.5 border-b border-[#ececee] pb-4">
            <div
              class="w-10 h-10 bg-[#ff5a00]/10 text-[#ff5a00] border border-[#ff5a00]/20 flex items-center justify-center rounded-[14px]"
            >
              <Icon name="layers" size={18} />
            </div>
            <div>
              <span
                class="text-[11px] text-[#ff5a00] font-semibold uppercase tracking-wider block"
                >[ FORMAT SERAH TERIMA ]</span
              >
              <h2 class="text-xl font-semibold text-[#09090b]">
                Spesifikasi Deliverables
              </h2>
            </div>
          </div>
          <p class="text-[13px] text-[#52525b] leading-relaxed font-normal">
            Seluruh berkas produksi diserahkan melalui repository terenkripsi dan cloud storage resmi dengan pengalihan kepemilikan mutlak kepada Anda.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[13px]">
            <div class="bg-[#fafafa] p-4 border border-[#ececee] space-y-1 rounded-[20px]">
              <div class="font-semibold text-[#09090b]">Master Source File</div>
              <div class="text-[12px] text-[#52525b] font-normal">
                Figma / Git Repo dengan arsitektur folder terstruktur rapi.
              </div>
            </div>
            <div class="bg-[#fafafa] p-4 border border-[#ececee] space-y-1 rounded-[20px]">
              <div class="font-semibold text-[#09090b]">Interactive Preview</div>
              <div class="text-[12px] text-[#52525b] font-normal">
                High-fidelity prototype atau staging environment terverifikasi.
              </div>
            </div>
            <div class="bg-[#fafafa] p-4 border border-[#ececee] space-y-1 rounded-[20px]">
              <div class="font-semibold text-[#09090b]">Export Siap Pakai</div>
              <div class="text-[12px] text-[#52525b] font-normal">
                Aset SVG, WebP, PNG @2x @3x, dan icon token terkompresi.
              </div>
            </div>
            <div class="bg-[#fafafa] p-4 border border-[#ececee] space-y-1 rounded-[20px]">
              <div class="font-semibold text-[#09090b]">Dokumen Handoff</div>
              <div class="text-[12px] text-[#52525b] font-normal">
                Panduan teknis dan API contract untuk memudahkan integrasi developer.
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-4 bg-[#fafafa] border border-[#ececee] rounded-[20px] text-[13px] text-[#09090b] flex items-center gap-3 font-medium"
        >
          <Icon name="check" size={16} className="text-emerald-500 shrink-0" />
          <span
            >Hak cipta intelektual (IPR) dialihkan 100% setelah pelunasan transaksi.</span
          >
        </div>
      </div>
    </div>

    <!-- PROCESS TIMELINE (7 STEPS) -->
    <div
      class="bg-white border border-[#ececee] p-8 sm:p-12 space-y-8 rounded-[36px] shadow-xs reveal-on-scroll"
    >
      <div
        class="border-b border-[#ececee] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3"
      >
        <div class="space-y-1">
          <span
            class="text-[11px] font-semibold text-[#ff5a00] uppercase tracking-wider block"
            >[ PROTOKOL EKSEKUSI ]</span
          >
          <h2
            class="text-2xl sm:text-3xl font-semibold text-[#09090b] tracking-tight"
          >
            Alur Pengerjaan 7 Tahapan Terstruktur
          </h2>
        </div>
        <p class="text-[13px] text-[#52525b] max-w-sm font-normal">
          Setiap tahapan divalidasi bersama sebelum melangkah ke sprint berikutnya.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each (currentService.process || []) as p, idx}
          <div
            class="p-5 border border-[#ececee] bg-[#fafafa] space-y-2 rounded-[24px] {idx ===
            (currentService.process?.length || 0) - 1
              ? 'lg:col-span-2'
              : ''}"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-[11px] font-semibold px-3 py-1 bg-[#09090b] text-white rounded-[10px]"
              >
                TAHAP 0{p.step}
              </span>
            </div>
            <h3 class="text-[15px] font-semibold text-[#09090b] pt-1">
              {p.title}
            </h3>
            <p class="text-[13px] text-[#52525b] leading-relaxed font-normal">
              {p.desc}
            </p>
          </div>
        {/each}
      </div>
    </div>

    <!-- PRICING PACKAGES (BASIC, STANDARD, PREMIUM) -->
    <div class="space-y-8 reveal-on-scroll" id="packages-section">
      <div class="text-center max-w-2xl mx-auto space-y-2">
        <span
          class="text-[11px] font-semibold text-[#ff5a00] uppercase tracking-wider block"
          >[ SKALA INVESTASI ]</span
        >
        <h2 class="text-3xl font-semibold text-[#09090b] tracking-tight">
          Pilihan Paket & Transparansi Biaya
        </h2>
        <p class="text-[14px] text-[#52525b] font-normal">
          Pilih tingkatan paket yang sesuai dengan volume kebutuhan produk Anda. Seluruh paket mencakup kontrak PKS dan e-Faktur resmi.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {#each (currentService.packages || []) as pkg}
          <div
            class="bg-white border border-[#ececee] p-4 rounded-[36px] shadow-xs transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#ff5a00]/40"
          >
            <PricingCard {pkg} onSelect={orderPackage} />
          </div>
        {/each}
      </div>
    </div>

    <!-- FAQ SECTION -->
    {#if currentService.faqs && currentService.faqs.length > 0}
      <div class="max-w-4xl mx-auto space-y-6 reveal-on-scroll">
        <div class="text-center space-y-1 border-b border-[#ececee] pb-5">
          <span
            class="text-[11px] font-semibold text-[#ff5a00] uppercase tracking-wider block"
            >[ FAQ TEKNIS ]</span
          >
          <h2 class="text-2xl sm:text-3xl font-semibold text-[#09090b]">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p class="text-[13px] text-[#52525b] font-normal">
            Informasi seputar ruang lingkup, durasi, dan garansi layanan {currentService.name}
          </p>
        </div>

        <div class="space-y-3">
          {#each currentService.faqs as faq, idx}
            <div
              class="border border-[#ececee] bg-white rounded-[20px] overflow-hidden shadow-xs"
            >
              <button
                type="button"
                on:click={() => toggleFaq(idx)}
                class="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-[14px] text-[#09090b] hover:bg-[#fafafa] transition cursor-pointer"
              >
                <span>{faq.q}</span>
                <Icon
                  name="chevron-down"
                  size={16}
                  className="text-[#71717a] transition-transform {openFaq ===
                  idx
                    ? 'rotate-180'
                    : ''}"
                />
              </button>
              {#if openFaq === idx}
                <div
                  class="px-5 pb-5 pt-1 text-[13px] text-[#52525b] leading-relaxed border-t border-[#ececee] bg-[#fafafa] font-normal"
                >
                  {faq.a}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- CUSTOMER REVIEWS -->
    {#if currentService.reviews && currentService.reviews.length > 0}
      <div class="w-full space-y-6 reveal-on-scroll">
        <div class="text-center space-y-1 border-b border-[#ececee] pb-5">
          <span
            class="text-[11px] font-semibold text-[#ff5a00] uppercase tracking-wider block"
            >[ TESTIMONI TERVERIFIKASI ]</span
          >
          <h2 class="text-2xl sm:text-3xl font-semibold text-[#09090b]">
            Ulasan Klien Komersial
          </h2>
          <p class="text-[13px] text-[#52525b] font-normal">
            Evaluasi dari pimpinan produk dan engineer yang telah menggunakan layanan ini
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each currentService.reviews as rev}
            <div
              class="bg-white p-6 border border-[#ececee] space-y-3 rounded-[28px] shadow-xs"
            >
              <div
                class="flex items-center justify-between border-b border-[#ececee] pb-3"
              >
                <div>
                  <div class="font-semibold text-[14px] text-[#09090b]">
                    {rev.name}
                  </div>
                  <div class="text-[12px] text-[#71717a] font-normal">{rev.company}</div>
                </div>
                <div class="flex text-[#ff5a00] gap-0.5">
                  {#each Array(rev.rating) as _}
                    <Icon name="star" size={13} />
                  {/each}
                </div>
              </div>
              <p
                class="text-[13px] text-[#52525b] italic leading-relaxed font-normal"
              >
                "{rev.comment}"
              </p>
              <div class="text-[11px] text-[#a1a1aa] pt-1 uppercase font-medium">
                {rev.date}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- RELATED SERVICES -->
    <div class="pt-8 border-t border-[#ececee] space-y-6 reveal-on-scroll">
      <div class="flex items-center justify-between">
        <div>
          <span
            class="text-[11px] font-semibold text-[#ff5a00] uppercase tracking-wider block"
            >[ INTEGRASI LANJUTAN ]</span
          >
          <h2 class="text-2xl font-semibold text-[#09090b]">
            Katalog Spesifikasi Terkait
          </h2>
        </div>
        <button
          type="button"
          on:click={() => navigateTo("services")}
          class="text-[13px] uppercase font-semibold text-[#09090b] hover:text-[#ff5a00] transition cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Lihat Semua Katalog</span>
          <Icon name="arrow-right" size={14} />
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each otherServices.slice(0, 4) as rel}
          <button
            type="button"
            on:click={() => {
              selectedServiceId.set(rel.id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            class="p-5 border border-[#ececee] bg-white hover:bg-[#fafafa] hover:-translate-y-1 transition-all text-left space-y-2 cursor-pointer rounded-[24px] shadow-xs group"
          >
            <div class="text-[11px] font-semibold text-[#ff5a00] uppercase">
              {rel.category}
            </div>
            <div
              class="font-semibold text-[15px] text-[#09090b] group-hover:text-[#ff5a00] transition-colors leading-snug"
            >
              {rel.name}
            </div>
            <div class="text-[13px] text-[#52525b] pt-2 border-t border-[#ececee] font-medium">
              Mulai {formatRupiah(rel.startingPrice)}
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

  .reveal-on-scroll {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>