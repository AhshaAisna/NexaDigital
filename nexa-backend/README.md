# Nexa Digital — Backend RESTful API (Laravel 12)

Backend RESTful API untuk platform **PT Nexa Digital Solusindo**, dibangun menggunakan framework **Laravel 12**, **MySQL / MariaDB**, dan **Eloquent ORM**.

---

## 🚀 Fitur Utama API

1. **Layanan & Paket (Services & Packages)**
   - Katalog lengkap 5 bidang layanan (UI/UX, Frontend, Backend, Mobile Flutter, Digital Marketing).
   - Data paket (Basic/MVP, Standard, Enterprise), deliverables, timeline, dan fitur.
2. **Pesanan & Pelacakan Proyek (Orders & Tracking)**
   - Buat pesanan baru dari formulir checkout (otomatis menerbitkan faktur/invoice).
   - Filter & pencarian pesanan berdasarkan status dan keyword klien/layanan.
   - Update status proyek dan persentase progress (untuk Admin Dashboard).
   - Toggle status pembayaran (`PAID` / `PENDING`).
   - Thread komunikasi/pesan antara klien dan tim agensi.
3. **Faktur & Pembayaran (Invoices)**
   - Daftar faktur resmi dengan rincian PPN 11%, subtotal, diskon, dan status lunas.
4. **Portofolio & Studi Kasus (Portfolio Projects)**
   - Studi kasus proyek riil (FreshMart, CarePal, Sistem Perpustakaan).
5. **Formulir Kontak (Contact Inquiries)**
   - Penerimaan pesan konsultasi & estimasi budget dari calon klien.
6. **Dashboard Statistik (Admin Analytics)**
   - Agregasi total omset (revenue), proyek aktif, proyek selesai, dan pesanan terbaru.

---

## 🛠️ Panduan Instalasi & Menjalankan

### 1. Buka XAMPP / Laragon
- Pastikan modul **MySQL** dan **Apache** sudah dalam keadaan **Start / Running** (Port 3306).

### 2. Buat Database MySQL
Buka browser ke [phpMyAdmin](http://localhost/phpmyadmin) atau jalankan query SQL:
```sql
CREATE DATABASE nexa_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Konfigurasi `.env`
File `.env` di dalam folder `nexa-backend` sudah disiapkan dengan konfigurasi standar:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nexa_digital
DB_USERNAME=root
DB_PASSWORD=
```
*(Sesuaikan password jika MySQL lokal Anda menggunakan password).*

### 4. Jalankan Migrasi & Data Seeder
Jalankan perintah ini di terminal (dari folder `nexa-backend`):
```bash
php artisan migrate --seed
```
*Perintah ini akan membuat semua tabel dan mengisinya dengan data awal realistis (5 layanan, 3 proyek portofolio, dan 3 pesanan awal).*

### 5. Jalankan Server Lokal Laravel
```bash
php artisan serve
```
Server API akan aktif di: **`http://127.0.0.1:8000`**

---

## 📡 Dokumentasi Endpoint REST API

Base URL: `http://127.0.0.1:8000/api`

### 1. Health Check
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/health` | Cek status server API |

### 2. Services & Packages
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/services` | Mendapatkan seluruh layanan beserta paketnya |
| `GET` | `/api/services/{id}` | Mendapatkan detail 1 layanan (misal: `ui-ux-design`) |

### 3. Orders & Tracking
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/orders` | Ambil semua pesanan (bisa filter `?search=...&status=...`) |
| `GET` | `/api/orders/{id}` | Ambil detail 1 pesanan (misal: `NXD-2026-081`) |
| `POST` | `/api/orders` | Buat pesanan baru (sekaligus auto-create faktur) |
| `PATCH` | `/api/orders/{id}/status` | Update status proyek & progress % (Admin) |
| `PATCH` | `/api/orders/{id}/payment` | Update status bayar (`PAID` / `PENDING`) |
| `POST` | `/api/orders/{id}/messages` | Kirim pesan chat komunikasi proyek |

#### Contoh Payload `POST /api/orders`:
```json
{
  "serviceId": "ui-ux-design",
  "serviceName": "UI/UX Design",
  "packageId": "standard",
  "packageName": "Standard (Hingga 7 Layar Responsif)",
  "customerName": "Rian Hidayat",
  "customerEmail": "rian@example.com",
  "customerPhone": "+62 812-3456-7890",
  "customerCompany": "PT Startup Kita",
  "price": 1500000,
  "discount": 0,
  "paymentMethod": "Bank Transfer BCA",
  "paymentStatus": "PAID",
  "deliveryDays": 5,
  "projectTitle": "Redesain Aplikasi Mobile",
  "projectDescription": "Kebutuhan desain antarmuka 7 layar utama.",
  "notes": "Prioritaskan kontras tinggi."
}
```

### 4. Invoices
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/invoices` | Ambil daftar semua faktur |
| `GET` | `/api/invoices/{id}` | Ambil faktur via nomor faktur atau order ID |

### 5. Portfolio
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/portfolio` | Ambil daftar proyek portofolio & metrik |
| `GET` | `/api/portfolio/{id}` | Detail studi kasus portofolio |

### 6. Contact & Inquiry
| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/contact` | Kirim form konsultasi / kontak |
| `GET` | `/api/contact` | Ambil daftar pesan masuk (Admin) |

### 7. Dashboard Statistik
| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Rekap total omset, proyek aktif, selesai, dll. |

---

## 🌐 Koneksi Frontend ke Backend

Frontend Svelte di root project dapat langsung mengakses endpoint ini via `fetch()` tanpa kendala CORS karena header `config/cors.php` telah dikonfigurasi untuk mengizinkan permintaan dari browser lokal (`allowed_origins: ['*']`).
