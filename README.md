# SIKEREN - Sistem Informasi Keterangan Pelayanan Perizinan
**Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak**

![SIKEREN Logo](assets/logo.svg)

---

## 📌 Tentang SIKEREN
**SIKEREN (Sistem Informasi Keterangan Pelayanan Perizinan)** adalah platform pelayanan publik, infografis keterbukaan informasi perizinan, dan pemantauan permohonan terpadu berbasis web di lingkungan Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU) Kabupaten Demak.

Sistem terintegrasi dengan database SQLite lokal, REST API endpoints, serta rekapitulasi data otentik tahun 2026:
1. **Panel Halaman Publik (Infografis Rangkuman Layanan 2026)**:
   - Menyajikan data agregat permohonan KTTR, Validasi OSS, PBG, dan SLF sepanjang tahun 2026 yang dapat difilter per bulan (Januari s.d. November 2026) dengan 5 indikator utama (*Total Permohonan Masuk*, *Sudah Dilayani/Terbit*, *On Progress*, *Berkas Dikembalikan*, dan *Tingkat Penyelesaian*).
   - Dilengkapi menu dan kotak **Cek Pola Ruang Tanah / Bidang / Lokasi** dengan tautan langsung ke geoportal resmi Kementerian ATR/BPN ([gistaru.atrbpn.go.id](https://gistaru.atrbpn.go.id)).
   - Akses pendaftaran mandiri langsung bagi masyarakat:
     - **KTTR**: Terkoneksi formulir pendaftaran ([bit.ly/pendaftaranKTTRDemak](https://bit.ly/pendaftaranKTTRDemak)). SLA: **5 Hari Kerja**.
     - **Validasi KKPR OSS-RBA**: Terkoneksi formulir validasi ([bit.ly/validasioss](https://bit.ly/validasioss)). SLA: **5 Hari Kerja**.
     - **PBG**: Tautan resmi ke portal nasional SIMBG ([simbg.pu.go.id](https://simbg.pu.go.id)). SLA: **28 Hari Kerja**.
     - **SLF**: Tautan resmi ke portal nasional SIMBG ([simbg.pu.go.id](https://simbg.pu.go.id)). SLA: **28 Hari Kerja**.
2. **Panel Dashboard Monitoring Internal (Aparatur & Pimpinan Dinas)**:
   - Login khusus petugas internal dengan CAPTCHA matematika keamanan.
   - 4 Kategori Pengajuan berlabel warna khusus:
     - **KTTR** (Biru)
     - **OSS** (Hijau)
     - **PBG** (Oranye)
     - **SLF** (Ungu)
   - Hak akses operasional: Koordinator dan Superadmin memiliki wewenang penuh untuk menambah, mengedit, menyimpan, dan menghapus data pengajuan.
   - Dilengkapi **Grafik Analitik Chart.js**: Tren bulanan 4 layanan, status penyelesaian, proporsi beban pelayanan, dan sebaran kecamatan di Kabupaten Demak.
   - Tabel monitoring dengan **Metadata Asli Rekap Excel** (KTTR, OSS, dan SIMBG).
3. **Manajemen Pengguna & Pengaturan Teks Sistem (Super Admin)**:
   - Super Admin memiliki menu Manajemen User untuk menambah, mengedit, menghapus, dan menyimpan pengguna internal.
   - Super Admin dapat mengubah seluruh teks sistem secara dinamis (judul, menu, badge, deskripsi, nilai SLA, alamat kantor, kontak, dan footer) langsung melalui menu pengaturan teks.

---

## 💾 Arsitektur Database & Backend API
Sistem dilengkapi database SQLite bawaan Node.js (`node:sqlite`) dan REST API lengkap:
- **File Database**: `database/silan.db`
- **Cadangan JSON Portabel**: `database/silan_backup.json`
- **REST API Endpoints**:
  - `GET /api/submissions`: Mengambil daftar pengajuan (dengan filter bidang, layanan, status, pencarian, dan limit).
  - `GET /api/submissions/:id`: Mengambil detail satu berkas pengajuan lengkap dengan metadata Excel dan riwayat timeline.
  - `POST /api/submissions`: Menambahkan pengajuan baru (Create).
  - `PUT /api/submissions/:id`: Memperbarui data berkas pengajuan (Update).
  - `DELETE /api/submissions/:id`: Menghapus data berkas pengajuan secara permanen (Delete).
  - `GET /api/stats`: Menghitung agregat statistik bulanan secara *real-time* langsung dari data pengajuan.
  - `GET /api/settings` & `POST /api/settings`: Mengambil dan menyimpan konfigurasi teks sistem.
  - `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`: Manajemen pengguna petugas internal.
  - `POST /api/auth/login`: Autentikasi login untuk petugas internal dengan CAPTCHA matematika.
  - `GET /api/database/backup`: Ekspor dump seluruh database ke format JSON.

---

## 👥 Akun Petugas Internal (Sesuai Master Akun dan Role)

| No | Nama Pegawai | NIP | Username | Peran / Jabatan | Bidang |
|---|---|---|---|---|---|
| 1 | **Nanang Triyono, ST** | 197805162002121004 | `nanang_triyono` | Koordinator | Tata Ruang |
| 2 | **Aditya Hernowo, ST** | 199307272024211003 | `aditya_hernowo` | Verifikator | Tata Ruang |
| 3 | **Fajar Eko Saputro, ST** | 199411212022031003 | `fajar_eko` | Operator | Tata Ruang |
| 4 | **Bambang Priyambodo, ST** | 196906232002121004 | `bambang_priyambodo` | Koordinator | Penataan Bangunan |
| 5 | **Eka Purdiananta, ST** | 198205242009021003 | `eka_purdiananta` | Verifikator | Penataan Bangunan |
| 6 | **Arif Hidayatulloh, ST** | 198901242024211007 | `arif_hidayatulloh` | Operator | Penataan Bangunan |
| 7 | **Super Admin DINPUTARU** | 198501012010011001 | `superadmin` | Super Admin | Sekretariat / Sistem |

*Kata sandi bawaan master akun:* `*Dinput4ru_01` (atau `password123`)

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
├── index.html                   # Single Page Application (SPA) SIKEREN
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
