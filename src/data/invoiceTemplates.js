/**
 * Katalog Resmi 16 Template Invoice untuk Nexa Digital
 * Dapat digunakan dan diisi oleh Pegawai / Staf Operasional untuk menerbitkan
 * faktur kesepakatan (deal) projek dengan klien.
 */

export const INVOICE_TEMPLATES = [
  {
    id: "modern-corporate",
    name: "Modern Corporate Nexa",
    category: "Corporate",
    badge: "Standar Resmi",
    description: "Desain korporat bersih dengan aksen brand orange dan slate profesional, stempel otorisasi digital lengkap.",
    accentColor: "#ea580c",
    previewBg: "bg-orange-50 border-orange-200 text-orange-700",
    headerStyle: "corporate",
    layout: "standard"
  },
  {
    id: "minimalist-scandi",
    name: "Minimalist Scandinavian",
    category: "Minimalis",
    badge: "Monokrom",
    description: "Tipografi elegan dengan ruang putih luas, garis tipis berpresisi tinggi, dan palet monokrom abadi.",
    accentColor: "#0f172a",
    previewBg: "bg-slate-100 border-slate-300 text-slate-800",
    headerStyle: "minimalist",
    layout: "clean"
  },
  {
    id: "creative-agency",
    name: "Creative Studio Agency",
    category: "Kreatif",
    badge: "Bold & Vibrant",
    description: "Header kontras hitam pekat dengan sorotan oranye neon cerah, cocok untuk agensi desain dan produk digital.",
    accentColor: "#f97316",
    previewBg: "bg-zinc-900 border-zinc-700 text-orange-400",
    headerStyle: "dark-header",
    layout: "creative"
  },
  {
    id: "tech-saas",
    name: "Tech & SaaS Horizon",
    category: "Teknologi",
    badge: "Indigo Modern",
    description: "Gaya platform SaaS modern dengan aksen gradasi nila/ungu dan pill status teknologi terintegrasi.",
    accentColor: "#6366f1",
    previewBg: "bg-indigo-50 border-indigo-200 text-indigo-700",
    headerStyle: "gradient-indigo",
    layout: "saas"
  },
  {
    id: "luxury-executive",
    name: "Luxury Executive Serif",
    category: "Eksklusif",
    badge: "Klasik & Mewah",
    description: "Tipografi serif klasik bermartabat dengan sentuhan lis emas/perunggu dan cap pengesahan formal.",
    accentColor: "#b45309",
    previewBg: "bg-amber-50 border-amber-200 text-amber-800",
    headerStyle: "serif-luxury",
    layout: "formal"
  },
  {
    id: "compact-receipt",
    name: "Compact Quick Delivery",
    category: "Ringkas",
    badge: "Hemat Ruang",
    description: "Tata letak rapat yang efisien untuk serah terima sprint cepat tanpa mengorbankan rincian biaya penting.",
    accentColor: "#2563eb",
    previewBg: "bg-blue-50 border-blue-200 text-blue-700",
    headerStyle: "compact",
    layout: "receipt"
  },
  {
    id: "bold-geometric",
    name: "Bold Geometric Grid",
    category: "Modern",
    badge: "Grid Modular",
    description: "Batas garis tebal 2px dengan partisi modular tegas untuk memisahkan data klien, scope, dan hitungan keuangan.",
    accentColor: "#1e293b",
    previewBg: "bg-slate-100 border-slate-400 text-slate-900 font-bold",
    headerStyle: "geometric",
    layout: "grid-cards"
  },
  {
    id: "fresh-emerald",
    name: "Fresh Emerald Digital",
    category: "Layanan",
    badge: "Eco & Clean",
    description: "Nuansa hijau zamrud segar dengan aura kesuksesan finansial, lunas, dan hubungan kemitraan yang harmonis.",
    accentColor: "#059669",
    previewBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
    headerStyle: "emerald",
    layout: "fresh"
  },
  {
    id: "retro-mono",
    name: "Retro Monospace Engineering",
    category: "Developer",
    badge: "Terminal / Code",
    description: "Tipografi font mesin ketik/kode program (monospace) dengan pembatas garis putus-putus ala rekap terminal hacker.",
    accentColor: "#0284c7",
    previewBg: "bg-sky-50 border-sky-200 text-sky-800 font-mono",
    headerStyle: "monospace",
    layout: "terminal"
  },
  {
    id: "horizon-gradient",
    name: "Warm Sunset Horizon",
    category: "Kreatif",
    badge: "Vibrant Gradient",
    description: "Banner gradasi hangat oranye ke merah muda lembut, memancarkan kesan ramah, bersahabat, dan inovatif.",
    accentColor: "#ec4899",
    previewBg: "bg-gradient-to-r from-orange-400 to-rose-400 text-white",
    headerStyle: "sunset-banner",
    layout: "banner"
  },
  {
    id: "dark-carbon",
    name: "Dark Carbon VIP Edition",
    category: "Eksklusif",
    badge: "Dark Mode",
    description: "Palet gelap arang karbon mewah dengan teks kontras tinggi, ditujukan bagi klien korporat level enterprise.",
    accentColor: "#f59e0b",
    previewBg: "bg-slate-900 border-slate-700 text-amber-300",
    headerStyle: "dark-carbon",
    layout: "dark"
  },
  {
    id: "split-column",
    name: "Balanced Split Column",
    category: "Corporate",
    badge: "Dual Panel",
    description: "Dua kolom sejajar proporsional untuk membandingkan entitas penerbit Nexa dan data identitas klien bisnis.",
    accentColor: "#0d9488",
    previewBg: "bg-teal-50 border-teal-200 text-teal-800",
    headerStyle: "split",
    layout: "dual-col"
  },
  {
    id: "enterprise-tax",
    name: "Faktur Pajak B2B Enterprise",
    category: "Formal",
    badge: "Standar Pajak",
    description: "Format resmi perpajakan korporat dengan rincian NPWP kedua belah pihak, klausul hukum, dan kotak meterai elektronik.",
    accentColor: "#dc2626",
    previewBg: "bg-rose-50 border-rose-200 text-rose-800",
    headerStyle: "formal-tax",
    layout: "tax-official"
  },
  {
    id: "pastel-friendly",
    name: "Pastel Creative Boutique",
    category: "Kreatif",
    badge: "Friendly Rounded",
    description: "Sudut-sudut membulat lembut dengan aksen pastel hangat, menciptakan pengalaman invoice yang menyenangkan.",
    accentColor: "#8b5cf6",
    previewBg: "bg-purple-50 border-purple-200 text-purple-700",
    headerStyle: "pastel",
    layout: "boutique"
  },
  {
    id: "blueprint-tech",
    name: "Blueprint Architectural",
    category: "Teknologi",
    badge: "Engineering Spec",
    description: "Aksen biru cetak biru (blueprint) teknik dengan rincian arsitektur software dan deliverable teknikal.",
    accentColor: "#1d4ed8",
    previewBg: "bg-blue-900 border-blue-700 text-blue-200",
    headerStyle: "blueprint",
    layout: "blueprint"
  },
  {
    id: "coral-navy",
    name: "Contemporary Coral & Navy",
    category: "Modern",
    badge: "Dwi Warna",
    description: "Kombinasi warna navy solid yang terpercaya dipadukan dengan aksen koral yang menyegarkan.",
    accentColor: "#f43f5e",
    previewBg: "bg-slate-900 border-rose-400 text-rose-400",
    headerStyle: "coral-navy",
    layout: "modern-contrast"
  }
];

/**
 * Normalisasi data untuk template invoice
 */
export function buildInvoiceDataFromOrder(order, customOverrides = {}) {
  if (!order) return null;

  const today = new Date().toISOString().split('T')[0];
  const items = customOverrides.items || [
    {
      description: `${order.serviceName || 'Layanan Digital'} — ${order.packageName || 'Paket Standar'}`,
      details: order.requirements?.title || order.requirements?.description || 'Pengembangan produk digital sesuai kesepakatan scope deal.',
      qty: 1,
      price: Number(order.price) || 0
    }
  ];

  const subtotal = items.reduce((acc, item) => acc + (Number(item.qty) || 1) * (Number(item.price) || 0), 0);
  const discount = Number(customOverrides.discount !== undefined ? customOverrides.discount : (order.discount || 0));
  const taxable = Math.max(0, subtotal - discount);
  const isTaxEnabled = customOverrides.isTaxEnabled !== undefined ? customOverrides.isTaxEnabled : true;
  const tax = isTaxEnabled ? Math.round(taxable * 0.11) : 0;
  const total = taxable + tax;

  return {
    invoiceNumber: customOverrides.invoiceNumber || order.invoiceNumber || `INV-${new Date().getFullYear()}-${String(order.id || '001').replace(/\D/g, '').slice(-4) || '1001'}`,
    orderId: order.id || 'NXD-2026-DEAL',
    issueDate: customOverrides.issueDate || order.orderDate || today,
    dueDate: customOverrides.dueDate || order.deadline || today,
    paymentStatus: customOverrides.paymentStatus || order.paymentStatus || 'PAID',
    paymentMethod: customOverrides.paymentMethod || order.paymentMethod || 'Bank Transfer BCA (VA)',
    
    // Customer Info
    customer: {
      name: customOverrides.customerName || order.customer?.name || order.customerName || 'Klien Nexa',
      company: customOverrides.customerCompany || order.customer?.company || order.customerCompany || 'Entitas Personal / Bisnis',
      email: customOverrides.customerEmail || order.customer?.email || order.customerEmail || 'klien@example.com',
      phone: customOverrides.customerPhone || order.customer?.phone || order.customerPhone || '+62 812-0000-0000',
      address: customOverrides.customerAddress || 'Jakarta, Indonesia'
    },

    // Project Info
    project: {
      title: customOverrides.projectTitle || order.requirements?.title || `Proyek ${order.serviceName || 'Digital'}`,
      serviceName: order.serviceName || 'Pengembangan Digital',
      packageName: order.packageName || 'Paket Kustom',
      notes: customOverrides.notes || order.requirements?.notes || 'Pembayaran disepakati sesuai deliverables serah terima proyek.'
    },

    // Financial
    items,
    financial: {
      subtotal,
      discount,
      taxable,
      tax,
      isTaxEnabled,
      total
    },

    // Employee & Company Signatory
    signatory: {
      employeeName: customOverrides.employeeName || order.assignedTeam || 'Bagas Pratama',
      employeeTitle: customOverrides.employeeTitle || 'Project Lead & Staff Operasional',
      signDate: customOverrides.signDate || today,
      digitalAuthHash: `SHA256-NXD-${order.id || 'DEAL'}-VERIFIED-PEG`
    },

    // Company Official
    company: {
      name: 'Nexa Digital',
      legalName: 'PT Nexa Digital Solusindo',
      npwp: '01.234.567.8-012.000',
      address: 'Menara Cyber 2 Lantai 14, Jl. H.R. Rasuna Said, Jakarta Selatan 12950',
      email: 'operasional@nexadigital.id',
      phone: '+62 812-8921-3344',
      bankInfo: 'Bank Central Asia (BCA) — Rek: 800-1234-567 a/n PT Nexa Digital Solusindo'
    }
  };
}
