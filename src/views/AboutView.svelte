<script>
  import { onMount } from "svelte";
  import { companyInfo, teamMembers } from "../data/team";
  import { navigateTo } from "../stores/marketplaceStore";
  import Icon from "../components/Icon.svelte";

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
            COMPANY PROFILE
          </span>
          <span class="text-[#09090b] font-semibold">{companyInfo.legalName}</span>
          <span>/</span>
          <span>SURABAYA & JAKARTA</span>
        </div>
        <div class="hidden sm:block text-[#52525b]">
          EST: <strong class="text-[#09090b]">{companyInfo.establishedYear}</strong>
        </div>
      </div>

      <!-- Title & Headline -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
        <div class="max-w-3xl space-y-4">
          <h1 class="text-4xl sm:text-6xl font-semibold tracking-normal text-[#09090b] leading-[1.12]">
            Rekayasa Berintegritas & <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#09090b] via-[#3f3f46] to-[#ff5a00]">Standar Nyata.</span>
          </h1>
          <p class="text-[16px] sm:text-[18px] text-[#52525b] leading-[1.45] font-normal">
            {companyInfo.description}
          </p>
        </div>

        <!-- Counter / Legal Entity Badge
        <div class="bg-white text-[#09090b] border border-[#ececee] px-6 py-3.5 rounded-[20px] shrink-0 shadow-xs">
          <span class="text-[#71717a] block uppercase text-[11px] font-medium">Entitas Resmi:</span>
          <strong class="text-[#09090b] text-[18px] font-semibold block mt-0.5">
            {companyInfo.legalName}
          </strong>
        </div> -->
      </div>

      <!-- Quick Metrics Grid -->
      <div class="pt-6 border-t border-[#ececee] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px] animate-slide-up">
        {#each companyInfo.stats as st, idx}
          <div class="bg-white border border-[#ececee] p-5 rounded-[24px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#ff5a00]/40">
            <span class="text-[#71717a] block uppercase text-[11px] font-medium">[ METRIK 0{idx + 1} ]</span>
            <strong class="text-[#09090b] text-2xl block font-semibold mt-1">{st.value}</strong>
            <span class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-wider block mt-1">{st.label}</span>
          </div>
        {/each}
      </div>

    </div>
  </section>

  <!-- ==================== VISION & MISSION SECTION ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 py-8 reveal-on-scroll">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      <!-- Vision (Solid Dark Accent Box #18181b) -->
      <div
        class="lg:col-span-5 bg-[#18181b] text-white border border-[#27272a] p-8 sm:p-12 rounded-[36px] flex flex-col justify-between space-y-8 shadow-xl relative overflow-hidden"
      >
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff5a00]/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div class="space-y-4 relative z-10">
          <span
            class="text-[12px] font-semibold uppercase tracking-widest text-[#ff5a00] block"
          >
            [ VISI REKAYASA ]
          </span>
          <h2 class="text-2xl sm:text-3xl font-semibold leading-snug text-white">
            "{companyInfo.vision}"
          </h2>
        </div>
        <div
          class="text-[14px] text-[#a1a1aa] pt-6 border-t border-[#27272a] leading-relaxed font-normal relative z-10"
        >
          Kepatuhan legalitas, hak cipta mutlak, dan transparansi ruang lingkup menjadi standar fondasi di setiap proyek yang kami kerjakan.
        </div>
      </div>

      <!-- Mission (Structured List) -->
      <div
        class="lg:col-span-7 bg-white border border-[#ececee] p-8 sm:p-12 rounded-[36px] space-y-6 shadow-xs flex flex-col justify-between"
      >
        <div class="border-b border-[#ececee] pb-4">
          <span
            class="text-[12px] uppercase tracking-widest text-[#ff5a00] font-semibold block"
          >
            [ MISI KERJA ]
          </span>
          <h2 class="text-2xl sm:text-3xl font-semibold text-[#09090b] mt-1">
            Komitmen Operasional Layanan
          </h2>
        </div>

        <div class="space-y-4">
          {#each companyInfo.missions as m, idx}
            <div
              class="flex items-start gap-4 text-[14px] text-[#52525b]"
            >
              <span
                class="w-8 h-8 bg-[#fafafa] border border-[#ececee] text-[#09090b] font-semibold text-[13px] flex items-center justify-center shrink-0 mt-0.5 rounded-[12px]"
              >
                0{idx + 1}
              </span>
              <p class="leading-relaxed font-normal">{m}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== TEAM MEMBERS SECTION ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 py-12 reveal-on-scroll space-y-8">
    <div
      class="border-b border-[#ececee] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
    >
      <div class="max-w-xl space-y-2">
        <span
          class="text-[12px] font-semibold text-[#ff5a00] uppercase tracking-wider"
        >
          [ TIM PRAKTISI ]
        </span>
        <h2
          class="text-3xl sm:text-4xl font-semibold text-[#09090b] tracking-tight"
        >
          Personel di Balik Setiap Baris Kode
        </h2>
        <p class="text-[14px] sm:text-[16px] text-[#52525b]">
          Dikelola langsung oleh tim rekayasa internal, tanpa dialihdayakan ke subkontraktor luar yang tidak terverifikasi.
        </p>
      </div>
      <span class="text-[12px] text-[#71717a] uppercase shrink-0 font-medium bg-white px-4 py-2 border border-[#ececee] rounded-[14px]">
        TIM INTI / DEDIKASI PENUH
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each teamMembers as member}
        <div
          class="bg-white border border-[#ececee] p-6 rounded-[36px] space-y-5 shadow-xs hover:shadow-xl hover:border-[#ff5a00]/40 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between"
        >
          <div class="space-y-4">
            <div class="flex items-start gap-4">
              <img
                src={member.avatar}
                alt={member.name}
                class="w-16 h-16 object-cover border border-[#ececee] rounded-[20px] shrink-0 shadow-xs"
              />
              <div>
                <h3 class="font-semibold text-[17px] text-[#09090b] leading-tight">
                  {member.name}
                </h3>
                <div class="text-[12px] font-semibold text-[#ff5a00] mt-1">
                  {member.role}
                </div>
                <span
                  class="text-[11px] text-[#71717a] block mt-0.5"
                  >{member.experience}</span
                >
              </div>
            </div>

            <p class="text-[13px] text-[#52525b] leading-relaxed font-normal">
              {member.bio}
            </p>
          </div>

          <div
            class="pt-4 border-t border-[#ececee] text-[12px] text-[#52525b]"
          >
            <span class="text-[#71717a] block uppercase text-[10px] font-medium"
              >Spesialisasi Inti:</span
            >
            <span class="text-[#09090b] font-semibold block mt-0.5"
              >{member.specialty}</span
            >
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- ==================== OFFICE & LEGAL DETAILS BANNER ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 py-8 reveal-on-scroll">
    <div
      class="bg-[#18181b] text-white border border-[#27272a] p-8 sm:p-14 rounded-[36px] shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 text-[13px] relative overflow-hidden"
    >
      <div class="absolute -left-20 -top-20 w-80 h-80 bg-[#ff5a00]/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div class="space-y-2 relative z-10">
        <span
          class="text-[#ff5a00] font-semibold block uppercase tracking-wider text-[11px]"
        >
          [ ALAMAT KANTOR RESMI ]
        </span>
        <p class="text-[#a1a1aa] leading-relaxed font-normal">{companyInfo.address}</p>
      </div>

      <div class="space-y-2 relative z-10">
        <span
          class="text-[#ff5a00] font-semibold block uppercase tracking-wider text-[11px]"
        >
          [ KORESPONDENSI FORMAL ]
        </span>
        <p class="text-[#a1a1aa]">Email: {companyInfo.email}</p>
        <p class="text-[#a1a1aa]">WhatsApp: {companyInfo.whatsapp}</p>
      </div>

      <div class="space-y-2 relative z-10">
        <span
          class="text-[#ff5a00] font-semibold block uppercase tracking-wider text-[11px]"
        >
          [ JAM KERJA OPERASIONAL ]
        </span>
        <p class="text-[#a1a1aa]">{companyInfo.workingHours}</p>
        <p class="text-emerald-400 font-semibold mt-1">
          SLA Pemantauan Server 24/7 Aktif
        </p>
      </div>
    </div>
  </section>

</div>

<style>
  :global(body), :global(button), :global(input), :global(select), :global(textarea) {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }

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

  .reveal-on-scroll {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
</style>