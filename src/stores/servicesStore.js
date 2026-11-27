import { derived, writable } from 'svelte/store';
import { services as baseServices, featuredPackages } from '../data/services';
import { products } from './adminStore';

/**
 * Pemetaan icon berdasarkan kategori produk
 */
function getCategoryIcon(category = '') {
  const cat = category.toLowerCase();
  if (cat.includes('design') || cat.includes('ui') || cat.includes('ux')) return 'palette';
  if (cat.includes('mobile') || cat.includes('flutter') || cat.includes('android') || cat.includes('ios')) return 'smartphone';
  if (cat.includes('devops') || cat.includes('cloud') || cat.includes('server')) return 'server';
  if (cat.includes('growth') || cat.includes('seo') || cat.includes('marketing')) return 'trending-up';
  if (cat.includes('ai') || cat.includes('bot') || cat.includes('intel')) return 'sparkles';
  if (cat.includes('code') || cat.includes('front') || cat.includes('back') || cat.includes('web')) return 'code';
  return 'package';
}

/**
 * Mengonversi format produk dari Admin Dashboard menjadi format Service lengkap
 * yang kompatibel dengan ServiceCard, ServiceDetailView, CheckoutView, dll.
 */
export function convertProductToService(prod) {
  const price = Number(prod.price) || 1000000;
  const deliverables = Array.isArray(prod.deliverables)
    ? prod.deliverables
    : (prod.deliverables || '').split('\n').filter((s) => s.trim().length > 0);

  const deliveryTime = prod.sla || (prod.billingCycle ? `Siklus ${prod.billingCycle}` : '3 - 7 Hari Kerja');
  const icon = prod.icon || getCategoryIcon(prod.category);

  // Buat 3 paket (Basic, Standard, Premium) secara cerdas agar halaman detail & checkout lengkap
  const packages = [
    {
      id: 'basic',
      name: 'Basic Starter',
      price: Math.round(price * 0.7),
      deliveryTime: deliveryTime,
      revisions: '2x Revisi',
      screens: 'Modul Esensial',
      features: deliverables.slice(0, 3).length > 0 ? deliverables.slice(0, 3) : ['Fitur dasar layanan', 'Setup awal', 'Dukungan standar'],
      notIncluded: ['Dukungan prioritas 24/7', 'Kustomisasi tingkat lanjut'],
      isRecommended: false
    },
    {
      id: 'standard',
      name: `Standard (${prod.billingCycle || 'Retainer'})`,
      price: price,
      deliveryTime: deliveryTime,
      revisions: 'Revisi Berkala',
      screens: 'Cakupan Penuh',
      features: deliverables.length > 0 ? deliverables : ['Paket lengkap layanan', 'Dukungan reguler', 'Dokumentasi handoff'],
      notIncluded: [],
      isRecommended: true
    },
    {
      id: 'premium',
      name: 'Premium Enterprise SLA',
      price: Math.round(price * 1.5),
      deliveryTime: 'Prioritas Tertinggi',
      revisions: 'Revisi Tanpa Batas',
      screens: 'Dukungan Penuh & Dedikasi',
      features: [
        ...(deliverables.length > 0 ? deliverables : ['Layanan lengkap']),
        'Dedicated Tech Lead & Fast Response < 1 Jam',
        'Garansi SLA Uptime & Asistensi 24/7'
      ],
      notIncluded: [],
      isRecommended: false
    }
  ];

  return {
    id: prod.id,
    name: prod.name,
    category: prod.category || 'Development',
    tagline: prod.tagline || `Solusi rekayasa ${prod.name} oleh PT Nexa Digital Solusindo.`,
    description:
      prod.description ||
      prod.tagline ||
      `Layanan profesional ${prod.name} dirancang khusus untuk mempercepat pertumbuhan bisnis Anda dengan standar rekayasa modern, kode bersih, dan jaminan mutu SLA resmi studio.`,
    startingPrice: price,
    estimatedDelivery: deliveryTime,
    icon: icon,
    packagesCount: 3,
    deliverables: deliverables,
    billingType: prod.billingType || 'subscription',
    billingCycle: prod.billingCycle || 'Bulanan',
    status: prod.status || 'active',
    process: [
      { step: '01', title: 'Diskusi & Briefing', desc: 'Membedah kebutuhan teknis, sasaran proyek, dan ekspektasi deliverables.' },
      { step: '02', title: 'Penyusunan Arsitektur & Rencana', desc: 'Menyusun alur kerja spesifik, skema database/desain, dan jadwal sprint.' },
      { step: '03', title: 'Fase Pengerjaan & Pengembangan', desc: 'Tim spesialis Nexa Digital mengeksekusi modul dengan standar industri.' },
      { step: '04', title: 'Sesi Review & Evaluasi', desc: 'Presentasi hasil dan penyempurnaan berdasarkan masukan langsung klien.' },
      { step: '05', title: 'Quality Assurance & Testing', desc: 'Uji performa, kompatibilitas perangkat, dan keamanan menyeluruh.' },
      { step: '06', title: 'Serah Terima & Handoff', desc: 'Pelimpahan aset master, repository, dan dokumentasi operasional.' },
      { step: '07', title: 'Dukungan & SLA Berjalan', desc: 'Pendampingan pasca-rilis dan asistensi teknis berkelanjutan.' }
    ],
    packages: packages,
    faqs: [
      {
        q: `Bagaimana alur pengerjaan ${prod.name}?`,
        a: 'Setelah pesanan diverifikasi, tim Project Manager kami akan menginisiasi workspace pelacakan sprint dan briefing teknis bersama Anda.'
      },
      {
        q: 'Apakah biaya sudah termasuk PPN 11%?',
        a: 'Ya, seluruh tagihan dan faktur yang diterbitkan PT Nexa Digital Solusindo menyertakan e-Faktur resmi dengan PPN 11% yang sah untuk pembukuan akuntansi.'
      },
      {
        q: 'Apakah bisa melakukan penyesuaian kebutuhan khusus (kustom)?',
        a: 'Tentu bisa. Anda dapat berdiskusi dengan tim kami melalui formulir kontak atau WhatsApp untuk mendapatkan proposal penawaran kustom.'
      }
    ],
    reviews: [
      {
        name: 'Mitra Bisnis Nexa',
        company: 'Klien Korporat',
        rating: 5,
        date: 'Oktober 2026',
        comment: `Layanan ${prod.name} dieksekusi dengan profesionalisme tinggi dan respons komunikasi yang sangat sigap.`
      }
    ]
  };
}

/**
 * Reactive Store: allServices
 * Menggabungkan katalog layanan dasar (baseServices) dengan produk-produk baru
 * yang ditambahkan oleh admin melalui Admin Dashboard.
 */
export const allServices = derived([products], ([$products]) => {
  // 1. Ambil seluruh base services
  const baseList = [...baseServices];
  const baseIds = new Set(baseList.map((s) => s.id));

  // 2. Cari produk dari adminStore yang merupakan produk baru atau update
  const adminActiveProducts = ($products || []).filter((p) => p.status === 'active');

  const customServices = [];
  adminActiveProducts.forEach((p) => {
    if (!baseIds.has(p.id)) {
      // Ini produk baru yang ditambahkan admin!
      customServices.push(convertProductToService(p));
    } else {
      // Jika produk dasar diubah harganya / statusnya di admin
      const idx = baseList.findIndex((s) => s.id === p.id);
      if (idx !== -1) {
        baseList[idx] = {
          ...baseList[idx],
          name: p.name,
          category: p.category,
          startingPrice: Number(p.price) || baseList[idx].startingPrice,
          tagline: p.tagline || baseList[idx].tagline,
          estimatedDelivery: p.sla || baseList[idx].estimatedDelivery
        };
      }
    }
  });

  // Produk baru yang baru saja ditambahkan akan ditampilkan di bagian paling atas
  return [...customServices, ...baseList];
});

// Re-export featuredPackages untuk keperluan HomeView
export { featuredPackages };
