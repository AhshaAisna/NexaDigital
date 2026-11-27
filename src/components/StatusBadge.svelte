<script>
  export let status = 'PAID';
  export let size = 'md'; // 'sm' | 'md' | 'lg'
</script>

{#if status === 'PAID' || status === 'Lunas' || status === 'Selesai'}
  <span class="inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 {size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}">
    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
    {status === 'PAID' ? 'LUNAS (PAID)' : status}
  </span>
{:else if status === 'PENDING' || status === 'Menunggu Pembayaran'}
  <span class="inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 {size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}">
    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
    {status === 'PENDING' ? 'MENUNGGU PEMBAYARAN' : status}
  </span>
{:else if status === 'Sedang Dikerjakan'}
  <span class="inline-flex items-center gap-1.5 font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 {size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}">
    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
    Sedang Dikerjakan
  </span>
{:else if status === 'Tahap Revisi'}
  <span class="inline-flex items-center gap-1.5 font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 {size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}">
    <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
    Tahap Revisi
  </span>
{:else if status === 'Menunggu Kebutuhan'}
  <span class="inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 {size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}">
    <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
    Menunggu Kebutuhan
  </span>
{:else if status === 'CANCELLED' || status === 'Dibatalkan'}
  <span class="inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 {size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}">
    <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
    Dibatalkan
  </span>
{:else}
  <span class="inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 text-xs">
    {status}
  </span>
{/if}
