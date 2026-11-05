const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'silan.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for better concurrency and performance
db.exec('PRAGMA journal_mode = WAL;');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    no_registrasi TEXT,
    layanan TEXT,
    kategori TEXT,
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

  CREATE TABLE IF NOT EXISTS users (
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

  CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    nama TEXT,
    email TEXT UNIQUE,
    no_hp TEXT,
    password TEXT,
    tgl_daftar TEXT,
    role TEXT,
    role_label TEXT,
    avatar TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS system_texts (
    setting_key TEXT PRIMARY KEY,
    setting_val TEXT,
    updated_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_sub_layanan ON submissions (layanan);
  CREATE INDEX IF NOT EXISTS idx_sub_status ON submissions (status);
  CREATE INDEX IF NOT EXISTS idx_sub_bidang ON submissions (bidang);
  CREATE INDEX IF NOT EXISTS idx_sub_tgl ON submissions (tgl_pengajuan);
`);

module.exports = db;

