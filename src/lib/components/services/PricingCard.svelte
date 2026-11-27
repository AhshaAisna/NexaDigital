<script>
  import { formatRupiah } from "../../utils/formatCurrency";
  import Icon from "../../../components/Icon.svelte";

  export let pkg;
  export let onSelect = () => {};
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
</style>

<div
  class="bg-white border p-6 sm:p-7 flex flex-col justify-between relative h-full rounded-3xl transition-all duration-200 font-['Poppins'] antialiased {pkg.isRecommended
    ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20 bg-gradient-to-b from-orange-50/30 to-white'
    : 'border-slate-200 shadow-sm hover:shadow-md'}"
>
  {#if pkg.isRecommended}
    <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
      <span
        class="text-[10px] font-bold uppercase tracking-widest bg-orange-600 text-white px-3.5 py-1 rounded-full shadow-md shadow-orange-600/30 whitespace-nowrap block"
      >
        ★ REKOMENDASI UTAMA
      </span>
    </div>
  {/if}

  <div class="space-y-5">
    <!-- Header Paket -->
    <div class="border-b border-slate-100 pb-5">
      <div class="flex items-start justify-between gap-2">
        <h3
          class="text-xl font-bold text-slate-900 tracking-tight leading-snug"
        >
          {pkg.name}
        </h3>
        <span
          class="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg shrink-0"
        >
          {pkg.screens || "Layanan Penuh"}
        </span>
      </div>

      <div class="mt-4 flex items-baseline gap-1.5">
        <span
          class="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight font-mono"
        >
          {formatRupiah(pkg.price)}
        </span>
        <span class="text-xs text-slate-400 font-normal">/ paket</span>
      </div>
    </div>

    <!-- Info Waktu & Revisi (Ledger Grid) -->
    <div class="grid grid-cols-2 gap-2.5 text-xs">
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-0.5">
        <span class="text-[10px] text-slate-400 uppercase font-semibold block"
          >ESTIMASI WAKTU</span
        >
        <span class="font-bold text-slate-900 block text-xs"
          >{pkg.deliveryTime}</span
        >
      </div>
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-0.5">
        <span class="text-[10px] text-slate-400 uppercase font-semibold block"
          >SESI REVISI</span
        >
        <span class="font-bold text-slate-900 block text-xs"
          >{pkg.revisions}</span
        >
      </div>
    </div>

    <div class="space-y-2.5 pt-2">
      <span
        class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block"
      >
        SPESIFIKASI TERMASUK
      </span>
      <ul class="space-y-2.5 text-xs text-slate-700 font-normal">
        {#each pkg.features as feat}
          <li class="flex items-start gap-2.5">
            <span class="text-orange-500 font-bold shrink-0 mt-0.5">▪</span>
            <span class="leading-relaxed">{feat}</span>
          </li>
        {/each}
      </ul>
    </div>

    {#if pkg.notIncluded && pkg.notIncluded.length > 0}
      <div class="space-y-2 pt-3 border-t border-slate-100">
        <span
          class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block"
        >
          DI LUAR RUANG LINGKUP
        </span>
        <ul class="space-y-1.5 text-xs text-slate-400 font-normal">
          {#each pkg.notIncluded as notInc}
            <li class="flex items-center gap-2">
              <span class="text-slate-300 font-bold shrink-0">✕</span>
              <span class="line-through decoration-slate-300"
                >{notInc}</span
              >
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <div class="pt-6 border-t border-slate-100 mt-6">
    <button
      type="button"
      on:click={() => onSelect(pkg.id)}
      class="w-full py-3.5 px-4 text-xs uppercase font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer rounded-xl {pkg.isRecommended
        ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/30 active:translate-y-0.5'
        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:translate-y-0.5'}"
    >
      <span>Pilih Paket {pkg.name}</span>
      <Icon
        name="arrow-right"
        size={14}
        className="text-white"
      />
    </button>
  </div>
</div>