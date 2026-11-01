# SILAN - Sistem Monitoring Layanan
**Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak**

![SILAN Logo](assets/logo.svg)

---

## 📌 Tentang SILAN
**SILAN (Sistem Monitoring Layanan)** adalah platform keterbukaan informasi dan pemantauan pelayanan terpadu berbasis web di lingkungan Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU) Kabupaten Demak.

Sistem ini terbagi menjadi dua panel utama:
1. **Panel Halaman Publik (Rangkuman Layanan & Infografis Interaktif)**  
   Menyajikan data agregat jumlah permohonan layanan publik tahun 2026 dalam bentuk infografis, angka, dan grafik komparasi per kategori layanan yang dapat difilter berdasarkan bulan.
2. **Panel Dashboard Monitoring Internal (Petugas & Pimpinan)**  
   Halaman internal khusus petugas berwenang yang **wajib masuk melalui autentikasi login** dengan sistem pengamanan **CAPTCHA perhitungan matematika sederhana**.

---

## 📊 Panel Halaman Publik (Infografis Rangkuman Layanan)
* **Pilihan Periode Bulan Interaktif:** Pengunjung dapat memilih periode *"Sepanjang Tahun 2026 (Jan - Nov)"* atau bulan spesifik (Januari s.d. November 2026) untuk melihat data secara dinamis.
* **4 Kartu Metrik Kategori Layanan:**
  1. **KTTR (Keterangan Rencana Tata Ruang)** - Bidang TRP (Contoh kumulatif: 150 pengajuan, 130 selesai, 20 belum selesai).
  2. **Validasi KKPR OSS-RBA** - Bidang TRP (Contoh kumulatif: 95 pengajuan, 80 selesai, 15 belum selesai).
  3. **PBG (Persetujuan Bangunan Gedung)** - Bidang Cipta Karya (Contoh kumulatif: 210 pengajuan, 175 selesai, 35 belum selesai).
  4. **SLF (Sertifikat Laik Fungsi)** - Bidang Cipta Karya (Contoh kumulatif: 65 pengajuan, 52 selesai, 13 belum selesai).
* **Grafik Visual Komparasi:** Menampilkan rasio persentase dan bar grafik warna hijau (selesai/terbit) vs oranye (belum selesai/on progress) yang langsung menyesuaikan saat periode bulan diganti.
* **Tombol Login Internal:** Terletak di pojok kanan atas navbar untuk akses cepat bagi petugas dinas.

---

## 🔐 Sistem Keamanan & Login Petugas
* **Autentikasi Login Minimalis:** Halaman login yang bersih, elegan, dan profesional.
* **Pengamanan CAPTCHA Matematika Acak:** Setiap kali halaman login dibuka atau di-refresh, sistem secara otomatis menghasilkan soal perhitungan matematika dasar acak (penjumlahan `+`, pengurangan `-`, perkalian `×`, atau pembagian `÷`) yang wajib dijawab dengan benar untuk mencegah bot/serangan otomatis.
* **Tanpa Menu Beralih Peran Terbuka:** Tidak ada lagi bilah pengalih peran publik. Tingkat akses dan wewenang (Kepala Dinas, Sekretaris, Kabid TRP, Kabid CK, Koordinator, Superadmin) ditentukan murni berdasarkan akun login yang diatur di panel admin.

---

## 👥 Akun Petugas & Hak Akses

| Peran (Role) | Username | Password Default | Wewenang Sistem |
|---|---|---|---|
| **Kepala Dinas** | `kepala_dinas` | `password123` | Monitoring eksekutif menyeluruh, rekapitulasi bottleneck, cetak laporan eksekutif PDF |
| **Sekretaris Dinas** | `sekretaris` | `password123` | Monitoring kepatuhan SLA dan pengendalian administrasi lintas bidang |
| **Kabid TRP** | `kabid_trp` | `password123` | Validasi teknis dan pembaruan status berkas Bidang Tata Ruang & Pertanahan (KTTR & OSS) |
| **Kabid CK** | `kabid_ck` | `password123` | Validasi teknis dan pembaruan status berkas Bidang Cipta Karya (PBG & SLF) |
| **Koordinator TRP** | `koordinator_trp` | `password123` | Verifikasi teknis lapangan permohonan zonasi & tata ruang |
| **Koordinator CK** | `koordinator_ck` | `password123` | Verifikasi teknis gambar & sidang TPA permohonan bangunan gedung |
| **Superadmin** | `admin` | `password123` | Kendali penuh sistem, manajemen pengguna (tambah/edit/hapus/reset sandi), dan hapus berkas |

---

## 🚀 Cara Menjalankan Secara Lokal

```bash
# 1. Clone repositori
git clone https://github.com/ariyoigun/Monitor-Pelayanan.git
cd Monitor-Pelayanan

# 2. Jalankan server lokal
npm start

# 3. Buka di browser
http://localhost:3000
```

---

## 📁 Struktur Berkas

```
├── assets/
│   └── logo.svg                 # Logo vektor resmi DINPUTARU Kabupaten Demak
├── css/
│   ├── main.css                 # Base design system & layout responsif
│   ├── components.css           # Styling infografis, kartu layanan, bar chart & captcha
│   └── dashboard.css            # Styling dashboard pimpinan & cetak lembar kerja
├── js/
│   ├── data.js                  # Master data, dataset bulanan 2026 & storage helper
│   ├── auth.js                  # Autentikasi akun, generator CAPTCHA matematika & role guard
│   ├── infografis.js            # Engine infografis publik, filter bulan & grafik dinamis
│   ├── monitoring.js            # Engine tabel monitoring internal, filter & operasi berkas
│   ├── userManagement.js        # Modul manajemen pengguna khusus Superadmin
│   ├── tracker.js               # Generator cetak disposisi & laporan eksekutif PDF
│   └── app.js                   # Application router & inisialisasi modul global
├── index.html                   # Single Page Application (SPA) SILAN
├── server.js                    # Web server Node.js ringan (support SPA & traversal protection)
├── package.json                 # Metadata proyek & npm scripts
├── .gitignore                   # Ignore file git
└── README.md                    # Dokumentasi lengkap sistem
```

---

## 🏛️ Pemerintah Kabupaten Demak
**Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU)**  
Jl. Kyai Singkil No. 7, Bintoro, Demak 59511  
- **Telepon:** (0291) 685112  
- **Email:** dinputaru@demakkab.go.id  
- **Website:** [dinputaru.demakkab.go.id](https://dinputaru.demakkab.go.id)
