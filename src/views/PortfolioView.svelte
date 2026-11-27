<script>
  import { onMount } from "svelte";
  import { portfolioProjects } from "../data/portfolio";
  import { selectedCaseStudy, navigateTo } from "../stores/marketplaceStore";
  import Icon from "../components/Icon.svelte";

  let selectedCategory = "All";

  $: filteredProjects =
    selectedCategory === "All"
      ? portfolioProjects
      : portfolioProjects.filter(
          (p) => p.category.toLowerCase() === selectedCategory.toLowerCase(),
        );

  function openModal(proj) {
    selectedCaseStudy.set(proj);
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

<div
  class="bg-[#f4f4f5] text-[#09090b] selection:bg-[#ff5a00] selection:text-white font-['Plus_Jakarta_Sans',sans-serif] min-h-screen pb-24 antialiased overflow-x-hidden animate-fade-in"
>
  <!-- ==================== HERO SECTION ==================== -->
  <section class="pt-16 pb-12 lg:pt-20 lg:pb-16 relative overflow-hidden">
    <!-- Glowing background aura -->
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-[#ff5a00]/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

    <div class="w-full px-6 sm:px-12 lg:px-20 space-y-8 relative z-10">
      
      <!-- Top Meta Badge -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ececee] text-[12px] font-medium text-[#71717a] animate-slide-down">
        <div class="flex items-center gap-2.5">
          <span class="px-2.5 py-1 bg-[#ff5a00] text-white rounded-[12px] text-[11px] font-semibold animate-bounce-subtle shadow-xs">
            PORTFOLIO SHOWCASE
          </span>
          <span class="text-[#09090b] font-semibold">PT NEXA DIGITAL SOLUSINDO</span>
          <span>/</span>
          <span>SURABAYA & JAKARTA</span>
        </div>
        <div class="hidden sm:block text-[#52525b]">
          ARSIP: <strong class="text-[#09090b]">PROYEK RESMI TERVERIFIKASI</strong>
        </div>
      </div>

      <!-- Title & Headline -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
        <div class="max-w-3xl space-y-4">
          <h1 class="text-4xl sm:text-6xl font-semibold tracking-normal text-[#09090b] leading-[1.12]">
            Dokumentasi Rekayasa & <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#09090b] via-[#3f3f46] to-[#ff5a00]">Studi Kasus Produk.</span>
          </h1>
          <p class="text-[16px] sm:text-[18px] text-[#52525b] leading-[1.45] font-normal">
            Arsip implementasi perangkat lunak komersial, arsitektur aplikasi mobile, dan transformasi antarmuka produk digital yang berproduksi secara aktif di pasar.
          </p>
        </div>

        <!-- Counter Badge -->
        <div class="bg-white text-[#09090b] border border-[#ececee] px-6 py-3.5 rounded-[20px] shrink-0 shadow-xs">
          <span class="text-[#71717a] block uppercase text-[11px] font-medium">Total Project Releases:</span>
          <strong class="text-[#09090b] text-[20px] font-semibold block mt-0.5">
            {portfolioProjects.length} Studi Kasus Aktiv
          </strong>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="pt-6 border-t border-[#ececee] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px] animate-slide-up">
        <div class="bg-white border border-[#ececee] p-4 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
          <span class="text-[#71717a] block uppercase text-[11px]">User Satisfaction</span>
          <strong class="text-[#09090b] text-[15px] block font-semibold mt-1">99.4% Rating SLA</strong>
        </div>
        <div class="bg-white border border-[#ececee] p-4 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
          <span class="text-[#71717a] block uppercase text-[11px]">Deploy Speed</span>
          <strong class="text-[#09090b] text-[15px] block font-semibold mt-1">100% On-Time Sprint</strong>
        </div>
        <div class="bg-white border border-[#ececee] p-4 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
          <span class="text-[#71717a] block uppercase text-[11px]">Ownership</span>
          <strong class="text-[#09090b] text-[15px] block font-semibold mt-1">100% Code & IPR</strong>
        </div>
        <div class="bg-white border border-[#ececee] p-4 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
          <span class="text-[#71717a] block uppercase text-[11px]">PKS & Tax</span>
          <strong class="text-[#09090b] text-[15px] block font-semibold mt-1">e-Faktur PPN Ready</strong>
        </div>
      </div>

    </div>
  </section>

  <!-- ==================== CATEGORY FILTER CONSOLE ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 pb-8">
    <div class="bg-white border border-[#ececee] p-4 rounded-[28px] shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none text-[12px] uppercase font-medium reveal-on-scroll">
      {#each ["All", "UI/UX", "Website", "Mobile App", "Backend", "Digital Marketing"] as cat}
        <button
          type="button"
          on:click={() => (selectedCategory = cat)}
          class="px-5 py-3 border rounded-[14px] transition-all duration-200 cursor-pointer whitespace-nowrap font-medium {selectedCategory === cat
            ? 'bg-[#09090b] border-[#09090b] text-white shadow-md'
            : 'bg-[#fafafa] border-[#ececee] text-[#52525b] hover:border-[#a1a1aa] hover:text-[#09090b]'}"
        >
          {cat === "All" ? "Semua Kategori" : cat}
        </button>
      {/each}
    </div>
  </section>

  <!-- ==================== PROJECTS GRID ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 py-4 reveal-on-scroll">
    {#if filteredProjects.length === 0}
      <div class="bg-white border border-[#ececee] p-12 rounded-[36px] text-center space-y-4 shadow-xs">
        <div class="w-12 h-12 bg-[#fafafa] border border-[#ececee] rounded-[16px] flex items-center justify-center mx-auto text-[#71717a] font-semibold text-lg">
          ?
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-[#09090b]">
            Studi Kasus Tidak Ditemukan
          </h3>
          <p class="text-[13px] text-[#52525b] max-w-sm mx-auto">
            Tidak ada proyek yang cocok dengan filter kategori "{selectedCategory}".
          </p>
        </div>
        <button
          type="button"
          on:click={() => (selectedCategory = "All")}
          class="px-5 py-3 bg-[#09090b] text-white text-[13px] uppercase font-medium hover:bg-[#18181b] transition cursor-pointer rounded-[14px]"
        >
          Reset Filter Kategori
        </button>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredProjects as proj}
          <div
            class="bg-white border border-[#ececee] p-4 rounded-[36px] shadow-xs hover:shadow-xl hover:border-[#ff5a00]/50 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-2"
          >
            <div class="space-y-4">
              <!-- Thumbnail Container -->
              <div class="h-56 bg-[#fafafa] border border-[#ececee] rounded-[24px] relative overflow-hidden">
                <img
                  src={proj.thumbnail}
                  alt={proj.title}
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <!-- Floating Glass Tag -->
                <span
                  class="absolute top-3.5 left-3.5 text-[11px] font-semibold uppercase px-3 py-1 bg-[#09090b]/85 backdrop-blur-md text-white border border-white/10 rounded-[12px] shadow-xs"
                >
                  {proj.categoryLabel}
                </span>
              </div>

              <!-- Body Information -->
              <div class="space-y-3 px-1">
                <div class="flex items-center justify-between text-[11px] font-semibold text-[#71717a] uppercase tracking-wider border-b border-[#ececee] pb-2">
                  <span>KLIEN: <strong class="text-[#09090b]">{proj.client}</strong></span>
                  <span class="text-[#ff5a00]">VERIFIED</span>
                </div>

                <h3 class="text-[18px] font-semibold text-[#09090b] group-hover:text-[#ff5a00] transition-colors leading-snug">
                  {proj.title}
                </h3>

                <p class="text-[13px] text-[#52525b] leading-relaxed line-clamp-3 font-normal">
                  {proj.summary}
                </p>

                <!-- Tech Stack Chips -->
                <div class="flex flex-wrap gap-1.5 pt-2">
                  {#each proj.technologies as tech}
                    <span class="px-3 py-1 border border-[#ececee] bg-[#fafafa] text-[#52525b] text-[11px] uppercase font-medium rounded-[10px]">
                      {tech}
                    </span>
                  {/each}
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-6 px-1">
              <button
                type="button"
                on:click={() => openModal(proj)}
                class="w-full py-3.5 px-4 bg-[#09090b] hover:bg-[#ff5a00] text-white text-[13px] uppercase font-medium transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer rounded-[14px] shadow-md"
              >
                <span>Lihat Studi Kasus</span>
                <span class="transition-transform duration-300 group-hover:translate-x-1">
                  <Icon name="arrow-right" size={15} />
                </span>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ==================== CALL TO ACTION BANNER ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 py-12 reveal-on-scroll">
    <div class="bg-[#18181b] text-white border border-[#27272a] p-8 sm:p-14 rounded-[36px] relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
      <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff5a00]/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div class="max-w-3xl space-y-4 relative z-10">
        <span class="text-[12px] text-[#ff5a00] uppercase tracking-widest font-semibold">
          [ INISIASI KERJA SAMA ]
        </span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Tertarik mengembangkan solusi dengan standar rekayasa serupa?
        </h2>
        <p class="text-[14px] text-[#a1a1aa] leading-relaxed">
          Diskusikan parameter teknis, alur integrasi, dan batasan jadwal bersama tim rekayasa perangkat lunak PT Nexa Digital Solusindo.
        </p>

        <div class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
          <button
            type="button"
            on:click={() => navigateTo("contact")}
            class="px-6 py-3.5 bg-white text-[#09090b] hover:bg-[#ff5a00] hover:text-white text-[13px] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-[14px] shadow-md"
          >
            Jadwalkan Diskusi Brief
          </button>
          <button
            type="button"
            on:click={() => navigateTo("services")}
            class="px-6 py-3.5 bg-transparent hover:bg-white/10 text-white text-[13px] uppercase font-semibold border border-[#3f3f46] transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-[14px]"
          >
            Lihat Modul Layanan
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

  /* Keyframe Animasi Halus */
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

  /* Scroll Reveal Animasi */
  .reveal-on-scroll {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>