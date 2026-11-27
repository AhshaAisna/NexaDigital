export const services = [
  {
    id: "ui-ux-design",
    name: "UI/UX Design",
    category: "Design",
    tagline: "Desain antarmuka yang bersih, intuitif, dan mudah dinavigasi untuk web & mobile.",
    description: "Layanan desain UI/UX berbasis riset pengguna nyata untuk memastikan aplikasi dan website Anda memiliki konversi tinggi, alur penggunaan yang mulus, dan identitas visual yang profesional.",
    startingPrice: 750000,
    estimatedDelivery: "3 - 7 Hari Kerja",
    icon: "palette",
    packagesCount: 3,
    deliverables: [
      "Figma Source File (.fig) tersusun rapi & autolayout",
      "Interactive High-Fidelity Prototype (dapat diklik & diuji)",
      "Design System & Style Guide (Warna, Tipografi, Komponen UI)",
      "Export Assets Siap Koding (SVG, PNG @2x @3x, Icon pack)",
      "User Flow Chart & Wireframe Low-Fidelity",
      "Dokumentasi Handoff untuk Developer"
    ],
    process: [
      { step: "01", title: "Diskusi Kebutuhan & Riset", desc: "Membedah tujuan bisnis, target pengguna, dan referensi desain yang diinginkan." },
      { step: "02", title: "Penyusunan User Flow", desc: "Memetakan alur interaksi pengguna dari halaman pertama hingga konversi/checkout." },
      { step: "03", title: "Wireframing Low-Fidelity", desc: "Merancang layout kerangka dan tata letak informasi sebelum masuk ke estetika." },
      { step: "04", title: "Visual Design High-Fidelity", desc: "Menerapkan warna, tipografi, komponen modern, dan hierarki visual detail." },
      { step: "05", title: "Interactive Prototype", desc: "Membuat prototipe yang dapat diklik langsung di smartphone atau browser." },
      { step: "06", title: "Sesi Review & Revisi", desc: "Menerima masukan dari klien dan menyempurnakan detail sebelum finalisasi." },
      { step: "07", title: "Final Handoff & Assets", desc: "Serah terima master file Figma, asset export, dan panduan styling untuk tim dev." }
    ],
    packages: [
      {
        id: "basic",
        name: "Basic",
        price: 750000,
        deliveryTime: "3 Hari Kerja",
        revisions: "2x Revisi Minor",
        screens: "Hingga 3 Layar Utama",
        features: [
          "Maksimal 3 halaman / screen responsif",
          "Wireframe & High-Fidelity UI",
          "File Master Figma terstruktur",
          "Asset Icon & Gambar standar",
          "Estimasi pengerjaan 3 hari kerja"
        ],
        notIncluded: [
          "Interactive Prototype kompleks",
          "Design System lengkap"
        ],
        isRecommended: false
      },
      {
        id: "standard",
        name: "Standard",
        price: 1500000,
        deliveryTime: "5 Hari Kerja",
        revisions: "3x Revisi",
        screens: "Hingga 7 Layar Responsif",
        features: [
          "Maksimal 7 halaman / screen responsif",
          "User Flow & Wireframe lengkap",
          "High-Fidelity UI Design modern",
          "Interactive Prototype di Figma",
          "Mini Design System (Komponen, Warna, Font)",
          "Asset Export siap koding",
          "Estimasi pengerjaan 5 hari kerja"
        ],
        notIncluded: [
          "User testing dengan responden eksternal"
        ],
        isRecommended: true
      },
      {
        id: "premium",
        name: "Premium",
        price: 2500000,
        deliveryTime: "7 Hari Kerja",
        revisions: "Revisi Tanpa Batas (Mayor 2x)",
        screens: "Hingga 15 Layar Responsif",
        features: [
          "Hingga 15 halaman / screen aplikasi lengkap",
          "Comprehensive User Flow & Information Architecture",
          "Full Design System & Token UI",
          "Advanced Clickable Prototype dengan micro-interactions",
          "Developer Handoff Session (Meeting 30 menit via Google Meet)",
          "Dukungan asistensi styling 14 hari pasca serah terima"
        ],
        notIncluded: [],
        isRecommended: false
      }
    ],
    faqs: [
      { q: "Format file apa yang akan saya terima?", a: "Anda akan mendapatkan link master file Figma dengan permission edit/view, serta file backup .fig lokal dan folder asset berformat SVG dan PNG berkualitas tinggi." },
      { q: "Bagaimana jika saya membutuhkan revisi setelah proyek selesai?", a: "Setiap paket sudah mencakup revisi gratis sesuai kuota. Setelah proyek selesai, kami tetap memberikan masa garansi perbaikan minor selama 7 hari kerja." },
      { q: "Apakah desain ini siap untuk langsung dicoding oleh developer?", a: "Tentu saja. Desain kami menggunakan sistem 8pt grid, Auto Layout Figma, dan penamaan komponen terstandar yang sangat ramah bagi developer Frontend." }
    ],
    reviews: [
      { name: "Andi Wijaya", company: "Pendiri KopiSaku", rating: 5, date: "15 September 2026", comment: "Hasil UI Figma-nya sangat rapi. Tim developer kami bisa langsung implementasi tanpa kebingungan sama sekali." },
      { name: "Rina Kusuma", company: "Product Lead MedikaCare", rating: 5, date: "28 Agustus 2026", comment: "Komunikasi sangat cepat dan tim Nexa paham betul user experience aplikasi kesehatan kami." }
    ]
  },
  {
    id: "front-end-development",
    name: "Front End Development",
    category: "Development",
    tagline: "Bangun tampilan web interaktif, cepat, dan responsif dari desain Anda.",
    description: "Konversi desain Figma atau dokumen spesifikasi menjadi kode website modern yang ringan, ramah SEO, dan berjalan mulus di semua perangkat (Desktop, Tablet, & Mobile).",
    startingPrice: 1500000,
    estimatedDelivery: "5 - 10 Hari Kerja",
    icon: "code",
    packagesCount: 3,
    deliverables: [
      "Source Code bersih berbasis Svelte / React / Next.js / Tailwind CSS",
      "Responsive Layout 100% pixel-perfect dari desain",
      "Optimasi Web Vitals (Kecepatan loading < 1.5 detik)",
      "Integrasi API RESTful atau GraphQL",
      "Deploy Staging di Vercel / Netlify untuk preview klien",
      "Dokumentasi instalasi & README lengkap"
    ],
    process: [
      { step: "01", title: "Review Desain & Spesifikasi", desc: "Menganalisis file desain, assets, dan endpoints API yang akan diintegrasikan." },
      { step: "02", title: "Setup Arsitektur Project", desc: "Inisialisasi repo Git, konfigurasi Tailwind CSS, komponen reusable, dan router." },
      { step: "03", title: "Pengembangan Komponen UI", desc: "Membangun tampilan komponen secara modular dan pixel-perfect." },
      { step: "04", title: "Integrasi State & API", desc: "Menghubungkan form, logika interaktif, dan fetching data backend." },
      { step: "05", title: "Testing Lintas Browser", desc: "Memastikan tampilan presisi di Chrome, Safari, Firefox, iOS, dan Android." },
      { step: "06", title: "Uji Performa & SEO", desc: "Optimasi Core Web Vitals, accessibility, dan meta tags." },
      { step: "07", title: "Deployment & Serah Terima", desc: "Live deployment di server hosting dan penyerahan akses repository GitHub." }
    ],
    packages: [
      {
        id: "basic",
        name: "Basic",
        price: 1500000,
        deliveryTime: "5 Hari Kerja",
        revisions: "2x Revisi",
        screens: "Landing Page (1 Halaman Panjang)",
        features: [
          "1 Single Page Website (Maks. 5 Bagian/Section)",
          "Teknologi Svelte / React + Tailwind CSS",
          "Responsive Mobile & Desktop",
          "Contact form terintegrasi WhatsApp / Email",
          "Deploy live di Vercel/Netlify"
        ],
        notIncluded: ["Integrasi backend kompleks", "Sistem autentikasi user"],
        isRecommended: false
      },
      {
        id: "standard",
        name: "Standard",
        price: 2800000,
        deliveryTime: "7 Hari Kerja",
        revisions: "3x Revisi",
        screens: "Hingga 5 Halaman Responsif",
        features: [
          "Maksimal 5 Halaman (Beranda, Layanan, Tentang, Kontak, Detail)",
          "Integrasi API RESTful (Fetch & Post data)",
          "Form validasi interaktif",
          "Animasi micro-interaction halus",
          "Skor Google PageSpeed 90+",
          "Akses repository GitHub privat"
        ],
        notIncluded: ["Payment gateway backend"],
        isRecommended: true
      },
      {
        id: "premium",
        name: "Premium",
        price: 4500000,
        deliveryTime: "10 Hari Kerja",
        revisions: "Revisi Bebas (3x Mayor)",
        screens: "Hingga 10 Halaman & Dashboard",
        features: [
          "Hingga 10 Halaman atau Web Application / Dashboard",
          "Manajemen State global (Zustand / Svelte Store)",
          "Integrasi Auth & Role-based routing",
          "Dashboard interaktif dengan tabel & filter",
          "Dokumentasi kode terperinci & video walkthrough",
          "Garansi bug fix selama 30 hari"
        ],
        notIncluded: [],
        isRecommended: false
      }
    ],
    faqs: [
      { q: "Framework apa yang digunakan?", a: "Kami mengutamakan teknologi modern seperti Svelte/SvelteKit atau React/Next.js dengan Tailwind CSS sesuai preferensi dan arsitektur kebutuhan Anda." },
      { q: "Apakah kode menjadi hak milik saya sepenuhnya?", a: "Ya, seluruh source code dan hak cipta diserahkan 100% ke repository GitHub Anda setelah pembayaran lunas." }
    ],
    reviews: [
      { name: "Bambang Sutrisno", company: "CTO PayHub Indonesia", rating: 5, date: "10 September 2026", comment: "Hasil kodingan bersih, terstruktur rapi, dan performa skor di Lighthouse mencapai 98!" }
    ]
  },
  {
    id: "backend-development",
    name: "Backend Development",
    category: "Development",
    tagline: "Kembangkan API, database, dan arsitektur server yang andal dan aman.",
    description: "Layanan pembangunan arsitektur server-side yang skalabel, manajemen database SQL/NoSQL yang teroptimasi, autentikasi aman, dan integrasi payment gateway serta layanan pihak ketiga.",
    startingPrice: 2000000,
    estimatedDelivery: "7 - 14 Hari Kerja",
    icon: "server",
    packagesCount: 3,
    deliverables: [
      "RESTful API atau GraphQL endpoints terdokumentasi (Swagger / Postman Collection)",
      "Database Schema & Migration script (PostgreSQL, MySQL, atau Supabase)",
      "Sistem Autentikasi aman (JWT / OAuth2 / Session)",
      "Integrasi Payment Gateway (Midtrans, Xendit, atau DOKU)",
      "Server Deployment script (Docker, VPS Ubuntu, atau AWS/GCP)",
      "Dokumentasi API lengkap dan Environment variables checklist"
    ],
    process: [
      { step: "01", title: "Analisis Arsitektur Data", desc: "Merancang Entity Relationship Diagram (ERD) dan skema database." },
      { step: "02", title: "Setup Database & Migrations", desc: "Konfigurasi tabel, indexing untuk query cepat, dan relasi data." },
      { step: "03", title: "Pengembangan Core API", desc: "Pembuatan endpoint CRUD, validasi input, dan logika bisnis utama." },
      { step: "04", title: "Autentikasi & Otorisasi", desc: "Enkripsi password (Argon2/Bcrypt), role access level, dan refresh token." },
      { step: "05", title: "Integrasi Layanan Pihak Ketiga", desc: "Webhook payment gateway, pengiriman email SMTP, dan SMS/WhatsApp API." },
      { step: "06", title: "Uji Keamanan & Beban", desc: "Testing sanitasi input dari SQL Injection, rate limiting, dan stres test." },
      { step: "07", title: "Deployment Server & Handoff", desc: "Deploy ke production VPS/Cloud dengan SSL aktif dan backup harian." }
    ],
    packages: [
      {
        id: "basic",
        name: "Basic API",
        price: 2000000,
        deliveryTime: "7 Hari Kerja",
        revisions: "2x Revisi",
        screens: "Hingga 5 Endpoint API",
        features: [
          "Maksimal 5 RESTful API Endpoints",
          "Database PostgreSQL atau MySQL sederhana",
          "Validasi data & error handling terstandar",
          "Dokumentasi Postman Collection siap pakai",
          "Deploy di VPS / Supabase"
        ],
        notIncluded: ["Payment gateway", "Sistem autentikasi kompleks"],
        isRecommended: false
      },
      {
        id: "standard",
        name: "Standard API & Auth",
        price: 3800000,
        deliveryTime: "10 Hari Kerja",
        revisions: "3x Revisi",
        screens: "Hingga 12 Endpoint + Auth",
        features: [
          "Hingga 12 RESTful API Endpoints teroptimasi",
          "Sistem Autentikasi JWT (Register, Login, Forgot Password)",
          "Role-based Access Control (Admin vs User)",
          "Integrasi 1 Payment Gateway (Midtrans / Xendit)",
          "Database schema & backup otomatis",
          "Swagger API Documentation interaktif"
        ],
        notIncluded: ["Microservices architecture"],
        isRecommended: true
      },
      {
        id: "premium",
        name: "Enterprise Backend",
        price: 6000000,
        deliveryTime: "14 Hari Kerja",
        revisions: "Revisi Bebas (3x Mayor)",
        screens: "Full System Backend & Webhooks",
        features: [
          "Endpoints API tidak terbatas (sesuai scope disepakati)",
          "Integrasi multi-channel (Payment, Email SMTP, WhatsApp Notification)",
          "Background Worker & Job Queuing (Redis / BullMQ)",
          "Arsitektur Docker Container siap scale-up",
          "Setup CI/CD Pipeline otomatis di GitHub Actions",
          "Monitoring log server & garansi 60 hari"
        ],
        notIncluded: [],
        isRecommended: false
      }
    ],
    faqs: [
      { q: "Teknologi server apa yang digunakan?", a: "Kami terbiasa dengan Node.js (Express/NestJS), Go (Golang), atau Python (FastAPI), dipadukan dengan database PostgreSQL atau MySQL." }
    ],
    reviews: [
      { name: "Dewi Safitri", company: "COO EduNusantara", rating: 5, date: "02 September 2026", comment: "Backend sangat stabil saat diuji 10.000 user serentak. Dokumentasi Postman-nya rapi sekali." }
    ]
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    category: "Marketing",
    tagline: "Jangkau target audiens ideal melalui kampanye digital yang terukur.",
    description: "Strategi pemasaran digital berbasis data mencakup optimasi mesin pencari (SEO), periklanan Meta Ads & Google Ads, serta pembuatan copywriting landing page yang menghasilkan konversi nyata.",
    startingPrice: 1000000,
    estimatedDelivery: "14 - 30 Hari Kerja",
    icon: "trending-up",
    packagesCount: 3,
    deliverables: [
      "Audit SEO Komprehensif & Riset Kata Kunci bernilai tinggi",
      "Setup Akun Google Ads / Meta Ads Manager & Tracking Pixel",
      "Creative Ad Copywriting & Banner Brief",
      "Optimasi On-Page SEO (Meta Tag, Schema Markup, Content Structure)",
      "Laporan Dashboard Metrik Mingguan & Rekomendasi Bulanan"
    ],
    process: [
      { step: "01", title: "Audit & Analisis Pesaing", desc: "Meneliti performa online saat ini dan celah pasar dari kompetitor utama." },
      { step: "02", title: "Penyusunan Strategi & Funnel", desc: "Menentukan saluran pemasaran yang paling efisien sesuai anggaran klien." },
      { step: "03", title: "Setup Konversi & Pixel Tracking", desc: "Memasang Google Analytics 4, Tag Manager, dan Meta Pixel." },
      { step: "04", title: "Eksekusi Konten & Kampanye", desc: "Meluncurkan kampanye iklan terarah atau publikasi artikel SEO." },
      { step: "05", title: "A/B Testing & Optimasi Biaya", desc: "Memangkas biaya per klik (CPC) dan meningkatkan Return on Ad Spend (ROAS)." },
      { step: "06", title: "Laporan Evaluasi Transparan", desc: "Memberikan laporan performa berkala berisi angka riil tanpa manipulasi." }
    ],
    packages: [
      {
        id: "basic",
        name: "Starter SEO",
        price: 1000000,
        deliveryTime: "14 Hari Kerja",
        revisions: "2x Evaluasi",
        screens: "Audit + 3 Artikel SEO",
        features: [
          "Audit Teknis SEO & Indexing website",
          "Riset 15 Kata Kunci potensial untuk bisnis Anda",
          "Optimasi On-Page untuk 3 Halaman Utama",
          "3 Artikel SEO Pillar (1000 kata/artikel)",
          "Laporan performa Google Search Console"
        ],
        notIncluded: ["Pengelolaan Iklan Berbayar"],
        isRecommended: false
      },
      {
        id: "standard",
        name: "Growth Ads & SEO",
        price: 2200000,
        deliveryTime: "30 Hari Pengelolaan",
        revisions: "Konsultasi 2 Mingguan",
        screens: "Setup Ads + On-Page SEO",
        features: [
          "Manajemen Kampanye Meta Ads (Instagram & Facebook) atau Google Ads",
          "Setup Conversion Tracking & Custom Audiences",
          "Copywriting untuk 5 variasi iklan konversi",
          "Optimasi On-Page SEO 7 halaman",
          "Laporan mingguan & dashboard live via Looker Studio",
          "*Biaya ad spend iklan ditanggung klien"
        ],
        notIncluded: ["Biaya saldo iklan resmi platform"],
        isRecommended: true
      },
      {
        id: "premium",
        name: "Full Funnel Scale",
        price: 4000000,
        deliveryTime: "30 Hari Pengelolaan Penuh",
        revisions: "Konsultasi Mingguan Dedicated",
        screens: "Omnichannel Scale",
        features: [
          "Pengelolaan Terpadu Google Ads, Meta Ads & TikTok Ads",
          "Copywriting Landing Page berorientasi konversi tinggi",
          "Advanced Retargeting & Email marketing sequence",
          "Strategi Backlink berkualitas tinggi (Off-Page SEO)",
          "Dedicated Account Strategist via WhatsApp grup khusus"
        ],
        notIncluded: ["Biaya saldo iklan resmi platform"],
        isRecommended: false
      }
    ],
    faqs: [
      { q: "Apakah biaya paket sudah termasuk saldo iklan?", a: "Biaya paket adalah jasa profesional riset, strategi, setup, copywriting, dan optimasi harian. Saldo iklan resmi (Ad Spend) dibayarkan langsung ke platform Meta/Google dengan kartu kredit atau virtual account Anda." }
    ],
    reviews: [
      { name: "Hendra Gunawan", company: "Owner BatikPesisir", rating: 5, date: "18 Agustus 2026", comment: "ROAS kami naik dari 2.1x menjadi 4.8x setelah ditangani tim marketing Nexa Digital!" }
    ]
  },
  {
    id: "mobile-app-development",
    name: "Mobile App Development",
    category: "Development",
    tagline: "Aplikasi Android & iOS yang responsif, stabil, dan siap rilis ke Play Store & App Store.",
    description: "Bangun aplikasi mobile native atau cross-platform menggunakan Flutter / React Native dengan performa tinggi, tampilan konsisten, integrasi kamera/GPS, push notification, dan kemudahan publikasi toko aplikasi.",
    startingPrice: 3000000,
    estimatedDelivery: "10 - 21 Hari Kerja",
    icon: "smartphone",
    packagesCount: 3,
    deliverables: [
      "File Bundle Aplikasi Android (.apk & .aab) dan iOS (.ipa)",
      "Source Code Flutter / React Native terstruktur rapi",
      "Integrasi API & Autentikasi Pengguna",
      "Integrasi Push Notification (Firebase Cloud Messaging)",
      "Bantuan panduan rilis ke Google Play Store & Apple App Store",
      "Garansi pemeliharaan & bug-fix 30 hari"
    ],
    process: [
      { step: "01", title: "Spesifikasi Fitur & Arsitektur", desc: "Menentukan alur kerja aplikasi, device permissions, dan integrasi backend." },
      { step: "02", title: "Setup Base Project & Design Assets", desc: "Konfigurasi skema tema, font kustom, icons, dan state management (Bloc/Provider)." },
      { step: "03", title: "Pengembangan Layar & Navigasi", desc: "Membuat seluruh interface pengguna dengan transisi halus." },
      { step: "04", title: "Integrasi Fitur Perangkat & API", desc: "Koneksi ke backend, GPS maps, kamera, penyimpanan offline (SQLite/Hive)." },
      { step: "05", title: "Uji Coba di Perangkat Nyata", desc: "Pengujian performa pada berbagai ukuran layar dan versi Android/iOS." },
      { step: "06", title: "Persiapan Signing & Store Metadata", desc: "Pembuatan key release, privacy policy, dan icon adaptif." },
      { step: "07", title: "Build Release & Penyerahan", desc: "Penyerahan file build produksi dan penyerahan repo source code." }
    ],
    packages: [
      {
        id: "basic",
        name: "Starter App",
        price: 3000000,
        deliveryTime: "10 Hari Kerja",
        revisions: "2x Revisi",
        screens: "Hingga 5 Layar Aplikasi",
        features: [
          "Maksimal 5 Layar Aplikasi Utama",
          "Platform Android (.apk & .aab)",
          "Integrasi API sederhana",
          "State management standar",
          "Source code lengkap di GitHub"
        ],
        notIncluded: ["Dukungan iOS", "In-App Purchases"],
        isRecommended: false
      },
      {
        id: "standard",
        name: "Standard Cross-Platform",
        price: 5500000,
        deliveryTime: "15 Hari Kerja",
        revisions: "3x Revisi",
        screens: "Hingga 10 Layar (Android & iOS)",
        features: [
          "Hingga 10 Layar Aplikasi Lengkap",
          "Mendukung Android & iOS (Flutter / React Native)",
          "Sistem Login & Register (Email/Google Sign-In)",
          "Push Notification dengan Firebase",
          "Penyimpanan Cache Offline",
          "Bantuan submission ke Google Play Store"
        ],
        notIncluded: ["Fitur video streaming kompleks"],
        isRecommended: true
      },
      {
        id: "premium",
        name: "Enterprise Mobile Solution",
        price: 9000000,
        deliveryTime: "21 Hari Kerja",
        revisions: "Revisi Bebas (3x Mayor)",
        screens: "Aplikasi Kompleks (Hingga 20 Layar)",
        features: [
          "Hingga 20 Layar dengan alur bisnis lengkap",
          "Android & iOS Build Siap Produksi",
          "Integrasi Payment Gateway Mobile SDK",
          "Live Tracking GPS / Google Maps terpadu",
          "Offline first architecture & Sinkronisasi cloud",
          "Bantuan rilis ke Google Play Store & Apple App Store",
          "Garansi bug fix dan update minor selama 45 hari"
        ],
        notIncluded: [],
        isRecommended: false
      }
    ],
    faqs: [
      { q: "Apakah aplikasi bisa jalan di Android dan iPhone sekaligus?", a: "Ya! Menggunakan teknologi cross-platform Flutter yang efisien, satu basis kode dapat menghasilkan aplikasi berkualitas tinggi untuk Android dan iOS sekaligus." },
      { q: "Apakah dibantu sampai aplikasi tayang di Play Store?", a: "Tentu, tim kami akan menyiapkan file .aab bertanda tangan (signed), screenshot aplikasi, serta panduan pendaftaran akun developer Anda." }
    ],
    reviews: [
      { name: "dr. Amanda Savitri", company: "Co-founder CarePal", rating: 5, date: "05 September 2026", comment: "Aplikasi CarePal berjalan sangat mulus di Android maupun iPhone pengguna kami. Layanan dari Nexa patut diacungi jempol!" }
    ]
  }
];

export const featuredPackages = [
  {
    id: "bundle-website-starter",
    name: "Website Starter",
    combo: "UI/UX Design + Front End Development",
    price: 2500000,
    originalPrice: 3000000,
    discountBadge: "Hemat Rp500.000",
    description: "Paket ideal bagi startup dan bisnis yang membutuhkan website profesional siap luncur dengan desain kustom dan kode bersih.",
    delivery: "7 - 10 Hari Kerja",
    includedServices: ["UI/UX 5 Layar Figma", "Frontend Responsive Svelte/Tailwind", "Deploy Hosting Siap Pakai", "Garansi 14 Hari"],
    popular: true
  },
  {
    id: "bundle-mobile-app-starter",
    name: "Mobile App Starter",
    combo: "UI/UX Design + Mobile Development",
    price: 4500000,
    originalPrice: 5500000,
    discountBadge: "Hemat Rp1.000.000",
    description: "Solusi cepat memiliki aplikasi mobile Android dari ide kasar hingga file APK yang siap diinstall pengguna.",
    delivery: "14 Hari Kerja",
    includedServices: ["Desain UI/UX 7 Layar Lengkap", "Build Flutter Android (.apk & .aab)", "Push Notification Firebase", "Panduan Rilis Play Store"],
    popular: false
  },
  {
    id: "bundle-business-website",
    name: "Business Website Fullstack",
    combo: "UI/UX + Front End + Backend API",
    price: 6000000,
    originalPrice: 7500000,
    discountBadge: "Hemat Rp1.500.000",
    description: "Platform website komprehensif lengkap dengan sistem backend, database klien, form dinamis, dan dashboard pengelolaan.",
    delivery: "14 - 20 Hari Kerja",
    includedServices: ["Full UI/UX Design System", "Frontend Web Responsif", "Backend REST API & Database", "Dashboard Admin Terintegrasi"],
    popular: false
  }
];
