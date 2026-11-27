<script>
  import { onMount } from "svelte";
  import { companyInfo } from "../data/team";
  import { allServices } from "../stores/servicesStore";
  import { showToast, navigateTo } from "../stores/marketplaceStore";
  import { sendContactMessageToApi } from "../lib/services/apiService";
  import Icon from "../components/Icon.svelte";

  let fullName = "";
  let email = "";
  let whatsapp = "";
  let selectedService = "";
  $: if (!selectedService && $allServices.length > 0) {
    selectedService = $allServices[0].name;
  }
  let selectedPackage = "Standard";
  let budgetRange = "Rp3.000.000 – Rp5.000.000";
  let deadline = "1 Bulan ke depan";
  let description = "";
  let notes = "";
  let uploadedFileName = "";
  let isSubmitting = false;

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      uploadedFileName = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    }
  }

  async function submitInquiry() {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !whatsapp.trim() ||
      !description.trim()
    ) {
      showToast(
        "Mohon lengkapi Nama, Email, WhatsApp, dan Deskripsi proyek.",
        "error",
      );
      return;
    }

    isSubmitting = true;
    try {
      await sendContactMessageToApi({
        name: fullName,
        email: email,
        phone: whatsapp,
        service_interest: selectedService,
        budget_range: budgetRange,
        message: description + (notes ? `\nCatatan: ${notes}` : ''),
      });
    } catch (e) {
      console.warn("Backend contact sync fallback:", e.message);
    }

    isSubmitting = false;
    showToast(
      "Permintaan penawaran proyek Anda telah kami terima & tersimpan! Tim Nexa akan menghubungi Anda dalam 1x24 jam via WhatsApp.",
      "success",
    );
    fullName = "";
    email = "";
    whatsapp = "";
    description = "";
    notes = "";
    uploadedFileName = "";
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
  <section class="pt-16 pb-8 lg:pt-20 lg:pb-12 relative overflow-hidden">
    <!-- Glowing background aura -->
    <div class="absolute top-0 right-1/4 w-96 h-96 bg-[#ff5a00]/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

    <div class="w-full px-6 sm:px-12 lg:px-20 space-y-8 relative z-10">
      
      <!-- Top Meta Badge -->
      <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#ececee] text-[12px] font-medium text-[#71717a] animate-slide-down">
        <div class="flex items-center gap-2.5">
          <span class="px-2.5 py-1 bg-[#ff5a00] text-white rounded-[12px] text-[11px] font-semibold animate-bounce-subtle shadow-xs">
            INQUIRY DESK
          </span>
          <span class="text-[#09090b] font-semibold">PT NEXA DIGITAL SOLUSINDO</span>
          <span>/</span>
          <span>SURABAYA & JAKARTA</span>
        </div>
        <div class="hidden sm:block text-[#52525b]">
          RESPONS: <strong class="text-[#09090b]">&lt; 24 JAM KERJA</strong>
        </div>
      </div>

      <!-- Title & Headline -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
        <div class="max-w-3xl space-y-4">
          <h1 class="text-4xl sm:text-6xl font-semibold tracking-normal text-[#09090b] leading-[1.12]">
            Inisiasi Brief & <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#09090b] via-[#3f3f46] to-[#ff5a00]">Diskusi Proyek.</span>
          </h1>
          <p class="text-[16px] sm:text-[18px] text-[#52525b] leading-[1.45] font-normal">
            Uraikan spesifikasi teknis dan objektif bisnis produk Anda. Tim rekayasa kami akan menyiapkan estimasi ruang lingkup kerja (SoW), proyeksi alokasi sprint, dan kalkulasi biaya transparan.
          </p>
        </div>

        <!-- SLA Response Badge -->
        <!-- <div class="bg-white text-[#09090b] border border-[#ececee] px-6 py-3.5 rounded-[20px] shrink-0 shadow-xs">
          <span class="text-[#71717a] block uppercase text-[11px] font-medium">Standar Respons:</span>
          <strong class="text-[#09090b] text-[16px] font-semibold block mt-0.5">
            &lt; 24 Jam Kerja
          </strong>
        </div> -->
      </div>

    </div>
  </section>

  <!-- ==================== MAIN FORM & SIDEBAR SECTION ==================== -->
  <section class="w-full px-6 sm:px-12 lg:px-20 py-4 reveal-on-scroll">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Main Inquiry Form (Tactile Technical Console) -->
      <div
        class="lg:col-span-8 bg-white border border-[#ececee] p-6 sm:p-10 rounded-[36px] shadow-xs space-y-8"
      >
        <div
          class="border-b border-[#ececee] pb-4 flex items-center justify-between"
        >
          <div>
            <span
              class="text-[11px] font-semibold text-[#ff5a00] uppercase tracking-wider block"
              >[ FORMULIR SPESIFIKASI ]</span
            >
            <h2 class="text-xl font-semibold text-[#09090b] mt-0.5">
              Lembar Pengajuan Kebutuhan
            </h2>
          </div>
          <span class="text-[12px] text-[#71717a] hidden sm:inline font-medium"
            >* BIDANG WAJIB</span
          >
        </div>

        <div class="space-y-6">
          <!-- Contact Information -->
          <div class="space-y-2">
            <span
              class="text-[12px] uppercase font-semibold text-[#09090b] block"
              >[ 01 / DATA KORESPONDENSI ]</span
            >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block space-y-1.5">
                <span class="text-[12px] text-[#52525b] font-medium"
                  >Nama Lengkap *</span
                >
                <input
                  type="text"
                  bind:value={fullName}
                  placeholder="Contoh: Budi Santoso"
                  class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                />
              </label>

              <label class="block space-y-1.5">
                <span class="text-[12px] text-[#52525b] font-medium"
                  >Alamat Email Perusahaan *</span
                >
                <input
                  type="email"
                  bind:value={email}
                  placeholder="nama@perusahaan.com"
                  class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
                />
              </label>
            </div>
          </div>

          <!-- Phone & Service Choice -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label class="block space-y-1.5">
              <span class="text-[12px] text-[#52525b] font-medium"
                >Nomor WhatsApp Aktif *</span
              >
              <input
                type="tel"
                bind:value={whatsapp}
                placeholder="0812-xxxx-xxxx"
                class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
              />
            </label>

            <label class="block space-y-1.5">
              <span class="text-[12px] text-[#52525b] font-medium"
                >Modul Layanan Pokok</span
              >
              <select
                bind:value={selectedService}
                class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b] cursor-pointer font-medium"
              >
                {#each $allServices as s}
                  <option value={s.name}>{s.name} ({s.category})</option>
                {/each}
                <option value="Paket Custom Multi-Layanan"
                  >Paket Custom Multi-Layanan</option
                >
              </select>
            </label>
          </div>

          <!-- Parameter Scope & Budget -->
          <div class="space-y-2 pt-4 border-t border-[#ececee]">
            <span
              class="text-[12px] uppercase font-semibold text-[#09090b] block"
              >[ 02 / PARAMETER ANGGARAN & WAKTU ]</span
            >
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label class="block space-y-1.5">
                <span class="text-[12px] text-[#52525b] font-medium"
                  >Tingkat Kompleksitas</span
                >
                <select
                  bind:value={selectedPackage}
                  class="w-full px-3.5 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] cursor-pointer font-medium"
                >
                  <option value="Basic">Paket MVP / Basic</option>
                  <option value="Standard">Standar Komersial</option>
                  <option value="Premium">Enterprise / Skala Penuh</option>
                  <option value="Belum Tahu / Butuh Saran"
                    >Butuh Arahan Tim</option
                  >
                </select>
              </label>

              <label class="block space-y-1.5">
                <span class="text-[12px] text-[#52525b] font-medium"
                  >Rentang Budget</span
                >
                <select
                  bind:value={budgetRange}
                  class="w-full px-3.5 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] cursor-pointer font-medium"
                >
                  <option value="Di bawah Rp1.000.000"
                    >Di bawah Rp1.000.000</option
                  >
                  <option value="Rp1.000.000 – Rp3.000.000"
                    >Rp1.000.000 – Rp3.000.000</option
                  >
                  <option value="Rp3.000.000 – Rp5.000.000"
                    >Rp3.000.000 – Rp5.000.000</option
                  >
                  <option value="Rp5.000.000 – Rp10.000.000"
                    >Rp5.000.000 – Rp10.000.000</option
                  >
                  <option value="Di atas Rp10.000.000"
                    >Di atas Rp10.000.000</option
                  >
                </select>
              </label>

              <label class="block space-y-1.5">
                <span class="text-[12px] text-[#52525b] font-medium"
                  >Target Timeline</span
                >
                <select
                  bind:value={deadline}
                  class="w-full px-3.5 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] text-[#09090b] cursor-pointer font-medium"
                >
                  <option value="Kurang dari 1 Minggu (Kilat)"
                    >Kilat (&lt; 1 Minggu)</option
                  >
                  <option value="1 – 2 Minggu">1 – 2 Minggu</option>
                  <option value="1 Bulan ke depan">1 Bulan Penuh</option>
                  <option value="Fleksibel">Fleksibel / Sesuai Sprint</option>
                </select>
              </label>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2 pt-4 border-t border-[#ececee]">
            <span
              class="text-[12px] uppercase font-semibold text-[#09090b] block"
              >[ 03 / DESKRIPSI KEBUTUHAN ]</span
            >
            <label class="block space-y-1.5">
              <span class="text-[12px] text-[#52525b] font-medium"
                >Rangkuman Proyek / Fitur Kunci *</span
              >
              <textarea
                rows="4"
                bind:value={description}
                placeholder="Uraikan alur utama aplikasi, masalah yang ingin diselesaikan, target audiens, atau tautan referensi yang relevan..."
                class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b] leading-relaxed"
              ></textarea>
            </label>
          </div>

          <!-- Additional requirements -->
          <label class="block space-y-1.5">
            <span class="text-[12px] text-[#52525b] font-medium"
              >Catatan Legal / Persyaratan Tambahan (Opsional)</span
            >
            <input
              type="text"
              bind:value={notes}
              placeholder="Contoh: Butuh NDA sebelum dokumen dibuka, integrasi payment gateway Xendit, dsb."
              class="w-full px-4 py-3 text-[13px] bg-[#fafafa] border border-[#ececee] rounded-[14px] focus:outline-none focus:border-[#09090b] focus:bg-white transition text-[#09090b]"
            />
          </label>

          <!-- File upload simulation -->
          <div class="space-y-1.5 pt-2">
            <span class="text-[12px] text-[#52525b] font-medium"
              >Lampiran Dokumen Brief / Wireframe (Opsional)</span
            >
            <label
              class="border border-dashed border-[#ececee] bg-[#fafafa] p-5 text-center hover:bg-[#ececee]/50 hover:border-[#a1a1aa] transition cursor-pointer relative block rounded-[20px]"
            >
              <input type="file" on:change={handleFileChange} class="sr-only" />
              <div class="space-y-1 text-[13px] text-[#52525b]">
                <Icon
                  name="upload-cloud"
                  size={20}
                  className="mx-auto text-[#71717a]"
                />
                <div>
                  {#if uploadedFileName}
                    <span class="text-[#ff5a00] font-semibold"
                      >{uploadedFileName}</span
                    >
                  {:else}
                    <span class="text-[#09090b] font-medium block"
                      >Pilih file atau seret dokumen ke sini</span
                    >
                    <span class="text-[11px] text-[#71717a]"
                      >Mendukung format PDF, PNG, JPG, ZIP (Maks. 25MB)</span
                    >
                  {/if}
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Submit CTA Strip -->
        <div
          class="pt-6 border-t border-[#ececee] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p class="text-[12px] text-[#71717a] leading-snug font-normal">
            Kerahasiaan ide dan dokumen brief dilindungi standar etika non-disclosure profesional.
          </p>
          <button
            type="button"
            on:click={submitInquiry}
            disabled={isSubmitting}
            class="w-full sm:w-auto px-8 py-3.5 bg-[#ff5a00] hover:bg-[#e04f00] text-white text-[13px] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50 rounded-[14px] shadow-md"
          >
            {#if isSubmitting}
              <span>Memproses Brief...</span>
            {:else}
              <span>Kirim Pengajuan Proyek</span>
              <Icon name="arrow-right" size={14} />
            {/if}
          </button>
        </div>
      </div>

      <!-- Side Direct Desk & Quick Access (Console Cards) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- WhatsApp Direct Desk -->
        <div
          class="bg-[#18181b] text-white border border-[#27272a] p-6 sm:p-8 rounded-[36px] shadow-xl space-y-6 relative overflow-hidden"
        >
          <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff5a00]/20 rounded-full blur-[100px] pointer-events-none"></div>

          <div class="border-b border-[#27272a] pb-4 relative z-10">
            <span
              class="text-[11px] text-[#ff5a00] font-semibold uppercase tracking-wider block"
              >[ JALUR RESPON CEPAT ]</span
            >
            <h3 class="text-lg font-semibold text-white mt-1">
              Konsultasi Langsung
            </h3>
            <p class="text-[13px] text-[#a1a1aa] mt-1 leading-relaxed font-normal">
              Memerlukan validasi cepat sebelum menyusun brief lengkap? Hubungi representatif teknis kami secara langsung.
            </p>
          </div>

          <a
            href="https://wa.me/6281289213344"
            target="_blank"
            rel="noreferrer"
            class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-md rounded-[14px] relative z-10"
          >
            <Icon name="phone" size={15} />
            <span>Chat via WhatsApp Resmi</span>
          </a>

          <div
            class="space-y-3 pt-2 border-t border-[#27272a] text-[13px] text-[#a1a1aa] relative z-10 font-normal"
          >
            <div class="space-y-0.5">
              <span class="text-[#71717a] uppercase text-[10px] block font-semibold"
                >Email Korespondensi:</span
              >
              <a
                href="mailto:{companyInfo.email}"
                class="text-white hover:text-[#ff5a00] transition-colors"
                >{companyInfo.email}</a
              >
            </div>

            <div class="space-y-0.5 pt-2 border-t border-[#27272a]">
              <span class="text-[#71717a] uppercase text-[10px] block font-semibold"
                >Jam Layanan Tim:</span
              >
              <span class="text-white">{companyInfo.workingHours}</span>
            </div>

            <div class="space-y-0.5 pt-2 border-t border-[#27272a]">
              <span class="text-[#71717a] uppercase text-[10px] block font-semibold"
                >Domisili Kantor:</span
              >
              <span class="text-white leading-snug block"
                >{companyInfo.address}</span
              >
            </div>
          </div>
        </div>

        <!-- Catalog Shortlink Box -->
        <div
          class="bg-white border border-[#ececee] p-6 rounded-[36px] shadow-xs space-y-3"
        >
          <div
            class="text-[11px] uppercase font-semibold text-[#ff5a00] tracking-wider"
          >
            [ PEMESANAN INSTAN ]
          </div>
          <h4 class="font-semibold text-[15px] text-[#09090b]">
            Sudah Mengetahui Paket Pilihan?
          </h4>
          <p class="text-[13px] text-[#52525b] leading-relaxed font-normal">
            Anda dapat langsung melakukan reservasi paket terstruktur dan penerbitan faktur proforma melalui alur pemesanan langsung.
          </p>
          <button
            type="button"
            on:click={() => navigateTo("services")}
            class="w-full py-3 px-4 bg-[#fafafa] hover:bg-[#ececee] text-[#09090b] text-[13px] uppercase font-medium border border-[#ececee] transition cursor-pointer rounded-[14px]"
          >
            Buka Katalog Layanan
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