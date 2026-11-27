<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\PortfolioProject;
use App\Models\Service;
use App\Models\ServicePackage;
use Illuminate\Database\Seeder;

class NexaDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. SEED SERVICES & PACKAGES
        $servicesData = [
            [
                'id' => 'ui-ux-design',
                'name' => 'UI/UX Design',
                'category' => 'Design',
                'tagline' => 'Desain antarmuka yang bersih, intuitif, dan mudah dinavigasi untuk web & mobile.',
                'description' => 'Layanan desain UI/UX berbasis riset pengguna nyata untuk memastikan aplikasi dan website Anda memiliki konversi tinggi, alur penggunaan yang mulus, dan identitas visual yang profesional.',
                'starting_price' => 750000,
                'estimated_delivery' => '3 - 7 Hari Kerja',
                'icon' => 'palette',
                'packages_count' => 3,
                'deliverables' => [
                    'Figma Source File (.fig) tersusun rapi & autolayout',
                    'Interactive High-Fidelity Prototype (dapat diklik & diuji)',
                    'Design System & Style Guide (Warna, Tipografi, Komponen UI)',
                    'Export Assets Siap Koding (SVG, PNG @2x @3x, Icon pack)',
                    'User Flow Chart & Wireframe Low-Fidelity',
                    'Dokumentasi Handoff untuk Developer',
                ],
                'process' => [
                    ['step' => '01', 'title' => 'Diskusi Kebutuhan & Riset', 'desc' => 'Membedah tujuan bisnis, target pengguna, dan referensi desain.'],
                    ['step' => '02', 'title' => 'Penyusunan User Flow', 'desc' => 'Memetakan alur interaksi pengguna dari awal hingga konversi.'],
                    ['step' => '03', 'title' => 'Visual Design High-Fidelity', 'desc' => 'Menerapkan warna, tipografi, dan hierarki visual detail.'],
                    ['step' => '04', 'title' => 'Final Handoff & Assets', 'desc' => 'Serah terima master file Figma dan panduan styling.'],
                ],
                'packages' => [
                    [
                        'package_code' => 'basic',
                        'name' => 'Basic (MVP UI)',
                        'price' => 750000,
                        'delivery_time' => '3 Hari Kerja',
                        'revisions' => '2x Revisi Minor',
                        'screens' => 'Hingga 3 Layar Utama',
                        'features' => ['Maksimal 3 halaman responsif', 'Wireframe & High-Fidelity UI', 'File Master Figma terstruktur', 'Asset Icon & Gambar standar'],
                        'not_included' => ['Interactive Prototype kompleks', 'Design System lengkap'],
                        'is_recommended' => false,
                    ],
                    [
                        'package_code' => 'standard',
                        'name' => 'Standard (Hingga 7 Layar Responsif)',
                        'price' => 1500000,
                        'delivery_time' => '5 Hari Kerja',
                        'revisions' => '3x Revisi',
                        'screens' => 'Hingga 7 Layar Responsif',
                        'features' => ['Maksimal 7 halaman responsif', 'User Flow & Wireframe lengkap', 'High-Fidelity UI Design modern', 'Interactive Clickable Prototype', 'Mini Design System & Style Guide'],
                        'not_included' => ['Custom Ilustration 3D kompleks'],
                        'is_recommended' => true,
                    ],
                    [
                        'package_code' => 'enterprise',
                        'name' => 'Enterprise (Full Product Design)',
                        'price' => 2500000,
                        'delivery_time' => '7 Hari Kerja',
                        'revisions' => 'Unlimited (Mayor & Minor)',
                        'screens' => 'Hingga 15 Layar + Variasi',
                        'features' => ['Hingga 15 halaman web / aplikasi', 'Full Design System Tokenized', 'Advanced Micro-interactions', 'Priority Developer Handoff', 'Sesi Walkthrough Desain 1-on-1'],
                        'not_included' => [],
                        'is_recommended' => false,
                    ],
                ],
            ],
            [
                'id' => 'front-end-development',
                'name' => 'Front End Development',
                'category' => 'Engineering',
                'tagline' => 'Pengembangan antarmuka web modern, ultra responsif, dan interaktif.',
                'description' => 'Menerjemahkan rancangan desain Figma Anda ke dalam kode HTML, CSS, dan JavaScript/Svelte/React yang rapi, cepat, dan SEO-friendly.',
                'starting_price' => 1500000,
                'estimated_delivery' => '5 - 12 Hari Kerja',
                'icon' => 'code',
                'packages_count' => 3,
                'deliverables' => [
                    'Source code frontend terstruktur (Git Repository)',
                    'Desain 100% responsif untuk Mobile, Tablet, dan Desktop',
                    'Integrasi RESTful API & state management',
                    'Optimasi Core Web Vitals (LCP < 1.2s, Skor 95+)',
                ],
                'process' => [
                    ['step' => '01', 'title' => 'Analisis Spesifikasi', 'desc' => 'Meninjau arsitektur komponen dan state data yang dibutuhkan.'],
                    ['step' => '02', 'title' => 'Pengembangan Komponen', 'desc' => 'Coding antarmuka modular dengan animasi mulus.'],
                    ['step' => '03', 'title' => 'Uji Responsif & Performa', 'desc' => 'Memastikan tampilan konsisten di seluruh browser dan layar.'],
                ],
                'packages' => [
                    [
                        'package_code' => 'basic',
                        'name' => 'Basic (Single Page / Landing)',
                        'price' => 1500000,
                        'delivery_time' => '5 Hari Kerja',
                        'revisions' => '2x Revisi',
                        'screens' => '1 Halaman Landing Page',
                        'features' => ['Single page modern responsif', 'Tailwind CSS / Vanilla CSS', 'Form kontak interaktif', 'Lighthouse Score 90+'],
                        'not_included' => ['Multi-page routing', 'Sistem autentikasi'],
                        'is_recommended' => false,
                    ],
                    [
                        'package_code' => 'standard',
                        'name' => 'Standard (5 Halaman Web Responsif)',
                        'price' => 2750000,
                        'delivery_time' => '8 Hari Kerja',
                        'revisions' => '3x Revisi',
                        'screens' => '5 Halaman Dinamis',
                        'features' => ['Multi-page router (Svelte/Vite)', 'Animasi mikro & interaksi halus', 'Integrasi API eksternal', 'Dukungan dark mode & SEO'],
                        'not_included' => ['Admin Dashboard multi-level'],
                        'is_recommended' => true,
                    ],
                    [
                        'package_code' => 'enterprise',
                        'name' => 'Enterprise (Complex Web Application)',
                        'price' => 4500000,
                        'delivery_time' => '12 Hari Kerja',
                        'revisions' => 'Bebas Revisi dalam masa garansi',
                        'screens' => 'Halaman Kompleks + Dashboard',
                        'features' => ['Arsitektur modular scalable', 'State management terpusat', 'Full PWA Support (Offline Mode)', 'Garansi SLA 30 Hari'],
                        'not_included' => [],
                        'is_recommended' => false,
                    ],
                ],
            ],
            [
                'id' => 'backend-development',
                'name' => 'Backend Development',
                'category' => 'Engineering',
                'tagline' => 'Arsitektur server andal, RESTful API cepat, dan perancangan basis data terstruktur.',
                'description' => 'Membangun logika bisnis aplikasi, otentikasi aman JWT/OAuth, manajemen basis data relasional, dan integrasi payment gateway pihak ketiga.',
                'starting_price' => 2000000,
                'estimated_delivery' => '6 - 15 Hari Kerja',
                'icon' => 'database',
                'packages_count' => 3,
                'deliverables' => [
                    'Source code backend (Laravel / Node.js)',
                    'Dokumentasi API lengkap (Swagger / Postman Collection)',
                    'Skrip migrasi database & data seeder otomatis',
                    'Konfigurasi Docker & panduan deployment server',
                ],
                'process' => [
                    ['step' => '01', 'title' => 'Skema Basis Data', 'desc' => 'Normalisasi tabel relasional dan perancangan indeks performa.'],
                    ['step' => '02', 'title' => 'Endpoint API', 'desc' => 'Implementasi CRUD, validasi payload, dan otorisasi role.'],
                    ['step' => '03', 'title' => 'Testing & Deployment', 'desc' => 'Uji beban request dan panduan setting VPS.'],
                ],
                'packages' => [
                    [
                        'package_code' => 'basic',
                        'name' => 'Basic (REST API Inti)',
                        'price' => 2000000,
                        'delivery_time' => '6 Hari Kerja',
                        'revisions' => '2x Revisi',
                        'screens' => 'Hingga 5 Endpoint Inti',
                        'features' => ['5 Endpoint CRUD utama', 'Database MySQL / PostgreSQL', 'Validasi request input', 'Postman Collection'],
                        'not_included' => ['Otentikasi multi-role', 'Payment gateway'],
                        'is_recommended' => false,
                    ],
                    [
                        'package_code' => 'standard',
                        'name' => 'Standard (Full Authentication & API)',
                        'price' => 3500000,
                        'delivery_time' => '10 Hari Kerja',
                        'revisions' => '3x Revisi',
                        'screens' => 'Hingga 12 Endpoint + Auth',
                        'features' => ['Autentikasi JWT / Laravel Sanctum', 'Role-based Access Control (RBAC)', 'Integrasi Payment Gateway', 'Rate limiting & caching'],
                        'not_included' => ['Microservices cluster'],
                        'is_recommended' => true,
                    ],
                    [
                        'package_code' => 'enterprise',
                        'name' => 'Enterprise (Scalable Server Architecture)',
                        'price' => 6000000,
                        'delivery_time' => '15 Hari Kerja',
                        'revisions' => 'Pendampingan Deployment Penuh',
                        'screens' => 'Unlimited Endpoints',
                        'features' => ['Arsitektur modular enterprise', 'Background job queue & workers', 'Docker containerization', 'Garansi bugfix & SLA 60 hari'],
                        'not_included' => [],
                        'is_recommended' => false,
                    ],
                ],
            ],
            [
                'id' => 'mobile-app-development',
                'name' => 'Mobile App Development',
                'category' => 'Engineering',
                'tagline' => 'Aplikasi seluler Android & iOS dengan performa native dan visual modern.',
                'description' => 'Membangun aplikasi mobile menggunakan Flutter untuk efisiensi biaya satu basis kode yang berjalan mulus di platform Android dan iOS.',
                'starting_price' => 3000000,
                'estimated_delivery' => '8 - 21 Hari Kerja',
                'icon' => 'smartphone',
                'packages_count' => 3,
                'deliverables' => [
                    'File Build APK & Android App Bundle (AAB)',
                    'Source code Flutter terdokumentasi',
                    'Integrasi Push Notification Firebase',
                    'Bantuan submission ke Google Play Store',
                ],
                'process' => [
                    ['step' => '01', 'title' => 'Setup Arsitektur', 'desc' => 'Penyiapan state management Flutter dan koneksi API.'],
                    ['step' => '02', 'title' => 'Pengembangan Fitur', 'desc' => 'Pengkodean navigasi, storage lokal, dan antarmuka.'],
                    ['step' => '03', 'title' => 'Build & Release', 'desc' => 'Kompilasi paket produksi dan pengujian pada perangkat nyata.'],
                ],
                'packages' => [
                    [
                        'package_code' => 'basic',
                        'name' => 'Basic (MVP Mobile)',
                        'price' => 3000000,
                        'delivery_time' => '8 Hari Kerja',
                        'revisions' => '2x Revisi',
                        'screens' => 'Hingga 5 Layar Mobile',
                        'features' => ['5 Layar aplikasi Flutter', 'Build release APK Android', 'Integrasi API REST standar', 'Penyimpanan lokal SQLite/Prefs'],
                        'not_included' => ['Push notifications Firebase'],
                        'is_recommended' => false,
                    ],
                    [
                        'package_code' => 'standard',
                        'name' => 'Standard (Ready-to-Publish App)',
                        'price' => 5500000,
                        'delivery_time' => '14 Hari Kerja',
                        'revisions' => '3x Revisi',
                        'screens' => 'Hingga 10 Layar Interaktif',
                        'features' => ['Dukungan Android & iOS', 'Firebase Auth & Cloud Messaging', 'Integrasi kamera / galeri / GPS', 'Bantuan upload ke Play Console'],
                        'not_included' => ['In-app purchase subscription'],
                        'is_recommended' => true,
                    ],
                    [
                        'package_code' => 'enterprise',
                        'name' => 'Enterprise (Full-Featured Ecosystem)',
                        'price' => 9000000,
                        'delivery_time' => '21 Hari Kerja',
                        'revisions' => 'Garansi & Revisi Intensif',
                        'screens' => 'Hingga 20 Layar Kompleks',
                        'features' => ['Offline-first sync capability', 'Real-time WebSocket & maps tracking', 'Security hardening & obfuscation', 'Garansi perawatan 45 hari'],
                        'not_included' => [],
                        'is_recommended' => false,
                    ],
                ],
            ],
            [
                'id' => 'digital-marketing',
                'name' => 'Digital Marketing & Growth',
                'category' => 'Growth',
                'tagline' => 'Akselerasi visibilitas brand, optimasi SEO on-page, dan campaign berkinerja tinggi.',
                'description' => 'Strategi pemasaran digital terukur untuk meningkatkan traffic organik website, konversi penjualan, dan visibilitas bisnis di mesin pencari.',
                'starting_price' => 1200000,
                'estimated_delivery' => '4 - 10 Hari Kerja',
                'icon' => 'trending-up',
                'packages_count' => 3,
                'deliverables' => [
                    'Laporan Audit SEO & Rekomendasi Kata Kunci',
                    'Setup Google Analytics 4 & Google Search Console',
                    'Panduan Konten Pemasaran & Copywriting Iklan',
                    'Laporan Kinerja Bulanan & Analisis ROI',
                ],
                'process' => [
                    ['step' => '01', 'title' => 'Audit Brand & Kompetitor', 'desc' => 'Meneliti celah pasar dan kata kunci dengan konversi terbaik.'],
                    ['step' => '02', 'title' => 'Implementasi SEO On-Page', 'desc' => 'Optimasi tag metadata, schema markup, dan struktur URL.'],
                    ['step' => '03', 'title' => 'Evaluasi & Scaling', 'desc' => 'Meninjau traffic insight dan rekomendasi perbaikan kontinu.'],
                ],
                'packages' => [
                    [
                        'package_code' => 'basic',
                        'name' => 'Basic (Audit SEO & Setup GA4)',
                        'price' => 1200000,
                        'delivery_time' => '4 Hari Kerja',
                        'revisions' => '1x Sesi Diskusi',
                        'screens' => 'Audit 1 Domain',
                        'features' => ['Audit menyeluruh 1 situs web', 'Pemasangan GA4 & Search Console', 'Riset 15 keyword potensial', 'Dokumen laporan PDF'],
                        'not_included' => ['Eksekusi penulisan artikel bulanan'],
                        'is_recommended' => false,
                    ],
                    [
                        'package_code' => 'standard',
                        'name' => 'Standard (SEO On-Page & Copywriting)',
                        'price' => 2200000,
                        'delivery_time' => '7 Hari Kerja',
                        'revisions' => '2x Sesi Konsultasi',
                        'screens' => 'Optimasi 5 Halaman Inti',
                        'features' => ['Optimasi teknikal 5 halaman utama', 'Penyusunan 3 artikel pilar SEO', 'Setup Google Business Profile', 'Monitoring peringkat selama 30 hari'],
                        'not_included' => ['Budget iklan berbayar (Ads Spend)'],
                        'is_recommended' => true,
                    ],
                    [
                        'package_code' => 'enterprise',
                        'name' => 'Enterprise (Full-Funnel Growth Campaign)',
                        'price' => 3800000,
                        'delivery_time' => '10 Hari Kerja',
                        'revisions' => 'Konsultasi Mingguan Rutin',
                        'screens' => 'Comprehensive Growth Strategy',
                        'features' => ['Strategi integrasi multi-kanal', 'Setup Meta Ads & Google Ads Pixel', '8 Artikel SEO ramah konversi', 'Dashboard analitik real-time kustom'],
                        'not_included' => [],
                        'is_recommended' => false,
                    ],
                ],
            ],
        ];

        foreach ($servicesData as $item) {
            $packages = $item['packages'];
            unset($item['packages']);

            $service = Service::updateOrCreate(['id' => $item['id']], $item);

            foreach ($packages as $pkg) {
                ServicePackage::updateOrCreate(
                    [
                        'service_id' => $service->id,
                        'package_code' => $pkg['package_code'],
                    ],
                    $pkg
                );
            }
        }

        // 2. SEED INITIAL ORDERS & INVOICES
        $ordersData = [
            [
                'id' => 'NXD-2026-081',
                'invoice_number' => 'INV-2026-00001',
                'service_id' => 'ui-ux-design',
                'service_name' => 'UI/UX Design',
                'package_id' => 'standard',
                'package_name' => 'Standard (Hingga 7 Layar Responsif)',
                'customer_name' => 'Rian Hidayat',
                'customer_email' => 'rian.hidayat@startupkita.id',
                'customer_phone' => '+62 812-9988-7766',
                'customer_company' => 'PT Logistik Kita Bersama',
                'order_date' => '2026-09-20',
                'deadline' => '2026-09-27',
                'price' => 1500000,
                'tax' => 165000,
                'discount' => 0,
                'total' => 1665000,
                'payment_method' => 'Bank Transfer BCA',
                'payment_status' => 'PAID',
                'project_status' => 'Sedang Dikerjakan',
                'progress' => 65,
                'assigned_team' => 'Dimas Arya (Lead UI/UX)',
                'requirements' => [
                    'title' => 'Redesain Aplikasi Mobile Kurir On-Demand',
                    'description' => 'Membutuhkan 7 layar utama untuk aplikasi kurir lokal: Splash, Login OTP, Beranda Peta, Pilih Layanan, Konfirmasi Ongkir, Pelacakan Driver Real-time, dan Riwayat Pesanan.',
                    'referenceUrl' => 'https://dribbble.com/tags/logistics-app',
                    'notes' => 'Mohon diperhatikan kontras warna agar mudah terbaca driver di luar ruangan saat siang hari.',
                ],
                'timeline' => [
                    ['stage' => 'Pesanan Diterima', 'date' => '20 Sep 2026, 09:30 WIB', 'status' => 'completed', 'desc' => 'Pembayaran terverifikasi otomatis via BCA Virtual Account.'],
                    ['stage' => 'Kebutuhan Proyek Dikirim', 'date' => '20 Sep 2026, 11:15 WIB', 'status' => 'completed', 'desc' => 'Klien mengirimkan dokumen brief dan referensi desain.'],
                    ['stage' => 'Proyek Dimulai', 'date' => '21 Sep 2026, 08:00 WIB', 'status' => 'completed', 'desc' => 'Kick-off meeting internal dan penyusunan user flow.'],
                    ['stage' => 'Pengembangan & Desain', 'date' => '22 Sep 2026, 14:00 WIB', 'status' => 'current', 'desc' => 'Eksplorasi wireframe dan visual high-fidelity di Figma (Progress 65%).'],
                    ['stage' => 'Review & Revisi', 'date' => 'Estimasi 25 Sep 2026', 'status' => 'pending', 'desc' => 'Sesi peninjauan oleh klien dan pengajuan catatan perbaikan.'],
                    ['stage' => 'Final Review', 'date' => 'Estimasi 26 Sep 2026', 'status' => 'pending', 'desc' => 'Pemeriksaan akhir kelengkapan aset dan prototipe.'],
                    ['stage' => 'Selesai & Serah Terima', 'date' => 'Estimasi 27 Sep 2026', 'status' => 'pending', 'desc' => 'Penyerahan link master Figma dan seluruh aset produksi.'],
                ],
                'messages' => [
                    ['id' => 1, 'sender' => 'Dimas Arya (Nexa Digital)', 'role' => 'agency', 'time' => '21 Sep 2026, 09:10 WIB', 'text' => 'Halo Mas Rian! Terima kasih sudah mempercayakan desain aplikasi kurirnya ke Nexa Digital.'],
                    ['id' => 2, 'sender' => 'Rian Hidayat (Klien)', 'role' => 'client', 'time' => '21 Sep 2026, 10:20 WIB', 'text' => 'Siap Mas Dimas. Mohon fokus ke layar tracking driver ya.'],
                ],
                'files' => [
                    ['name' => 'Brief_Kebutuhan_Proyek_NXD081.pdf', 'size' => '1.4 MB', 'type' => 'pdf', 'date' => '20 Sep 2026'],
                ],
            ],
            [
                'id' => 'NXD-2026-074',
                'invoice_number' => 'INV-2026-00002',
                'service_id' => 'front-end-development',
                'service_name' => 'Front End Development',
                'package_id' => 'standard',
                'package_name' => 'Standard (5 Halaman Web Responsif)',
                'customer_name' => 'Siti Rahmawati',
                'customer_email' => 'siti.rahma@berkahkuliner.com',
                'customer_phone' => '+62 856-1122-3344',
                'customer_company' => 'CV Berkah Kuliner Nusantara',
                'order_date' => '2026-09-12',
                'deadline' => '2026-09-20',
                'price' => 2750000,
                'tax' => 302500,
                'discount' => 0,
                'total' => 3052500,
                'payment_method' => 'QRIS Dinamis',
                'payment_status' => 'PAID',
                'project_status' => 'Selesai',
                'progress' => 100,
                'assigned_team' => 'Yusuf Maulana (Front End Dev)',
                'requirements' => [
                    'title' => 'Pengembangan Landing Page Profil Restoran & Menu',
                    'description' => 'Konversi desain Figma ke kode SvelteKit responsif dengan animasi transisi smooth dan form reservasi meja.',
                    'referenceUrl' => '',
                    'notes' => 'Pastikan gambar menu makanan dimuat dengan format WebP kompresi optimal.',
                ],
                'timeline' => [
                    ['stage' => 'Pesanan Diterima', 'date' => '12 Sep 2026, 14:00 WIB', 'status' => 'completed', 'desc' => 'Pembayaran lunas terverifikasi via QRIS.'],
                    ['stage' => 'Coding & Integrasi', 'date' => '15 Sep 2026, 17:00 WIB', 'status' => 'completed', 'desc' => 'Slicing HTML/CSS dan scripting logic selesai.'],
                    ['stage' => 'Selesai & Serah Terima', 'date' => '20 Sep 2026, 16:30 WIB', 'status' => 'completed', 'desc' => 'Kode repository Git dan live deploy berhasil dipindahkan ke klien.'],
                ],
                'messages' => [
                    ['id' => 1, 'sender' => 'Yusuf Maulana (Nexa Digital)', 'role' => 'agency', 'time' => '12 Sep 2026, 15:00 WIB', 'text' => 'Halo Bu Siti, tim kami mulai pengerjaan frontend hari ini.'],
                ],
                'files' => [
                    ['name' => 'Source_Code_Frontend_Build.zip', 'size' => '8.2 MB', 'type' => 'zip', 'date' => '20 Sep 2026'],
                ],
            ],
            [
                'id' => 'NXD-2026-092',
                'invoice_number' => 'INV-2026-00003',
                'service_id' => 'backend-development',
                'service_name' => 'Backend Development',
                'package_id' => 'standard',
                'package_name' => 'Standard (Full Authentication & API)',
                'customer_name' => 'Bambang Trianto',
                'customer_email' => 'bambang@fintechsolusi.id',
                'customer_phone' => '+62 813-4455-6677',
                'customer_company' => 'PT Solusi Finansial Cerdas',
                'order_date' => '2026-09-22',
                'deadline' => '2026-10-02',
                'price' => 3500000,
                'tax' => 385000,
                'discount' => 200000,
                'total' => 3685000,
                'payment_method' => 'Bank Transfer Mandiri',
                'payment_status' => 'PENDING',
                'project_status' => 'Menunggu Pembayaran',
                'progress' => 0,
                'assigned_team' => 'Andi Wijaya (Senior Backend)',
                'requirements' => [
                    'title' => 'Arsitektur REST API & Integrasi Dompet Digital',
                    'description' => 'Pembuatan 12 endpoint API untuk transaksi p2p lending mikro, autentikasi multi-faktor OTP SMS, dan webhook notifikasi otomatis.',
                    'referenceUrl' => '',
                    'notes' => 'Diperlukan penerapan rate-limiting ketat untuk mencegah brute-force login.',
                ],
                'timeline' => [
                    ['stage' => 'Pesanan Dibuat', 'date' => '22 Sep 2026, 10:15 WIB', 'status' => 'completed', 'desc' => 'Menunggu konfirmasi transfer bank Mandiri.'],
                    ['stage' => 'Verifikasi Pembayaran', 'date' => 'Sedang Berlangsung', 'status' => 'current', 'desc' => 'Sistem menunggu mutasi transfer rekening tujuan.'],
                ],
                'messages' => [],
                'files' => [],
            ],
        ];

        foreach ($ordersData as $o) {
            $order = Order::updateOrCreate(['id' => $o['id']], $o);

            Invoice::updateOrCreate(
                ['invoice_number' => $o['invoice_number']],
                [
                    'order_id' => $o['id'],
                    'issue_date' => $o['order_date'],
                    'due_date' => $o['deadline'],
                    'customer_name' => $o['customer_name'],
                    'customer_email' => $o['customer_email'],
                    'customer_phone' => $o['customer_phone'],
                    'customer_company' => $o['customer_company'],
                    'service_name' => $o['service_name'],
                    'package_name' => $o['package_name'],
                    'subtotal' => $o['price'],
                    'tax_amount' => $o['tax'],
                    'discount_amount' => $o['discount'],
                    'total_amount' => $o['total'],
                    'payment_method' => $o['payment_method'],
                    'status' => $o['payment_status'],
                    'notes' => 'Faktur resmi diterbitkan otomatis oleh sistem PT Nexa Digital Solusindo.',
                ]
            );
        }

        // 3. SEED PORTFOLIO PROJECTS
        $portfolioData = [
            [
                'id' => 'freshmart-ecommerce',
                'title' => 'FreshMart — Platform E-Commerce Produk Segar',
                'category' => 'Website & E-Commerce',
                'client' => 'PT Segar Nusantara Mandiri',
                'year' => '2026',
                'description' => 'Website e-commerce untuk pemesanan sayur, buah, dan daging segar harian dengan sistem pengiriman same-day dan payment gateway terintegrasi.',
                'metrics' => [
                    ['label' => 'Peningkatan Konversi', 'value' => '+42%'],
                    ['label' => 'Waktu Muat Rata-rata', 'value' => '0.9 Detik'],
                    ['label' => 'Pesanan Harian', 'value' => '350+ Order'],
                ],
                'technologies' => ['SvelteKit', 'Tailwind CSS', 'Laravel API', 'MySQL', 'Midtrans Payment'],
                'deliverables' => [
                    'Website Frontend SvelteKit responsif',
                    'Backend API manajemen katalog & checkout',
                    'Integrasi verifikasi pembayaran otomatis',
                ],
                'image_url' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'id' => 'carepal-health-app',
                'title' => 'CarePal — Aplikasi Mobile Pemantau Kesehatan Lansia',
                'category' => 'Mobile Application',
                'client' => 'Yayasan Sahabat Lansia Indonesia',
                'year' => '2026',
                'description' => 'Aplikasi mobile lintas platform yang memudahkan keluarga dan perawat memantau jadwal minum obat, tekanan darah, dan janji dokter lansia.',
                'metrics' => [
                    ['label' => 'Pengguna Aktif', 'value' => '15.000+'],
                    ['label' => 'Rating App Store', 'value' => '4.9 / 5.0'],
                    ['label' => 'Ketepatan Jadwal Obat', 'value' => '94%'],
                ],
                'technologies' => ['Flutter', 'Dart', 'Firebase', 'Laravel REST API', 'MySQL'],
                'deliverables' => [
                    'Aplikasi Android & iOS Flutter',
                    'Push notifications real-time pengingat obat',
                    'Dashboard web pelaporan untuk dokter wali',
                ],
                'image_url' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
            ],
            [
                'id' => 'library-management-system',
                'title' => 'Sistem Manajemen Perpustakaan Digital Kampus',
                'category' => 'Web Application & Backend',
                'client' => 'Universitas Bina Cendekia',
                'year' => '2025',
                'description' => 'Sistem otomasi katalog buku, sirkulasi peminjaman barcode, dan repositori digital karya ilmiah mahasiswa berbasis web intranet dan public API.',
                'metrics' => [
                    ['label' => 'Koleksi Terindeks', 'value' => '45.000+ Buku'],
                    ['label' => 'Kecepatan Pencarian', 'value' => '< 50ms'],
                    ['label' => 'Efisiensi Pustakawan', 'value' => '3x Lebih Cepat'],
                ],
                'technologies' => ['React', 'Laravel Backend', 'MySQL', 'Redis', 'Docker'],
                'deliverables' => [
                    'Sistem peminjaman barcode cepat',
                    'Katalog pencarian buku full-text',
                    'Modul denda dan kartu anggota digital',
                ],
                'image_url' => 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
            ],
        ];

        foreach ($portfolioData as $p) {
            PortfolioProject::updateOrCreate(['id' => $p['id']], $p);
        }
    }
}
