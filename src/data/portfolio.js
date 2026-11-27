export const portfolioProjects = [
  {
    id: "freshmart-ecommerce",
    title: "FreshMart — Platform E-Commerce Produk Segar",
    category: "Website",
    categoryLabel: "Website & E-Commerce",
    client: "PT Segar Nusantara Mandiri",
    year: "2026",
    technologies: ["SvelteKit", "Tailwind CSS", "Node.js", "PostgreSQL", "Midtrans Payment"],
    thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    summary: "Website e-commerce untuk pemesanan sayur, buah, dan daging segar harian dengan sistem pengiriman same-day dan payment gateway terintegrasi.",
    stats: [
      { label: "Peningkatan Konversi", value: "+42%" },
      { label: "Waktu Muat Rata-rata", value: "0.9 Detik" },
      { label: "Pesanan Harian", value: "350+ Order" }
    ],
    caseStudy: {
      clientProblem: "FreshMart sebelumnya hanya menerima pesanan melalui WhatsApp manual yang menyebabkan seringnya salah catat pesanan, keterlambatan konfirmasi pembayaran, dan tingginya biaya admin.",
      projectObjectives: "Membangun toko online berbasis web yang cepat diakses dari smartphone tanpa harus download aplikasi, dengan kalkulasi ongkos kirim otomatis dan verifikasi pembayaran instan.",
      research: "Melakukan interview terhadap 25 ibu rumah tangga dan pemilik restoran katering di Jabodetabek untuk memetakan kebiasaan belanja bahan pangan segar pagi hari.",
      designProcess: "Mengembangkan desain visual dengan palet warna hijau segar yang membangkitkan rasa higienis. Menyederhanakan proses checkout menjadi 3 langkah mudah tanpa registrasi rumit.",
      development: "Membangun frontend dengan SvelteKit untuk performa super instan. Mengintegrasikan API kurir logistik lokal (Lalamove/GrabExpress) dan gateway pembayaran Midtrans.",
      finalResult: "Situs FreshMart berhasil menangani lebih dari 10.000 transaksi dalam 3 bulan pertama dengan rasio kegagalan pembayaran di bawah 0.5%."
    }
  },
  {
    id: "carepal-health-app",
    title: "CarePal — Aplikasi Mobile Pemantau Kesehatan Lansia",
    category: "Mobile App",
    categoryLabel: "Mobile Application",
    client: "Yayasan Sahabat Lansia Indonesia",
    year: "2026",
    technologies: ["Flutter", "Dart", "Firebase", "Go Backend", "RESTful API"],
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    summary: "Aplikasi mobile lintas platform yang memudahkan keluarga dan perawat memantau jadwal minum obat, tekanan darah, dan janji dokter lansia.",
    stats: [
      { label: "Pengguna Aktif", value: "15.000+" },
      { label: "Rating App Store", value: "4.9 / 5.0" },
      { label: "Ketepatan Jadwal Obat", value: "94%" }
    ],
    caseStudy: {
      clientProblem: "Banyak lansia lupa meminum obat rutin harian, sementara anak atau pengasuh yang bekerja kesulitan memantau kepatuhan konsumsi obat secara real-time.",
      projectObjectives: "Menciptakan aplikasi berantarmuka ramah lanjut usia (font besar, kontras tinggi, tombol jelas) yang otomatis mengirimkan alarm push notification interaktif ke ponsel wali.",
      research: "Menguji prototype pada 30 pengguna berusia di atas 55 tahun untuk memastikan tingkat keterbacaan tipografi dan kemudahan menekan tombol tanpa salah sentuh.",
      designProcess: "Mengadopsi prinsip desain aksesibilitas WCAG AAA. Mengurangi kompleksitas menu navigasi menjadi tombol utama 'Sudah Minum Obat' dan 'Telepon Darurat'.",
      development: "Dibangun dengan Flutter untuk konsistensi pada smartphone Android harga terjangkau maupun iPhone. Dilengkapi alarm lokal offline yang tetap berbunyi meski tanpa koneksi internet.",
      finalResult: "CarePal terpilih sebagai salah satu inovasi kesehatan digital terbaik 2026 dengan lebih dari 15.000 pengguna aktif di seluruh Indonesia."
    }
  },
  {
    id: "library-management-system",
    title: "Sistem Manajemen Perpustakaan Digital Kampus",
    category: "Backend",
    categoryLabel: "Web Application & Backend",
    client: "Universitas Bina Cendekia",
    year: "2025",
    technologies: ["React", "Express.js", "PostgreSQL", "Redis", "Docker"],
    thumbnail: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
    summary: "Sistem otomasi katalog buku, sirkulasi peminjaman barcode, dan repositori digital karya ilmiah mahasiswa berbasis web intranet dan public API.",
    stats: [
      { label: "Koleksi Terindeks", value: "45.000+ Buku" },
      { label: "Kecepatan Pencarian", value: "< 50ms" },
      { label: "Efisiensi Pustakawan", value: "3x Lebih Cepat" }
    ],
    caseStudy: {
      clientProblem: "Pencatatan sirkulasi buku masih menggunakan lembaran kertas dan spreadsheet terpisah, menyebabkan sering terjadinya selisih stok buku dan keterlambatan denda.",
      projectObjectives: "Mengembangkan sistem perpustakaan terpadu yang dapat memindai kartu mahasiswa dan barcode buku dalam hitungan detik, serta menghitung denda otomatis.",
      research: "Observasi alur sirkulasi fisik di perpustakaan kampus selama masa ujian dan pendaftaran semester baru ketika antrean memuncak.",
      designProcess: "Merancang panel dashboard pustakawan yang padat informasi dengan hotkey keyboard untuk mempercepat transaksi peminjaman tanpa perlu sering memakai mouse.",
      development: "Arsitektur database PostgreSQL dengan indeks Full-Text Search dan Redis caching untuk pencarian judul buku dalam puluhan ribu data tanpa lag.",
      finalResult: "Waktu peminjaman per mahasiswa terpangkas dari 3 menit menjadi hanya 15 detik dengan akurasi data sirkulasi 100%."
    }
  },
  {
    id: "bil-yatimi-foundation",
    title: "Yayasan Bil Yatimi — Portal Donasi & Transparansi",
    category: "UI/UX",
    categoryLabel: "UI/UX Design & Web",
    client: "Yayasan Bil Yatimi Mandiri",
    year: "2026",
    technologies: ["Figma", "Design System", "Tailwind CSS", "Next.js", "QRIS"],
    thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
    summary: "Redesain antarmuka website filantropi dan donasi online dengan fokus pada transparansi penyaluran dana anak asuh dan akuntabilitas laporan publik.",
    stats: [
      { label: "Donasi Masuk", value: "Rp 1.2M+" },
      { label: "Peningkatan Donatur", value: "+75%" },
      { label: "Transparansi Penyaluran", value: "100% Tercatat" }
    ],
    caseStudy: {
      clientProblem: "Donatur potensial merasa ragu berdonasi karena website lama yayasan tidak menyajikan rincian penyaluran dana dan dokumentasi kegiatan yang rapi.",
      projectObjectives: "Membangun rasa percaya masyarakat dengan sistem transparansi finansial interaktif dan sistem donasi instan via QRIS tanpa biaya transfer.",
      research: "Menganalisis faktor psikologis donor online di Indonesia: transparansi bukti foto penyaluran dan kemudahan pembayaran adalah kunci utama kepuasan.",
      designProcess: "Desain visual yang hangat dan bersahaja dengan komponen 'Lacak Donasi Saya' di mana setiap donatur menerima laporan foto penyaluran program.",
      development: "Desain Figma diubah menjadi website performa tinggi dengan fitur live feed penyaluran dana bantuan dan kalkulator zakat terintegrasi.",
      finalResult: "Jumlah donatur aktif bulanan melonjak 75% dalam 4 bulan pertama pasca peluncuran situs baru."
    }
  },
  {
    id: "marketing-dashboard-analytics",
    title: "PulseMetrics — Dashboard Analitik Kampanye Digital",
    category: "Digital Marketing",
    categoryLabel: "Digital Marketing & Dashboard",
    client: "GrowthPulse Agency",
    year: "2026",
    technologies: ["Vue.js", "Chart.js", "Python FastAPI", "Google Ads API", "Meta Graph API"],
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    summary: "Platform pemantauan efektivitas iklan multi-channel yang menyatukan data dari Google Ads, TikTok Ads, dan Meta Ads dalam satu tampilan ringkas.",
    stats: [
      { label: "Waktu Reporting", value: "Hemat 8 Jam/Mgg" },
      { label: "Akurasi ROAS", value: "99.8%" },
      { label: "Ad Spend Terpantau", value: "Rp 500Jt+/Bln" }
    ],
    caseStudy: {
      clientProblem: "Tim media buyer menghabiskan waktu berjam-jam setiap hari hanya untuk mengunduh laporan CSV dari tiga dashboard iklan yang berbeda dan menggabungkannya manual.",
      projectObjectives: "Menyediakan dashboard otomatis yang menarik data via API setiap 1 jam dan menyajikan perbandingan ROAS, CPC, dan CPM secara real-time.",
      research: "Mewawancarai 10 digital marketer profesional untuk mengidentifikasi 5 metrik paling krusial yang perlu dilihat saat mengevaluasi winning ads.",
      designProcess: "Hierarki data yang bersih dengan kartu ringkasan di bagian atas dan visualisasi tren grafik yang mudah dibaca bahkan di layar tablet.",
      development: "Menggunakan FastAPI untuk agregasi data performa tinggi dengan background job terotomasi untuk meminimalkan beban kuota API masing-masing platform.",
      finalResult: "Tim media buyer dapat mengalihkan fokus dari pekerjaan administratif manual ke optimasi strategi kampanye yang lebih strategis."
    }
  }
];
