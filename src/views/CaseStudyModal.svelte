<script>
  import { selectedCaseStudy } from "../stores/marketplaceStore";
  import { navigateTo } from "../stores/marketplaceStore";
  import Icon from "../components/Icon.svelte";

  function close() {
    selectedCaseStudy.set(null);
  }

  function handleConsult() {
    close();
    navigateTo("contact");
  }
</script>

{#if $selectedCaseStudy}
  <!-- Backdrop dengan efek blur mendalam -->
  <div
    class="fixed inset-0 z-50 overflow-y-auto bg-[#09090b]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]"
  >
    <!-- Modal Container dengan sudut lengkung khas Awesomic -->
    <div
      class="bg-white border border-[#ececee] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative text-[#09090b] my-6 rounded-[36px] animate-scale-up"
    >
      <!-- Close Button Mengambang -->
      <button
        type="button"
        onclick={close}
        aria-label="Tutup Studi Kasus"
        class="absolute top-4 right-4 z-30 w-11 h-11 bg-[#09090b]/90 backdrop-blur-md text-white hover:bg-[#ff5a00] border border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer rounded-[16px] shadow-lg hover:scale-105"
      >
        <Icon name="x" size={20} />
      </button>

      <!-- Modal Header Banner dengan Ambient Overlay -->
      <div
        class="h-72 sm:h-80 relative bg-[#09090b] overflow-hidden rounded-t-[36px]"
      >
        <img
          src={$selectedCaseStudy.thumbnail}
          alt={$selectedCaseStudy.title}
          class="w-full h-full object-cover opacity-50 transform hover:scale-105 transition-transform duration-700"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent"
        ></div>
        
        <!-- Subtle Glow Effect -->
        <div class="absolute -left-10 -top-10 w-60 h-60 bg-[#ff5a00]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div
          class="absolute bottom-6 left-6 right-6 sm:left-8 sm:right-8 text-white space-y-3 z-10"
        >
          <!-- Category Tag -->
          <span
            class="inline-block text-[11px] font-semibold uppercase tracking-widest px-3.5 py-1.5 bg-[#ff5a00] text-white rounded-[14px] shadow-sm"
          >
            {$selectedCaseStudy.categoryLabel}
          </span>

          <h2
            class="text-2xl sm:text-4xl font-semibold tracking-tight text-white leading-tight"
          >
            {$selectedCaseStudy.title}
          </h2>

          <div
            class="flex flex-wrap items-center gap-3 text-[12px] text-[#d4d4d8] pt-1"
          >
            <span
              >KLIEN: <strong class="text-white"
                >{$selectedCaseStudy.client}</strong
              ></span
            >
            <span class="text-[#ff5a00]">•</span>
            <span
              >TAHUN RILIS: <strong class="text-white"
                >{$selectedCaseStudy.year}</strong
              ></span
            >
          </div>
        </div>
      </div>

      <!-- Content Body -->
      <div class="p-6 sm:p-10 space-y-8">
        
        <!-- Metrics / Impact Stats Grid -->
        {#if $selectedCaseStudy.stats}
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {#each $selectedCaseStudy.stats as stat, idx}
              <div
                class="bg-[#fafafa] border border-[#ececee] p-5 text-center rounded-[24px] shadow-xs hover:border-[#ff5a00]/40 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  class="text-[10px] font-semibold text-[#ff5a00] uppercase tracking-wider"
                >
                  [ HASIL 0{idx + 1} ]
                </div>
                <div
                  class="text-2xl sm:text-3xl font-semibold text-[#09090b] tracking-tight mt-1.5"
                >
                  {stat.value}
                </div>
                <div
                  class="text-[12px] font-medium text-[#52525b] uppercase mt-1"
                >
                  {stat.label}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Technologies & Infrastructure Used -->
        {#if $selectedCaseStudy.technologies}
          <div class="space-y-3 pt-2">
            <span
              class="text-[11px] font-semibold text-[#71717a] uppercase tracking-widest block"
            >
              [ TEKNOLOGI & INFRASTRUKTUR YANG DIGUNAKAN ]
            </span>
            <div class="flex flex-wrap gap-2">
              {#each $selectedCaseStudy.technologies as tech}
                <span
                  class="px-3.5 py-1.5 bg-[#fafafa] text-[#09090b] text-[12px] font-medium uppercase border border-[#ececee] rounded-[12px] shadow-xs"
                >
                  {tech}
                </span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Detailed Sections -->
        <div class="space-y-6 border-t border-[#ececee] pt-6">
          
          <!-- Tantangan & Masalah -->
          {#if $selectedCaseStudy.caseStudy?.clientProblem}
            <div class="space-y-2.5">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-[#ff5a00] rounded-full animate-pulse"></span>
                <h4
                  class="text-[13px] uppercase font-semibold text-[#09090b] tracking-wider"
                >
                  Tantangan & Masalah Klien
                </h4>
              </div>
              <p
                class="text-[13px] sm:text-[14px] text-[#52525b] bg-[#fafafa] border border-[#ececee] p-5 rounded-[24px] leading-relaxed"
              >
                {$selectedCaseStudy.caseStudy.clientProblem}
              </p>
            </div>
          {/if}

          <!-- Tujuan & Ruang Lingkup -->
          {#if $selectedCaseStudy.caseStudy?.projectObjectives}
            <div class="space-y-2.5">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-[#09090b] rounded-full"></span>
                <h4
                  class="text-[13px] uppercase font-semibold text-[#09090b] tracking-wider"
                >
                  Tujuan & Ruang Lingkup Proyek
                </h4>
              </div>
              <p
                class="text-[13px] sm:text-[14px] text-[#52525b] bg-[#fafafa] border border-[#ececee] p-5 rounded-[24px] leading-relaxed"
              >
                {$selectedCaseStudy.caseStudy.projectObjectives}
              </p>
            </div>
          {/if}

          <!-- Riset & Desain Split Grid -->
          {#if $selectedCaseStudy.caseStudy?.research || $selectedCaseStudy.caseStudy?.designProcess}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {#if $selectedCaseStudy.caseStudy.research}
                <div class="bg-[#fafafa] p-5 border border-[#ececee] rounded-[24px] space-y-2">
                  <span
                    class="text-[11px] font-semibold uppercase text-[#ff5a00] block"
                    >[ 01 / RISET & ANALISIS ]</span
                  >
                  <p class="text-[13px] text-[#52525b] leading-relaxed">
                    {$selectedCaseStudy.caseStudy.research}
                  </p>
                </div>
              {/if}
              {#if $selectedCaseStudy.caseStudy.designProcess}
                <div class="bg-[#fafafa] p-5 border border-[#ececee] rounded-[24px] space-y-2">
                  <span
                    class="text-[11px] font-semibold uppercase text-[#ff5a00] block"
                    >[ 02 / PROSES DESAIN UI/UX ]</span
                  >
                  <p class="text-[13px] text-[#52525b] leading-relaxed">
                    {$selectedCaseStudy.caseStudy.designProcess}
                  </p>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Eksekusi Pengembangan -->
          {#if $selectedCaseStudy.caseStudy?.development}
            <div class="space-y-2.5 pt-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-[#09090b] rounded-full"></span>
                <h4
                  class="text-[13px] uppercase font-semibold text-[#09090b] tracking-wider"
                >
                  Eksekusi Pengembangan & Integrasi
                </h4>
              </div>
              <p
                class="text-[13px] sm:text-[14px] text-[#52525b] bg-[#fafafa] border border-[#ececee] p-5 rounded-[24px] leading-relaxed"
              >
                {$selectedCaseStudy.caseStudy.development}
              </p>
            </div>
          {/if}

          <!-- Hasil Akhir & Dampak -->
          {#if $selectedCaseStudy.caseStudy?.finalResult}
            <div class="space-y-2.5 pt-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <h4
                  class="text-[13px] uppercase font-semibold text-[#09090b] tracking-wider"
                >
                  Hasil Akhir & Dampak Bisnis
                </h4>
              </div>
              <div
                class="bg-[#18181b] text-white border border-[#27272a] p-6 rounded-[24px] text-[13px] sm:text-[14px] leading-relaxed font-normal shadow-lg relative overflow-hidden"
              >
                <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <p class="relative z-10">{$selectedCaseStudy.caseStudy.finalResult}</p>
              </div>
            </div>
          {/if}
        </div>

        <!-- Footer Actions Console -->
        <div
          class="pt-6 border-t border-[#ececee] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <button
            type="button"
            onclick={close}
            class="w-full sm:w-auto px-6 py-3.5 border border-[#ececee] text-[13px] uppercase font-semibold text-[#52525b] hover:bg-[#fafafa] transition cursor-pointer rounded-[14px]"
          >
            Tutup Studi Kasus
          </button>
          <button
            type="button"
            onclick={handleConsult}
            class="w-full sm:w-auto px-7 py-3.5 bg-[#ff5a00] hover:bg-[#e04f00] text-white text-[13px] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 rounded-[14px] shadow-md"
          >
            <span>Konsultasikan Proyek Serupa</span>
            <Icon name="arrow-right" size={15} />
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleUp {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .animate-scale-up {
    animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
</style>