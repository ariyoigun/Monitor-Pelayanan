const db = require('./db');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Seeding SILAN SQLite Database...');

// 1. Read data from js/data.js
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; }
};

const dataJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
vm.runInThisContext(dataJs);

// 2. Seed Users
const insertUser = db.prepare(`
  INSERT OR REPLACE INTO users (
    id, username, password, nama, nip, role, role_label, bidang, bidang_label,
    jabatan, avatar, email, no_hp, status, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

for (const u of INITIAL_USERS) {
  insertUser.run(
    u.id, u.username, u.password, u.nama, u.nip || '', u.role, u.roleLabel,
    u.bidang || 'Semua Bidang', u.bidangLabel || '', u.jabatan || '',
    u.avatar || 'assets/logo.svg', u.email || '', u.noHp || '', u.status || 'Aktif',
    new Date().toISOString()
  );
}
console.log(`Seeded ${INITIAL_USERS.length} internal users.`);

// 3. Seed Visitors
const insertVisitor = db.prepare(`
  INSERT OR REPLACE INTO visitors (
    id, nama, email, no_hp, password, tgl_daftar, role, role_label, avatar, created_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`);

for (const v of INITIAL_VISITORS) {
  insertVisitor.run(
    v.id, v.nama, v.email, v.noHp, v.password, v.tglDaftar || new Date().toISOString().split('T')[0],
    v.role || 'visitor', v.roleLabel || 'Pemohon / Pengunjung', v.avatar || 'assets/logo.svg',
    new Date().toISOString()
  );
}
console.log(`Seeded ${INITIAL_VISITORS.length} initial visitors.`);

// 4. Seed System Texts
const insertSetting = db.prepare(`
  INSERT OR REPLACE INTO system_texts (setting_key, setting_val, updated_at)
  VALUES (?, ?, ?)
`);

for (const [k, v] of Object.entries(DEFAULT_SYSTEM_TEXTS)) {
  insertSetting.run(k, String(v), new Date().toISOString());
}
console.log(`Seeded ${Object.keys(DEFAULT_SYSTEM_TEXTS).length} system settings.`);

// 5. Seed Submissions
const insertSub = db.prepare(`
  INSERT OR REPLACE INTO submissions (
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

for (const s of INITIAL_SUBMISSIONS) {
  insertSub.run(
    s.id,
    s.noRegistrasi || s.id,
    s.layanan,
    s.bidang,
    s.namaPemohon || '-',
    s.jenisPemohon || '-',
    s.nikNib || '-',
    s.noHp || '-',
    s.email || '-',
    s.namaKegiatan || '-',
    s.lokasiProyek || '-',
    s.kecamatan || 'Demak',
    s.luasLahan || '-',
    s.luasBangunan || '-',
    s.tglPengajuan || '2026-01-01',
    s.estimasiSelesai || s.tglPengajuan || '2026-01-01',
    s.tglSelesai || null,
    s.status || 'PROSES',
    s.slaStatus || 'ON_TRACK',
    s.tahapSaatIni || '-',
    s.tahapIndex || 0,
    s.posisiMeja || '-',
    s.penanggungJawab || '-',
    s.noSuratKeputusan || '-',
    s.keteranganKendala || '-',
    s.catatanPimpinan || '',
    JSON.stringify(s.metaExcel || {}),
    JSON.stringify(s.timeline || []),
    nowStr,
    nowStr
  );
}

console.log(`Seeded ${INITIAL_SUBMISSIONS.length} submissions.`);

// 6. Verify row count
const countSub = db.prepare('SELECT COUNT(*) as cnt FROM submissions').get();
console.log('Total submissions in SQLite DB:', countSub.cnt);
console.log('Database successfully initialized at:', path.join(__dirname, 'silan.db'));
