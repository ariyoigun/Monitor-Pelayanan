# SILAN - Sistem Monitoring Layanan
**Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak**

![SILAN Logo](assets/logo.svg)

---

## 📌 Tentang SILAN
**SILAN (Sistem Monitoring Layanan)** adalah platform pelayanan publik, pendaftaran perizinan mandiri, dan pemantauan permohonan terpadu berbasis web di lingkungan Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU) Kabupaten Demak.

Sistem terintegrasi dengan database SQLite lokal, REST API endpoints, serta rekapitulasi data otentik tahun 2026:
1. **Panel Halaman Publik (Infografis Rangkuman Layanan 2026)**:
   Menyajikan data agregat permohonan KTTR, Validasi OSS, PBG, dan SLF sepanjang tahun 2026 yang dapat difilter per bulan (Januari s.d. November 2026) dengan angka pengajuan riil (*Total Masuk*, *Sudah Dilayani*, dan *Belum Diproses*).
2. **Portal Pengajuan Layanan (Khusus Pemohon / Pengunjung)**:
   Pemohon wajib login/daftar akun untuk mengisi formulir pendaftaran:
   - **KTTR**: Terkoneksi Google Form langsung via embed tanpa redirect ([bit.ly/pendaftaranKTTRDemak](https://bit.ly/pendaftaranKTTRDemak)). SLA: **5 Hari Kerja**.
   - **Validasi KKPR OSS-RBA**: Terkoneksi Google Form langsung via embed tanpa redirect ([bit.ly/validasioss](https://bit.ly/validasioss)). SLA: **5 Hari Kerja**.
   - **PBG**: Tautan resmi ke portal nasional SIMBG ([simbg.pu.go.id](https://simbg.pu.go.id)). SLA: **28 Hari Kerja**.
   - **SLF**: Tautan resmi ke portal nasional SIMBG ([simbg.pu.go.id](https://simbg.pu.go.id)). SLA: **28 Hari Kerja**.
3. **Panel Dashboard Monitoring Internal (Aparatur & Pimpinan Dinas)**:
   - Dilengkapi **Grafik Analitik Chart.js**: Tren bulanan 4 layanan, status penyelesaian, proporsi beban pelayanan, dan sebaran kecamatan terbanyak di Kabupaten Demak.
   - Kotak sorotan pimpinan untuk berkas tertahan / overdue SLA.
   - Tabel monitoring dengan **Metadata Asli Rekap Excel** (KTTR, OSS, dan SIMBG).
   - Pengendalian penuh status berkas (Tambah, Edit Status, Catatan Pimpinan, Cetak Disposisi, dan Hapus Berkas).
4. **Pengaturan Teks Sistem (Super Admin)**:
   Superadmin dapat mengubah seluruh teks di sistem secara dinamis (judul, menu, badge, deskripsi, nilai SLA, alamat kantor, kontak, dan footer) langsung melalui dashboard.

---

## 💾 Arsitektur Database & Backend API
Sistem kini dilengkapi database SQLite bawaan Node.js (`node:sqlite`) dan REST API lengkap:
- **File Database**: `database/silan.db`
- **Cadangan JSON Portabel**: `database/silan_backup.json`
- **REST API Endpoints**:
  - `GET /api/submissions`: Mengambil daftar pengajuan (dengan filter bidang, layanan, status, pencarian, dan limit).
  - `GET /api/submissions/:id`: Mengambil detail satu berkas pengajuan lengkap dengan metadata Excel dan riwayat timeline.
  - `POST /api/submissions`: Menambahkan pengajuan baru (Create).
  - `PUT /api/submissions/:id`: Memperbarui status, posisi meja, kendala, arahan, dan nomor SK (Update).
  - `DELETE /api/submissions/:id`: Menghapus data berkas pengajuan secara permanen (Delete).
  - `GET /api/stats`: Menghitung agregat statistik bulanan secara *real-time* langsung dari data pengajuan.
  - `GET /api/settings` & `POST /api/settings`: Mengambil dan menyimpan konfigurasi teks sistem.
  - `GET /api/users` & `POST /api/users` & `DELETE /api/users/:id`: Manajemen pengguna petugas internal.
  - `POST /api/auth/login`: Autentikasi login untuk pemohon maupun petugas internal.
  - `POST /api/auth/register`: Pendaftaran mandiri akun pemohon baru.
  - `GET /api/database/backup`: Ekspor dump seluruh database ke format JSON.

---

## 👥 Akun Simulasi & Hak Akses

| Kategori Akun | Identifier / Username | Kata Sandi | Peran & Akses |
|---|---|---|---|
| **Pemohon Demo** | `budi.santoso@gmail.com` | `password123` | Portal pengajuan KTTR, OSS, dan akses SIMBG |
| **Kepala Dinas** | `kepala_dinas` | `password123` | Dashboard monitoring eksekutif, grafik analitik, disposisi |
| **Sekretaris Dinas** | `sekretaris` | `password123` | Monitoring administrasi dan kepatuhan SLA 5 & 28 hari kerja |
| **Kabid TRP** | `kabid_trp` | `password123` | Validasi & update status berkas TRP (KTTR & Validasi OSS) |
| **Kabid CK** | `kabid_ck` | `password123` | Validasi & update status berkas Cipta Karya (PBG & SLF) |
| **Koordinator TRP** | `koordinator_trp` | `password123` | Verifikasi teknis lapangan & kajian tata ruang |
| **Koordinator CK** | `koordinator_ck` | `password123` | Penilaian teknis & penugasan sidang TPA/TPT |
| **Superadmin** | `admin` | `password123` | Kendali penuh, manajemen user, pengaturan teks sistem & hapus data |

---

## 🚀 Cara Menjalankan Secara Lokal

```bash
# 1. Clone repositori
git clone https://github.com/ariyoigun/Monitor-Pelayanan.git
cd Monitor-Pelayanan

# 2. Jalankan server lokal Node.js
npm start

# 3. Akses melalui browser
http://localhost:3000
```

Perintah database tambahan:
```bash
# Inisialisasi ulang database dari data master
npm run db:seed

# Ekspor database SQLite ke file silan_backup.json
npm run db:export

# Menjalankan verifikasi sintaksis
npm test
```

---

## 📁 Struktur Berkas

```
├── assets/
│   └── logo.svg                 # Logo vektor resmi DINPUTARU Kabupaten Demak
├── css/
│   ├── main.css                 # Base design system & layout responsif
│   ├── components.css           # Styling infografis, kartu layanan & captcha
│   └── dashboard.css            # Styling dashboard, portal pemohon & charts
├── database/
│   ├── db.js                    # Inisialisasi SQLite database (node:sqlite)
│   ├── seed.js                  # Skrip seeding data awal dari Excel ke SQLite
│   ├── export_json.js           # Skrip backup SQLite ke JSON portabel
│   ├── silan.db                 # Database SQLite biner aktif
│   └── silan_backup.json        # Cadangan database lengkap format JSON
├── data_source/                 # Sumber file data Excel asli (KTTR, OSS, SIMBG)
├── js/
│   ├── data.js                  # Master data, model storage & REST API sync bridge
│   ├── auth.js                  # Autentikasi, registrasi pemohon & CAPTCHA matematika
│   ├── portal.js                # Modul portal pemohon & frame embed Google Form
│   ├── systemSettings.js        # Modul kustomisasi semua teks sistem (Superadmin)
│   ├── infografis.js            # Engine infografis publik & filter bulan 2026
│   ├── monitoring.js            # Engine monitoring, grafik Chart.js & metadata Excel
│   ├── userManagement.js        # Modul manajemen pengguna khusus Superadmin
│   ├── tracker.js               # Generator cetak disposisi & laporan eksekutif PDF
│   └── app.js                   # Application router & inisialisasi modul global
├── index.html                   # Single Page Application (SPA) SILAN
├── server.js                    # HTTP Server & REST API backend SQLite
├── package.json                 # Metadata proyek, dependensi & npm scripts
└── README.md                    # Dokumentasi lengkap sistem
```

---

## 🏛️ Pemerintah Kabupaten Demak
**Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU)**  
Jl. Kyai Jebat No. 35, Demak 59511  
- **Telepon:** (0291) 685112  
- **Email:** dinputaru@demakkab.go.id  
- **Website:** [dinputaru.demakkab.go.id](https://dinputaru.demakkab.go.id)
