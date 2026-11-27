export const initialOrders = [
  {
    id: "NXD-2026-081",
    invoiceNumber: "INV-2026-00001",
    serviceId: "ui-ux-design",
    serviceName: "UI/UX Design",
    packageId: "standard",
    packageName: "Standard (Hingga 7 Layar Responsif)",
    customer: {
      name: "Rian Hidayat",
      email: "rian.hidayat@startupkita.id",
      phone: "+62 812-9988-7766",
      company: "PT Logistik Kita Bersama"
    },
    orderDate: "2026-09-20",
    deadline: "2026-09-27",
    price: 1500000,
    tax: 165000,
    discount: 0,
    total: 1665000,
    paymentMethod: "Bank Transfer BCA",
    paymentStatus: "PAID",
    projectStatus: "Sedang Dikerjakan",
    progress: 65,
    assignedTeam: "Dimas Arya (Lead UI/UX)",
    requirements: {
      title: "Redesain Aplikasi Mobile Kurir On-Demand",
      description: "Membutuhkan 7 layar utama untuk aplikasi kurir lokal: Splash, Login OTP, Beranda Peta, Pilih Layanan, Konfirmasi Ongkir, Pelacakan Driver Real-time, dan Riwayat Pesanan.",
      referenceUrl: "https://dribbble.com/tags/logistics-app",
      notes: "Mohon diperhatikan kontras warna agar mudah terbaca driver di luar ruangan saat siang hari."
    },
    timeline: [
      { stage: "Pesanan Diterima", date: "20 Sep 2026, 09:30 WIB", status: "completed", desc: "Pembayaran terverifikasi otomatis via BCA Virtual Account." },
      { stage: "Kebutuhan Proyek Dikirim", date: "20 Sep 2026, 11:15 WIB", status: "completed", desc: "Klien mengirimkan dokumen brief dan referensi desain." },
      { stage: "Proyek Dimulai", date: "21 Sep 2026, 08:00 WIB", status: "completed", desc: "Kick-off meeting internal dan penyusunan user flow." },
      { stage: "Pengembangan & Desain", date: "22 Sep 2026, 14:00 WIB", status: "current", desc: "Eksplorasi wireframe dan visual high-fidelity di Figma (Progress 65%)." },
      { stage: "Review & Revisi", date: "Estimasi 25 Sep 2026", status: "pending", desc: "Sesi peninjauan oleh klien dan pengajuan catatan perbaikan." },
      { stage: "Final Review", date: "Estimasi 26 Sep 2026", status: "pending", desc: "Pemeriksaan akhir kelengkapan aset dan prototipe." },
      { stage: "Selesai & Serah Terima", date: "Estimasi 27 Sep 2026", status: "pending", desc: "Penyerahan link master Figma dan seluruh aset produksi." }
    ],
    messages: [
      { id: 1, sender: "Dimas Arya (Nexa Digital)", role: "agency", time: "21 Sep 2026, 09:10 WIB", text: "Halo Mas Rian! Terima kasih sudah mempercayakan desain aplikasi kurirnya ke Nexa Digital. Kami sudah meninjau dokumen brief dan user flow awalnya." },
      { id: 2, sender: "Rian Hidayat (Klien)", role: "client", time: "21 Sep 2026, 10:20 WIB", text: "Siap Mas Dimas. Mohon fokus ke layar tracking driver ya, karena itu core value layanan kami." },
      { id: 3, sender: "Dimas Arya (Nexa Digital)", role: "agency", time: "22 Sep 2026, 13:45 WIB", text: "Tentu Mas Rian. Kami sudah menyiapkan 2 alternatif layout untuk pelacakan driver dengan floating status card. Draft Figma akan kami bagikan besok siang." }
    ],
    files: [
      { name: "Brief_Kebutuhan_Proyek_NXD081.pdf", size: "1.4 MB", type: "pdf", date: "20 Sep 2026" },
      { name: "Preview_User_Flow_v1.png", size: "850 KB", type: "image", date: "21 Sep 2026" },
      { name: "Figma_Working_File_Draft", size: "Link Cloud", type: "figma", date: "22 Sep 2026" }
    ]
  },
  {
    id: "NXD-2026-074",
    invoiceNumber: "INV-2026-00002",
    serviceId: "front-end-development",
    serviceName: "Front End Development",
    packageId: "standard",
    packageName: "Standard (5 Halaman Web Responsif)",
    customer: {
      name: "Siti Rahmawati",
      email: "siti.rahma@fintechkini.co.id",
      phone: "+62 857-1122-3344",
      company: "Fintech Kini Indonesia"
    },
    orderDate: "2026-09-12",
    deadline: "2026-09-19",
    price: 2800000,
    tax: 308000,
    discount: 280000,
    total: 2828000,
    paymentMethod: "QRIS / E-Wallet",
    paymentStatus: "PAID",
    projectStatus: "Selesai",
    progress: 100,
    assignedTeam: "Sarah Nabilah (Senior Frontend)",
    requirements: {
      title: "Landing Page Finansial & Kalkulator Pinjaman",
      description: "Pengembangan 5 halaman website interaktif dengan kalkulator simulasi kredit dan integrasi form leads.",
      referenceUrl: "https://fintechkini.co.id/preview",
      notes: "Pastikan loading speed di bawah 1 detik di koneksi 4G."
    },
    timeline: [
      { stage: "Pesanan Diterima", date: "12 Sep 2026", status: "completed", desc: "Pembayaran QRIS lunas." },
      { stage: "Kebutuhan Proyek Dikirim", date: "12 Sep 2026", status: "completed", desc: "Desain Figma diserahkan." },
      { stage: "Proyek Dimulai", date: "13 Sep 2026", status: "completed", desc: "Setup codebase Svelte + Tailwind." },
      { stage: "Pengembangan & Desain", date: "16 Sep 2026", status: "completed", desc: "Kodingan seluruh halaman rampung." },
      { stage: "Review & Revisi", date: "17 Sep 2026", status: "completed", desc: "Penyesuaian formula kalkulator pinjaman." },
      { stage: "Final Review", date: "18 Sep 2026", status: "completed", desc: "Uji performa Lighthouse skor 99/100." },
      { stage: "Selesai & Serah Terima", date: "19 Sep 2026", status: "completed", desc: "Source code dipush ke GitHub klien & deploy sukses." }
    ],
    messages: [
      { id: 1, sender: "Sarah Nabilah (Nexa Digital)", role: "agency", time: "19 Sep 2026, 17:00 WIB", text: "Halo Mbak Siti, seluruh source code telah kami serahkan dan staging sudah live. Terima kasih atas kerja samanya!" },
      { id: 2, sender: "Siti Rahmawati (Klien)", role: "client", time: "19 Sep 2026, 17:30 WIB", text: "Terima kasih banyak Mbak Sarah & tim Nexa! Hasilnya sangat memuaskan dan loading-nya luar biasa cepat." }
    ],
    files: [
      { name: "Source_Code_Archive_NXD074.zip", size: "12.8 MB", type: "zip", date: "19 Sep 2026" },
      { name: "Dokumentasi_Instalasi.pdf", size: "900 KB", type: "pdf", date: "19 Sep 2026" }
    ]
  },
  {
    id: "NXD-2026-068",
    invoiceNumber: "INV-2026-00003",
    serviceId: "mobile-app-development",
    serviceName: "Mobile App Development",
    packageId: "standard",
    packageName: "Standard Cross-Platform (Flutter)",
    customer: {
      name: "Budi Santoso",
      email: "budi.s@agrikultur.id",
      phone: "+62 813-4455-6677",
      company: "CV Agri Mandiri"
    },
    orderDate: "2026-09-18",
    deadline: "2026-10-03",
    price: 5500000,
    tax: 605000,
    discount: 0,
    total: 6105000,
    paymentMethod: "Bank Mandiri Virtual Account",
    paymentStatus: "PAID",
    projectStatus: "Tahap Revisi",
    progress: 80,
    assignedTeam: "Kevin Alamsyah (Mobile App Lead)",
    requirements: {
      title: "Aplikasi Pendataan Hasil Panen Petani",
      description: "Aplikasi mobile offline-first untuk mencatat tonase hasil panen padi, jagung, dan kedelai.",
      referenceUrl: "",
      notes: "Wajib bisa simpan data saat petani tidak dapat sinyal di pedalaman."
    },
    timeline: [
      { stage: "Pesanan Diterima", date: "18 Sep 2026", status: "completed", desc: "Pembayaran lunas via VA Mandiri." },
      { stage: "Kebutuhan Proyek Dikirim", date: "18 Sep 2026", status: "completed", desc: "Format formulir panen dikirim." },
      { stage: "Proyek Dimulai", date: "19 Sep 2026", status: "completed", desc: "Konfigurasi SQLite offline sync." },
      { stage: "Pengembangan & Desain", date: "21 Sep 2026", status: "completed", desc: "Fitur form & export PDF selesai." },
      { stage: "Review & Revisi", date: "22 Sep 2026", status: "current", desc: "Penyesuaian format satuan berat (Kuintal vs Kilogram)." },
      { stage: "Final Review", date: "Estimasi 30 Sep 2026", status: "pending", desc: "Pemeriksaan APK produksi." },
      { stage: "Selesai & Serah Terima", date: "Estimasi 03 Okt 2026", status: "pending", desc: "Serah terima file .aab & source code." }
    ],
    messages: [
      { id: 1, sender: "Budi Santoso (Klien)", role: "client", time: "22 Sep 2026, 11:00 WIB", text: "Mas Kevin, untuk pilihan satuan panen bisakah ditambahkan Kuintal dan Ton selain Kilogram?" },
      { id: 2, sender: "Kevin Alamsyah (Nexa Digital)", role: "agency", time: "22 Sep 2026, 11:40 WIB", text: "Bisa sekali Pak Budi. Kami sedang update enum datanya di Flutter, siang ini kami kirimkan APK update terbarunya ya." }
    ],
    files: [
      { name: "AgriPanen_Beta_v0.8.apk", size: "24.2 MB", type: "apk", date: "21 Sep 2026" }
    ]
  },
  {
    id: "NXD-2026-085",
    invoiceNumber: "INV-2026-00004",
    serviceId: "backend-development",
    serviceName: "Backend Development",
    packageId: "basic",
    packageName: "Basic API (5 Endpoints)",
    customer: {
      name: "Darmawan Saputra",
      email: "darmawan@kreatifstudio.com",
      phone: "+62 821-7788-9900",
      company: "Kreatif Studio"
    },
    orderDate: "2026-09-22",
    deadline: "2026-09-29",
    price: 2000000,
    tax: 220000,
    discount: 0,
    total: 2220000,
    paymentMethod: "Bank Transfer BCA",
    paymentStatus: "PENDING",
    projectStatus: "Menunggu Kebutuhan",
    progress: 10,
    assignedTeam: "Bagas Wicaksono (Lead Backend)",
    requirements: {
      title: "API Microservice Autentikasi & Email Transaksional",
      description: "Pembuatan REST API Node.js untuk user register/login dan pengiriman template email HTML via Resend/SendGrid.",
      referenceUrl: "",
      notes: "Menunggu konfirmasi payload JSON dari tim klien."
    },
    timeline: [
      { stage: "Pesanan Diterima", date: "22 Sep 2026, 14:10 WIB", status: "completed", desc: "Pesanan tercatat di sistem Nexa Digital." },
      { stage: "Kebutuhan Proyek Dikirim", date: "22 Sep 2026, 15:00 WIB", status: "current", desc: "Menunggu dokumen spesifikasi payload dari klien." },
      { stage: "Proyek Dimulai", date: "Menunggu briefing", status: "pending", desc: "-" },
      { stage: "Pengembangan & Desain", date: "Menunggu briefing", status: "pending", desc: "-" },
      { stage: "Review & Revisi", date: "Menunggu briefing", status: "pending", desc: "-" },
      { stage: "Final Review", date: "Menunggu briefing", status: "pending", desc: "-" },
      { stage: "Selesai & Serah Terima", date: "Estimasi 29 Sep 2026", status: "pending", desc: "-" }
    ],
    messages: [
      { id: 1, sender: "Bagas Wicaksono (Nexa Digital)", role: "agency", time: "22 Sep 2026, 14:30 WIB", text: "Halo Mas Darmawan, kami menunggu dokumen spesifikasi field JSON agar bisa langsung kami siapkan skema database PostgreSQL-nya." }
    ],
    files: []
  }
];
