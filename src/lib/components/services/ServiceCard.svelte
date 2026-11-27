<script>
  import { formatRupiah } from "../../utils/formatCurrency";
  import Icon from "../../../components/Icon.svelte";

  export let service;
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
  class="bg-white p-6 rounded-2xl flex flex-col justify-between transition-all duration-200 group h-full border border-slate-200 hover:shadow-md"
>
  <div class="space-y-4">
    <!-- Icon & Kategori Tag -->
    <div class="flex items-center justify-between">
      <div
        class="w-11 h-11 border border-slate-200 bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center transition-colors duration-200 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 shadow-xs"
      >
        <Icon name={service.icon} size={20} />
      </div>
      <span
        class="text-[10px] font-semibold px-2.5 py-1 border border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-widest rounded-lg"
      >
        {service.category}
      </span>
    </div>

    <!-- Judul & Tagline -->
    <div>
      <h3
        class="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-200 leading-snug"
      >
        {service.name}
      </h3>
      <p class="text-xs text-slate-500 mt-1.5 leading-relaxed font-normal">
        {service.tagline}
      </p>
    </div>

    <!-- Deliverables Snippet -->
    {#if service.deliverables && service.deliverables.length > 0}
      <div class="space-y-1.5 pt-2 border-t border-slate-100">
        {#each service.deliverables.slice(0, 2) as item}
          <div class="flex items-center gap-2 text-xs text-slate-600">
            <span class="text-orange-500 font-bold shrink-0">▪</span>
            <span class="truncate">{item}</span>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Info Harga & Waktu SLA -->
    <div
      class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs"
    >
      <div>
        <span class="text-[10px] text-slate-400 block uppercase font-medium"
          >Mulai dari</span
        >
        <span class="font-bold text-base text-slate-900 block mt-0.5 font-mono"
          >{formatRupiah(service.startingPrice)}</span
        >
      </div>
      <div class="text-right">
        <span class="text-[10px] text-slate-400 block uppercase font-medium"
          >Estimasi Pengerjaan</span
        >
        <span
          class="font-semibold text-slate-700 flex items-center justify-end gap-1 mt-0.5"
        >
          <Icon name="clock" size={12} className="text-slate-400" />
          {service.estimatedDelivery}
        </span>
      </div>
    </div>
  </div>

  <!-- Aksi Pemilihan -->
  <div class="pt-6">
    <button
      type="button"
      on:click={() => onSelect(service.id)}
      class="w-full py-3 px-4 text-xs uppercase font-semibold border border-slate-200 bg-slate-50 text-slate-800 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-xs"
    >
      <span>Lihat Rincian Paket</span>
      <Icon name="arrow-right" size={13} />
    </button>
  </div>
</div>