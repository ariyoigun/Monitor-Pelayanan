/**
 * SIMOPEL DINPUTARU DEMAK - Sistem Informasi Monitoring Pelayanan
 * Data Master, Mock Initial Data & Default State
 */

const INITIAL_USERS = [
  {
    id: "USR-001",
    username: "admin",
    password: "password123",
    nama: "Hafidz Nur Pratama, S.Kom",
    nip: "19880512 201201 1 004",
    role: "superadmin",
    roleLabel: "Superadmin Sistem",
    bidang: "Semua Bidang",
    jabatan: "Pranata Komputer Ahli Muda / Administrator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    email: "admin.dinputaru@demakkab.go.id",
    noHp: "081228991200",
    status: "Aktif"
  },
  {
    id: "USR-002",
    username: "kepala_dinas",
    password: "password123",
    nama: "Dr. H. Akhmad Sugiharto, S.T., M.T.",
    nip: "19720418 199803 1 006",
    role: "kepala_dinas",
    roleLabel: "Kepala Dinas",
    bidang: "Semua Bidang",
    jabatan: "Kepala Dinas PUTARU Kabupaten Demak",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    email: "kadin.dinputaru@demakkab.go.id",
    noHp: "08112700445",
    status: "Aktif"
  },
  {
    id: "USR-003",
    username: "sekretaris",
    password: "password123",
    nama: "Dra. Hj. Sri Wahyuni, M.M.",
    nip: "19750914 200003 2 003",
    role: "sekretaris",
    roleLabel: "Sekretaris Dinas",
    bidang: "Semua Bidang",
    jabatan: "Sekretaris Dinas PUTARU Kabupaten Demak",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    email: "sekretaris.dinputaru@demakkab.go.id",
    noHp: "08122556091",
    status: "Aktif"
  },
  {
    id: "USR-004",
    username: "kabid_trp",
    password: "password123",
    nama: "Drs. Hendro Wibowo, M.Si.",
    nip: "19780120 200312 1 005",
    role: "kepala_bidang",
    roleLabel: "Kepala Bidang TRP",
    bidang: "TRP",
    bidangLabel: "Tata Ruang & Pertanahan",
    jabatan: "Kepala Bidang Tata Ruang dan Pertanahan",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    email: "kabid.trp@demakkab.go.id",
    noHp: "08132644901",
    status: "Aktif"
  },
  {
    id: "USR-005",
    username: "kabid_ck",
    password: "password123",
    nama: "Ir. Sulistiyono, M.T.",
    nip: "19770805 200212 1 008",
    role: "kepala_bidang",
    roleLabel: "Kepala Bidang Cipta Karya",
    bidang: "CK",
    bidangLabel: "Cipta Karya",
    jabatan: "Kepala Bidang Cipta Karya",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    email: "kabid.ck@demakkab.go.id",
    noHp: "08122900772",
    status: "Aktif"
  },
  {
    id: "USR-006",
    username: "koordinator_trp",
    password: "password123",
    nama: "Ir. Bambang Sugiarto, S.T.",
    nip: "19830615 200902 1 003",
    role: "koordinator_bidang",
    roleLabel: "Koordinator Teknis TRP",
    bidang: "TRP",
    bidangLabel: "Tata Ruang & Pertanahan",
    jabatan: "Penata Ruang Ahli Muda / Sub-Koordinator",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    email: "bambang.trp@demakkab.go.id",
    noHp: "08157500122",
    status: "Aktif"
  },
  {
    id: "USR-007",
    username: "koordinator_ck",
    password: "password123",
    nama: "Arief Prasetyo, S.T., M.Eng.",
    nip: "19851128 201001 1 015",
    role: "koordinator_bidang",
    roleLabel: "Koordinator Teknis Cipta Karya",
    bidang: "CK",
    bidangLabel: "Cipta Karya",
    jabatan: "Teknik Tata Bangunan & Perumahan Ahli Muda",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    email: "arief.ck@demakkab.go.id",
    noHp: "08139044321",
    status: "Aktif"
  }
];

const LAYANAN_CONFIG = {
  KTTR: {
    kode: "KTTR",
    nama: "Keterangan Rencana Tata Ruang (KTTR)",
    bidang: "TRP",
    bidangNama: "Tata Ruang & Pertanahan",
    standarSLA: 5, // hari kerja
    dasarHukum: "Perda Kab. Demak No. 1 Tahun 2020 tentang RTRW & Permen ATR/BPN No. 13 Tahun 2021",
    deskripsi: "Penyediaan informasi ketentuan intensitas pemanfaatan ruang (KDB, KLB, KDH, GSB) dan kesesuaian rencana zonasi terhadap RTRW/RDTR Kabupaten Demak.",
    tahapan: [
      "Verifikasi Administrasi Berkas",
      "Pemeriksaan Geospasial RDTR/RTRW",
      "Tinjauan & Survey Lapangan",
      "Kajian Teknis & Draft Lembar KTTR",
      "Validasi Kepala Bidang TRP",
      "Pengesahan & Penerbitan Dokumen"
    ]
  },
  OSS: {
    kode: "OSS",
    nama: "Validasi Kesesuaian Tata Ruang (KKPR OSS)",
    bidang: "TRP",
    bidangNama: "Tata Ruang & Pertanahan",
    standarSLA: 10, // hari kerja
    dasarHukum: "PP No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko & PP No. 21/2021",
    deskripsi: "Validasi dan verifikasi teknis permohonan Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) untuk izin berusaha melalui sistem terintegrasi OSS RBA.",
    tahapan: [
      "Integrasi Permohonan OSS RBA",
      "Verifikasi Poligon SHP & Batas Lahan",
      "Kajian Kebijakan Tata Ruang & Sempadan",
      "Penyusunan Pertimbangan Teknis Pertanahan",
      "Persetujuan Rekomendasi Kabid TRP",
      "Validasi & TTE Sistem OSS Terbit"
    ]
  },
  PBG: {
    kode: "PBG",
    nama: "Persetujuan Bangunan Gedung (PBG)",
    bidang: "CK",
    bidangNama: "Cipta Karya",
    standarSLA: 21, // hari kerja
    dasarHukum: "UU No. 11/2020 Cipta Kerja, PP No. 16 Tahun 2021, & Perda PBG Kabupaten Demak",
    deskripsi: "Perizinan yang diberikan kepada pemilik bangunan gedung untuk membangun baru, mengubah, memperluas, mengurangi, dan/atau merawat bangunan gedung sesuai standar teknis.",
    tahapan: [
      "Verifikasi Kelengkapan Dokumen SIMBG",
      "Penugasan & Penjadwalan Sidang TPA/TPT",
      "Sidang Konsultasi & Penilaian Teknis",
      "Penyusunan Berita Acara Rekomtek PBG",
      "Penetapan & Verifikasi Retribusi Daerah",
      "Penerbitan Surat Keputusan (SK) PBG"
    ]
  },
  SLF: {
    kode: "SLF",
    nama: "Sertifikat Laik Fungsi (SLF)",
    bidang: "CK",
    bidangNama: "Cipta Karya",
    standarSLA: 14, // hari kerja
    dasarHukum: "PP No. 16 Tahun 2021 tentang Bangunan Gedung & Permen PUPR No. 27/PRT/M/2018",
    deskripsi: "Sertifikat yang diterbitkan oleh pemerintah daerah untuk menyatakan kelaikan fungsi bangunan gedung sebelum dapat dimanfaatkan secara aman dan nyaman.",
    tahapan: [
      "Pemeriksaan Dokumen As-Built Drawing & SIMBG",
      "Inspeksi Visual & Pengujian Kelaikan Struktur/MEP",
      "Rapat Evaluasi Tim Penilai Teknis (TPT)",
      "Pemenuhan Catatan Rekomendasi Teknis",
      "Paraf Koordinasi Rekomendasi SLF",
      "Penandatanganan & Penerbitan Sertifikat SLF"
    ]
  }
};

const INITIAL_SUBMISSIONS = [
  // 1. KTTR - SELESAI
  {
    id: "SUB-2026-001",
    noRegistrasi: "REG/TRP/2026/001",
    layanan: "KTTR",
    bidang: "TRP",
    namaPemohon: "PT Sayung Logistik Raya (Bpk. Joko Santoso)",
    jenisPemohon: "Badan Usaha / PT",
    nikNib: "NIB: 9120003418291",
    noHp: "081234567890",
    email: "perizinan@sayunglogistik.co.id",
    namaKegiatan: "Pembangunan Kompleks Pergudangan & Distribusi Semen",
    lokasiProyek: "Jl. Raya Semarang - Demak KM 11, Desa Sriwulan",
    kecamatan: "Sayung",
    luasLahan: "18.500 m²",
    luasBangunan: "11.200 m²",
    tglPengajuan: "2026-10-02",
    estimasiSelesai: "2026-10-09",
    tglSelesai: "2026-10-08",
    status: "SELESAI",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Pengesahan & Penerbitan Dokumen (Selesai)",
    tahapIndex: 5,
    posisiMeja: "Loket Pelayanan Terpadu DINPUTARU",
    penanggungJawab: "Ir. Bambang Sugiarto, S.T. (Koordinator TRP)",
    noSuratKeputusan: "650/KTTR/2026/0142",
    keteranganKendala: "Tidak ada kendala. Rekomendasi tata ruang zonasi industri telah sesuai Perda RTRW Kab. Demak.",
    catatanPimpinan: "Dokumen telah ditandatangani secara elektronik (TTE) oleh Kepala Dinas.",
    timeline: [
      { waktu: "2026-10-02 08:30", tahap: "Verifikasi Administrasi Berkas", status: "DONE", petugas: "Front Office TRP", catatan: "Kelengkapan sertifikat HGB dan KTP pemohon lengkap & valid." },
      { waktu: "2026-10-03 10:15", tahap: "Pemeriksaan Geospasial RDTR/RTRW", status: "DONE", petugas: "Tim GIS TRP", catatan: "Zonasi peruntukan Industri Menengah. Garis Sempadan Jalan Nasional 20 meter dari as jalan." },
      { waktu: "2026-10-05 13:30", tahap: "Tinjauan & Survey Lapangan", status: "DONE", petugas: "Tim Teknis TRP", catatan: "Cek patok batas lahan, tidak bersinggungan dengan saluran irigasi primer." },
      { waktu: "2026-10-06 11:00", tahap: "Kajian Teknis & Draft Lembar KTTR", status: "DONE", petugas: "Ir. Bambang Sugiarto, S.T.", catatan: "Draf ketetapan KDB max 60%, KLB 1.8, KDH min 20% siap diajukan." },
      { waktu: "2026-10-07 14:00", tahap: "Validasi Kepala Bidang TRP", status: "DONE", petugas: "Drs. Hendro Wibowo, M.Si.", catatan: "Diverifikasi dan disetujui tanpa perbaikan." },
      { waktu: "2026-10-08 09:45", tahap: "Pengesahan & Penerbitan Dokumen", status: "DONE", petugas: "Dr. H. Akhmad Sugiharto, S.T., M.T.", catatan: "SK KTTR disahkan dan diterbitkan." }
    ]
  },

  // 2. KTTR - KENDALA BERKAS PEMOHON (PENDING)
  {
    id: "SUB-2026-002",
    noRegistrasi: "REG/TRP/2026/002",
    layanan: "KTTR",
    bidang: "TRP",
    namaPemohon: "CV Sari Bumi Demak (Bpk. H. Sukirno)",
    jenisPemohon: "Badan Usaha / CV",
    nikNib: "NIB: 0220205930211",
    noHp: "081390112233",
    email: "saribumidemak@gmail.com",
    namaKegiatan: "Pabrik Pengolahan Gabah & Penggilingan Padi Modern",
    lokasiProyek: "Jl. Guntur - Karangawen KM 4, Desa Sukorejo",
    kecamatan: "Guntur",
    luasLahan: "7.200 m²",
    luasBangunan: "3.500 m²",
    tglPengajuan: "2026-10-09",
    estimasiSelesai: "2026-10-16",
    tglSelesai: null,
    status: "PENDING_PEMOHON",
    slaStatus: "OVERDUE",
    tahapSaatIni: "Kajian Teknis & Draft Lembar KTTR (Tertahan)",
    tahapIndex: 3,
    posisiMeja: "Meja Koordinator Bidang TRP",
    penanggungJawab: "Ir. Bambang Sugiarto, S.T. (Koordinator TRP)",
    noSuratKeputusan: "-",
    keteranganKendala: "KENDALA UTAMA: Pemohon belum melengkapi Akta Peralihan Hak Atas Tanah (AJB) dan koordinat batas patok BPN terbaru. Terdapat selisih luas ukur 420 m² dengan peta PBB.",
    catatanPimpinan: "Surat permintaan perbaikan berkas No. 650/118/TRP telah dikirimkan via WA & pos pada 14 Okt 2026. Menunggu respon pemohon.",
    timeline: [
      { waktu: "2026-10-09 09:00", tahap: "Verifikasi Administrasi Berkas", status: "DONE", petugas: "Front Office TRP", catatan: "Berkas masuk, tanda terima sementara diterbitkan." },
      { waktu: "2026-10-11 11:30", tahap: "Pemeriksaan Geospasial RDTR/RTRW", status: "DONE", petugas: "Tim GIS TRP", catatan: "Lokasi masuk zonasi Tanaman Pangan Beririgasi Teknis Sebagian, perlu validasi status LP2B." },
      { waktu: "2026-10-13 14:00", tahap: "Tinjauan & Survey Lapangan", status: "DONE", petugas: "Tim Teknis TRP", catatan: "Hasil pengukuran batas lahan tidak klop dengan SHM yang dilampirkan." },
      { waktu: "2026-10-14 10:00", tahap: "Kajian Teknis & Draft Lembar KTTR", status: "HOLD", petugas: "Ir. Bambang Sugiarto, S.T.", catatan: "Berkas di-hold: Menunggu klarifikasi surat keterangan kepala desa & peta ukur BPN dari pemohon." }
    ]
  },

  // 3. KTTR - PROSES BERJALAN ON TRACK
  {
    id: "SUB-2026-003",
    noRegistrasi: "REG/TRP/2026/003",
    layanan: "KTTR",
    bidang: "TRP",
    namaPemohon: "Klinik Rawat Inap Sehat Mandiri (dr. Rina Puspitasari)",
    jenisPemohon: "Perorangan / Profesi",
    nikNib: "NIK: 3321045903870002",
    noHp: "085741889900",
    email: "dr.rina.puspita@yahoo.com",
    namaKegiatan: "Pengembangan Bangunan Klinik dan Farmasi",
    lokasiProyek: "Jl. Raya Bandungrejo No. 88",
    kecamatan: "Mranggen",
    luasLahan: "1.450 m²",
    luasBangunan: "980 m²",
    tglPengajuan: "2026-10-17",
    estimasiSelesai: "2026-10-24",
    tglSelesai: null,
    status: "PROSES",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Pemeriksaan Geospasial RDTR/RTRW",
    tahapIndex: 1,
    posisiMeja: "Meja Tim GIS Tata Ruang",
    penanggungJawab: "Ir. Bambang Sugiarto, S.T. (Koordinator TRP)",
    noSuratKeputusan: "-",
    keteranganKendala: "Tidak ada kendala berarti. Sedang overlay dengan rencana jaringan drainase jalan perkotaan Mranggen.",
    catatanPimpinan: "Survey dijadwalkan Rabu pagi bersama dinas kesehatan.",
    timeline: [
      { waktu: "2026-10-17 10:00", tahap: "Verifikasi Administrasi Berkas", status: "DONE", petugas: "Front Office TRP", catatan: "Dokumen administrasi lengkap, izin operasional lama dilampirkan." },
      { waktu: "2026-10-19 09:00", tahap: "Pemeriksaan Geospasial RDTR/RTRW", status: "ACTIVE", petugas: "Tim GIS TRP", catatan: "Sedang dilakukan analisis zoning kawasan fasilitas umum kesehatan." }
    ]
  },

  // 4. KTTR - MENUNGGU APPROVAL KEPALA DINAS
  {
    id: "SUB-2026-004",
    noRegistrasi: "REG/TRP/2026/004",
    layanan: "KTTR",
    bidang: "TRP",
    namaPemohon: "Perumahan Subsidi Demak Asri (PT Demak Graha Pratama)",
    jenisPemohon: "Pengembang / Developer",
    nikNib: "NIB: 0129038472911",
    noHp: "081229871144",
    email: "demakgraha@property.com",
    namaKegiatan: "Pembangunan Perumahan MBR 150 Unit Rumah Tapak",
    lokasiProyek: "Desa Katonsari",
    kecamatan: "Demak",
    luasLahan: "25.000 m²",
    luasBangunan: "8.400 m²",
    tglPengajuan: "2026-10-12",
    estimasiSelesai: "2026-10-21",
    tglSelesai: null,
    status: "MENUNGGU_APPROVAL",
    slaStatus: "WARNING",
    tahapSaatIni: "Pengesahan & Penerbitan Dokumen (Di Meja Kadis)",
    tahapIndex: 5,
    posisiMeja: "Meja Kepala Dinas",
    penanggungJawab: "Dr. H. Akhmad Sugiharto, S.T., M.T.",
    noSuratKeputusan: "Draft: 650/KTTR/2026/0158",
    keteranganKendala: "Berkas draf telah selesai diparaf Kabid TRP dan Sekdin. Menunggu tandatangan digital (TTE) Kepala Dinas.",
    catatanPimpinan: "Catatan Sekdin: Telah diverifikasi fasum RTH 30% dan embung retensi banjir lokal terpenuhi.",
    timeline: [
      { waktu: "2026-10-12 11:00", tahap: "Verifikasi Administrasi Berkas", status: "DONE", petugas: "Front Office TRP", catatan: "Sertifikat tanah HGB dan masterplan kawasan valid." },
      { waktu: "2026-10-14 13:00", tahap: "Pemeriksaan Geospasial RDTR/RTRW", status: "DONE", petugas: "Tim GIS TRP", catatan: "Sesuai zonasi permukiman kepadatan sedang (R3)." },
      { waktu: "2026-10-16 10:00", tahap: "Tinjauan & Survey Lapangan", status: "DONE", petugas: "Tim Survey TRP", catatan: "Kesiapan akses jalan keluar masuk lebar 8 meter memadai." },
      { waktu: "2026-10-18 15:00", tahap: "Kajian Teknis & Draft Lembar KTTR", status: "DONE", petugas: "Ir. Bambang Sugiarto, S.T.", catatan: "Rekomendasi teknis disusun lengkap." },
      { waktu: "2026-10-19 11:30", tahap: "Validasi Kepala Bidang TRP", status: "DONE", petugas: "Drs. Hendro Wibowo, M.Si.", catatan: "Disetujui dan diteruskan ke Sekretaris Dinas & Kadin." },
      { waktu: "2026-10-20 08:30", tahap: "Pengesahan & Penerbitan Dokumen", status: "ACTIVE", petugas: "Dr. H. Akhmad Sugiharto, S.T., M.T.", catatan: "Dalam antrean verifikasi TTE Kadin." }
    ]
  },

  // 5. VALIDASI OSS - PROSES OVERLAP SEMPADAN (KENDALA TEKNIS)
  {
    id: "SUB-2026-005",
    noRegistrasi: "REG/OSS/2026/001",
    layanan: "OSS",
    bidang: "TRP",
    namaPemohon: "PT Central Java Polybag Industry (Bpk. Denny Kurniawan)",
    jenisPemohon: "Badan Usaha / PMA-PMDN",
    nikNib: "NIB: 1249000340019",
    noHp: "08119888231",
    email: "denny@cjpolybag.co.id",
    namaKegiatan: "Pabrik Pembuatan Plastik Kemasan dan Polybag Pertanian",
    lokasiProyek: "Kawasan Industri Sayung, Jl. Raya Semarang-Demak KM 14",
    kecamatan: "Sayung",
    luasLahan: "32.000 m²",
    luasBangunan: "18.500 m²",
    tglPengajuan: "2026-10-06",
    estimasiSelesai: "2026-10-18",
    tglSelesai: null,
    status: "PROSES",
    slaStatus: "OVERDUE",
    tahapSaatIni: "Kajian Kebijakan Tata Ruang & Sempadan",
    tahapIndex: 2,
    posisiMeja: "Meja Kepala Bidang TRP",
    penanggungJawab: "Drs. Hendro Wibowo, M.Si. (Kabid TRP)",
    noSuratKeputusan: "-",
    keteranganKendala: "KENDALA SPASIAL: Polygon koordinat SHP yang diunggah di OSS tumpang tindih (overlap) selebar 8 meter dengan sempadan tanggul BBWS Pemali-Juana & rencana trase tol Semarang-Demak Seksi 1.",
    catatanPimpinan: "Perlu surat konfirmasi resmi ke BBWS dan BBPJN Jawa Tengah sebelum validasi disetujui.",
    timeline: [
      { waktu: "2026-10-06 09:30", tahap: "Integrasi Permohonan OSS RBA", status: "DONE", petugas: "Operator OSS TRP", catatan: "Data permohonan KKPR OSS RBA ditarik ke sistem daerah." },
      { waktu: "2026-10-08 14:00", tahap: "Verifikasi Poligon SHP & Batas Lahan", status: "DONE", petugas: "Analis Spasial TRP", catatan: "Hasil overlay menunjukkan overlap seluas 240 m2 pada sempadan sungai & tol." },
      { waktu: "2026-10-12 10:00", tahap: "Kajian Kebijakan Tata Ruang & Sempadan", status: "HOLD", petugas: "Drs. Hendro Wibowo, M.Si.", catatan: "Rapat koordinasi teknis bersama BBWS Pemali Juana dijadwalkan." }
    ]
  },

  // 6. VALIDASI OSS - SELESAI
  {
    id: "SUB-2026-006",
    noRegistrasi: "REG/OSS/2026/002",
    layanan: "OSS",
    bidang: "TRP",
    namaPemohon: "SPBU Pertamina Mandiri Jaya (Bpk. H. Sukamto)",
    jenisPemohon: "Badan Usaha / SPBU",
    nikNib: "NIB: 0281948201948",
    noHp: "081228114400",
    email: "spbu.demak595@gmail.com",
    namaKegiatan: "Pengembangan SPBU, SPKLU Listrik & Food Court",
    lokasiProyek: "Jl. Raya Trengguli, Desa Trengguli",
    kecamatan: "Won流行 / Wonosalam",
    luasLahan: "4.800 m²",
    luasBangunan: "1.200 m²",
    tglPengajuan: "2026-10-04",
    estimasiSelesai: "2026-10-16",
    tglSelesai: "2026-10-15",
    status: "SELESAI",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Validasi & TTE Sistem OSS Terbit (Selesai)",
    tahapIndex: 5,
    posisiMeja: "Sistem Terintegrasi OSS-RBA BKPM",
    penanggungJawab: "Drs. Hendro Wibowo, M.Si. (Kabid TRP)",
    noSuratKeputusan: "KKPR-OSS-595/2026/0089",
    keteranganKendala: "Tidak ada kendala. Rekomendasi teknis kesesuaian ruang disetujui penuh.",
    catatanPimpinan: "Disetujui oleh Kadin pada 15 Oktober 2026.",
    timeline: [
      { waktu: "2026-10-04 08:00", tahap: "Integrasi Permohonan OSS RBA", status: "DONE", petugas: "Operator OSS TRP", catatan: "Sinkronisasi permohonan baru." },
      { waktu: "2026-10-06 10:00", tahap: "Verifikasi Poligon SHP & Batas Lahan", status: "DONE", petugas: "Tim GIS TRP", catatan: "Polygon bersih, tidak ada irisan kawasan lindung." },
      { waktu: "2026-10-09 13:00", tahap: "Kajian Kebijakan Tata Ruang & Sempadan", status: "DONE", petugas: "Ir. Bambang Sugiarto, S.T.", catatan: "Akses keluar masuk memenuhi standar keselamatan LLAJ Dishub." },
      { waktu: "2026-10-12 11:00", tahap: "Penyusunan Pertimbangan Teknis Pertanahan", status: "DONE", petugas: "Tim PTP Pertanahan", catatan: "PTP terbit dari Kantor Pertanahan BPN Demak." },
      { waktu: "2026-10-14 14:00", tahap: "Persetujuan Rekomendasi Kabid TRP", status: "DONE", petugas: "Drs. Hendro Wibowo, M.Si.", catatan: "Rekomendasi teknis disetujui." },
      { waktu: "2026-10-15 16:30", tahap: "Validasi & TTE Sistem OSS Terbit", status: "DONE", petugas: "Dr. H. Akhmad Sugiharto, S.T., M.T.", catatan: "TTE persetujuan KKPR OSS berhasil ditransmisikan." }
    ]
  },

  // 7. VALIDASI OSS - PROSES TAHAP PERTIMBANGAN TEKNIS
  {
    id: "SUB-2026-007",
    noRegistrasi: "REG/OSS/2026/003",
    layanan: "OSS",
    bidang: "TRP",
    namaPemohon: "UD Sumber Rejeki Ternak (Bpk. Mulyadi)",
    jenisPemohon: "Perorangan / Usaha Mikro",
    nikNib: "NIB: 9120394857281",
    noHp: "087832115599",
    email: "peternakan.sumberrejeki@yahoo.com",
    namaKegiatan: "Peternakan Ayam Petelur Modern Closed House",
    lokasiProyek: "Dukuh Bogosari, Desa Brambang",
    kecamatan: "Karangawen",
    luasLahan: "9.500 m²",
    luasBangunan: "4.200 m²",
    tglPengajuan: "2026-10-14",
    estimasiSelesai: "2026-10-26",
    tglSelesai: null,
    status: "PROSES",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Penyusunan Pertimbangan Teknis Pertanahan",
    tahapIndex: 3,
    posisiMeja: "Meja Koordinator Bidang TRP",
    penanggungJawab: "Ir. Bambang Sugiarto, S.T. (Koordinator TRP)",
    noSuratKeputusan: "-",
    keteranganKendala: "Sedang menunggu konfirmasi jarak radius dengan permukiman warga terdekat (syarat higienitas lingkungan).",
    catatanPimpinan: "Dinas Lingkungan Hidup Kabupaten Demak telah memberikan surat keterangan kesanggupan UKL-UPL.",
    timeline: [
      { waktu: "2026-10-14 10:00", tahap: "Integrasi Permohonan OSS RBA", status: "DONE", petugas: "Operator OSS TRP", catatan: "Dokumen ditarik dari OSS." },
      { waktu: "2026-10-16 11:00", tahap: "Verifikasi Poligon SHP & Batas Lahan", status: "DONE", petugas: "Tim GIS TRP", catatan: "Zonasi agropolitan budidaya peternakan." },
      { waktu: "2026-10-18 14:00", tahap: "Kajian Kebijakan Tata Ruang & Sempadan", status: "DONE", petugas: "Ir. Bambang Sugiarto, S.T.", catatan: "Sempadan jalan kabupaten 12 meter terpenuhi." },
      { waktu: "2026-10-19 13:00", tahap: "Penyusunan Pertimbangan Teknis Pertanahan", status: "ACTIVE", petugas: "Tim PTP Pertanahan", catatan: "Penyelarasan pertimbangan teknis dengan BPN." }
    ]
  },

  // 8. PBG - SIDANG TPA (KENDALA PERBAIKAN STRUKTUR GEMPA)
  {
    id: "SUB-2026-008",
    noRegistrasi: "REG/PBG/2026/001",
    layanan: "PBG",
    bidang: "CK",
    namaPemohon: "Badan Layanan Umum RSUD Sunan Kalijaga Demak",
    jenisPemohon: "Instansi Pemerintah Daerah",
    nikNib: "NIP PPK: 19800315 200501 1 009",
    noHp: "081226778899",
    email: "rsud@demakkab.go.id",
    namaKegiatan: "Pembangunan Gedung Rawat Inap & ICU 5 Lantai",
    lokasiProyek: "Jl. Sultan Fatah No. 669, Bintoro",
    kecamatan: "Demak",
    luasLahan: "12.000 m²",
    luasBangunan: "6.850 m²",
    tglPengajuan: "2026-09-22",
    estimasiSelesai: "2026-10-18",
    tglSelesai: null,
    status: "SIDANG_SURVEY",
    slaStatus: "OVERDUE",
    tahapSaatIni: "Sidang Konsultasi & Penilaian Teknis (Revisi Desain)",
    tahapIndex: 2,
    posisiMeja: "Sekretariat Tim Profesi Ahli (TPA) Cipta Karya",
    penanggungJawab: "Arief Prasetyo, S.T., M.Eng. (Koordinator CK)",
    noSuratKeputusan: "-",
    keteranganKendala: "KENDALA TEKNIS STRUKTUR: Tim Ahli TPA Bidang Struktur meminta konsultan perencana merevisi perhitungan pondasi spun pile dan ketahanan beban seismik gempa zona pesisir Demak.",
    catatanPimpinan: "Sidang Pleno Ulang dijadwalkan pada Kamis, 22 Oktober 2026 setelah dokumen perbaikan DED diserahkan.",
    timeline: [
      { waktu: "2026-09-22 09:00", tahap: "Verifikasi Kelengkapan Dokumen SIMBG", status: "DONE", petugas: "Operator SIMBG CK", catatan: "Dokumen arsitektur, struktur, MEP lengkap diupload." },
      { waktu: "2026-09-26 14:00", tahap: "Penugasan & Penjadwalan Sidang TPA/TPT", status: "DONE", petugas: "Arief Prasetyo, S.T., M.Eng.", catatan: "Menunjuk Tim Ahli: Dr. Ir. Wahyudi (Struktur) & Ar. Dimas (Arsitektur)." },
      { waktu: "2026-10-04 10:00", tahap: "Sidang Konsultasi & Penilaian Teknis", status: "HOLD", petugas: "Tim Profesi Ahli (TPA)", catatan: "Ditemukan catatan teknis krusial terkait respon spektrum tanah lunak Demak." }
    ]
  },

  // 9. PBG - MENUNGGU BUKTI PEMBAYARAN RETRIBUSI DARI PEMOHON
  {
    id: "SUB-2026-009",
    noRegistrasi: "REG/PBG/2026/002",
    layanan: "PBG",
    bidang: "CK",
    namaPemohon: "PT Hasil Laut Bahari Sayung (Bpk. H. Zaenal Arifin)",
    jenisPemohon: "Badan Usaha Swasta",
    nikNib: "NIB: 8129038471029",
    noHp: "081325114789",
    email: "zaenal@hasillautbahari.com",
    namaKegiatan: "Pembangunan Cold Storage & Pengolahan Ikan",
    lokasiProyek: "Jl. Morosari RT 03 RW 01, Desa Bedono",
    kecamatan: "Sayung",
    luasLahan: "8.600 m²",
    luasBangunan: "4.800 m²",
    tglPengajuan: "2026-09-28",
    estimasiSelesai: "2026-10-23",
    tglSelesai: null,
    status: "PENDING_PEMOHON",
    slaStatus: "WARNING",
    tahapSaatIni: "Penetapan & Verifikasi Retribusi Daerah",
    tahapIndex: 4,
    posisiMeja: "Loket Keuangan & Kas Daerah BPKPAD",
    penanggungJawab: "Ir. Sulistiyono, M.T. (Kabid Cipta Karya)",
    noSuratKeputusan: "SKRD: 973/PBG/2026/0411",
    keteranganKendala: "MENUNGGU SETORAN RETRIBUSI: Surat Ketetapan Retribusi Daerah (SKRD) telah terbit senilai Rp 18.720.000. Pemohon belum mengunggah bukti validasi setoran Bank Jateng.",
    catatanPimpinan: "Batas jatuh tempo pembayaran pada 23 Oktober 2026. Staf CK telah mengirim reminder via WhatsApp.",
    timeline: [
      { waktu: "2026-09-28 10:00", tahap: "Verifikasi Kelengkapan Dokumen SIMBG", status: "DONE", petugas: "Operator SIMBG CK", catatan: "Dokumen lengkap dan terverifikasi." },
      { waktu: "2026-10-02 11:00", tahap: "Penugasan & Penjadwalan Sidang TPA/TPT", status: "DONE", petugas: "Arief Prasetyo, S.T., M.Eng.", catatan: "Penetapan jadwal TPT." },
      { waktu: "2026-10-08 09:30", tahap: "Sidang Konsultasi & Penilaian Teknis", status: "DONE", petugas: "Tim Penilai Teknis (TPT)", catatan: "Desain disetujui dengan catatan ketinggian peil lantai +1.50m antisipasi rob." },
      { waktu: "2026-10-14 13:00", tahap: "Penyusunan Berita Acara Rekomtek PBG", status: "DONE", petugas: "Ir. Sulistiyono, M.T.", catatan: "Berita acara kelaikan teknis ditandatangani." },
      { waktu: "2026-10-16 11:00", tahap: "Penetapan & Verifikasi Retribusi Daerah", status: "ACTIVE", petugas: "Bendahara Khusus Penerimaan", catatan: "SKRD terbit, menunggu konfirmasi bukti setor pemohon." }
    ]
  },

  // 10. PBG - SELESAI
  {
    id: "SUB-2026-010",
    noRegistrasi: "REG/PBG/2026/003",
    layanan: "PBG",
    bidang: "CK",
    namaPemohon: "H. Ahmad Fauzi & Hj. Maryam",
    jenisPemohon: "Perorangan",
    nikNib: "NIK: 3321012904710001",
    noHp: "081228445566",
    email: "ahmadfauzi.demak@gmail.com",
    namaKegiatan: "Pembangunan Ruko 3 Lantai (Toko Tekstil & Hunian)",
    lokasiProyek: "Jl. Pemuda No. 45, Kelurahan Bintoro",
    kecamatan: "Demak",
    luasLahan: "450 m²",
    luasBangunan: "720 m²",
    tglPengajuan: "2026-09-18",
    estimasiSelesai: "2026-10-12",
    tglSelesai: "2026-10-11",
    status: "SELESAI",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Penerbitan Surat Keputusan (SK) PBG (Selesai)",
    tahapIndex: 5,
    posisiMeja: "Arsip Perizinan Gedung & SIMBG",
    penanggungJawab: "Ir. Sulistiyono, M.T. (Kabid Cipta Karya)",
    noSuratKeputusan: "SK-PBG-3321-2026-00412",
    keteranganKendala: "Tidak ada kendala. Retribusi daerah Rp 4.250.000 lunas terbayar.",
    catatanPimpinan: "Sertifikat PBG telah diserahkan langsung ke pemohon.",
    timeline: [
      { waktu: "2026-09-18 08:30", tahap: "Verifikasi Kelengkapan Dokumen SIMBG", status: "DONE", petugas: "Operator SIMBG CK", catatan: "Gambar teknis arsitek bersertifikat STRA lengkap." },
      { waktu: "2026-09-23 10:00", tahap: "Penugasan & Penjadwalan Sidang TPA/TPT", status: "DONE", petugas: "Arief Prasetyo, S.T., M.Eng.", catatan: "Penilaian berkas oleh TPT Cipta Karya." },
      { waktu: "2026-09-29 13:30", tahap: "Sidang Konsultasi & Penilaian Teknis", status: "DONE", petugas: "TPT Cipta Karya", catatan: "Persetujuan desain tangga darurat dan proteksi kebakaran APAR." },
      { waktu: "2026-10-04 10:00", tahap: "Penyusunan Berita Acara Rekomtek PBG", status: "DONE", petugas: "Arief Prasetyo, S.T., M.Eng.", catatan: "Berita acara penerbitan disahkan." },
      { waktu: "2026-10-07 11:00", tahap: "Penetapan & Verifikasi Retribusi Daerah", status: "DONE", petugas: "Petugas Kasda", catatan: "Pembayaran terverifikasi via QRIS BPD Jateng." },
      { waktu: "2026-10-11 14:00", tahap: "Penerbitan Surat Keputusan (SK) PBG", status: "DONE", petugas: "Dr. H. Akhmad Sugiharto, S.T., M.T.", catatan: "SK PBG diterbitkan & diupload ke SIMBG." }
    ]
  },

  // 11. PBG - PROSES VERIFIKASI DOKUMEN AWAL
  {
    id: "SUB-2026-011",
    noRegistrasi: "REG/PBG/2026/004",
    layanan: "PBG",
    bidang: "CK",
    namaPemohon: "PT Grand Jaya Garment (Bpk. Vincent Susanto)",
    jenisPemohon: "Badan Usaha / PMA",
    nikNib: "NIB: 0239019481940",
    noHp: "081122334455",
    email: "hrd@grandjayagarment.com",
    namaKegiatan: "Ekspansi Pabrik Garmen & Fasilitas Asrama Karyawan",
    lokasiProyek: "Kawasan Industri Karanganyar KM 19",
    kecamatan: "Karanganyar",
    luasLahan: "45.000 m²",
    luasBangunan: "28.000 m²",
    tglPengajuan: "2026-10-15",
    estimasiSelesai: "2026-11-06",
    tglSelesai: null,
    status: "PROSES",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Penugasan & Penjadwalan Sidang TPA/TPT",
    tahapIndex: 1,
    posisiMeja: "Meja Koordinator Bidang Cipta Karya",
    penanggungJawab: "Arief Prasetyo, S.T., M.Eng. (Koordinator CK)",
    noSuratKeputusan: "-",
    keteranganKendala: "Sedang koordinasi penunjukan 3 anggota TPA (Arsitektur, Struktur, MEP) mengingat kategori bangunan kompleks industri tinggi.",
    catatanPimpinan: "Prioritaskan sidang TPA minggu depan karena nilai investasi PMA.",
    timeline: [
      { waktu: "2026-10-15 14:00", tahap: "Verifikasi Kelengkapan Dokumen SIMBG", status: "DONE", petugas: "Operator SIMBG CK", catatan: "Dokumen teknis lengkap, AMDAL terlampir." },
      { waktu: "2026-10-19 10:00", tahap: "Penugasan & Penjadwalan Sidang TPA/TPT", status: "ACTIVE", petugas: "Arief Prasetyo, S.T., M.Eng.", catatan: "Draft surat tugas TPA sedang disiapkan." }
    ]
  },

  // 12. SLF - TEMUAN KELAIKAN MEKANIKAL & EVAKUASI (KENDALA TEKNIS LAPANGAN)
  {
    id: "SUB-2026-012",
    noRegistrasi: "REG/SLF/2026/001",
    layanan: "SLF",
    bidang: "CK",
    namaPemohon: "Demak Square Mall & Bioskop (PT Nusantara Ritel Sejahtera)",
    jenisPemohon: "Badan Usaha Pusat Perbelanjaan",
    nikNib: "NIB: 8120394819283",
    noHp: "081229008811",
    email: "management@demaksquare.com",
    namaKegiatan: "Perpanjangan SLF Gedung Mall 4 Lantai & Basement",
    lokasiProyek: "Jl. Sultan Trenggono No. 12, Katonsari",
    kecamatan: "Demak",
    luasLahan: "15.000 m²",
    luasBangunan: "24.500 m²",
    tglPengajuan: "2026-09-30",
    estimasiSelesai: "2026-10-16",
    tglSelesai: null,
    status: "SIDANG_SURVEY",
    slaStatus: "OVERDUE",
    tahapSaatIni: "Pemenuhan Catatan Rekomendasi Teknis",
    tahapIndex: 3,
    posisiMeja: "Meja Pengkaji Teknis Pemohon / Tim TPT",
    penanggungJawab: "Arief Prasetyo, S.T., M.Eng. (Koordinator CK)",
    noSuratKeputusan: "-",
    keteranganKendala: "TEMUAN AUDIT KELAIKAN: (1) Sertifikat kelaikan 2 unit lift penumpang dari Disnakertrans Jateng kedaluwarsa; (2) Pintu darurat lantai 3 terhalang gudang tenant; (3) Uji fungsi pompa hidran tekanan kurang dari 4.5 bar.",
    catatanPimpinan: "Diberikan waktu perbaikan fisik 14 hari kalender sampai 24 Oktober 2026 sebelum dilakukan uji petik ulang oleh Dinas PUPR & Satpol PP/Damkar.",
    timeline: [
      { waktu: "2026-09-30 09:30", tahap: "Pemeriksaan Dokumen As-Built Drawing & SIMBG", status: "DONE", petugas: "Sekretariat SLF CK", catatan: "Gambar as-built drawing arsitektur tersedia." },
      { waktu: "2026-10-04 10:00", tahap: "Inspeksi Visual & Pengujian Kelaikan Struktur/MEP", status: "DONE", petugas: "Tim Uji Petik TPT", catatan: "Inspeksi komprehensif bersama petugas pemadam kebakaran." },
      { waktu: "2026-10-08 14:00", tahap: "Rapat Evaluasi Tim Penilai Teknis (TPT)", status: "DONE", petugas: "Tim Penilai Teknis (TPT)", catatan: "Penerbitan daftar cacat kelaikan fungsi (defects list)." },
      { waktu: "2026-10-12 11:00", tahap: "Pemenuhan Catatan Rekomendasi Teknis", status: "HOLD", petugas: "Pengelola Demak Square", catatan: "Pengelola sedang melakukan perbaikan instalasi pipa hidran dan sertifikasi lift." }
    ]
  },

  // 13. SLF - SELESAI
  {
    id: "SUB-2026-013",
    noRegistrasi: "REG/SLF/2026/002",
    layanan: "SLF",
    bidang: "CK",
    namaPemohon: "Bank BKK Demak Cabang Mranggen",
    jenisPemohon: "BUMD / Perbankan",
    nikNib: "NIB: 9120394812739",
    noHp: "081225887711",
    email: "cabang.mranggen@bankbkkdemak.co.id",
    namaKegiatan: "Kelaikan Fungsi Gedung Kantor Pelayanan 2 Lantai",
    lokasiProyek: "Jl. Raya Bandungrejo No. 112",
    kecamatan: "Mranggen",
    luasLahan: "900 m²",
    luasBangunan: "1.150 m²",
    tglPengajuan: "2026-10-01",
    estimasiSelesai: "2026-10-15",
    tglSelesai: "2026-10-14",
    status: "SELESAI",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Penandatanganan & Penerbitan Sertifikat SLF (Selesai)",
    tahapIndex: 5,
    posisiMeja: "Loket Pelayanan Cipta Karya",
    penanggungJawab: "Ir. Sulistiyono, M.T. (Kabid Cipta Karya)",
    noSuratKeputusan: "SLF-3321-2026-00098",
    keteranganKendala: "Tidak ada kendala. Semua uji kelaikan arsitektur, kelistrikan dan proteksi petir dinyatakan laik fungsi penuh.",
    catatanPimpinan: "Sertifikat SLF masa berlaku 5 tahun diterbitkan resmi.",
    timeline: [
      { waktu: "2026-10-01 10:00", tahap: "Pemeriksaan Dokumen As-Built Drawing & SIMBG", status: "DONE", petugas: "Staf Penilai CK", catatan: "Dokumen PBG lama dan as-built drawing valid." },
      { waktu: "2026-10-04 13:30", tahap: "Inspeksi Visual & Pengujian Kelaikan Struktur/MEP", status: "DONE", petugas: "Tim Pengkaji Teknis", catatan: "Pengujian pembumian (grounding) 1.2 ohm (sangat baik), APAR terpasang." },
      { waktu: "2026-10-08 10:00", tahap: "Rapat Evaluasi Tim Penilai Teknis (TPT)", status: "DONE", petugas: "TPT Cipta Karya", catatan: "Menyimpulkan gedung Laik Fungsi Tanpa Catatan." },
      { waktu: "2026-10-11 11:00", tahap: "Pemenuhan Catatan Rekomendasi Teknis", status: "DONE", petugas: "Tim Teknis", catatan: "Tidak ada temuan cacat fungsi." },
      { waktu: "2026-10-13 14:00", tahap: "Paraf Koordinasi Rekomendasi SLF", status: "DONE", petugas: "Ir. Sulistiyono, M.T.", catatan: "Rekomendasi teknis disahkan dan diparaf Sekdin." },
      { waktu: "2026-10-14 16:00", tahap: "Penandatanganan & Penerbitan Sertifikat SLF", status: "DONE", petugas: "Dr. H. Akhmad Sugiharto, S.T., M.T.", catatan: "Sertifikat SLF ditandatangani secara elektronik." }
    ]
  },

  // 14. SLF - MENUNGGU APPROVAL SEKRETARIS & KADIN
  {
    id: "SUB-2026-014",
    noRegistrasi: "REG/SLF/2026/003",
    layanan: "SLF",
    bidang: "CK",
    namaPemohon: "SMK Negeri 1 Sayung (Dinas Pendidikan Prov. Jateng)",
    jenisPemohon: "Instansi Sekolah / Negeri",
    nikNib: "NPSN: 20340321",
    noHp: "081390901234",
    email: "smkn1sayung@sch.id",
    namaKegiatan: "Sertifikasi Kelaikan Fungsi Gedung Bengkel Otomotif & Lab",
    lokasiProyek: "Jl. Raya Semarang-Demak KM 10.5",
    kecamatan: "Sayung",
    luasLahan: "14.200 m²",
    luasBangunan: "3.200 m²",
    tglPengajuan: "2026-10-08",
    estimasiSelesai: "2026-10-22",
    tglSelesai: null,
    status: "MENUNGGU_APPROVAL",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Paraf Koordinasi Rekomendasi SLF (Meja Sekdin)",
    tahapIndex: 4,
    posisiMeja: "Meja Sekretaris Dinas",
    penanggungJawab: "Dra. Hj. Sri Wahyuni, M.M. (Sekretaris Dinas)",
    noSuratKeputusan: "Draft: SLF-3321-2026-00104",
    keteranganKendala: "Uji fisik peninggian tanggul rob di sekitar gedung lab telah diverifikasi oleh tim CK. Rekomtek disetujui Kabid CK, sekarang proses paraf pengantar Sekdin ke Kadis.",
    catatanPimpinan: "Siap diajukan ke Kepala Dinas besok pagi.",
    timeline: [
      { waktu: "2026-10-08 09:00", tahap: "Pemeriksaan Dokumen As-Built Drawing & SIMBG", status: "DONE", petugas: "Sekretariat SLF CK", catatan: "Dokumen teknis sekolah lengkap." },
      { waktu: "2026-10-12 10:30", tahap: "Inspeksi Visual & Pengujian Kelaikan Struktur/MEP", status: "DONE", petugas: "Tim Uji Teknis", catatan: "Kondisi struktur beton baik dan kedap air rob." },
      { waktu: "2026-10-15 14:00", tahap: "Rapat Evaluasi Tim Penilai Teknis (TPT)", status: "DONE", petugas: "TPT Cipta Karya", catatan: "Disetujui laik fungsi kategori fasilitas pendidikan." },
      { waktu: "2026-10-18 11:00", tahap: "Pemenuhan Catatan Rekomendasi Teknis", status: "DONE", petugas: "Pihak SMKN 1 Sayung", catatan: "Penambahan ramp disabilitas dan jalur evakuasi selesai dipasang." },
      { waktu: "2026-10-19 15:30", tahap: "Paraf Koordinasi Rekomendasi SLF", status: "ACTIVE", petugas: "Dra. Hj. Sri Wahyuni, M.M.", catatan: "Berkas sedang ditelaah paraf Sekretaris Dinas." }
    ]
  },

  // 15. VALIDASI OSS - MENUNGGU TINJAUAN LAPANGAN
  {
    id: "SUB-2026-015",
    noRegistrasi: "REG/OSS/2026/004",
    layanan: "OSS",
    bidang: "TRP",
    namaPemohon: "Koperasi Mina Makmur Nelayan Morodemak",
    jenisPemohon: "Koperasi Nelayan",
    nikNib: "NIB: 0281903841920",
    noHp: "085226117733",
    email: "minamakmur.morodemak@gmail.com",
    namaKegiatan: "Pabrik Es Balok & Pengolahan Hasil Tangkap Ikan Tradisional",
    lokasiProyek: "Dermaga Pelabuhan Perikanan Pantai Morodemak",
    kecamatan: "Bonang",
    luasLahan: "2.500 m²",
    luasBangunan: "1.400 m²",
    tglPengajuan: "2026-10-16",
    estimasiSelesai: "2026-10-28",
    tglSelesai: null,
    status: "PROSES",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Kajian Kebijakan Tata Ruang & Sempadan",
    tahapIndex: 2,
    posisiMeja: "Meja Koordinator Bidang TRP",
    penanggungJawab: "Ir. Bambang Sugiarto, S.T. (Koordinator TRP)",
    noSuratKeputusan: "-",
    keteranganKendala: "Penjadwalan survey lapangan bersama Dinas Kelautan dan Perikanan Kab. Demak pada hari Jumat mendatang.",
    catatanPimpinan: "Pastikan tidak mengganggu alur lalu lintas kapal nelayan tradisional.",
    timeline: [
      { waktu: "2026-10-16 11:00", tahap: "Integrasi Permohonan OSS RBA", status: "DONE", petugas: "Operator OSS TRP", catatan: "Permohonan masuk dari sistem OSS." },
      { waktu: "2026-10-18 13:00", tahap: "Verifikasi Poligon SHP & Batas Lahan", status: "DONE", petugas: "Tim GIS TRP", catatan: "Zonasi perikanan tangkap dan industri pengolahan hasil laut." },
      { waktu: "2026-10-20 09:00", tahap: "Kajian Kebijakan Tata Ruang & Sempadan", status: "ACTIVE", petugas: "Ir. Bambang Sugiarto, S.T.", catatan: "Persiapan surat pemberitahuan survey bersama DKP." }
    ]
  },

  // 16. PBG - DITOLAK KARENA TIDAK SESUAI ZONASI RDTR
  {
    id: "SUB-2026-016",
    noRegistrasi: "REG/PBG/2026/005",
    layanan: "PBG",
    bidang: "CK",
    namaPemohon: "CV Cahaya Logam Abadi (Bpk. Bambang Hartono)",
    jenisPemohon: "Badan Usaha / CV",
    nikNib: "NIB: 9120938471029",
    noHp: "081229334411",
    email: "bambang.cahayalogam@gmail.com",
    namaKegiatan: "Pabrik Peleburan Aluminium & Bengkel Cor",
    lokasiProyek: "Desa Kalisari",
    kecamatan: "Sayung",
    luasLahan: "3.200 m²",
    luasBangunan: "1.800 m²",
    tglPengajuan: "2026-09-25",
    estimasiSelesai: "2026-10-16",
    tglSelesai: "2026-10-09",
    status: "DITOLAK",
    slaStatus: "ON_TRACK",
    tahapSaatIni: "Ditolak / Dikembalikan ke Pemohon",
    tahapIndex: 0,
    posisiMeja: "Loket Pelayanan Terpadu DINPUTARU",
    penanggungJawab: "Ir. Sulistiyono, M.T. (Kabid Cipta Karya)",
    noSuratKeputusan: "640/PBG-TOLAK/2026/0014",
    keteranganKendala: "PERMOHONAN DITOLAK RESMI: Berdasarkan verifikasi teknis dan hasil konsultasi tata ruang, lokasi berada pada zonasi R2 (Permukiman Padat) yang dilarang untuk industri peleburan logam B3 berpolusi.",
    catatanPimpinan: "Surat penolakan resmi telah diserahkan dengan saran relokasi ke Kawasan Peruntukan Industri (KPI) Sayung.",
    timeline: [
      { waktu: "2026-09-25 10:00", tahap: "Verifikasi Kelengkapan Dokumen SIMBG", status: "DONE", petugas: "Operator SIMBG CK", catatan: "Dokumen awal masuk." },
      { waktu: "2026-09-28 14:00", tahap: "Penugasan & Penjadwalan Sidang TPA/TPT", status: "DONE", petugas: "Arief Prasetyo, S.T., M.Eng.", catatan: "Koordinasi lintas bidang dengan TRP terkait zonasi." },
      { waktu: "2026-10-05 11:00", tahap: "Sidang Konsultasi & Penilaian Teknis", status: "DONE", petugas: "Tim TPT & Tim TRP", catatan: "Keputusan bersama: Usaha bertentangan dengan RDTR dan membahayakan lingkungan permukiman." },
      { waktu: "2026-10-09 10:00", tahap: "Penolakan & Penerbitan Surat Rekomendasi", status: "DONE", petugas: "Dr. H. Akhmad Sugiharto, S.T., M.T.", catatan: "Surat penolakan No. 640/PBG-TOLAK/2026/0014 diterbitkan." }
    ]
  }
];

// Helper functions for Data Storage in localStorage
const STORAGE_KEYS = {
  SUBMISSIONS: "simopel_submissions_v1",
  USERS: "simopel_users_v1",
  CURRENT_USER: "simopel_current_user_v1"
};

function getStoredSubmissions() {
  const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    return INITIAL_SUBMISSIONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_SUBMISSIONS;
  }
}

function saveStoredSubmissions(submissions) {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
}

function getStoredUsers() {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_USERS;
  }
}

function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getStoredCurrentUser() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) {
    // Default to Kepala Dinas for executive wow effect
    const defaultUser = INITIAL_USERS.find(u => u.role === "kepala_dinas") || INITIAL_USERS[0];
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
    return defaultUser;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_USERS[1];
  }
}

function saveStoredCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function resetToDefaultData() {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS.find(u => u.role === "kepala_dinas")));
}
