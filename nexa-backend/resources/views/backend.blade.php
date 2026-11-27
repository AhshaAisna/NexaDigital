<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nexa Digital — Backend RESTful API & Admin Console</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #F6F6F3; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
    </style>
</head>
<body class="text-stone-900 p-4 md:p-8">
    <div class="max-w-5xl mx-auto space-y-6">
        
        <!-- Header -->
        <header class="bg-stone-950 text-white border-2 border-stone-900 p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="space-y-2">
                <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-300 font-bold">
                    <span class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span>[ LARAVEL 12 RESTFUL API BACKEND ]</span>
                </div>
                <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">PT Nexa Digital Solusindo</h1>
                <p class="text-stone-400 text-xs md:text-sm">Konsol Backend Operasional, Manajemen Layanan, Database & API Server</p>
            </div>
            
            <div class="flex items-center gap-3">
                <a href="http://localhost:5173/#backend" target="_blank" class="px-4 py-2.5 bg-orange-300 hover:bg-orange-400 text-stone-950 font-mono font-bold text-xs uppercase border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)] transition">
                    Buka Konsol Admin &rarr;
                </a>
                <a href="http://localhost:5173" target="_blank" class="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-mono font-bold text-xs uppercase border-2 border-stone-900 shadow-[3px_3px_0px_0px_rgba(255,255,255,0.4)] transition">
                    Website Publik &rarr;
                </a>
            </div>
        </header>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white border-2 border-stone-900 p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
                <span class="text-xs font-mono text-stone-500 uppercase font-bold block">Status Database</span>
                <div class="text-lg font-extrabold text-emerald-600 mt-1 flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Tersambung ({{ strtoupper(config('database.default')) }})</span>
                </div>
                <p class="text-[11px] font-mono text-stone-400 mt-1">DB: {{ config('database.connections.' . config('database.default') . '.database') }}</p>
            </div>

            <div class="bg-white border-2 border-stone-900 p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
                <span class="text-xs font-mono text-stone-500 uppercase font-bold block">Total Produk / Layanan</span>
                <div class="text-2xl font-black text-stone-950 mt-1">{{ $servicesCount ?? 0 }} Modul</div>
                <p class="text-[11px] font-mono text-stone-400 mt-1">Endpoint: /api/services</p>
            </div>

            <div class="bg-white border-2 border-stone-900 p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
                <span class="text-xs font-mono text-stone-500 uppercase font-bold block">Total Pesanan Masuk</span>
                <div class="text-2xl font-black text-stone-950 mt-1">{{ $ordersCount ?? 0 }} Pesanan</div>
                <p class="text-[11px] font-mono text-stone-400 mt-1">Endpoint: /api/orders</p>
            </div>

            <div class="bg-white border-2 border-stone-900 p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
                <span class="text-xs font-mono text-stone-500 uppercase font-bold block">Faktur Resmi e-Tax</span>
                <div class="text-2xl font-black text-stone-950 mt-1">{{ $invoicesCount ?? 0 }} Faktur</div>
                <p class="text-[11px] font-mono text-stone-400 mt-1">PPN 11% Terdata</p>
            </div>
        </div>

        <!-- Endpoints Table -->
        <div class="bg-white border-2 border-stone-900 p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] space-y-4">
            <div class="flex items-center justify-between border-b-2 border-stone-900 pb-3">
                <h2 class="font-extrabold text-base uppercase font-mono tracking-wider">RESTful API Endpoints Terbuka</h2>
                <span class="text-xs font-mono bg-stone-100 border border-stone-300 px-2 py-0.5">Base URL: {{ url('/api') }}</span>
            </div>

            <div class="overflow-x-auto font-mono text-xs">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-stone-100 border-b border-stone-300 text-stone-700">
                            <th class="py-2.5 px-3">Method</th>
                            <th class="py-2.5 px-3">Endpoint</th>
                            <th class="py-2.5 px-3">Fungsi / Aksi</th>
                            <th class="py-2.5 px-3 text-right">Uji Endpoint</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-200">
                        <tr>
                            <td class="py-2 px-3 font-bold text-emerald-700">GET</td>
                            <td class="py-2 px-3">/api/health</td>
                            <td class="py-2 px-3 text-stone-600">Health check status server API</td>
                            <td class="py-2 px-3 text-right"><a href="/api/health" target="_blank" class="text-orange-600 hover:underline">Buka &rarr;</a></td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-emerald-700">GET</td>
                            <td class="py-2 px-3">/api/services</td>
                            <td class="py-2 px-3 text-stone-600">Daftar semua layanan & paket harga</td>
                            <td class="py-2 px-3 text-right"><a href="/api/services" target="_blank" class="text-orange-600 hover:underline">Buka &rarr;</a></td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-blue-700">POST</td>
                            <td class="py-2 px-3">/api/services</td>
                            <td class="py-2 px-3 text-stone-600">Tambah produk / layanan baru ke katalog</td>
                            <td class="py-2 px-3 text-right text-stone-400">JSON Payload</td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-emerald-700">GET</td>
                            <td class="py-2 px-3">/api/orders</td>
                            <td class="py-2 px-3 text-stone-600">Semua pesanan & pelacakan progress</td>
                            <td class="py-2 px-3 text-right"><a href="/api/orders" target="_blank" class="text-orange-600 hover:underline">Buka &rarr;</a></td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-blue-700">POST</td>
                            <td class="py-2 px-3">/api/orders</td>
                            <td class="py-2 px-3 text-stone-600">Buat pesanan baru & terbitkan faktur otomatis</td>
                            <td class="py-2 px-3 text-right text-stone-400">Checkout API</td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-emerald-700">GET</td>
                            <td class="py-2 px-3">/api/invoices</td>
                            <td class="py-2 px-3 text-stone-600">Arsip seluruh e-Faktur dan status lunas</td>
                            <td class="py-2 px-3 text-right"><a href="/api/invoices" target="_blank" class="text-orange-600 hover:underline">Buka &rarr;</a></td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-blue-700">POST</td>
                            <td class="py-2 px-3">/api/invoices/{id}/send-email</td>
                            <td class="py-2 px-3 text-stone-600">Kirim invoice / reminder tagihan ke email client via SMTP</td>
                            <td class="py-2 px-3 text-right text-stone-400">SMTP Mailer</td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-blue-700">POST</td>
                            <td class="py-2 px-3">/api/orders/{id}/pay</td>
                            <td class="py-2 px-3 text-stone-600">Generate Snap Token pembayaran Midtrans</td>
                            <td class="py-2 px-3 text-right text-stone-400">Midtrans Snap</td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-blue-700">POST</td>
                            <td class="py-2 px-3">/api/midtrans/notification</td>
                            <td class="py-2 px-3 text-stone-600">Webhook verifikasi status pembayaran otomatis Midtrans</td>
                            <td class="py-2 px-3 text-right text-stone-400">Webhook</td>
                        </tr>
                        <tr>
                            <td class="py-2 px-3 font-bold text-emerald-700">GET</td>
                            <td class="py-2 px-3">/api/dashboard/stats</td>
                            <td class="py-2 px-3 text-stone-600">Statistik omset, proyek aktif, & ringkasan</td>
                            <td class="py-2 px-3 text-right"><a href="/api/dashboard/stats" target="_blank" class="text-orange-600 hover:underline">Buka &rarr;</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</body>
</html>
