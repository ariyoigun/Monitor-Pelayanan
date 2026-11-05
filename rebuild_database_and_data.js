const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, 'data_source');
const dbPath = path.join(__dirname, 'database', 'silan.db');

// Ensure database directory exists
if (!fs.existsSync(path.join(__dirname, 'database'))) {
  fs.mkdirSync(path.join(__dirname, 'database'), { recursive: true });
}

// Helper to parse dates
function parseIndonesianMonth(str) {
  if (!str) return null;
  const s = String(str).toUpperCase();
  if (s.includes('JANUARI')) return 1;
  if (s.includes('FEBRUARI')) return 2;
  if (s.includes('MARET')) return 3;
  if (s.includes('APRIL')) return 4;
  if (s.includes('MEI')) return 5;
  if (s.includes('JUNI')) return 6;
  if (s.includes('JULI')) return 7;
  if (s.includes('AGUSTUS')) return 8;
  if (s.includes('SEPTEMBER')) return 9;
  if (s.includes('OKTOBER')) return 10;
  if (s.includes('NOVEMBER')) return 11;
  if (s.includes('DESEMBER')) return 12;
  return null;
}

function convertDate(val, prevDate) {
  if (!val) return prevDate || '2026-05-15';
  const s = String(val).trim();
  if (/^\d{5}$/.test(s)) {
    const num = parseInt(s, 10);
    const d = new Date(Math.round((num - 25569) * 86400 * 1000));
    return d.toISOString().split('T')[0];
  }
  const m = parseIndonesianMonth(s);
  if (m) {
    const dayMatch = s.match(/\d+/);
    const day = dayMatch ? parseInt(dayMatch[0], 10) : 1;
    const dayStr = day < 10 ? '0' + day : '' + day;
    const mStr = m < 10 ? '0' + m : '' + m;
    return `2026-${mStr}-${dayStr}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.substring(0, 10);
  }
  return prevDate || '2026-05-15';
}

function extractKecamatan(lokasi) {
  if (!lokasi) return 'Demak';
  const s = String(lokasi).toUpperCase();
  const kecamatans = [
    'SAYUNG', 'MRANGGEN', 'KARANGTENGAH', 'KARANGANYAR', 'GUNTUR',
    'KARANGAWEN', 'BONANG', 'WEDUNG', 'WONOSALAM', 'DEMPET',
    'GAJAH', 'MIJEN', 'KEBONAGUNG', 'DEMAK'
  ];
  for (const k of kecamatans) {
    if (s.includes(k)) {
      return k.charAt(0) + k.slice(1).toLowerCase();
    }
  }
  return 'Demak';
}

// 1. Read Users from "Akun dan Role Silan.xlsx"
const wbRoles = XLSX.readFile(path.join(dataDir, 'Akun_dan_Role_Silan.xlsx'));
const wsRoles = wbRoles.Sheets[wbRoles.SheetNames[0]];
const roleRows = XLSX.utils.sheet_to_json(wsRoles);

const INITIAL_USERS = roleRows.map((r, idx) => {
  const username = String(r['Username']).trim();
  const rawRole = String(r['Role']).trim();
  let role = 'koordinator_bidang';
  let bidang = 'Semua Bidang';
  let bidangLabel = 'Semua Bidang';

  if (username === 'superadmin' || rawRole.toLowerCase().includes('superadmin')) {
    role = 'superadmin';
  } else if (username.includes('kadin') || rawRole.toLowerCase().includes('kepala dinas')) {
    role = 'kepala_dinas';
  } else if (username.includes('sekdin') || rawRole.toLowerCase().includes('sekretaris')) {
    role = 'sekretaris';
  } else if (username.includes('kabid.trp') || rawRole.toLowerCase().includes('trp') && rawRole.toLowerCase().includes('kabid')) {
    role = 'kepala_bidang';
    bidang = 'TRP';
    bidangLabel = 'Tata Ruang & Pertanahan';
  } else if (username.includes('kabid.ck') || rawRole.toLowerCase().includes('cipta karya') && rawRole.toLowerCase().includes('kabid')) {
    role = 'kepala_bidang';
    bidang = 'CK';
    bidangLabel = 'Cipta Karya';
  } else if (username.includes('koor.trp') || rawRole.toLowerCase().includes('koordinator trp')) {
    role = 'koordinator_bidang';
    bidang = 'TRP';
    bidangLabel = 'Tata Ruang & Pertanahan';
  } else if (username.includes('koor.ck') || rawRole.toLowerCase().includes('koordinator cipta karya')) {
    role = 'koordinator_bidang';
    bidang = 'CK';
    bidangLabel = 'Cipta Karya';
  }

  return {
    id: `USR-${String(idx + 1).padStart(3, '0')}`,
    nama: String(r['Nama']).trim(),
    nip: String(r['NIP']).trim(),
    username: username,
    password: String(r['Password']).trim(),
    role: role,
    roleLabel: rawRole,
    bidang: bidang,
    bidangLabel: bidangLabel,
    jabatan: rawRole,
    avatar: 'assets/logo.svg',
    email: `${username}@demakkab.go.id`,
    noHp: '08122899000' + (idx + 1),
    status: 'Aktif'
  };
});

console.log(`Loaded ${INITIAL_USERS.length} authentic users from Akun dan Role Silan.xlsx.`);

// 2. Read Raw Submissions from Excel
// A. KTTR & OSS
const wbKttr = XLSX.readFile(path.join(dataDir, 'Layanan KTTR dan OSS.xlsx'));
const wsKttr = wbKttr.Sheets['PAKAI '];
const rowsKttr = XLSX.utils.sheet_to_json(wsKttr, { header: 1 });

const rawRecords = {
  KTTR: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] },
  OSS:  { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] },
  PBG:  { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] },
  SLF:  { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [] }
};

let lastKttrDate = '2026-01-01';
for (let r = 4; r < 504; r++) {
  const row = rowsKttr[r];
  if (!row || !row[2]) continue;
  const d = convertDate(row[1], lastKttrDate);
  lastKttrDate = d;
  const m = parseInt(d.split('-')[1], 10);
  if (m < 1 || m > 11) continue;

  const per = String(row[4] || '').toUpperCase();
  const isKttr = per === 'RTT' || per.includes('RUMAH');
  const cat = isKttr ? 'KTTR' : 'OSS';
  rawRecords[cat][m].push({
    source: 'kttr_oss',
    date: d,
    row: row
  });
}

// B. PBG & SLF
const pbgFiles = [
  '05112026104417 JANUARI-MARET.xlsx',
  '05112026104356 APRIL-JUNI.xlsx',
  '05112026104337 JULI-SEPTEMBER.xlsx',
  '05112026104318 OKTOBER-NOV.xlsx'
];

for (const pf of pbgFiles) {
  const wb = XLSX.readFile(path.join(dataDir, pf));
  const ws = wb.Sheets['list'] || wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);
  for (const r of rows) {
    const tgl = String(r['Tanggal'] || '');
    if (!tgl) continue;
    const parts = tgl.split('-');
    if (parts.length < 2) continue;
    const m = parseInt(parts[1], 10);
    if (!m || m < 1 || m > 11) continue;

    const jp = String(r['Jenis Permohonan'] || '');
    if (jp.includes('Persetujuan Bangunan Gedung') || jp.includes('Perubahan Bangunan Gedung')) {
      rawRecords.PBG[m].push({ source: 'simbg', file: pf, row: r, date: tgl });
    } else if (jp.includes('Sertifikat Laik Fungsi') || jp.includes('SLF')) {
      rawRecords.SLF[m].push({ source: 'simbg', file: pf, row: r, date: tgl });
    }
  }
}

// 3. User percentage specification:
// Januari: 7% on progress
// Februari: 6% on progress
// Maret: 7.5% on progress
// April: 6% on progress
// Mei: 8% on progress
// Juni: 2% on progress
// Juli: 1% on progress
// Agustus s/d saat ini: 100% on progress
const onProgressRates = {
  1: 0.07,
  2: 0.06,
  3: 0.075,
  4: 0.06,
  5: 0.08,
  6: 0.02,
  7: 0.01,
  8: 1.00,
  9: 1.00,
  10: 1.00,
  11: 1.00
};

// Process records and build monthly stats
const MONTHLY_STATS_2026 = {
  months: [
    { key: "ALL", label: "Sepanjang Tahun 2026", shortLabel: "Semua (2026)" },
    { key: "1",  label: "Januari 2026",    shortLabel: "Jan" },
    { key: "2",  label: "Februari 2026",   shortLabel: "Feb" },
    { key: "3",  label: "Maret 2026",      shortLabel: "Mar" },
    { key: "4",  label: "April 2026",      shortLabel: "Apr" },
    { key: "5",  label: "Mei 2026",        shortLabel: "Mei" },
    { key: "6",  label: "Juni 2026",       shortLabel: "Jun" },
    { key: "7",  label: "Juli 2026",       shortLabel: "Jul" },
    { key: "8",  label: "Agustus 2026",    shortLabel: "Agu" },
    { key: "9",  label: "September 2026",  shortLabel: "Sep" },
    { key: "10", label: "Oktober 2026",    shortLabel: "Okt" },
    { key: "11", label: "November 2026",   shortLabel: "Nov" }
  ],
  services: {
    KTTR: {
      nama: "Keterangan Rencana Tata Ruang (KTTR)",
      bidang: "Tata Ruang & Pertanahan (TRP)",
      sla: "5 Hari Kerja",
      monthly: {}
    },
    OSS: {
      nama: "Validasi KKPR OSS-RBA",
      bidang: "Tata Ruang & Pertanahan (TRP)",
      sla: "5 Hari Kerja",
      monthly: {}
    },
    PBG: {
      nama: "PBG (Persetujuan Bangunan Gedung)",
      bidang: "Cipta Karya (CK)",
      sla: "28 Hari Kerja",
      monthly: {}
    },
    SLF: {
      nama: "SLF (Sertifikat Laik Fungsi)",
      bidang: "Cipta Karya (CK)",
      sla: "28 Hari Kerja",
      monthly: {}
    }
  }
};

const allSubmissions = [];
let subCounter = 1;

for (const srv of ['KTTR', 'OSS', 'PBG', 'SLF']) {
  const bidang = (srv === 'KTTR' || srv === 'OSS') ? 'TRP' : 'CK';

  for (let m = 1; m <= 11; m++) {
    const list = rawRecords[srv][m];
    const total = list.length;
    const rate = onProgressRates[m];

    let onProgCount = 0;
    let dikembalikanCount = 0;
    let dilayaniCount = 0;

    if (total > 0) {
      if (rate === 1.00) {
        onProgCount = total;
        dilayaniCount = 0;
        dikembalikanCount = 0;
      } else {
        onProgCount = Math.max(1, Math.round(total * rate));
        const rem = total - onProgCount;
        // Berkas belum lengkap / kembali ke pemohon: ~3-5% dari sisa
        dikembalikanCount = Math.max(0, Math.round(rem * 0.04));
        dilayaniCount = rem - dikembalikanCount;
      }
    }

    MONTHLY_STATS_2026.services[srv].monthly[String(m)] = {
      total: total,
      sudahDilayani: dilayaniCount,
      onProgress: onProgCount,
      berkasDikembalikan: dikembalikanCount,
      tingkatPenyelesaian: total > 0 ? Math.round(((dilayaniCount + dikembalikanCount) / total) * 100) : 0
    };

    // Assign status to records
    for (let i = 0; i < list.length; i++) {
      const rec = list[i];
      let status = 'SELESAI';
      let slaStatus = 'ON_TRACK';
      let statusLabel = 'Sudah Dilayani / Terbit';
      let tahap = 'Pengesahan & Penerbitan Dokumen (Selesai)';
      let posisi = srv.startsWith('P') || srv === 'SLF' ? 'Penerbitan Dokumen (CK)' : 'Loket Pelayanan Terpadu TRP';
      let kendala = 'Dokumen telah selesai diproses dan terbit sesuai standar pelayanan.';

      if (rate === 1.00 || i < onProgCount) {
        status = 'PROSES';
        slaStatus = m <= 7 ? 'ON_TRACK' : 'ON_TRACK';
        statusLabel = 'On Progress';
        tahap = srv.startsWith('P') || srv === 'SLF' ? 'Sidang Konsultasi & Penilaian Teknis TPA/TPT' : 'Pemeriksaan Geospasial RDTR & Lapangan';
        posisi = srv.startsWith('P') || srv === 'SLF' ? 'Meja Tim Penilai Teknis (CK)' : 'Meja Tim GIS Tata Ruang';
        kendala = 'Sedang dalam penelaahan teknis dan kelengkapan berkas pemohon.';
      } else if (i < onProgCount + dikembalikanCount) {
        status = 'BERKAS_DIKEMBALIKAN';
        slaStatus = 'WARNING';
        statusLabel = 'Berkas Dikembalikan (Kembali ke Pemohon)';
        tahap = 'Verifikasi Administrasi & Konfirmasi Pemohon';
        posisi = 'Menunggu Kelengkapan Pemohon';
        kendala = 'Berkas belum lengkap/perlu perbaikan data teknis oleh pemohon, dikembalikan untuk dilengkapi.';
      }

      const id = `SUB-2026-${srv}-${String(subCounter).padStart(4, '0')}`;
      const noReg = `REG/${bidang}/2026/${String(subCounter).padStart(4, '0')}`;
      subCounter++;

      if (rec.source === 'kttr_oss') {
        const row = rec.row;
        const pemohon = String(row[2] || 'Pemohon').trim();
        const lokasi = String(row[3] || 'Kab. Demak').trim();
        const peruntukan = String(row[4] || '-').trim();
        const luas = row[6] ? String(row[6]).replace(/[^0-9.]/g, '') + ' m²' : '-';
        const pengolah = String(row[7] || '').trim();
        const kec = extractKecamatan(lokasi);

        allSubmissions.push({
          id,
          noRegistrasi: noReg,
          layanan: srv,
          kategori: srv,
          bidang: bidang,
          namaPemohon: pemohon,
          jenisPemohon: srv === 'KTTR' ? 'Perorangan / Warga' : 'Pelaku Usaha / Badan Usaha',
          nikNib: srv === 'KTTR' ? 'NIK Terverifikasi' : 'NIB Berusaha Terdaftar',
          noHp: '-',
          email: '-',
          namaKegiatan: peruntukan || (srv === 'KTTR' ? 'Rumah Tempat Tinggal' : 'Pemanfaatan Ruang Usaha'),
          lokasiProyek: lokasi,
          kecamatan: kec,
          luasLahan: luas,
          luasBangunan: '-',
          tglPengajuan: rec.date,
          estimasiSelesai: rec.date,
          tglSelesai: status === 'SELESAI' ? rec.date : null,
          status: status,
          slaStatus: slaStatus,
          tahapSaatIni: tahap,
          tahapIndex: status === 'SELESAI' ? 5 : 2,
          posisiMeja: posisi,
          penanggungJawab: pengolah ? `Petugas Pengolah: ${pengolah}` : (bidang === 'TRP' ? 'Koordinator TRP' : 'Koordinator CK'),
          noSuratKeputusan: status === 'SELESAI' ? `650/${srv}/2026/${String(subCounter).padStart(4, '0')}` : '-',
          keteranganKendala: kendala,
          catatanPimpinan: status === 'SELESAI' ? 'Dokumen telah disahkan.' : (status === 'BERKAS_DIKEMBALIKAN' ? 'Surat pemberitahuan perbaikan telah dikirim.' : 'Pantau proses verifikasi.'),
          metaExcel: {
            sumber: 'Layanan KTTR dan OSS.xlsx',
            noUrut: row[0] || '-',
            tglBerkasMasuk: row[1] || rec.date,
            peruntukan: peruntukan,
            luasanDimohon: row[6] || '-',
            pengolah: pengolah || '-',
            tglKePengolah: row[8] || '-',
            tglJadiKembali: row[9] || '-',
            keterangan: row[10] || '-'
          },
          timeline: [
            { waktu: `${rec.date} 08:30`, tahap: 'Verifikasi Administrasi Berkas', status: 'DONE', petugas: pengolah || 'Front Office', catatan: 'Berkas masuk.' },
            { waktu: `${rec.date} 13:00`, tahap: tahap, status: status === 'SELESAI' ? 'DONE' : 'ACTIVE', petugas: pengolah || 'Petugas Teknis', catatan: kendala }
          ]
        });
      } else {
        // SIMBG (PBG / SLF)
        const r = rec.row;
        const kec = r['Kecamatan Bangunan'] ? String(r['Kecamatan Bangunan']).trim() : 'Demak';
        const pemohon = String(r['Nama Pemilik'] || 'Pemilik Bangunan').trim();
        const namaBgn = String(r['Nama Bangunan'] || r['Jenis Permohonan'] || srv).trim();
        const noDokumen = r['Nomor Dokumen'] && r['Nomor Dokumen'] !== 'None' ? r['Nomor Dokumen'] : (status === 'SELESAI' ? `SK-${srv}-3321-2026-${String(subCounter).padStart(3, '0')}` : '-');
        const noSimbg = r['Nomor Registrasi'] && r['Nomor Registrasi'] !== 'None' ? r['Nomor Registrasi'] : `SIMBG-2026-${String(subCounter).padStart(4, '0')}`;
        const alamat = `${r['Alamat'] || ''}, ${r['Kelurahan Bangunan'] || ''}, Kec. ${kec}`.trim();
        const luasBgn = r['Luas Bangunan'] ? `${r['Luas Bangunan']} m²` : '-';

        allSubmissions.push({
          id,
          noRegistrasi: noSimbg,
          layanan: srv,
          kategori: srv,
          bidang: 'CK',
          namaPemohon: pemohon,
          jenisPemohon: r['Fungsi'] ? String(r['Fungsi']) : 'Pemilik Bangunan Gedung',
          nikNib: 'SIMBG Terintegrasi',
          noHp: '-',
          email: '-',
          namaKegiatan: namaBgn,
          lokasiProyek: alamat,
          kecamatan: kec,
          luasLahan: '-',
          luasBangunan: luasBgn,
          tglPengajuan: rec.date,
          estimasiSelesai: rec.date,
          tglSelesai: status === 'SELESAI' ? rec.date : null,
          status: status,
          slaStatus: slaStatus,
          tahapSaatIni: tahap,
          tahapIndex: status === 'SELESAI' ? 5 : 2,
          posisiMeja: posisi,
          penanggungJawab: 'Koordinator Cipta Karya',
          noSuratKeputusan: noDokumen,
          keteranganKendala: kendala,
          catatanPimpinan: status === 'SELESAI' ? 'Sertifikat terbit di SIMBG.' : 'Dalam proses sidang teknis TPA.',
          metaExcel: {
            sumber: rec.file,
            jenisPermohonan: r['Jenis Permohonan'] || srv,
            nomorDokumen: noDokumen,
            nomorRegistrasi: noSimbg,
            statusSimbg: r['Status'] || '-',
            statusSlf: r['Status SLF'] || '-',
            fungsi: r['Fungsi'] || '-',
            tipeKonsultasi: r['Tipe Konsultasi'] || '-',
            namaBangunan: namaBgn,
            jumlahUnit: r['Jumlah Unit'] || '-',
            okupansi: r['Okupansi'] || '-',
            luasBangunan: luasBgn,
            lantai: r['Lantai'] || '-',
            tinggi: r['Tinggi'] || '-',
            fungsiBangunan: r['Fungsi Bangunan'] || '-',
            subFungsiBangunan: r['Sub Fungsi Bangunan'] || '-'
          },
          timeline: [
            { waktu: `${rec.date} 09:00`, tahap: 'Verifikasi SIMBG', status: 'DONE', petugas: 'Front Office CK', catatan: 'Pendaftaran SIMBG.' },
            { waktu: `${rec.date} 14:00`, tahap: tahap, status: status === 'SELESAI' ? 'DONE' : 'ACTIVE', petugas: 'Tim Penilik CK', catatan: kendala }
          ]
        });
      }
    }
  }
}

console.log(`Total processed submissions: ${allSubmissions.length} records.`);

// 4. Default System Texts (Customizable by Superadmin)
const DEFAULT_SYSTEM_TEXTS = {
  appTitle: "SILAN DINPUTARU",
  appSubtitle: "Sistem Monitoring Layanan - Kab. Demak",
  navLandingText: "Infografis Publik",
  navDashboardText: "Monitoring Internal",
  navUsersText: "Manajemen Pengguna",
  navSettingsText: "Pengaturan Teks Sistem",

  heroBadge: "Portal Keterbukaan Informasi Pelayanan Publik DINPUTARU Kabupaten Demak",
  heroTitle: "Rangkuman Layanan <span class=\"text-gold\">SILAN 2026</span>",
  heroSubtitle: "Infografis agregat permohonan layanan publik Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak. Pantau volume permohonan masuk, tingkat penyelesaian berkas, dan kepastian standar waktu pelayanan (SLA) secara terbuka.",
  sectionTitle: "Infografis & Status 4 Layanan Utama DINPUTARU",
  sectionDesc: "Data real-time jumlah permohonan masuk, berkas yang telah rampung, dan berkas dalam proses untuk masing-masing kategori layanan sesuai periode bulan yang Anda pilih.",
  comparisonTitle: "Grafik Komparasi Volume & Penyelesaian Antar Layanan",
  comparisonSubtitle: "Perbandingan proporsional volume pengajuan selesai vs dalam proses pada periode terpilih",

  slaKttr: "5 Hari Kerja",
  slaOss: "5 Hari Kerja",
  slaPbg: "28 Hari Kerja",
  slaSlf: "28 Hari Kerja",

  descKttr: "Keterangan kesesuaian ruang, zonasi RTRW/RDTR, Garis Sempadan Bangunan (GSB), KDB & KLB di Kabupaten Demak.",
  descOss: "Validasi Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) terintegrasi sistem perizinan berusaha OSS RBA & poligon SHP.",
  descPbg: "Persetujuan Bangunan Gedung (pengganti IMB) untuk bangunan baru atau renovasi dengan standar arsitektur & struktur TPA.",
  descSlf: "Sertifikat Laik Fungsi pembuktian kelaikan gedung selesai terbangun dari aspek keselamatan kebakaran & kenyamanan.",

  urlFormKttr: "https://bit.ly/pendaftaranKTTRDemak",
  urlFormOss: "https://bit.ly/validasioss",
  urlSimbgWebsite: "https://simbg.pu.go.id",

  footerInstansi: "DINPUTARU KABUPATEN DEMAK",
  footerDesc: "Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak berkomitmen memberikan pelayanan tata ruang dan persetujuan bangunan yang cepat, pasti, dan transparan.",
  footerAlamat: "Jl. Kyai Jebat No. 35, Demak 59511",
  footerTelp: "(0291) 685112",
  footerEmail: "dinputaru@demakkab.go.id",
  footerWebsite: "dinputaru.demakkab.go.id",
  footerCopyright: "© 2026 Dinas Pekerjaan Umum dan Penataan Ruang Kabupaten Demak. Hak Cipta Dilindungi.",

  dashboardTitle: "Dashboard Pemantauan Pelayanan",
  leadershipFocusTitle: "Sorotan Pimpinan: Berkas Tertahan & Perlu Perhatian Segera",
  leadershipFocusDesc: "Daftar pengajuan belum selesai yang membutuhkan tindak lanjut, koordinasi lintas instansi, atau kelengkapan pemohon."
};

// 5. Populate SQLite Database
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  DROP TABLE IF EXISTS submissions;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS visitors;
  DROP TABLE IF EXISTS system_texts;

  CREATE TABLE submissions (
    id TEXT PRIMARY KEY,
    no_registrasi TEXT,
    layanan TEXT,
    bidang TEXT,
    nama_pemohon TEXT,
    jenis_pemohon TEXT,
    nik_nib TEXT,
    no_hp TEXT,
    email TEXT,
    nama_kegiatan TEXT,
    lokasi_proyek TEXT,
    kecamatan TEXT,
    luas_lahan TEXT,
    luas_bangunan TEXT,
    tgl_pengajuan TEXT,
    estimasi_selesai TEXT,
    tgl_selesai TEXT,
    status TEXT,
    sla_status TEXT,
    tahap_saat_ini TEXT,
    tahap_index INTEGER,
    posisi_meja TEXT,
    penanggung_jawab TEXT,
    no_surat_keputusan TEXT,
    keterangan_kendala TEXT,
    catatan_pimpinan TEXT,
    meta_excel TEXT,
    timeline TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    nama TEXT,
    nip TEXT,
    role TEXT,
    role_label TEXT,
    bidang TEXT,
    bidang_label TEXT,
    jabatan TEXT,
    avatar TEXT,
    email TEXT,
    no_hp TEXT,
    status TEXT,
    created_at TEXT
  );

  CREATE TABLE system_texts (
    setting_key TEXT PRIMARY KEY,
    setting_val TEXT,
    updated_at TEXT
  );

  CREATE INDEX idx_sub_layanan ON submissions (layanan);
  CREATE INDEX idx_sub_status ON submissions (status);
  CREATE INDEX idx_sub_bidang ON submissions (bidang);
  CREATE INDEX idx_sub_tgl ON submissions (tgl_pengajuan);
`);

const insertUser = db.prepare(`
  INSERT INTO users (id, username, password, nama, nip, role, role_label, bidang, bidang_label, jabatan, avatar, email, no_hp, status, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const u of INITIAL_USERS) {
  insertUser.run(
    u.id, u.username, u.password, u.nama, u.nip, u.role, u.roleLabel,
    u.bidang, u.bidangLabel, u.jabatan, u.avatar, u.email, u.noHp, u.status,
    new Date().toISOString()
  );
}

const insertSetting = db.prepare(`
  INSERT INTO system_texts (setting_key, setting_val, updated_at) VALUES (?, ?, ?)
`);

for (const [k, v] of Object.entries(DEFAULT_SYSTEM_TEXTS)) {
  insertSetting.run(k, String(v), new Date().toISOString());
}

const insertSub = db.prepare(`
  INSERT INTO submissions (
    id, no_registrasi, layanan, bidang, nama_pemohon, jenis_pemohon, nik_nib,
    no_hp, email, nama_kegiatan, lokasi_proyek, kecamatan, luas_lahan, luas_bangunan,
    tgl_pengajuan, estimasi_selesai, tgl_selesai, status, sla_status, tahap_saat_ini,
    tahap_index, posisi_meja, penanggung_jawab, no_surat_keputusan, keterangan_kendala,
    catatan_pimpinan, meta_excel, timeline, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

const nowStr = new Date().toISOString();
for (const s of allSubmissions) {
  insertSub.run(
    s.id, s.noRegistrasi, s.layanan, s.bidang, s.namaPemohon, s.jenisPemohon,
    s.nikNib, s.noHp, s.email, s.namaKegiatan, s.lokasiProyek, s.kecamatan,
    s.luasLahan, s.luasBangunan, s.tglPengajuan, s.estimasiSelesai, s.tglSelesai,
    s.status, s.slaStatus, s.tahapSaatIni, s.tahapIndex, s.posisiMeja, s.penanggungJawab,
    s.noSuratKeputusan, s.keteranganKendala, s.catatanPimpinan,
    JSON.stringify(s.metaExcel), JSON.stringify(s.timeline), nowStr, nowStr
  );
}

console.log(`Saved ${allSubmissions.length} submissions into SQLite database.`);

// 6. Generate JSON backup
const backup = {
  version: "2.1.0",
  exported_at: nowStr,
  counts: {
    submissions: allSubmissions.length,
    users: INITIAL_USERS.length,
    system_texts: Object.keys(DEFAULT_SYSTEM_TEXTS).length
  },
  tables: {
    submissions: allSubmissions,
    users: INITIAL_USERS,
    system_texts: DEFAULT_SYSTEM_TEXTS
  }
};

fs.writeFileSync(path.join(__dirname, 'database', 'silan_backup.json'), JSON.stringify(backup, null, 2), 'utf8');
console.log('Saved database/silan_backup.json.');

// 7. Generate js/data.js
// To keep initial loading instant and under 1.5MB for browser localStorage, take top 1000 submissions (all KTTR, all OSS, all PBG, and representative SLF)
const compactSubmissions = [
  ...allSubmissions.filter(s => s.layanan === 'KTTR'),
  ...allSubmissions.filter(s => s.layanan === 'OSS'),
  ...allSubmissions.filter(s => s.layanan === 'PBG'),
  ...allSubmissions.filter(s => s.layanan === 'SLF').slice(0, 300)
];

const dataJsContent = `/**
 * SILAN DINPUTARU DEMAK - Sistem Informasi Monitoring Layanan
 * Master Data, Excel 2026 Recalculated Statistics & Synchronized SQLite State
 */

const INITIAL_USERS = ${JSON.stringify(INITIAL_USERS, null, 2)};

const DEFAULT_SYSTEM_TEXTS = ${JSON.stringify(DEFAULT_SYSTEM_TEXTS, null, 2)};

const LAYANAN_CONFIG = {
  KTTR: {
    kode: "KTTR",
    nama: "Keterangan Rencana Tata Ruang (KTTR)",
    bidang: "TRP",
    bidangNama: "Tata Ruang & Pertanahan",
    warna: "#0284c7",
    standarSLA: 5,
    dasarHukum: "Perda Kab. Demak No. 1 Tahun 2020 tentang RTRW & Permen ATR/BPN No. 13 Tahun 2021",
    deskripsi: "Penyediaan informasi ketentuan intensitas pemanfaatan ruang (KDB, KLB, KDH, GSB) dan kesesuaian rencana zonasi terhadap RTRW/RDTR Kabupaten Demak."
  },
  OSS: {
    kode: "OSS",
    nama: "Validasi Kesesuaian Tata Ruang (KKPR OSS)",
    bidang: "TRP",
    bidangNama: "Tata Ruang & Pertanahan",
    warna: "#16a34a",
    standarSLA: 5,
    dasarHukum: "PP No. 5 Tahun 2021 tentang Penyelenggaraan Perizinan Berusaha Berbasis Risiko & PP No. 21/2021",
    deskripsi: "Validasi dan verifikasi teknis permohonan Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) untuk izin berusaha melalui sistem terintegrasi OSS RBA."
  },
  PBG: {
    kode: "PBG",
    nama: "Persetujuan Bangunan Gedung (PBG)",
    bidang: "CK",
    bidangNama: "Cipta Karya",
    warna: "#d97706",
    standarSLA: 28,
    dasarHukum: "UU No. 11/2020 Cipta Kerja, PP No. 16 Tahun 2021, & Perda PBG Kabupaten Demak",
    deskripsi: "Perizinan yang diberikan kepada pemilik bangunan gedung untuk membangun baru, mengubah, memperluas, mengurangi, dan/atau merawat bangunan gedung sesuai standar teknis."
  },
  SLF: {
    kode: "SLF",
    nama: "Sertifikat Laik Fungsi (SLF)",
    bidang: "CK",
    bidangNama: "Cipta Karya",
    warna: "#9333ea",
    standarSLA: 28,
    dasarHukum: "PP No. 16 Tahun 2021 tentang Bangunan Gedung & Permen PUPR No. 27/PRT/M/2018",
    deskripsi: "Sertifikat yang diterbitkan oleh pemerintah daerah untuk menyatakan kelaikan fungsi bangunan gedung sebelum dapat dimanfaatkan secara aman dan nyaman."
  }
};

const MONTHLY_STATS_2026 = ${JSON.stringify(MONTHLY_STATS_2026, null, 2)};

/**
 * Mendapatkan agregat statistik 5 metrik infografis publik dan dashboard
 */
function getMonthlyInfographicData(monthKey = "ALL") {
  const result = {
    selectedMonth: monthKey,
    monthLabel: MONTHLY_STATS_2026.months.find(m => m.key === String(monthKey))?.label || "Tahun 2026",
    summary: {
      total: 0,
      sudahDilayani: 0,
      onProgress: 0,
      berkasDikembalikan: 0,
      tingkatPenyelesaian: 0
    },
    services: {}
  };

  const serviceKeys = Object.keys(MONTHLY_STATS_2026.services);
  const sysTexts = getStoredSystemTexts();

  serviceKeys.forEach(sKey => {
    const sObj = MONTHLY_STATS_2026.services[sKey];
    let total = 0;
    let sudahDilayani = 0;
    let onProgress = 0;
    let berkasDikembalikan = 0;

    if (monthKey === "ALL") {
      for (let m = 1; m <= 11; m++) {
        const d = sObj.monthly[String(m)] || { total: 0, sudahDilayani: 0, onProgress: 0, berkasDikembalikan: 0 };
        total += d.total;
        sudahDilayani += d.sudahDilayani;
        onProgress += d.onProgress;
        berkasDikembalikan += d.berkasDikembalikan;
      }
    } else {
      const d = sObj.monthly[String(monthKey)] || { total: 0, sudahDilayani: 0, onProgress: 0, berkasDikembalikan: 0 };
      total = d.total;
      sudahDilayani = d.sudahDilayani;
      onProgress = d.onProgress;
      berkasDikembalikan = d.berkasDikembalikan;
    }

    const selesaiTot = sudahDilayani + berkasDikembalikan;
    const persen = total > 0 ? Math.round((selesaiTot / total) * 100) : 0;

    let slaLabel = sObj.sla;
    if (sKey === 'KTTR' && sysTexts.slaKttr) slaLabel = sysTexts.slaKttr;
    if (sKey === 'OSS' && sysTexts.slaOss) slaLabel = sysTexts.slaOss;
    if (sKey === 'PBG' && sysTexts.slaPbg) slaLabel = sysTexts.slaPbg;
    if (sKey === 'SLF' && sysTexts.slaSlf) slaLabel = sysTexts.slaSlf;

    result.services[sKey] = {
      kode: sKey,
      nama: sObj.nama,
      bidang: sObj.bidang,
      sla: slaLabel,
      total,
      sudahDilayani,
      onProgress,
      berkasDikembalikan,
      tingkatPenyelesaian: persen
    };

    result.summary.total += total;
    result.summary.sudahDilayani += sudahDilayani;
    result.summary.onProgress += onProgress;
    result.summary.berkasDikembalikan += berkasDikembalikan;
  });

  const summarySelesai = result.summary.sudahDilayani + result.summary.berkasDikembalikan;
  result.summary.tingkatPenyelesaian = result.summary.total > 0 ? 
    Math.round((summarySelesai / result.summary.total) * 100) : 0;

  return result;
}

const INITIAL_SUBMISSIONS = ${JSON.stringify(compactSubmissions)};

const STORAGE_KEYS = {
  SUBMISSIONS: "silan_submissions_v3",
  USERS: "silan_users_v3",
  CURRENT_USER: "silan_current_user_v3",
  SYSTEM_TEXTS: "silan_system_texts_v3"
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
  if (!data) return null;
  try { return JSON.parse(data); } catch (e) { return null; }
}

function saveStoredCurrentUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

function getStoredSystemTexts() {
  const data = localStorage.getItem(STORAGE_KEYS.SYSTEM_TEXTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_TEXTS, JSON.stringify(DEFAULT_SYSTEM_TEXTS));
    return { ...DEFAULT_SYSTEM_TEXTS };
  }
  try {
    return { ...DEFAULT_SYSTEM_TEXTS, ...JSON.parse(data) };
  } catch (e) {
    return { ...DEFAULT_SYSTEM_TEXTS };
  }
}

function saveStoredSystemTexts(texts) {
  localStorage.setItem(STORAGE_KEYS.SYSTEM_TEXTS, JSON.stringify(texts));
}

function resetToDefaultData() {
  localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.SYSTEM_TEXTS, JSON.stringify(DEFAULT_SYSTEM_TEXTS));
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// RESTful Database Client Bridge (SQLite Sync with LocalStorage Fallback)
const DataAPI = {
  isOnline: true,

  async init() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        this.isOnline = true;
        const subRes = await fetch('/api/submissions?limit=1500');
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.success && subData.data.length > 0) {
            saveStoredSubmissions(subData.data);
          }
        }
      }
    } catch (e) {
      this.isOnline = false;
    }
  },

  async addSubmission(sub) {
    if (this.isOnline) {
      try {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub)
        });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }
  },

  async updateSubmission(id, updateData) {
    if (this.isOnline) {
      try {
        await fetch(\`/api/submissions/\${id}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }
  },

  async deleteSubmission(id) {
    if (this.isOnline) {
      try {
        await fetch(\`/api/submissions/\${id}\`, { method: 'DELETE' });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }
  },

  async saveSettings(settings) {
    if (this.isOnline) {
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }
  },

  async saveUser(user) {
    if (this.isOnline) {
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }
  },

  async updateUser(id, user) {
    if (this.isOnline) {
      try {
        await fetch(\`/api/users/\${id}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }
  },

  async deleteUser(id) {
    if (this.isOnline) {
      try {
        await fetch(\`/api/users/\${id}\`, { method: 'DELETE' });
      } catch (e) {
        console.warn('API sync warning:', e);
      }
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    DataAPI.init();
  });
}
`;

fs.writeFileSync(path.join(__dirname, 'js', 'data.js'), dataJsContent, 'utf8');
console.log('Saved js/data.js.');
console.log('=== DATABASE & DATA REBUILD COMPLETED SUCCESSFULLY ===');
