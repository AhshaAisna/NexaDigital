<script>
  import { formatRupiah } from '../stores/marketplaceStore';
  import Icon from './Icon.svelte';

  export let templateId = 'modern-corporate';
  export let invoice; // Normalized invoice object from buildInvoiceDataFromOrder

  // Fallback defaults
  $: inv = invoice || {
    invoiceNumber: 'INV-2026-00001',
    orderId: 'NXD-2026-081',
    issueDate: '2026-09-20',
    dueDate: '2026-09-27',
    paymentStatus: 'PAID',
    paymentMethod: 'Bank Transfer BCA',
    customer: {
      name: 'Rian Hidayat',
      company: 'PT Logistik Kita Bersama',
      email: 'rian.hidayat@startupkita.id',
      phone: '+62 812-9988-7766',
      address: 'SCBD Lot 9, Jakarta Selatan'
    },
    project: {
      title: 'Redesain Aplikasi Mobile Kurir On-Demand',
      serviceName: 'UI/UX Design',
      packageName: 'Standard',
      notes: 'Pembayaran telah disepakati dan diverifikasi lunas.'
    },
    items: [
      {
        description: 'UI/UX Design — Standard (7 Layar)',
        details: 'Wireframe, visual UI, prototipe interaktif Figma',
        qty: 1,
        price: 1500000
      }
    ],
    financial: {
      subtotal: 1500000,
      discount: 0,
      tax: 165000,
      isTaxEnabled: true,
      total: 1665000
    },
    signatory: {
      employeeName: 'Bagas Pratama',
      employeeTitle: 'Staff Operasional & PIC Proyek',
      signDate: '2026-09-20',
      digitalAuthHash: 'SHA256-NXD-081-VERIFIED'
    },
    company: {
      name: 'Nexa Digital',
      legalName: 'PT Nexa Digital Solusindo',
      npwp: '01.234.567.8-012.000',
      address: 'Menara Cyber 2 Lt. 14, Jl. H.R. Rasuna Said, Jakarta',
      email: 'operasional@nexadigital.id',
      phone: '+62 812-8921-3344',
      bankInfo: 'BCA: 800-1234-567 a/n PT Nexa Digital Solusindo'
    }
  };
</script>

<style>
  @media print {
    .print-sheet {
      box-shadow: none !important;
      border: 1px solid #cbd5e1 !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 1.5rem !important;
    }
  }
</style>

<div class="print-sheet w-full transition-all duration-300">

  <!-- ========================================================================= -->
  <!-- 1. TEMPLATE: MODERN CORPORATE NEXA (Brand Orange & Slate)                 -->
  <!-- ========================================================================= -->
  {#if templateId === 'modern-corporate'}
    <div class="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-slate-800 space-y-8 shadow-sm">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-100 pb-8">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-slate-900 text-white font-bold text-sm flex items-center justify-center rounded-xl shadow-xs">
              NX
            </div>
            <div>
              <div class="text-xl font-bold tracking-tight text-slate-900 leading-none">Nexa Digital</div>
              <div class="text-[10px] uppercase tracking-widest text-slate-400 mt-1 font-semibold">{inv.company.legalName}</div>
            </div>
          </div>
          <div class="text-xs text-slate-500 max-w-sm leading-relaxed">
            <p>{inv.company.address}</p>
            <p class="pt-1 text-slate-700 font-semibold">NPWP: {inv.company.npwp}</p>
            <p>Email: {inv.company.email} | WA: {inv.company.phone}</p>
          </div>
        </div>

        <div class="text-left sm:text-right space-y-2">
          <span class="inline-block px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold uppercase tracking-wider rounded-lg">
            INVOICE RESMI
          </span>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight font-mono">{inv.invoiceNumber}</h1>
          <div class="text-xs text-slate-500 space-y-0.5">
            <div>Pesanan: <span class="font-semibold text-slate-800">{inv.orderId}</span></div>
            <div>Terbit: <span class="font-semibold text-slate-800">{inv.issueDate}</span> | Tempo: <span class="font-semibold text-slate-800">{inv.dueDate}</span></div>
            <div class="pt-1">
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase {inv.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                STATUS: {inv.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Parties -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pb-4">
        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">[ DITAGIHKAN KEPADA ]</span>
          <div class="font-bold text-base text-slate-900">{inv.customer.name}</div>
          <div class="text-slate-700 font-semibold">{inv.customer.company}</div>
          <div class="text-slate-500">{inv.customer.email} | {inv.customer.phone}</div>
          <div class="text-slate-500">{inv.customer.address}</div>
        </div>
        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">[ DETAIL PROYEK ]</span>
          <div class="font-bold text-sm text-slate-900">{inv.project.title}</div>
          <div class="text-slate-600">Layanan: <strong class="text-slate-900">{inv.project.serviceName}</strong></div>
          <div class="text-slate-600">Paket: <strong class="text-slate-900">{inv.project.packageName}</strong></div>
          <div class="text-slate-600">Metode Bayar: <strong class="text-slate-900">{inv.paymentMethod}</strong></div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th class="py-3 px-4 rounded-l-xl">Deskripsi Layanan & Deliverables</th>
              <th class="py-3 px-4 text-center w-20">Qty</th>
              <th class="py-3 px-4 text-right w-36">Harga Satuan</th>
              <th class="py-3 px-4 text-right w-36 rounded-r-xl">Subtotal</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#each inv.items as item}
              <tr>
                <td class="py-3.5 px-4 space-y-0.5">
                  <div class="font-bold text-slate-900">{item.description}</div>
                  {#if item.details}<p class="text-slate-500 text-[11px]">{item.details}</p>{/if}
                </td>
                <td class="py-3.5 px-4 text-center font-bold text-slate-900">{item.qty || 1}</td>
                <td class="py-3.5 px-4 text-right font-mono">{formatRupiah(item.price)}</td>
                <td class="py-3.5 px-4 text-right font-mono font-bold">{formatRupiah((item.qty || 1) * item.price)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Financial & Signature -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-slate-100 items-start">
        <div class="sm:col-span-7 space-y-3 text-xs">
          <div class="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl text-slate-600 space-y-1">
            <strong class="text-slate-900 block font-semibold">Instruksi Pembayaran:</strong>
            <p>{inv.company.bankInfo}</p>
            <p class="text-[11px] text-slate-500">{inv.project.notes}</p>
          </div>
          <div class="text-[11px] text-slate-400 font-mono">
            Auth ID: {inv.signatory.digitalAuthHash}
          </div>
        </div>

        <div class="sm:col-span-5 space-y-2 text-xs">
          <div class="flex justify-between py-1 text-slate-500">
            <span>Subtotal:</span>
            <span class="font-mono font-semibold text-slate-900">{formatRupiah(inv.financial.subtotal)}</span>
          </div>
          {#if inv.financial.discount > 0}
            <div class="flex justify-between py-1 text-emerald-600 font-semibold">
              <span>Potongan Diskon:</span>
              <span class="font-mono">- {formatRupiah(inv.financial.discount)}</span>
            </div>
          {/if}
          {#if inv.financial.isTaxEnabled}
            <div class="flex justify-between py-1 text-slate-500">
              <span>PPN (11%):</span>
              <span class="font-mono font-semibold text-slate-900">{formatRupiah(inv.financial.tax)}</span>
            </div>
          {/if}
          <div class="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <span class="text-xs uppercase font-bold text-slate-800">Total Tagihan:</span>
            <span class="text-2xl font-bold text-orange-600 font-mono">{formatRupiah(inv.financial.total)}</span>
          </div>
        </div>
      </div>

      <!-- Footer Signatory -->
      <div class="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-end gap-4 text-xs">
        <div class="text-slate-500 text-[11px]">
          <p>Terima kasih atas kepercayaan Anda bermitra dengan Nexa Digital.</p>
          <p>Diterbitkan & dikonfirmasi oleh Staf Operasional Nexa.</p>
        </div>
        <div class="text-right">
          <div class="text-[10px] uppercase font-bold text-slate-400">Penanggung Jawab Proyek (PIC):</div>
          <div class="font-bold text-slate-900 text-sm mt-1">{inv.signatory.employeeName}</div>
          <div class="text-slate-500 text-[11px]">{inv.signatory.employeeTitle}</div>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 2. TEMPLATE: MINIMALIST SCANDINAVIAN MONOKROM                             -->
  <!-- ========================================================================= -->
  {:else if templateId === 'minimalist-scandi'}
    <div class="bg-white border border-slate-300 rounded-none p-10 sm:p-14 text-slate-900 space-y-10 shadow-none font-sans">
      <div class="flex flex-col sm:flex-row justify-between items-start border-b border-black pb-8">
        <div>
          <h1 class="text-4xl font-light tracking-tighter uppercase">FAKTUR</h1>
          <p class="text-xs tracking-widest text-slate-500 uppercase mt-1"># {inv.invoiceNumber}</p>
        </div>
        <div class="text-left sm:text-right text-xs space-y-1 mt-4 sm:mt-0 font-mono">
          <div><span class="text-slate-400">TANGGAL:</span> {inv.issueDate}</div>
          <div><span class="text-slate-400">JATUH TEMPO:</span> {inv.dueDate}</div>
          <div><span class="text-slate-400">STATUS:</span> <strong class="uppercase underline">{inv.paymentStatus}</strong></div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
        <div class="space-y-1">
          <div class="text-[10px] tracking-widest uppercase text-slate-400 font-semibold">DARI</div>
          <div class="font-semibold text-sm">{inv.company.legalName}</div>
          <p class="text-slate-500 leading-relaxed">{inv.company.address}</p>
          <p class="text-slate-500">NPWP: {inv.company.npwp}</p>
        </div>
        <div class="space-y-1">
          <div class="text-[10px] tracking-widest uppercase text-slate-400 font-semibold">KEPADA</div>
          <div class="font-semibold text-sm">{inv.customer.name}</div>
          <div class="text-slate-700">{inv.customer.company}</div>
          <div class="text-slate-500">{inv.customer.email} | {inv.customer.phone}</div>
        </div>
      </div>

      <table class="w-full text-left text-xs border-t border-b border-black">
        <thead>
          <tr class="uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-200">
            <th class="py-3 font-normal">Deskripsi</th>
            <th class="py-3 text-center w-16 font-normal">Qty</th>
            <th class="py-3 text-right w-32 font-normal">Tarif</th>
            <th class="py-3 text-right w-32 font-normal">Jumlah</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-mono">
          {#each inv.items as item}
            <tr>
              <td class="py-4 font-sans font-medium">{item.description}</td>
              <td class="py-4 text-center">{item.qty || 1}</td>
              <td class="py-4 text-right">{formatRupiah(item.price)}</td>
              <td class="py-4 text-right">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex flex-col sm:flex-row justify-between items-start gap-8 pt-2">
        <div class="text-xs text-slate-500 max-w-sm space-y-1">
          <span class="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">REKENING PEMBAYARAN</span>
          <p class="font-mono text-slate-700">{inv.company.bankInfo}</p>
        </div>
        <div class="w-full sm:w-64 space-y-2 text-xs font-mono">
          <div class="flex justify-between">
            <span class="text-slate-400 font-sans">Subtotal</span>
            <span>{formatRupiah(inv.financial.subtotal)}</span>
          </div>
          {#if inv.financial.tax > 0}
            <div class="flex justify-between">
              <span class="text-slate-400 font-sans">PPN (11%)</span>
              <span>{formatRupiah(inv.financial.tax)}</span>
            </div>
          {/if}
          <div class="flex justify-between pt-3 border-t border-black text-base font-bold font-sans">
            <span>TOTAL</span>
            <span class="font-mono">{formatRupiah(inv.financial.total)}</span>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
        <span>PIC: {inv.signatory.employeeName}</span>
        <span class="font-mono text-[10px]">{inv.signatory.digitalAuthHash}</span>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 3. TEMPLATE: CREATIVE STUDIO AGENCY (Dark Header & High Contrast)         -->
  <!-- ========================================================================= -->
  {:else if templateId === 'creative-agency'}
    <div class="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-md">
      <!-- Dark Top Bar -->
      <div class="bg-slate-900 p-8 sm:p-10 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div class="space-y-1">
          <span class="px-2.5 py-1 bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest rounded-md">
            STUDIO DEAL INVOICE
          </span>
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight mt-1">{inv.company.name}</h1>
          <p class="text-xs text-slate-400">{inv.company.legalName} &bull; {inv.company.phone}</p>
        </div>
        <div class="text-left sm:text-right">
          <div class="text-3xl sm:text-4xl font-black text-orange-400 font-mono tracking-tight">{inv.invoiceNumber}</div>
          <div class="text-xs text-slate-400 mt-1">Diterbitkan: {inv.issueDate} | Tempo: {inv.dueDate}</div>
        </div>
      </div>

      <div class="p-8 sm:p-10 space-y-8 text-xs text-slate-800">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
          <div class="space-y-1">
            <span class="text-[10px] uppercase tracking-wider font-black text-orange-600 block">KLIEN TERDAFTAR</span>
            <div class="font-black text-base text-slate-900">{inv.customer.name}</div>
            <div class="font-bold text-slate-700">{inv.customer.company}</div>
            <div class="text-slate-500">{inv.customer.email} &bull; {inv.customer.phone}</div>
          </div>
          <div class="space-y-1">
            <span class="text-[10px] uppercase tracking-wider font-black text-orange-600 block">LINGKUP PEKERJAAN</span>
            <div class="font-bold text-sm text-slate-900">{inv.project.title}</div>
            <div class="text-slate-600">Layanan: <strong class="text-slate-900">{inv.project.serviceName}</strong> ({inv.project.packageName})</div>
            <div class="text-slate-600">Status Pembayaran: <strong class="uppercase text-emerald-600 font-bold">{inv.paymentStatus}</strong></div>
          </div>
        </div>

        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
              <th class="py-3 px-4 rounded-l-xl">Rincian Paket & Modul</th>
              <th class="py-3 px-4 text-center w-20">Kuantitas</th>
              <th class="py-3 px-4 text-right w-36">Tarif</th>
              <th class="py-3 px-4 text-right w-36 rounded-r-xl">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#each inv.items as item}
              <tr>
                <td class="py-4 px-4 font-bold text-slate-900">{item.description}</td>
                <td class="py-4 px-4 text-center font-bold">{item.qty || 1}</td>
                <td class="py-4 px-4 text-right font-mono">{formatRupiah(item.price)}</td>
                <td class="py-4 px-4 text-right font-mono font-black">{formatRupiah((item.qty || 1) * item.price)}</td>
              </tr>
            {/each}
          </tbody>
        </table>

        <div class="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t-2 border-slate-900">
          <div class="text-xs text-slate-500 space-y-1">
            <span class="font-bold text-slate-900 block">Instruksi Pembayaran:</span>
            <p>{inv.company.bankInfo}</p>
          </div>
          <div class="w-full sm:w-72 bg-slate-100 p-4 rounded-2xl border border-slate-300 space-y-2">
            <div class="flex justify-between font-medium"><span>Subtotal:</span><span class="font-mono">{formatRupiah(inv.financial.subtotal)}</span></div>
            {#if inv.financial.tax > 0}
              <div class="flex justify-between font-medium"><span>PPN 11%:</span><span class="font-mono">{formatRupiah(inv.financial.tax)}</span></div>
            {/if}
            <div class="flex justify-between pt-2 border-t border-slate-300 font-black text-lg text-slate-900">
              <span>TOTAL DEAL:</span>
              <span class="text-orange-600 font-mono">{formatRupiah(inv.financial.total)}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-4 text-[11px] text-slate-500">
          <span>Staf Penanggung Jawab: <strong class="text-slate-900">{inv.signatory.employeeName}</strong></span>
          <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">DIGITAL DEAL VERIFIED</span>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 4. TEMPLATE: TECH & SAAS INDIGO MODERN                                    -->
  <!-- ========================================================================= -->
  {:else if templateId === 'tech-saas'}
    <div class="bg-white border border-indigo-200 rounded-3xl p-8 sm:p-12 text-slate-800 space-y-8 shadow-sm">
      <div class="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[11px] uppercase tracking-widest text-indigo-200 font-mono">CLOUD SAAS & SERVICE INVOICE</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight">{inv.project.title}</h1>
          <p class="text-xs text-indigo-300">{inv.company.legalName} &bull; {inv.company.email}</p>
        </div>
        <div class="text-left sm:text-right font-mono">
          <div class="text-xl sm:text-2xl font-bold text-indigo-200">{inv.invoiceNumber}</div>
          <div class="text-xs text-indigo-300">Tempo: {inv.dueDate}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div class="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
          <span class="text-[10px] uppercase font-bold text-indigo-600">ORGANISASI KLIEN</span>
          <div class="font-bold text-slate-900 text-sm">{inv.customer.company}</div>
          <div class="text-slate-700">{inv.customer.name} &bull; {inv.customer.email}</div>
          <div class="text-slate-500">{inv.customer.phone}</div>
        </div>
        <div class="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
          <span class="text-[10px] uppercase font-bold text-indigo-600">METODE PEMBAYARAN</span>
          <div class="font-bold text-slate-900 text-sm">{inv.paymentMethod}</div>
          <div class="text-slate-600">Status: <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">{inv.paymentStatus}</span></div>
          <div class="text-slate-500 font-mono text-[10px]">Tx ID: NXD-TX-{inv.orderId}</div>
        </div>
      </div>

      <table class="w-full text-left text-xs border border-indigo-100 rounded-xl overflow-hidden">
        <thead class="bg-indigo-50 text-indigo-900 font-bold uppercase text-[10px]">
          <tr>
            <th class="py-3 px-4">Modul / Service Endpoint</th>
            <th class="py-3 px-4 text-center w-20">Siklus</th>
            <th class="py-3 px-4 text-right w-36">Harga</th>
            <th class="py-3 px-4 text-right w-36">Subtotal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-indigo-50 font-mono text-xs">
          {#each inv.items as item}
            <tr>
              <td class="py-3.5 px-4 font-sans font-semibold text-slate-900">{item.description}</td>
              <td class="py-3.5 px-4 text-center font-sans text-slate-500">{item.qty || 1}x</td>
              <td class="py-3.5 px-4 text-right">{formatRupiah(item.price)}</td>
              <td class="py-3.5 px-4 text-right font-bold text-indigo-950">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex justify-between items-end pt-4 border-t border-slate-100 text-xs">
        <div class="space-y-1 text-slate-500">
          <p class="font-semibold text-slate-700">Payment Gateway / Bank Transfer:</p>
          <p class="font-mono text-indigo-900">{inv.company.bankInfo}</p>
        </div>
        <div class="w-64 space-y-1.5 text-right font-mono">
          <div class="text-xs text-slate-500">Subtotal: {formatRupiah(inv.financial.subtotal)}</div>
          {#if inv.financial.tax > 0}
            <div class="text-xs text-slate-500">PPN (11%): {formatRupiah(inv.financial.tax)}</div>
          {/if}
          <div class="text-xl font-bold text-indigo-700 font-sans pt-1 border-t border-indigo-200">
            {formatRupiah(inv.financial.total)}
          </div>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 5. TEMPLATE: LUXURY EXECUTIVE SERIF                                       -->
  <!-- ========================================================================= -->
  {:else if templateId === 'luxury-executive'}
    <div class="bg-[#faf8f5] border-2 border-amber-900/20 rounded-2xl p-10 sm:p-14 text-slate-900 space-y-8 font-serif shadow-sm">
      <div class="text-center space-y-2 border-b-2 border-amber-900/10 pb-8">
        <div class="text-xs uppercase tracking-widest text-amber-800 font-sans font-bold">Surat Tagihan Resmi / Official Bill</div>
        <h1 class="text-3xl sm:text-4xl font-normal tracking-wide text-amber-950">{inv.company.legalName}</h1>
        <p class="text-xs text-slate-500 font-sans">{inv.company.address} &bull; NPWP: {inv.company.npwp}</p>
        <div class="pt-2 text-xs font-sans text-amber-900 font-semibold">Nomor Berkas: {inv.invoiceNumber}</div>
      </div>

      <div class="grid grid-cols-2 gap-8 text-xs font-sans">
        <div class="space-y-1">
          <span class="text-[10px] uppercase font-bold text-amber-800">PIHAK PENERIMA TAGIHAN</span>
          <div class="font-serif text-base font-bold text-slate-900">{inv.customer.name}</div>
          <div class="text-slate-700 font-semibold">{inv.customer.company}</div>
          <div class="text-slate-500">{inv.customer.email} &bull; {inv.customer.phone}</div>
        </div>
        <div class="text-right space-y-1">
          <span class="text-[10px] uppercase font-bold text-amber-800">KETENTUAN WAKTU</span>
          <div>Tanggal Terbit: <strong class="text-slate-900">{inv.issueDate}</strong></div>
          <div>Tanggal Jatuh Tempo: <strong class="text-slate-900">{inv.dueDate}</strong></div>
          <div>Status Transaksi: <span class="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">{inv.paymentStatus}</span></div>
        </div>
      </div>

      <table class="w-full text-left text-xs font-sans border-t-2 border-b-2 border-amber-900/20">
        <thead>
          <tr class="uppercase text-[11px] text-amber-900 border-b border-amber-900/10 font-bold">
            <th class="py-3">Spesifikasi Layanan & Karya</th>
            <th class="py-3 text-center w-16">Unit</th>
            <th class="py-3 text-right w-36">Harga Satuan</th>
            <th class="py-3 text-right w-36">Jumlah</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-amber-900/5">
          {#each inv.items as item}
            <tr>
              <td class="py-4 font-serif text-sm font-semibold">{item.description}</td>
              <td class="py-4 text-center">{item.qty || 1}</td>
              <td class="py-4 text-right font-mono">{formatRupiah(item.price)}</td>
              <td class="py-4 text-right font-mono font-bold">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex justify-between items-start gap-8 font-sans text-xs">
        <div class="space-y-1 text-slate-600 max-w-sm">
          <span class="font-bold text-amber-900 block">Keterangan Otorisasi:</span>
          <p class="text-[11px]">{inv.project.notes}</p>
          <p class="font-mono text-[10px] text-slate-400 mt-2">{inv.signatory.digitalAuthHash}</p>
        </div>
        <div class="w-64 space-y-2 text-right">
          <div class="flex justify-between"><span>Subtotal:</span><span class="font-mono">{formatRupiah(inv.financial.subtotal)}</span></div>
          {#if inv.financial.tax > 0}
            <div class="flex justify-between"><span>PPN (11%):</span><span class="font-mono">{formatRupiah(inv.financial.tax)}</span></div>
          {/if}
          <div class="flex justify-between pt-2 border-t-2 border-amber-900/20 text-lg font-serif font-bold text-amber-950">
            <span>Total Tagihan:</span>
            <span class="font-mono">{formatRupiah(inv.financial.total)}</span>
          </div>
        </div>
      </div>

      <div class="pt-8 border-t border-amber-900/10 flex justify-between items-center text-xs font-sans text-slate-500">
        <div>Nexa Digital Executive Billing</div>
        <div>Ditandatangani secara digital oleh: <strong class="text-slate-900">{inv.signatory.employeeName}</strong></div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 6. TEMPLATE: COMPACT QUICK RECEIPT                                        -->
  <!-- ========================================================================= -->
  {:else if templateId === 'compact-receipt'}
    <div class="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 text-slate-800 space-y-5 text-xs max-w-2xl mx-auto shadow-sm">
      <div class="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <div class="font-bold text-base text-slate-900">STRUK TRANSAKSI & INVOICE</div>
          <div class="text-[11px] text-slate-500">{inv.company.legalName}</div>
        </div>
        <div class="text-right font-mono">
          <span class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">{inv.invoiceNumber}</span>
          <div class="text-[10px] text-slate-400 mt-1">{inv.issueDate}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-[11px] p-3 bg-slate-50 rounded-lg">
        <div>
          <span class="text-slate-400 block font-semibold">KLIEN:</span>
          <strong>{inv.customer.name}</strong> ({inv.customer.company})
        </div>
        <div class="text-right">
          <span class="text-slate-400 block font-semibold">STATUS:</span>
          <strong class="text-emerald-700 uppercase">{inv.paymentStatus} ({inv.paymentMethod})</strong>
        </div>
      </div>

      <div class="space-y-2 border-b border-slate-200 pb-4">
        {#each inv.items as item}
          <div class="flex justify-between items-start">
            <div>
              <div class="font-semibold text-slate-900">{item.description}</div>
              <div class="text-[10px] text-slate-500">{item.qty || 1} x {formatRupiah(item.price)}</div>
            </div>
            <div class="font-mono font-bold">{formatRupiah((item.qty || 1) * item.price)}</div>
          </div>
        {/each}
      </div>

      <div class="space-y-1.5 font-mono text-[11px]">
        <div class="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatRupiah(inv.financial.subtotal)}</span></div>
        {#if inv.financial.tax > 0}
          <div class="flex justify-between text-slate-500"><span>PPN 11%</span><span>{formatRupiah(inv.financial.tax)}</span></div>
        {/if}
        <div class="flex justify-between text-sm font-bold font-sans text-slate-900 pt-2 border-t border-slate-200">
          <span>TOTAL DIBAYAR</span>
          <span class="text-blue-600 font-mono">{formatRupiah(inv.financial.total)}</span>
        </div>
      </div>

      <div class="pt-3 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
        Kasir / Pegawai PIC: {inv.signatory.employeeName} &bull; Terima kasih atas kerja samanya!
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 7. TEMPLATE: BOLD GEOMETRIC GRID                                          -->
  <!-- ========================================================================= -->
  {:else if templateId === 'bold-geometric'}
    <div class="bg-white border-4 border-slate-900 rounded-none p-8 sm:p-12 text-slate-900 space-y-6">
      <div class="border-b-4 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <span class="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-1">LEMBAR PERPAJAKAN & FAKTUR</span>
          <h1 class="text-4xl font-black uppercase tracking-tight mt-2">{inv.company.name}</h1>
          <div class="text-xs font-semibold">{inv.company.legalName} &bull; {inv.company.address}</div>
        </div>
        <div class="text-left sm:text-right">
          <div class="text-3xl font-black font-mono">{inv.invoiceNumber}</div>
          <div class="text-xs font-bold uppercase mt-1">Status: {inv.paymentStatus}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="border-2 border-slate-900 p-4 space-y-1 text-xs">
          <div class="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 inline-block">DATA KLIEN</div>
          <div class="font-black text-sm">{inv.customer.name}</div>
          <div class="font-bold">{inv.customer.company}</div>
          <div class="text-slate-600">{inv.customer.email} | {inv.customer.phone}</div>
        </div>
        <div class="border-2 border-slate-900 p-4 space-y-1 text-xs">
          <div class="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 inline-block">KESEPAKATAN DEAL</div>
          <div class="font-black text-sm">{inv.project.title}</div>
          <div class="text-slate-600">Penerbit: {inv.signatory.employeeName}</div>
          <div class="text-slate-600">Batas Waktu: {inv.dueDate}</div>
        </div>
      </div>

      <table class="w-full text-left text-xs border-2 border-slate-900">
        <thead class="bg-slate-900 text-white uppercase text-[11px] font-black">
          <tr>
            <th class="p-3">Item Layanan</th>
            <th class="p-3 text-center w-20">Qty</th>
            <th class="p-3 text-right w-36">Harga</th>
            <th class="p-3 text-right w-36">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y-2 divide-slate-900 font-bold">
          {#each inv.items as item}
            <tr>
              <td class="p-3">{item.description}</td>
              <td class="p-3 text-center">{item.qty || 1}</td>
              <td class="p-3 text-right font-mono">{formatRupiah(item.price)}</td>
              <td class="p-3 text-right font-mono font-black">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex justify-between items-end border-t-4 border-slate-900 pt-4 text-xs font-bold">
        <div>Rekening: {inv.company.bankInfo}</div>
        <div class="text-right text-2xl font-black font-mono">
          {formatRupiah(inv.financial.total)}
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 8. TEMPLATE: FRESH EMERALD DIGITAL                                        -->
  <!-- ========================================================================= -->
  {:else if templateId === 'fresh-emerald'}
    <div class="bg-white border-2 border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-slate-800 space-y-8 shadow-sm">
      <div class="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-emerald-100 pb-6">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">NX</div>
            <span class="text-lg font-bold text-emerald-950">Nexa Digital &bull; Green Studio</span>
          </div>
          <p class="text-xs text-slate-500">{inv.company.legalName}</p>
        </div>
        <div class="text-left sm:text-right space-y-1">
          <span class="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">LUNAS / VERIFIED</span>
          <div class="text-2xl font-bold text-emerald-900 font-mono mt-1">{inv.invoiceNumber}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div class="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
          <span class="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">MITRA KLIEN</span>
          <div class="font-bold text-slate-900 text-sm">{inv.customer.name}</div>
          <div class="text-slate-600">{inv.customer.company}</div>
          <div class="text-slate-500">{inv.customer.email}</div>
        </div>
        <div class="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1">
          <span class="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">DESKRIPSI PROYEK</span>
          <div class="font-bold text-slate-900 text-sm">{inv.project.title}</div>
          <div class="text-slate-600">Disepakati oleh PIC: {inv.signatory.employeeName}</div>
          <div class="text-slate-500">Jatuh Tempo: {inv.dueDate}</div>
        </div>
      </div>

      <table class="w-full text-left text-xs">
        <thead>
          <tr class="bg-emerald-600 text-white uppercase text-[10px] font-bold">
            <th class="py-3 px-4 rounded-l-xl">Rincian Layanan</th>
            <th class="py-3 px-4 text-center w-20">Volume</th>
            <th class="py-3 px-4 text-right w-36">Harga Satuan</th>
            <th class="py-3 px-4 text-right w-36 rounded-r-xl">Subtotal</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-emerald-50 text-xs">
          {#each inv.items as item}
            <tr>
              <td class="py-4 px-4 font-bold text-slate-900">{item.description}</td>
              <td class="py-4 px-4 text-center">{item.qty || 1}</td>
              <td class="py-4 px-4 text-right font-mono">{formatRupiah(item.price)}</td>
              <td class="py-4 px-4 text-right font-mono font-bold text-emerald-900">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex justify-between items-center pt-6 border-t border-emerald-100 text-xs">
        <div class="text-slate-500 text-[11px]">
          Faktur ramah lingkungan diterbitkan secara digital &bull; PT Nexa Digital Solusindo
        </div>
        <div class="text-right">
          <span class="text-xs uppercase text-slate-400 font-bold block">TOTAL PEMBAYARAN:</span>
          <span class="text-2xl font-bold text-emerald-700 font-mono">{formatRupiah(inv.financial.total)}</span>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 9. TEMPLATE: RETRO MONOSPACE ENGINEERING                                  -->
  <!-- ========================================================================= -->
  {:else if templateId === 'retro-mono'}
    <div class="bg-slate-950 text-sky-300 font-mono p-8 sm:p-12 rounded-2xl border-2 border-sky-500/40 text-xs space-y-6 shadow-2xl">
      <div class="border-b border-dashed border-sky-600 pb-4 flex justify-between items-start">
        <div>
          <pre class="text-[10px] text-sky-400 leading-tight">
 _  _ ____ _  _ ____   ___  _ ____ _ ___ ____ _    
 |\ | |___  \/  |__|   |  \ | | __ |  |  |__| |    
 | \| |___ _/\_ |  |   |__/ | |__] |  |  |  | |___ 
          </pre>
          <div class="text-[11px] text-sky-500 mt-1">ENGINEERING & DEVELOPMENT INVOICE TERMINAL</div>
        </div>
        <div class="text-right">
          <div class="text-xl font-bold text-sky-400">{inv.invoiceNumber}</div>
          <div class="text-slate-400 text-[10px]">TIME: {inv.issueDate} // DUE: {inv.dueDate}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-[11px] border border-sky-900 p-4 bg-sky-950/40 rounded-lg">
        <div>
          <span class="text-sky-500 block">CLIENT_ID:</span>
          <strong class="text-white">{inv.customer.name}</strong><br/>
          {inv.customer.company}<br/>
          {inv.customer.email}
        </div>
        <div class="text-right">
          <span class="text-sky-500 block">TRANSACTION_STATUS:</span>
          <span class="text-emerald-400 font-bold">[{inv.paymentStatus}]</span><br/>
          PIC_EMPLOYEE: {inv.signatory.employeeName}<br/>
          AUTH_CODE: {inv.signatory.digitalAuthHash.slice(0, 16)}...
        </div>
      </div>

      <div class="space-y-2 border-t border-b border-dashed border-sky-800 py-4">
        <div class="flex justify-between text-sky-500 text-[10px] pb-1 border-b border-sky-900">
          <span>TASK / MODULE / DELIVERABLE</span>
          <span>QTY</span>
          <span>AMOUNT</span>
        </div>
        {#each inv.items as item}
          <div class="flex justify-between items-center text-white py-1">
            <span class="max-w-md">{item.description}</span>
            <span>{item.qty || 1}</span>
            <span class="text-sky-300 font-bold">{formatRupiah((item.qty || 1) * item.price)}</span>
          </div>
        {/each}
      </div>

      <div class="flex justify-between items-center pt-2">
        <span class="text-slate-400 text-[10px]">SYSTEM VERIFICATION COMPLETE. NO MANUAL SIGNATURE REQUIRED.</span>
        <div class="text-right">
          <span class="text-sky-400 text-xs block">TOTAL_PAYABLE:</span>
          <span class="text-2xl font-bold text-white tracking-wider">{formatRupiah(inv.financial.total)}</span>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 10. TEMPLATE: WARM SUNSET HORIZON                                         -->
  <!-- ========================================================================= -->
  {:else if templateId === 'horizon-gradient'}
    <div class="bg-white rounded-3xl overflow-hidden border border-rose-200 shadow-md space-y-6">
      <div class="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 p-8 sm:p-10 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span class="px-2.5 py-1 bg-white/20 backdrop-blur-md text-[10px] uppercase font-bold rounded-full">OFFICIAL DEAL BILL</span>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight mt-1">{inv.company.name}</h1>
          <p class="text-xs text-orange-100">{inv.company.legalName}</p>
        </div>
        <div class="text-left sm:text-right">
          <div class="text-2xl sm:text-3xl font-black font-mono">{inv.invoiceNumber}</div>
          <div class="text-xs text-rose-100 mt-1">Jatuh Tempo: {inv.dueDate}</div>
        </div>
      </div>

      <div class="p-8 sm:p-10 space-y-6 text-xs text-slate-800">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-rose-50/40 rounded-2xl border border-rose-100">
          <div>
            <span class="text-[10px] uppercase font-bold text-rose-600 block">Klien Terdaftar:</span>
            <div class="font-bold text-sm text-slate-900 mt-0.5">{inv.customer.name}</div>
            <div class="text-slate-600">{inv.customer.company}</div>
            <div class="text-slate-500">{inv.customer.email}</div>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold text-rose-600 block">Judul Pekerjaan:</span>
            <div class="font-bold text-sm text-slate-900 mt-0.5">{inv.project.title}</div>
            <div class="text-slate-600">Disepakati oleh Pegawai: {inv.signatory.employeeName}</div>
          </div>
        </div>

        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-rose-200 text-rose-900 font-bold uppercase text-[10px]">
              <th class="py-3 px-2">Deskripsi Layanan</th>
              <th class="py-3 px-2 text-center w-16">Unit</th>
              <th class="py-3 px-2 text-right w-36">Harga</th>
              <th class="py-3 px-2 text-right w-36">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rose-50">
            {#each inv.items as item}
              <tr>
                <td class="py-3 px-2 font-semibold text-slate-900">{item.description}</td>
                <td class="py-3 px-2 text-center">{item.qty || 1}</td>
                <td class="py-3 px-2 text-right font-mono">{formatRupiah(item.price)}</td>
                <td class="py-3 px-2 text-right font-mono font-bold text-rose-950">{formatRupiah((item.qty || 1) * item.price)}</td>
              </tr>
            {/each}
          </tbody>
        </table>

        <div class="flex justify-between items-center pt-4 border-t border-rose-100">
          <div class="text-xs text-slate-500">
            Terima kasih! Pembayaran via {inv.company.bankInfo}
          </div>
          <div class="text-right">
            <span class="text-[11px] uppercase font-bold text-slate-400 block">TOTAL TAGIHAN:</span>
            <span class="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent font-mono">
              {formatRupiah(inv.financial.total)}
            </span>
          </div>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 11. TEMPLATE: DARK CARBON VIP EDITION                                     -->
  <!-- ========================================================================= -->
  {:else if templateId === 'dark-carbon'}
    <div class="bg-slate-900 text-slate-100 p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-xl space-y-8 text-xs">
      <div class="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-6">
        <div>
          <span class="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px] uppercase rounded-full">
            VIP EXECUTIVE DEAL
          </span>
          <h1 class="text-2xl font-bold tracking-tight text-white mt-2">{inv.company.name}</h1>
          <div class="text-slate-400 text-[11px]">{inv.company.legalName}</div>
        </div>
        <div class="text-left sm:text-right font-mono">
          <div class="text-2xl font-bold text-amber-400">{inv.invoiceNumber}</div>
          <div class="text-slate-400 text-[11px]">DATE: {inv.issueDate} &bull; DUE: {inv.dueDate}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-950/60 rounded-2xl border border-slate-800">
        <div>
          <span class="text-[10px] uppercase font-bold text-amber-400">PENERIMA:</span>
          <div class="font-bold text-sm text-white mt-1">{inv.customer.name}</div>
          <div class="text-slate-300">{inv.customer.company}</div>
          <div class="text-slate-400">{inv.customer.email}</div>
        </div>
        <div class="text-right">
          <span class="text-[10px] uppercase font-bold text-amber-400">PROYEK:</span>
          <div class="font-bold text-sm text-white mt-1">{inv.project.title}</div>
          <div class="text-slate-300">Disetujui: {inv.signatory.employeeName}</div>
        </div>
      </div>

      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
            <th class="py-3 px-3">Item Layanan</th>
            <th class="py-3 px-3 text-center w-16">Qty</th>
            <th class="py-3 px-3 text-right w-36">Harga</th>
            <th class="py-3 px-3 text-right w-36">Jumlah</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/60 font-mono">
          {#each inv.items as item}
            <tr>
              <td class="py-3 px-3 font-sans text-white font-medium">{item.description}</td>
              <td class="py-3 px-3 text-center">{item.qty || 1}</td>
              <td class="py-3 px-3 text-right text-slate-300">{formatRupiah(item.price)}</td>
              <td class="py-3 px-3 text-right font-bold text-amber-300">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex justify-between items-center pt-6 border-t border-slate-800">
        <div class="text-slate-400 text-[11px]">
          Digital Verification ID: <span class="font-mono text-amber-400">{inv.signatory.digitalAuthHash.slice(0, 20)}...</span>
        </div>
        <div class="text-right">
          <span class="text-[10px] uppercase text-slate-400 font-bold block">TOTAL BIAYA:</span>
          <span class="text-2xl font-bold text-amber-400 font-mono">{formatRupiah(inv.financial.total)}</span>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 12. TEMPLATE: BALANCED SPLIT DOUBLE-COLUMN                                -->
  <!-- ========================================================================= -->
  {:else if templateId === 'split-column'}
    <div class="bg-white border border-teal-200 rounded-3xl p-8 sm:p-12 text-slate-800 space-y-8 shadow-sm">
      <div class="flex justify-between items-center border-b border-teal-100 pb-4">
        <div class="text-teal-900 font-bold text-xl">{inv.company.name}</div>
        <span class="px-3 py-1 bg-teal-100 text-teal-800 font-bold rounded-lg text-xs font-mono">{inv.invoiceNumber}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs py-2 divide-y sm:divide-y-0 sm:divide-x divide-teal-100">
        <div class="space-y-2">
          <span class="text-[10px] font-bold uppercase text-teal-600 block tracking-wider">ENTITAS PENERBIT</span>
          <div class="font-bold text-base text-slate-900">{inv.company.legalName}</div>
          <p class="text-slate-500 leading-relaxed">{inv.company.address}</p>
          <p class="text-slate-500">NPWP: {inv.company.npwp}</p>
          <p class="text-slate-500">Email: {inv.company.email}</p>
        </div>
        <div class="space-y-2 sm:pl-8 pt-4 sm:pt-0">
          <span class="text-[10px] font-bold uppercase text-teal-600 block tracking-wider">ENTITAS KLIEN</span>
          <div class="font-bold text-base text-slate-900">{inv.customer.name}</div>
          <div class="font-semibold text-slate-700">{inv.customer.company}</div>
          <p class="text-slate-500">{inv.customer.email} &bull; {inv.customer.phone}</p>
          <div class="pt-2 text-slate-600">
            Jatuh Tempo: <strong class="text-slate-900">{inv.dueDate}</strong>
          </div>
        </div>
      </div>

      <table class="w-full text-left text-xs border border-teal-100 rounded-xl overflow-hidden">
        <thead class="bg-teal-50 text-teal-900 font-bold uppercase text-[10px]">
          <tr>
            <th class="p-3">Deskripsi</th>
            <th class="p-3 text-center w-16">Qty</th>
            <th class="p-3 text-right w-36">Harga Satuan</th>
            <th class="p-3 text-right w-36">Jumlah</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-teal-50">
          {#each inv.items as item}
            <tr>
              <td class="p-3 font-semibold text-slate-900">{item.description}</td>
              <td class="p-3 text-center">{item.qty || 1}</td>
              <td class="p-3 text-right font-mono">{formatRupiah(item.price)}</td>
              <td class="p-3 text-right font-mono font-bold text-teal-950">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex justify-between items-center pt-4 border-t border-teal-100 text-xs">
        <div class="text-slate-500">PIC Pegawai: <strong class="text-slate-900">{inv.signatory.employeeName}</strong></div>
        <div class="text-right">
          <span class="text-[10px] uppercase text-slate-400 font-bold block">TOTAL DIBAYARKAN:</span>
          <span class="text-2xl font-bold text-teal-700 font-mono">{formatRupiah(inv.financial.total)}</span>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 13. TEMPLATE: FAKTUR PAJAK STANDAR B2B ENTERPRISE                         -->
  <!-- ========================================================================= -->
  {:else if templateId === 'enterprise-tax'}
    <div class="bg-white border-2 border-red-800/30 rounded-2xl p-8 sm:p-12 text-slate-800 space-y-6 text-xs">
      <div class="border-b-2 border-red-800 pb-4 text-center space-y-1">
        <h1 class="text-2xl font-bold uppercase tracking-wider text-red-900">FAKTUR PAJAK & TAGIHAN B2B</h1>
        <p class="text-[11px] text-slate-500">KODE & NOMOR SERI: <strong class="font-mono text-slate-900">{inv.invoiceNumber}</strong></p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 border border-slate-300 rounded-xl">
        <div class="space-y-1">
          <span class="font-bold text-red-800 block text-[10px] uppercase">PENGUSAHA KENA PAJAK (PENJUAL):</span>
          <div class="font-bold text-slate-900">{inv.company.legalName}</div>
          <div>NPWP: <strong class="font-mono">{inv.company.npwp}</strong></div>
          <div class="text-slate-500">{inv.company.address}</div>
        </div>
        <div class="space-y-1">
          <span class="font-bold text-red-800 block text-[10px] uppercase">PEMBELI BARANG / PENERIMA JASA:</span>
          <div class="font-bold text-slate-900">{inv.customer.company}</div>
          <div>Nama PIC: {inv.customer.name}</div>
          <div class="text-slate-500">{inv.customer.email} | {inv.customer.phone}</div>
        </div>
      </div>

      <table class="w-full text-left border border-slate-300 text-xs">
        <thead class="bg-red-50 text-red-950 uppercase text-[10px] font-bold border-b border-slate-300">
          <tr>
            <th class="p-2.5">Nama Barang Kena Pajak / Jasa Kena Pajak</th>
            <th class="p-2.5 text-center w-16">Qty</th>
            <th class="p-2.5 text-right w-36">Harga Jual</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          {#each inv.items as item}
            <tr>
              <td class="p-2.5">{item.description}</td>
              <td class="p-2.5 text-center">{item.qty || 1}</td>
              <td class="p-2.5 text-right font-mono">{formatRupiah(item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="grid grid-cols-2 gap-6 pt-2">
        <div class="border border-slate-300 p-4 rounded-xl flex items-center justify-center text-center text-slate-400 text-[10px]">
          <div>
            <div class="font-bold text-slate-700 uppercase">METERAI ELEKTRONIK</div>
            <div>VALIDATED B2B TAX DOCUMENT</div>
          </div>
        </div>
        <div class="space-y-1 font-mono text-right text-xs">
          <div class="flex justify-between"><span>Harga Jual / Penggantian:</span><span>{formatRupiah(inv.financial.subtotal)}</span></div>
          <div class="flex justify-between"><span>PPN 11%:</span><span>{formatRupiah(inv.financial.tax)}</span></div>
          <div class="flex justify-between font-bold text-base font-sans text-red-900 pt-2 border-t border-slate-300">
            <span>TOTAL TAGIHAN:</span>
            <span class="font-mono">{formatRupiah(inv.financial.total)}</span>
          </div>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 14. TEMPLATE: SOFT PASTEL CREATIVE BOUTIQUE                               -->
  <!-- ========================================================================= -->
  {:else if templateId === 'pastel-friendly'}
    <div class="bg-white border border-purple-200 rounded-3xl p-8 sm:p-12 text-slate-800 space-y-8 shadow-sm">
      <div class="flex justify-between items-center border-b border-purple-100 pb-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">NX</div>
          <div>
            <div class="font-bold text-lg text-slate-900">{inv.company.name} Studio</div>
            <div class="text-xs text-purple-600">Boutique Digital & Creative Project</div>
          </div>
        </div>
        <div class="text-right">
          <span class="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs">{inv.invoiceNumber}</span>
          <div class="text-[11px] text-slate-400 mt-1">{inv.issueDate}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6 text-xs">
        <div class="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
          <span class="text-[10px] uppercase font-bold text-purple-600 block">DITAGIHKAN KE:</span>
          <div class="font-bold text-slate-900 mt-1">{inv.customer.name}</div>
          <div class="text-slate-600">{inv.customer.company}</div>
        </div>
        <div class="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
          <span class="text-[10px] uppercase font-bold text-purple-600 block">PROYEK:</span>
          <div class="font-bold text-slate-900 mt-1">{inv.project.title}</div>
          <div class="text-slate-600">PIC: {inv.signatory.employeeName}</div>
        </div>
      </div>

      <div class="space-y-3">
        {#each inv.items as item}
          <div class="p-4 bg-slate-50 rounded-2xl flex justify-between items-center text-xs">
            <div>
              <div class="font-bold text-slate-900">{item.description}</div>
              <div class="text-slate-500 text-[11px]">{item.details}</div>
            </div>
            <div class="font-mono font-bold text-purple-900 text-sm">{formatRupiah((item.qty || 1) * item.price)}</div>
          </div>
        {/each}
      </div>

      <div class="flex justify-between items-center pt-4 border-t border-purple-100 text-xs">
        <div class="text-slate-500">Kenyamanan proyek digital Anda adalah prioritas kami.</div>
        <div class="text-right">
          <span class="text-[10px] uppercase text-slate-400 font-bold block">TOTAL DEAL:</span>
          <span class="text-2xl font-bold text-purple-700 font-mono">{formatRupiah(inv.financial.total)}</span>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 15. TEMPLATE: BLUEPRINT TECHNICAL ARCHITECTURAL                           -->
  <!-- ========================================================================= -->
  {:else if templateId === 'blueprint-tech'}
    <div class="bg-blue-950 text-blue-100 p-8 sm:p-12 rounded-3xl border-2 border-blue-600/50 space-y-6 text-xs font-mono shadow-xl">
      <div class="border-b-2 border-blue-500 pb-4 flex justify-between items-start">
        <div>
          <span class="bg-blue-600 text-white text-[9px] px-2 py-0.5 uppercase font-bold">SOFTWARE ARCHITECTURE BLUEPRINT</span>
          <h1 class="text-2xl font-bold text-white mt-1">NEXA DIGITAL SPECIFICATION</h1>
          <div class="text-[10px] text-blue-300">REV 2026.04 &bull; DOC ID: {inv.invoiceNumber}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-blue-300">STATUS: APPROVED DEAL</div>
          <div class="text-white font-bold text-sm mt-0.5">{inv.orderId}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 border border-blue-800 p-4 rounded-xl bg-blue-900/30 text-[11px]">
        <div>
          <span class="text-blue-400 block font-bold">[CLIENT_METRICS]</span>
          NAME: {inv.customer.name}<br/>
          ORG: {inv.customer.company}<br/>
          CONTACT: {inv.customer.phone}
        </div>
        <div class="text-right">
          <span class="text-blue-400 block font-bold">[ENGINEERING_SCHEDULE]</span>
          START: {inv.issueDate}<br/>
          DEADLINE: {inv.dueDate}<br/>
          LEAD_ENG: {inv.signatory.employeeName}
        </div>
      </div>

      <table class="w-full text-left text-xs border border-blue-800">
        <thead class="bg-blue-900 text-blue-200 text-[10px] uppercase">
          <tr>
            <th class="p-2.5">DELIVERABLE COMPONENT</th>
            <th class="p-2.5 text-center w-16">UNITS</th>
            <th class="p-2.5 text-right w-36">COST ALLOCATION</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-blue-900">
          {#each inv.items as item}
            <tr>
              <td class="p-2.5 text-white">{item.description}</td>
              <td class="p-2.5 text-center">{item.qty || 1}</td>
              <td class="p-2.5 text-right font-bold text-cyan-300">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex justify-between items-center pt-4 border-t border-blue-800">
        <div class="text-[10px] text-blue-400">HASH: {inv.signatory.digitalAuthHash}</div>
        <div class="text-right">
          <span class="text-[10px] text-blue-400 block">TOTAL ALLOCATED BUDGET:</span>
          <span class="text-2xl font-bold text-cyan-300">{formatRupiah(inv.financial.total)}</span>
        </div>
      </div>
    </div>

  <!-- ========================================================================= -->
  <!-- 16. TEMPLATE: CONTEMPORARY CORAL & NAVY                                   -->
  <!-- ========================================================================= -->
  {:else}
    <div class="bg-white border-t-8 border-rose-600 rounded-3xl p-8 sm:p-12 text-slate-800 space-y-8 shadow-sm border-x border-b border-slate-200">
      <div class="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-6">
        <div>
          <span class="text-rose-600 font-bold text-xs uppercase tracking-wider block">STUDIO PROJECT DEAL</span>
          <h1 class="text-3xl font-bold text-slate-900 mt-1">{inv.company.name}</h1>
          <div class="text-xs text-slate-500">{inv.company.legalName}</div>
        </div>
        <div class="text-left sm:text-right font-mono">
          <span class="px-3 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg text-sm">{inv.invoiceNumber}</span>
          <div class="text-xs text-slate-400 mt-1">{inv.issueDate} &bull; Tempo: {inv.dueDate}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6 text-xs">
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">PENERIMA INVOICE:</span>
          <div class="font-bold text-slate-900 text-sm mt-0.5">{inv.customer.name}</div>
          <div class="text-slate-600">{inv.customer.company}</div>
        </div>
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">KESEPAKATAN:</span>
          <div class="font-bold text-slate-900 text-sm mt-0.5">{inv.project.title}</div>
          <div class="text-slate-600">Disepakati oleh: {inv.signatory.employeeName}</div>
        </div>
      </div>

      <table class="w-full text-left text-xs">
        <thead>
          <tr class="bg-slate-900 text-white uppercase text-[10px] font-bold">
            <th class="p-3 rounded-l-xl">Layanan / Deliverables</th>
            <th class="p-3 text-center w-16">Qty</th>
            <th class="p-3 text-right w-36">Harga Satuan</th>
            <th class="p-3 text-right w-36 rounded-r-xl">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#each inv.items as item}
            <tr>
              <td class="p-3 font-semibold text-slate-900">{item.description}</td>
              <td class="p-3 text-center">{item.qty || 1}</td>
              <td class="p-3 text-right font-mono">{formatRupiah(item.price)}</td>
              <td class="p-3 text-right font-mono font-bold text-rose-600">{formatRupiah((item.qty || 1) * item.price)}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="flex justify-between items-center pt-4 border-t border-slate-100 text-xs">
        <div class="text-slate-500">
          Pembayaran telah dikonfirmasi dan diverifikasi oleh staf operasional Nexa.
        </div>
        <div class="text-right">
          <span class="text-[10px] uppercase text-slate-400 font-bold block">TOTAL KESEPAKATAN:</span>
          <span class="text-2xl font-bold text-rose-600 font-mono">{formatRupiah(inv.financial.total)}</span>
        </div>
      </div>
    </div>
  {/if}

</div>
