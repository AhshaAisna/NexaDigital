<script>
  import { formatRupiah } from "../../utils/formatCurrency";

  export let serviceName = "";
  export let packageName = "";
  export let projectTitle = "";
  export let subtotal = 0;
  export let discount = 0;
  export let tax = 0;
  export let total = 0;
</script>

<!-- Tabel Rincian Item (Data Ledger) -->
<div class="overflow-x-auto">
  <table class="w-full text-left text-xs font-mono border-collapse">
    <thead>
      <tr
        class="bg-stone-100 border-b-2 border-stone-900 text-stone-950 font-bold uppercase tracking-wider text-[11px]"
      >
        <th class="py-3.5 px-3">Deskripsi Layanan & Spesifikasi</th>
        <th class="py-3.5 px-3 text-center">Tingkat Paket</th>
        <th class="py-3.5 px-3 text-right">Tarif Dasar</th>
        <th class="py-3.5 px-3 text-right">Potongan / Promo</th>
        <th class="py-3.5 px-3 text-right">Jumlah (DPP)</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-stone-200 text-stone-700 bg-white">
      <tr class="hover:bg-stone-50/80 transition-colors">
        <td class="py-4 px-3 space-y-1">
          <div class="font-sans font-bold text-sm text-stone-950">
            {serviceName}
          </div>
          <p
            class="text-stone-600 text-[11px] leading-relaxed max-w-md font-mono"
          >
            {projectTitle ||
              `Pengerjaan paket spesifikasi teknis ${serviceName}`}
          </p>
        </td>
        <td class="py-4 px-3 text-center">
          <span
            class="inline-block px-2.5 py-1 bg-stone-100 border border-stone-300 text-stone-900 font-bold text-[10px] uppercase tracking-wider"
          >
            {packageName}
          </span>
        </td>
        <td class="py-4 px-3 text-right text-stone-800 font-medium"
          >{formatRupiah(subtotal)}</td
        >
        <td class="py-4 px-3 text-right font-medium">
          {#if discount > 0}
            <span class="text-orange-700 font-bold"
              >-{formatRupiah(discount)}</span
            >
          {:else}
            <span class="text-stone-400">Rp0</span>
          {/if}
        </td>
        <td class="py-4 px-3 text-right font-extrabold text-stone-950">
          {formatRupiah(Math.max(0, subtotal - discount))}
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Ringkasan Finansial & Faktur Pajak -->
<div class="mt-6 flex justify-end font-mono">
  <div
    class="w-full sm:w-88 bg-stone-50 border-2 border-stone-900 p-5 space-y-2.5 text-xs shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]"
  >
    <div
      class="flex justify-between text-stone-600 pb-1 border-b border-stone-200"
    >
      <span>Subtotal Layanan:</span>
      <span class="font-bold text-stone-900">{formatRupiah(subtotal)}</span>
    </div>

    {#if discount > 0}
      <div
        class="flex justify-between text-orange-700 font-bold pb-1 border-b border-stone-200"
      >
        <span>Potongan Kupon Promo:</span>
        <span>-{formatRupiah(discount)}</span>
      </div>
    {/if}

    <div
      class="flex justify-between text-stone-600 pb-1 border-b border-stone-200"
    >
      <span>Dasar Pengenaan Pajak (DPP):</span>
      <span class="font-bold text-stone-900"
        >{formatRupiah(Math.max(0, subtotal - discount))}</span
      >
    </div>

    <div
      class="flex justify-between text-stone-600 pb-1 border-b border-stone-200"
    >
      <span>Faktur PPN 11% Resmi:</span>
      <span class="font-bold text-stone-900">{formatRupiah(tax)}</span>
    </div>

    <div
      class="flex justify-between items-baseline pt-2 text-stone-950 font-bold"
    >
      <span class="uppercase tracking-wider text-[11px] text-stone-500"
        >Total Tagihan:</span
      >
      <span
        class="text-lg font-black font-mono text-stone-950 bg-orange-300 border border-stone-900 px-2 py-0.5"
      >
        {formatRupiah(total)}
      </span>
    </div>
  </div>
</div>
