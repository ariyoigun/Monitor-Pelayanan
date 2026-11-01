# SIMOPEL DINPUTARU KABUPATEN DEMAK
**Sistem Informasi Monitoring Pelayanan Terpadu**  
*Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak*

![SIMOPEL Logo](assets/logo.svg)

---

## 📌 Tentang SIMOPEL
**SIMOPEL (Sistem Informasi Monitoring Pelayanan)** adalah platform pemantauan pelayanan terpadu berbasis web yang dirancang khusus untuk menjamin transparansi, kepastian waktu (SLA), dan akuntabilitas pemrosesan permohonan di lingkungan Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU) Kabupaten Demak.

Sistem ini memadukan **Front-End Publik** (untuk masyarakat dan pelaku usaha memantau berkas secara mandiri) serta **Back-End Internal** (dashboard eksekutif bagi Kepala Dinas, Sekretaris, Kepala Bidang, Koordinator, dan Superadmin).

---

## 🌟 4 Layanan Strategis Terintegrasi
1. **KTTR (Keterangan Rencana Tata Ruang)** - *Bidang Tata Ruang & Pertanahan*  
   *SLA Standar:* 5 Hari Kerja  
   Informasi ketentuan zonasi RTRW/RDTR, Garis Sempadan Bangunan (GSB), KDB, KLB, dan kesesuaian peruntukan ruang.
2. **Validasi KKPR OSS-RBA** - *Bidang Tata Ruang & Pertanahan*  
   *SLA Standar:* 10 Hari Kerja  
   Validasi kesesuaian kegiatan pemanfaatan ruang terintegrasi dengan sistem OSS RBA, polygon SHP koordinat batas lahan, dan pertimbangan teknis pertanahan.
3. **PBG (Persetujuan Bangunan Gedung)** - *Bidang Cipta Karya*  
   *SLA Standar:* 21 Hari Kerja  
   Pengganti IMB untuk pendirian bangunan baru, renovasi, atau perluasan dengan penelaahan arsitektur, struktur tahan gempa, dan utilitas MEP bersama Tim Profesi Ahli (TPA).
4. **SLF (Sertifikat Laik Fungsi)** - *Bidang Cipta Karya*  
   *SLA Standar:* 14 Hari Kerja  
   Sertifikasi kelaikan fungsi bangunan gedung yang telah selesai dibangun/eksisting terkait persyaratan keselamatan kebakaran, keandalan struktur, dan kenyamanan.

---

## 🚀 Fitur Utama Sistem

### 🌐 1. Front-End (Publik)
* **Lacak Berkas Mandiri:** Pencarian cepat menggunakan Nomor Registrasi (contoh: `REG/TRP/2026/001`) atau Nama Pemohon tanpa harus datang ke loket dinas.
* **Jejak Berkas Interaktif (Stepper Timeline):** Menampilkan tahapan riwayat pemeriksaan dari meja loket pendaftaran, verifikator teknis, sidang/survey lapangan, hingga pengesahan SK/Sertifikat.
* **Transparansi Catatan Kendala:** Masyarakat dapat mengetahui alasan spesifik jika berkas tertahan (misalnya perlu perbaikan gambar teknis atau menunggu bukti bayar retribusi).
* **Cetak Lembar Disposisi / Tanda Terima Resmi:** Format dokumen standar pemerintah lengkap dengan kop dinas dan format tanda tangan verifikator.
* **Responsif:** Tampilan optimal di smartphone, tablet, maupun layar desktop.

### 🏢 2. Back-End / Dashboard Internal (Pimpinan & Petugas)
* **Executive Leadership Bottleneck Monitor:** Kotak sorotan pimpinan yang langsung menampilkan berkas-berkas yang tertahan, mendekati batas waktu, atau mengalami kendala teknis agar segera mendapat tindakan/arahan.
* **Metrik KPI Real-Time:** Menghitung total pengajuan, persentase berkas selesai, berkas dalam proses, berkas tertahan (pending), dan status Overdue SLA secara otomatis.
* **Filter & Pencarian Multidimensi:** Filter berdasarkan Bidang (TRP/CK), Jenis Layanan (KTTR/OSS/PBG/SLF), Status Berkas, serta pencarian kata kunci nama/kecamatan/lokasi.
* **Pembaruan Status & Riwayat Verifikasi:** Petugas teknis dapat memperbarui status berkas, posisi meja disposisi, SLA, serta mencatat catatan pemeriksaan baru ke log timeline.
* **Registrasi Permohonan Baru:** Form registrasi lengkap dengan validasi data pemohon, NIB/NIK, kontak WhatsApp, data koordinat/lokasi proyek se-Kabupaten Demak.
* **Cetak Rekapitulasi Eksekutif (PDF Ready):** Laporan ringkas resmi untuk rapat koordinasi dinas atau laporan berkala kepada Bupati.
* **Manajemen Pengguna & Hak Akses (Superadmin):** Mengelola akun staf, penetapan hak akses bidang, reset kata sandi, dan status akun pegawai.

---

## 👥 Hak Akses & Peran Pengguna (RBAC)

| Peran (Role) | Lingkup Wewenang | Contoh Akun (Username) | Kata Sandi |
|---|---|---|---|
| **Kepala Dinas** | Monitoring menyeluruh seluruh bidang, akses cetak laporan eksekutif, disposisi arahan pimpinan. | `kepala_dinas` | `password123` |
| **Sekretaris Dinas** | Monitoring kepatuhan SLA, pengendalian administrasi lintas bidang TRP & CK. | `sekretaris` | `password123` |
| **Kabid TRP** | Validasi & pembaruan status teknis permohonan Bidang Tata Ruang & Pertanahan (KTTR & OSS). | `kabid_trp` | `password123` |
| **Kabid CK** | Validasi & pembaruan status teknis permohonan Bidang Cipta Karya (PBG & SLF). | `kabid_ck` | `password123` |
| **Koordinator Teknis** | Verifikator teknis lapangan & pengelolaan berkas sesuai bidangnya. | `koordinator_trp` / `koordinator_ck` | `password123` |
| **Superadmin** | Kendali penuh sistem, manajemen akun pengguna, reset data simulasi, dan penghapusan berkas. | `admin` | `password123` |

> *Catatan Demo:* Terdapat **Bilah Pengalih Peran Cepat (Quick Role Switcher)** di bagian atas halaman untuk kemudahan pengujian dan demonstrasi presentasi.

---

## 🛠️ Cara Menjalankan Secara Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)

### Langkah Menjalankan
1. Clone repositori ini atau buka direktori proyek:
   ```bash
   git clone https://github.com/ariyoigun/simopel-dinputaru-demak.git
   cd simopel-dinputaru-demak
   ```
2. Jalankan server lokal:
   ```bash
   npm start
   ```
   *(atau `node server.js`)*
3. Buka browser dan akses:
   ```
   http://localhost:3000
   ```

---

## 📁 Struktur Berkas

```
├── assets/
│   └── logo.svg                 # Logo resmi vektor DINPUTARU Kabupaten Demak
├── css/
│   ├── main.css                 # Base design system, variabel warna, tipografi & layout
│   ├── components.css           # Styling tombol, badge, kartu KPI, timeline & modal
│   └── dashboard.css            # Styling khusus dashboard pimpinan & cetak lembar kerja
├── js/
│   ├── data.js                  # Data master awal, konfigurasi SLA layanan & storage helpers
│   ├── auth.js                  # Sistem otentikasi peran & otorisasi hak akses (RBAC)
│   ├── monitoring.js            # Engine tabel monitoring, filtering, KPI & operasi pengajuan
│   ├── tracker.js               # Lacak berkas publik mandiri & generator cetak disposisi/laporan
│   ├── userManagement.js        # Modul manajemen pengguna khusus Superadmin
│   └── app.js                   # Main application router, inisialisasi & event listener global
├── index.html                   # Halaman utama aplikasi (SPA terintegrasi)
├── server.js                    # Web server Node.js ringan (support SPA & security traversal)
├── package.json                 # Metadata proyek & npm scripts
├── .gitignore                   # Konfigurasi ignore file git
└── README.md                    # Dokumentasi lengkap sistem
```

---

## 🏛️ Pemerintah Kabupaten Demak
**Dinas Pekerjaan Umum dan Penataan Ruang (DINPUTARU)**  
Jl. Kyai Singkil No. 7, Bintoro, Demak 59511  
- **Telepon:** (0291) 685112  
- **Email:** dinputaru@demakkab.go.id  
- **Website:** [dinputaru.demakkab.go.id](https://dinputaru.demakkab.go.id)
