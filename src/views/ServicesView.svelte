<script>
  import { onMount } from "svelte";
  import { allServices } from "../stores/servicesStore";
  import { navigateTo, formatRupiah, showToast } from "../stores/marketplaceStore";
  import { addProduct } from "../stores/adminStore";
  import Icon from "../components/Icon.svelte";
  import ServiceCard from "../lib/components/services/ServiceCard.svelte";

  let searchQuery = "";
  let selectedCategory = "All";
  let sortBy = "default";

  // Modal State Tambah Produk Baru
  let showAddModal = false;
  let newProductForm = {
    name: "",
    category: "Development",
    tagline: "",
    price: 1500000,
    sla: "3 - 5 Hari Kerja",
    deliverables: "Source code bersih & terstruktur\nOptimasi performa & responsive\nGaransi perbaikan bug 30 hari",
    billingCycle: "Bulanan",
    status: "active"
  };

  function openAddModal() {
    newProductForm = {
      name: "",
      category: "Development",
      tagline: "",
      price: 1500000,
      sla: "3 - 5 Hari Kerja",
      deliverables: "Source code bersih & terstruktur\nOptimasi performa & responsive\nGaransi perbaikan bug 30 hari",
      billingCycle: "Bulanan",
      status: "active"
    };
    showAddModal = true;
  }

  function handleSaveNewProduct() {
    if (!newProductForm.name.trim()) {
      showToast("Nama produk/layanan wajib diisi!", "error");
      return;
    }
    if (!newProductForm.price || Number(newProductForm.price) <= 0) {
      showToast("Harga produk harus lebih besar dari 0!", "error");
      return;
    }

    addProduct(newProductForm);
    showAddModal = false;
  }

  // Ambil daftar kategori secara dinamis dari data
  $: dynamicCategories = [
    "All",
    ...Array.from(new Set($allServices.map((s) => s.category).filter(Boolean)))
  ];

  $: filteredServices = $allServices
    .filter((s) => {
      const matchCategory =
        selectedCategory === "All" ||
        s.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.tagline || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.startingPrice - b.startingPrice;
      if (sortBy === "price-desc") return b.startingPrice - a.startingPrice;
      return 0;
    });

  function openService(id) {
    navigateTo("service-detail", { serviceId: id });
  }

  // Scroll Reveal Observer untuk transisi mulus
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
  <!-- ==================== HERO / HEADER SECTION ==================== -->
  <section class="pt-16 pb-12 lg:pt-20 lg:pb-16 relative overflow-hidden">
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-[#ff5a00]/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

    <div class="w-full px-6 sm:px-12 lg:px-20 space-y-10 relative z-10">
      
      <!-- Top Meta Badge -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ececee] text-[12px] font-medium text-[#71717a] animate-slide-down">
        <div class="flex items-center gap-2.5">
          <span class="px-2.5 py-1 bg-[#ff5a00] text-white rounded-[12px] text-[11px] font-semibold animate-bounce-subtle shadow-xs">
            KATALOG RESMI 2026
          </span>
          <span class="text-[#09090b] font-semibold">PT NEXA DIGITAL SOLUSINDO</span>
          <span>/</span>
          <span>SURABAYA & JAKARTA</span>
        </div>
        <div class="hidden sm:block text-[#52525b]">
          STATUS: <strong class="text-[#09090b]">MODUL LAYANAN AKTIF</strong>
        </div>
      </div>

      <!-- Title & Action Triggers -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
        <div class="max-w-3xl space-y-4">
          <h1 class="text-4xl sm:text-6xl font-semibold tracking-normal text-[#09090b] leading-[1.12]">
            Katalog Spesifikasi <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#09090b] via-[#3f3f46] to-[#ff5a00]">Layanan Digital.</span>
          </h1>
          <p class="text-[16px] sm:text-[18px] text-[#52525b] leading-[1.45] font-normal">
            Pilih modul rekayasa yang sesuai dengan kebutuhan produk Anda. Setiap paket dikerjakan dengan batasan deliverables terukur, kontrak PKS resmi, dan e-Faktur PPN 11%.
          </p>
        </div>

        <!-- <div class="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onclick={openAddModal}
            class="px-6 py-3.5 bg-[#09090b] hover:bg-[#ff5a00] text-white font-normal text-[14px] transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-[14px] flex items-center gap-2 border border-[#2c2e34] shadow-md"
            title="Tambah Produk / Jasa Baru ke Katalog"
          >
            <Icon name="plus" size={16} />
            <span>Tambah Produk Baru</span>
          </button>
        </div> -->
      </div>

    </div>
  </section>

  <!-- ==================== MARKETPLACE CONTROL CONSOLE ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 pb-8">
    <div class="bg-white border border-[#ececee] p-5 sm:p-6 rounded-[36px] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 reveal-on-scroll">
      
      <!-- Search Input -->
      <div class="relative w-full lg:w-80">
        <Icon
          name="search"
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a]"
        />
        <input
          type="text"
          placeholder="Cari spesifikasi (cth: UI/UX, Flutter, API)..."
          bind:value={searchQuery}
          class="w-full pl-11 pr-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[16px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b] placeholder:text-[#a1a1aa]"
        />
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-[12px]">
        {#each dynamicCategories as cat}
          <button
            type="button"
            onclick={() => (selectedCategory = cat)}
            class="px-4 py-2.5 border rounded-[14px] transition-all duration-200 cursor-pointer whitespace-nowrap font-medium {selectedCategory.toLowerCase() === cat.toLowerCase()
              ? 'bg-[#09090b] border-[#09090b] text-white shadow-md'
              : 'bg-[#fafafa] border-[#ececee] text-[#52525b] hover:border-[#a1a1aa] hover:text-[#09090b]'}"
          >
            {cat === 'All' ? 'Semua Kategori' : cat}
          </button>
        {/each}
      </div>

      <!-- Sort Selection -->
      <div class="flex items-center justify-end gap-2 text-[12px] text-[#52525b] border-t lg:border-t-0 pt-3 lg:pt-0 border-[#ececee]">
        <span class="whitespace-nowrap uppercase font-semibold text-[#09090b]">Urutkan:</span>
        <select
          bind:value={sortBy}
          class="bg-[#fafafa] border border-[#ececee] rounded-[14px] px-3.5 py-2.5 text-[12px] text-[#09090b] focus:outline-none focus:border-[#09090b] cursor-pointer font-medium"
        >
          <option value="default">Default Rekomendasi</option>
          <option value="price-asc">Harga: Terendah ke Tertinggi</option>
          <option value="price-desc">Harga: Tertinggi ke Terendah</option>
        </select>
      </div>

    </div>
  </section>

  <!-- ==================== MARKETPLACE SERVICES GRID ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 py-8 reveal-on-scroll">
    {#if filteredServices.length === 0}
      <div class="bg-white border border-[#ececee] p-12 rounded-[36px] text-center space-y-4 shadow-sm">
        <div class="w-12 h-12 bg-[#fafafa] border border-[#ececee] rounded-[16px] flex items-center justify-center mx-auto text-[#71717a] font-semibold text-lg">
          ?
        </div>
        <div class="space-y-1">
          <h3 class="text-base font-semibold text-[#09090b]">
            Layanan tidak ditemukan
          </h3>
          <p class="text-[13px] text-[#52525b] max-w-sm mx-auto">
            Tidak ada modul yang cocok dengan kriteria pencarian "{searchQuery}".
          </p>
        </div>
        <div class="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onclick={() => {
              searchQuery = "";
              selectedCategory = "All";
            }}
            class="px-5 py-3 bg-[#09090b] text-white text-[13px] uppercase font-medium hover:bg-[#18181b] transition cursor-pointer rounded-[14px]"
          >
            Reset Semua Filter
          </button>
          <button
            type="button"
            onclick={openAddModal}
            class="px-5 py-3 bg-[#ff5a00] text-white text-[13px] uppercase font-medium hover:bg-[#e04f00] transition cursor-pointer rounded-[14px]"
          >
            Tambah Produk Baru
          </button>
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredServices as s}
          <div class="bg-white border border-[#ececee] p-4 rounded-[36px] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-[#ff5a00]/50 group">
            <ServiceCard service={s} onSelect={openService} />
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- ==================== CUSTOM REQUEST BANNER ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 py-12 reveal-on-scroll">
    <div class="bg-[#18181b] text-white border border-[#27272a] p-8 sm:p-14 rounded-[36px] relative overflow-hidden transition-all duration-500 hover:shadow-2xl">
      <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff5a00]/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

      <div class="max-w-3xl space-y-4 relative z-10">
        <span class="text-[12px] text-[#ff5a00] uppercase tracking-widest font-semibold">
          [ SCOPE KUSTOM & INTEGRASI KHUSUS ]
        </span>
        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Memerlukan integrasi arsitektur atau kombinasi paket khusus?
        </h2>
        <p class="text-[14px] text-[#a1a1aa] leading-relaxed">
          Kami dapat menyusun dokumen *Scope of Work (SoW)* kustom, perjanjian kerahasiaan (NDA), dan jadwal pengerjaan sprint bertahap untuk kebutuhan tim Anda.
        </p>

        <div class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
          <button
            type="button"
            onclick={() => navigateTo("contact")}
            class="px-6 py-3.5 bg-white text-[#09090b] hover:bg-[#ff5a00] hover:text-white text-[13px] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-[14px] shadow-md"
          >
            Ajukan Brief Khusus
          </button>
        </div>
      </div>
    </div>
  </section>
</div>

<!-- ==================== MODAL TAMBAH PRODUK BARU ==================== -->
{#if showAddModal}
  <div class="fixed inset-0 z-50 bg-[#09090b]/75 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white border border-[#ececee] shadow-2xl rounded-[36px] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 text-[13px]">
      <div class="flex items-center justify-between border-b border-[#ececee] pb-4">
        <div>
          <span class="text-[11px] text-[#ff5a00] font-semibold uppercase tracking-wider block">[ KATALOG STUDIO ]</span>
          <h3 class="text-xl font-semibold text-[#09090b]">
            Tambah Produk / Layanan Baru
          </h3>
        </div>
        <button
          type="button"
          onclick={() => (showAddModal = false)}
          class="p-2 hover:bg-[#fafafa] rounded-[14px] border border-[#ececee] cursor-pointer text-[#71717a] hover:text-[#09090b] transition"
          aria-label="Tutup"
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div class="space-y-4">
        <!-- Nama Produk -->
        <div>
          <label for="new_prod_name" class="block text-[12px] font-semibold uppercase text-[#09090b] mb-1">Nama Produk / Layanan *</label>
          <input
            id="new_prod_name"
            type="text"
            bind:value={newProductForm.name}
            placeholder="Contoh: AI Chatbot & Customer Support Integration"
            class="w-full px-4 py-3 bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] text-[13px]"
          />
        </div>

        <!-- Kategori & Siklus -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="new_prod_cat" class="block text-[12px] font-semibold uppercase text-[#09090b] mb-1">Kategori *</label>
            <select
              id="new_prod_cat"
              bind:value={newProductForm.category}
              class="w-full px-4 py-3 bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] cursor-pointer text-[13px]"
            >
              <option value="Design">UI/UX Design</option>
              <option value="Development">Web Development</option>
              <option value="Mobile App">Mobile App</option>
              <option value="DevOps">Cloud & DevOps</option>
              <option value="Architecture">Web Architecture</option>
              <option value="Growth & SEO">Growth & SEO</option>
              <option value="AI Solutions">AI Solutions</option>
            </select>
          </div>

          <div>
            <label for="new_prod_cycle" class="block text-[12px] font-semibold uppercase text-[#09090b] mb-1">Siklus Penagihan *</label>
            <select
              id="new_prod_cycle"
              bind:value={newProductForm.billingCycle}
              class="w-full px-4 py-3 bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] cursor-pointer text-[13px]"
            >
              <option value="Bulanan">Bulanan (Monthly Retainer)</option>
              <option value="Per Proyek">Per Proyek (Fixed Project)</option>
              <option value="3 Bulan">Tiap 3 Bulan (Quarterly)</option>
              <option value="Tahunan">Tahunan (Annual Contract)</option>
            </select>
          </div>
        </div>

        <!-- Harga & SLA -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="new_prod_price" class="block text-[12px] font-semibold uppercase text-[#09090b] mb-1">Harga Dasar (Rp) *</label>
            <input
              id="new_prod_price"
              type="number"
              bind:value={newProductForm.price}
              placeholder="1500000"
              class="w-full px-4 py-3 bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] text-[13px]"
            />
          </div>

          <div>
            <label for="new_prod_sla" class="block text-[12px] font-semibold uppercase text-[#09090b] mb-1">SLA & Kecepatan Respons</label>
            <input
              id="new_prod_sla"
              type="text"
              bind:value={newProductForm.sla}
              placeholder="3 - 5 Hari Kerja • SLA Respons < 2 Jam"
              class="w-full px-4 py-3 bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] text-[13px]"
            />
          </div>
        </div>

        <!-- Tagline Singkat -->
        <div>
          <label for="new_prod_tagline" class="block text-[12px] font-semibold uppercase text-[#09090b] mb-1">Tagline Ringkas</label>
          <input
            id="new_prod_tagline"
            type="text"
            bind:value={newProductForm.tagline}
            placeholder="Deskripsi singkat daya tarik produk bagi klien..."
            class="w-full px-4 py-3 bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] text-[13px]"
          />
        </div>

        <!-- Deliverables -->
        <div>
          <label for="new_prod_deliv" class="block text-[12px] font-semibold uppercase text-[#09090b] mb-1">
            Deliverables & Fasilitas (Satu baris per poin)
          </label>
          <textarea
            id="new_prod_deliv"
            rows="3"
            bind:value={newProductForm.deliverables}
            placeholder="Source code bersih & terstruktur&#10;Dokumentasi handoff resmi&#10;Garansi perbaikan bug 30 hari"
            class="w-full px-4 py-3 bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] text-[13px]"
          ></textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-4 border-t border-[#ececee] flex items-center justify-end gap-3">
        <button
          type="button"
          onclick={() => (showAddModal = false)}
          class="px-5 py-3 bg-[#fafafa] hover:bg-[#ececee] text-[#52525b] font-medium uppercase rounded-[14px] border border-[#ececee] cursor-pointer transition text-[13px]"
        >
          Batal
        </button>
        <button
          type="button"
          onclick={handleSaveNewProduct}
          class="px-5 py-3 bg-[#09090b] hover:bg-[#ff5a00] text-white font-medium uppercase rounded-[14px] transition cursor-pointer text-[13px]"
        >
          Simpan Produk Baru
        </button>
      </div>
    </div>
  </div>
{/if}

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

  /* Perbaikan: Langsung tampil normal (opacity: 1) agar halaman tidak kosong di awal */
  .reveal-on-scroll {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .reveal-on-scroll.revealed {
    opacity: 1;
    transform: translateY(0);
  }
</style>