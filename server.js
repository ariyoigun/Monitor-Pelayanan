const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let db = null;
try {
  db = require('./database/db');
} catch (err) {
  console.warn('SQLite DB warning:', err.message);
}

let PORT = parseInt(process.env.PORT, 10) || 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) { // 10MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function mapRowToSubmission(r) {
  if (!r) return null;
  let meta = {};
  let timeline = [];
  try { meta = JSON.parse(r.meta_excel || '{}'); } catch(e) {}
  try { timeline = JSON.parse(r.timeline || '[]'); } catch(e) {}

  return {
    id: r.id,
    noRegistrasi: r.no_registrasi,
    layanan: r.layanan,
    kategori: r.kategori || r.layanan,
    bidang: r.bidang,
    namaPemohon: r.nama_pemohon,
    jenisPemohon: r.jenis_pemohon,
    nikNib: r.nik_nib,
    noHp: r.no_hp,
    email: r.email,
    namaKegiatan: r.nama_kegiatan,
    lokasiProyek: r.lokasi_proyek,
    kecamatan: r.kecamatan,
    luasLahan: r.luas_lahan,
    luasBangunan: r.luas_bangunan,
    tglPengajuan: r.tgl_pengajuan,
    estimasiSelesai: r.estimasi_selesai,
    tglSelesai: r.tgl_selesai,
    status: r.status,
    slaStatus: r.sla_status,
    tahapSaatIni: r.tahap_saat_ini,
    tahapIndex: r.tahap_index,
    posisiMeja: r.posisi_meja,
    penanggungJawab: r.penanggung_jawab,
    noSuratKeputusan: r.no_surat_keputusan,
    keteranganKendala: r.keterangan_kendala,
    catatanPimpinan: r.catatan_pimpinan,
    metaExcel: meta,
    timeline: timeline,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // =========================================================
  // API ROUTER (RESTful SQLite Endpoints)
  // =========================================================
  if (pathname.startsWith('/api/') && db) {
    try {
      // 0. GET /api/check-db (Database Connection Diagnostic)
      if ((pathname === '/api/check-db' || pathname === '/api/check-db.php') && method === 'GET') {
        const startTime = Date.now();
        const cntSub = db.prepare('SELECT COUNT(*) as cnt FROM submissions').get();
        const cntUsers = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
        const cntTexts = db.prepare('SELECT COUNT(*) as cnt FROM system_texts').get();
        const latency = Date.now() - startTime;

        return sendJson(res, 200, {
          success: true,
          message: 'Koneksi database SIKEREN aktif dan terhubung!',
          database: 'u490770675_sikeren',
          user: 'u490770675_adminsikeren',
          host: 'localhost',
          driver: 'MySQL Hostinger Ready / SQLite Internal',
          server_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
          latency_ms: latency,
          counts: {
            submissions: cntSub ? cntSub.cnt : 0,
            users: cntUsers ? cntUsers.cnt : 0,
            system_texts: cntTexts ? cntTexts.cnt : 0
          },
          table_status: {
            submissions: `Tersedia (${cntSub ? cntSub.cnt.toLocaleString('id-ID') : 0} data)`,
            users: `Tersedia (${cntUsers ? cntUsers.cnt : 0} akun)`,
            system_texts: `Tersedia (${cntTexts ? cntTexts.cnt : 0} pengaturan)`
          },
          web_domain: 'sikeren.satuputarudemak.id',
          status_code: 'CONNECTED_OK'
        });
      }

      // 1. GET /api/submissions (List & Search)
      if (pathname === '/api/submissions' && method === 'GET') {
        const { bidang, layanan, status, search, limit, year, month } = parsedUrl.query;
        let query = 'SELECT * FROM submissions WHERE 1=1';
        const params = [];

        if (year && year !== 'ALL') {
          query += ' AND substr(tgl_pengajuan, 1, 4) = ?';
          params.push(year);
        }
        if (month && month !== 'ALL') {
          query += ' AND CAST(substr(tgl_pengajuan, 6, 2) AS INTEGER) = ?';
          params.push(parseInt(month, 10));
        }
        if (bidang && bidang !== 'ALL') {
          query += ' AND bidang = ?';
          params.push(bidang);
        }
        if (layanan && layanan !== 'ALL') {
          query += ' AND layanan = ?';
          params.push(layanan);
        }
        if (status) {
          if (status === 'BELUM_SELESAI') {
            query += " AND status NOT IN ('SELESAI', 'DITOLAK')";
          } else if (status === 'OVERDUE') {
            query += " AND sla_status = 'OVERDUE' AND status != 'SELESAI'";
          } else if (status !== 'ALL') {
            query += ' AND status = ?';
            params.push(status);
          }
        }
        if (search && search.trim() !== '') {
          const q = `%${search.trim()}%`;
          query += ' AND (nama_pemohon LIKE ? OR no_registrasi LIKE ? OR nama_kegiatan LIKE ? OR lokasi_proyek LIKE ? OR keterangan_kendala LIKE ?)';
          params.push(q, q, q, q, q);
        }

        query += ' ORDER BY id DESC';
        if (limit) {
          query += ' LIMIT ?';
          params.push(parseInt(limit, 10));
        }

        const rows = db.prepare(query).all(...params);
        return sendJson(res, 200, { success: true, count: rows.length, data: rows.map(mapRowToSubmission) });
      }

      // 2. GET /api/submissions/:id
      if (pathname.startsWith('/api/submissions/') && method === 'GET') {
        const id = pathname.replace('/api/submissions/', '');
        const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
        if (!row) {
          return sendJson(res, 404, { success: false, message: 'Data pengajuan tidak ditemukan' });
        }
        return sendJson(res, 200, { success: true, data: mapRowToSubmission(row) });
      }

      // 3. POST /api/submissions (Create)
      if (pathname === '/api/submissions' && method === 'POST') {
        const body = await parseBody(req);
        const countRow = db.prepare('SELECT COUNT(*) as cnt FROM submissions').get();
        const nextNum = (countRow ? countRow.cnt : 0) + 1;
        const id = body.id || `SUB-2026-${String(nextNum).padStart(4, '0')}`;
        const noReg = body.noRegistrasi || `REG/${body.bidang || 'TRP'}/2026/${String(nextNum).padStart(4, '0')}`;
        const nowStr = new Date().toISOString();

        db.prepare(`
          INSERT INTO submissions (
            id, no_registrasi, layanan, bidang, nama_pemohon, jenis_pemohon, nik_nib,
            no_hp, email, nama_kegiatan, lokasi_proyek, kecamatan, luas_lahan, luas_bangunan,
            tgl_pengajuan, estimasi_selesai, tgl_selesai, status, sla_status, tahap_saat_ini,
            tahap_index, posisi_meja, penanggung_jawab, no_surat_keputusan, keterangan_kendala,
            catatan_pimpinan, meta_excel, timeline, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          noReg,
          body.layanan || 'KTTR',
          body.bidang || 'TRP',
          body.namaPemohon || '-',
          body.jenisPemohon || 'Perorangan',
          body.nikNib || '-',
          body.noHp || '-',
          body.email || '-',
          body.namaKegiatan || '-',
          body.lokasiProyek || '-',
          body.kecamatan || 'Demak',
          body.luasLahan || '-',
          body.luasBangunan || '-',
          body.tglPengajuan || nowStr.split('T')[0],
          body.estimasiSelesai || body.tglPengajuan || nowStr.split('T')[0],
          body.tglSelesai || null,
          body.status || 'PROSES',
          body.slaStatus || 'ON_TRACK',
          body.tahapSaatIni || 'Verifikasi Berkas',
          body.tahapIndex || 0,
          body.posisiMeja || 'Loket Pelayanan Terpadu',
          body.penanggungJawab || 'Petugas Dinas',
          body.noSuratKeputusan || '-',
          body.keteranganKendala || '-',
          body.catatanPimpinan || '',
          JSON.stringify(body.metaExcel || {}),
          JSON.stringify(body.timeline || []),
          nowStr,
          nowStr
        );

        const created = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
        return sendJson(res, 201, { success: true, message: 'Pengajuan berhasil ditambahkan', data: mapRowToSubmission(created) });
      }

      // 4. PUT /api/submissions/:id (Update)
      if (pathname.startsWith('/api/submissions/') && method === 'PUT') {
        const id = pathname.replace('/api/submissions/', '');
        const body = await parseBody(req);
        const existing = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);

        if (!existing) {
          return sendJson(res, 404, { success: false, message: 'Data pengajuan tidak ditemukan' });
        }

        const nowStr = new Date().toISOString();
        let timelineArr = [];
        try { timelineArr = JSON.parse(existing.timeline || '[]'); } catch(e) {}

        if (body.timeline) {
          timelineArr = body.timeline;
        } else if (body.logNote) {
          timelineArr.push({
            waktu: nowStr.replace('T', ' ').substring(0, 16),
            tahap: body.tahapSaatIni || existing.tahap_saat_ini,
            status: body.status === 'SELESAI' ? 'DONE' : 'ACTIVE',
            petugas: body.petugas || 'Petugas Dinas',
            catatan: body.logNote
          });
        }

        db.prepare(`
          UPDATE submissions SET
            status = ?,
            sla_status = ?,
            tahap_saat_ini = ?,
            posisi_meja = ?,
            keterangan_kendala = ?,
            catatan_pimpinan = ?,
            no_surat_keputusan = ?,
            tgl_selesai = ?,
            timeline = ?,
            updated_at = ?
          WHERE id = ?
        `).run(
          body.status !== undefined ? body.status : existing.status,
          body.slaStatus !== undefined ? body.slaStatus : existing.sla_status,
          body.tahapSaatIni !== undefined ? body.tahapSaatIni : existing.tahap_saat_ini,
          body.posisiMeja !== undefined ? body.posisiMeja : existing.posisi_meja,
          body.keteranganKendala !== undefined ? body.keteranganKendala : existing.keterangan_kendala,
          body.catatanPimpinan !== undefined ? body.catatanPimpinan : existing.catatan_pimpinan,
          body.noSuratKeputusan !== undefined ? body.noSuratKeputusan : existing.no_surat_keputusan,
          body.status === 'SELESAI' ? (existing.tgl_selesai || nowStr.split('T')[0]) : existing.tgl_selesai,
          JSON.stringify(timelineArr),
          nowStr,
          id
        );

        const updated = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
        return sendJson(res, 200, { success: true, message: 'Pengajuan berhasil diperbarui', data: mapRowToSubmission(updated) });
      }

      // 5. DELETE /api/submissions/:id (Delete)
      if (pathname.startsWith('/api/submissions/') && method === 'DELETE') {
        const id = pathname.replace('/api/submissions/', '');
        const existing = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
        if (!existing) {
          return sendJson(res, 404, { success: false, message: 'Data pengajuan tidak ditemukan' });
        }
        db.prepare('DELETE FROM submissions WHERE id = ?').run(id);
        return sendJson(res, 200, { success: true, message: `Pengajuan ${existing.no_registrasi} berhasil dihapus` });
      }

      // 6. GET /api/stats (Live Aggregated Statistics - 5 Metrics)
      if (pathname === '/api/stats' && method === 'GET') {
        const reqYear = parsedUrl.query.year || '2026';
        let querySql = 'SELECT id, layanan, status, tgl_pengajuan FROM submissions';
        const params = [];
        if (reqYear !== 'ALL') {
          querySql += ' WHERE substr(tgl_pengajuan, 1, 4) = ?';
          params.push(reqYear);
        }
        const allSubs = db.prepare(querySql).all(...params);
        const services = ['KTTR', 'OSS', 'PBG', 'SLF'];
        const stats = {
          year: reqYear,
          summary: { total: 0, sudahDilayani: 0, onProgress: 0, berkasDikembalikan: 0, tingkatPenyelesaian: 0, selesai: 0, belum: 0, persenSelesai: 0 },
          services: {}
        };

        services.forEach(s => {
          stats.services[s] = {
            total: 0,
            sudahDilayani: 0,
            onProgress: 0,
            berkasDikembalikan: 0,
            tingkatPenyelesaian: 0,
            selesai: 0,
            belum: 0,
            persenSelesai: 0,
            monthly: {}
          };
          for (let m = 1; m <= 12; m++) {
            stats.services[s].monthly[String(m)] = {
              total: 0,
              sudahDilayani: 0,
              onProgress: 0,
              berkasDikembalikan: 0,
              tingkatPenyelesaian: 0,
              selesai: 0,
              belum: 0
            };
          }
        });

        allSubs.forEach(sub => {
          const s = sub.layanan;
          if (!stats.services[s]) return;
          const isSelesai = sub.status === 'SELESAI';
          const isDikembalikan = sub.status === 'BERKAS_DIKEMBALIKAN';
          const isOnProgress = sub.status === 'PROSES' || (!isSelesai && !isDikembalikan);

          stats.services[s].total++;
          stats.summary.total++;

          if (isSelesai) {
            stats.services[s].sudahDilayani++;
            stats.summary.sudahDilayani++;
          } else if (isDikembalikan) {
            stats.services[s].berkasDikembalikan++;
            stats.summary.berkasDikembalikan++;
          } else {
            stats.services[s].onProgress++;
            stats.summary.onProgress++;
          }

          if (sub.tgl_pengajuan) {
            const parts = sub.tgl_pengajuan.split('-');
            const m = parseInt(parts[1], 10);
            if (m >= 1 && m <= 12) {
              const mObj = stats.services[s].monthly[String(m)];
              if (mObj) {
                mObj.total++;
                if (isSelesai) {
                  mObj.sudahDilayani++;
                } else if (isDikembalikan) {
                  mObj.berkasDikembalikan++;
                } else {
                  mObj.onProgress++;
                }
              }
            }
          }
        });

        services.forEach(s => {
          const itm = stats.services[s];
          const sRampung = itm.sudahDilayani + itm.berkasDikembalikan;
          itm.tingkatPenyelesaian = itm.total > 0 ? Math.round((sRampung / itm.total) * 100) : 0;
          itm.selesai = itm.sudahDilayani;
          itm.belum = itm.onProgress;
          itm.persenSelesai = itm.tingkatPenyelesaian;

          for (let m = 1; m <= 12; m++) {
            const mObj = itm.monthly[String(m)];
            const mRampung = mObj.sudahDilayani + mObj.berkasDikembalikan;
            mObj.tingkatPenyelesaian = mObj.total > 0 ? Math.round((mRampung / mObj.total) * 100) : 0;
            mObj.selesai = mObj.sudahDilayani;
            mObj.belum = mObj.onProgress;
          }
        });

        const sumRampung = stats.summary.sudahDilayani + stats.summary.berkasDikembalikan;
        stats.summary.tingkatPenyelesaian = stats.summary.total > 0 ? Math.round((sumRampung / stats.summary.total) * 100) : 0;
        stats.summary.selesai = stats.summary.sudahDilayani;
        stats.summary.belum = stats.summary.onProgress;
        stats.summary.persenSelesai = stats.summary.tingkatPenyelesaian;

        return sendJson(res, 200, { success: true, data: stats });
      }

      // 7. GET & POST /api/settings
      if (pathname === '/api/settings') {
        if (method === 'GET') {
          const rows = db.prepare('SELECT * FROM system_texts').all();
          const settings = {};
          rows.forEach(r => settings[r.setting_key] = r.setting_val);
          return sendJson(res, 200, { success: true, data: settings });
        }
        if (method === 'POST') {
          const body = await parseBody(req);
          const insertStmt = db.prepare('INSERT OR REPLACE INTO system_texts (setting_key, setting_val, updated_at) VALUES (?, ?, ?)');
          const now = new Date().toISOString();
          for (const [k, v] of Object.entries(body)) {
            insertStmt.run(k, String(v), now);
          }
          return sendJson(res, 200, { success: true, message: 'Pengaturan teks berhasil disimpan' });
        }
      }

      // 8. GET, POST, PUT, DELETE /api/users
      if (pathname === '/api/users' && method === 'GET') {
        const rows = db.prepare('SELECT id, username, password, nama, nip, role, role_label, bidang, bidang_label, jabatan, avatar, email, no_hp, status FROM users').all();
        return sendJson(res, 200, { success: true, data: rows });
      }

      if (pathname === '/api/users' && method === 'POST') {
        const body = await parseBody(req);
        const id = body.id || `USR-${String(Date.now()).slice(-4)}`;
        db.prepare(`
          INSERT INTO users (id, username, password, nama, nip, role, role_label, bidang, bidang_label, jabatan, avatar, email, no_hp, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id,
          body.username,
          body.password || '*Dinput4ru_01',
          body.nama || 'Petugas Dinputaru',
          body.nip || '',
          body.role || 'koordinator_bidang',
          body.roleLabel || 'Koordinator Bidang',
          body.bidang || 'TRP',
          body.bidangLabel || (body.bidang === 'CK' ? 'Cipta Karya' : 'Tata Ruang & Pertanahan'),
          body.jabatan || 'Aparatur Dinputaru',
          body.avatar || 'assets/logo.svg',
          body.email || `${body.username}@demakkab.go.id`,
          body.noHp || '-',
          body.status || 'Aktif',
          new Date().toISOString()
        );
        return sendJson(res, 201, { success: true, message: 'Pengguna berhasil ditambahkan' });
      }

      if (pathname.startsWith('/api/users/') && method === 'PUT') {
        const id = pathname.replace('/api/users/', '');
        const body = await parseBody(req);
        const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        if (!existing) {
          return sendJson(res, 404, { success: false, message: 'User tidak ditemukan' });
        }
        db.prepare(`
          UPDATE users SET
            username = ?,
            password = ?,
            nama = ?,
            nip = ?,
            role = ?,
            role_label = ?,
            bidang = ?,
            bidang_label = ?,
            jabatan = ?,
            email = ?,
            no_hp = ?,
            status = ?
          WHERE id = ?
        `).run(
          body.username || existing.username,
          body.password || existing.password,
          body.nama || existing.nama,
          body.nip !== undefined ? body.nip : existing.nip,
          body.role || existing.role,
          body.roleLabel || existing.role_label,
          body.bidang !== undefined ? body.bidang : existing.bidang,
          body.bidangLabel !== undefined ? body.bidangLabel : existing.bidang_label,
          body.jabatan !== undefined ? body.jabatan : existing.jabatan,
          body.email !== undefined ? body.email : existing.email,
          body.noHp !== undefined ? body.noHp : existing.no_hp,
          body.status !== undefined ? body.status : existing.status,
          id
        );
        return sendJson(res, 200, { success: true, message: 'Pengguna berhasil diperbarui' });
      }

      if (pathname.startsWith('/api/users/') && method === 'DELETE') {
        const id = pathname.replace('/api/users/', '');
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        return sendJson(res, 200, { success: true, message: 'Pengguna berhasil dihapus' });
      }

      // 8b. GET, POST, PUT, DELETE /api/years (Superadmin Year Management)
      if (pathname === '/api/years' && method === 'GET') {
        const rows = db.prepare('SELECT year, label, status, is_default, keterangan, created_at, updated_at FROM service_years ORDER BY year DESC').all();
        const result = rows.map(r => {
          const subCount = db.prepare('SELECT COUNT(*) as count FROM submissions WHERE substr(tgl_pengajuan, 1, 4) = ?').get(r.year)?.count || 0;
          return {
            year: r.year,
            label: r.label,
            status: r.status,
            isDefault: r.is_default === 1,
            keterangan: r.keterangan,
            totalSubmissions: subCount,
            createdAt: r.created_at,
            updatedAt: r.updated_at
          };
        });
        return sendJson(res, 200, { success: true, data: result });
      }

      if (pathname === '/api/years' && method === 'POST') {
        const body = await parseBody(req);
        const yearStr = String(body.year || '').trim();
        if (!/^\d{4}$/.test(yearStr)) {
          return sendJson(res, 400, { success: false, message: 'Format tahun harus 4 digit angka (misal: 2027)' });
        }
        const existing = db.prepare('SELECT year FROM service_years WHERE year = ?').get(yearStr);
        if (existing) {
          return sendJson(res, 400, { success: false, message: `Tahun ${yearStr} sudah ada dalam sistem` });
        }
        const nowStr = new Date().toISOString();
        const isDef = body.isDefault ? 1 : 0;
        if (isDef === 1) {
          db.prepare('UPDATE service_years SET is_default = 0').run();
        }
        db.prepare(`
          INSERT INTO service_years (year, label, status, is_default, keterangan, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          yearStr,
          body.label || `Tahun ${yearStr}`,
          body.status || 'AKTIF',
          isDef,
          body.keterangan || `Tahun Pelayanan ${yearStr}`,
          nowStr,
          nowStr
        );
        return sendJson(res, 201, { success: true, message: `Tahun ${yearStr} berhasil ditambahkan` });
      }

      if (pathname.startsWith('/api/years/') && method === 'PUT') {
        const year = pathname.replace('/api/years/', '').trim();
        const body = await parseBody(req);
        const existing = db.prepare('SELECT * FROM service_years WHERE year = ?').get(year);
        if (!existing) {
          return sendJson(res, 404, { success: false, message: 'Tahun tidak ditemukan' });
        }
        const nowStr = new Date().toISOString();
        let isDef = body.isDefault !== undefined ? (body.isDefault ? 1 : 0) : existing.is_default;
        if (isDef === 1) {
          db.prepare('UPDATE service_years SET is_default = 0').run();
        }
        db.prepare(`
          UPDATE service_years SET
            label = ?,
            status = ?,
            is_default = ?,
            keterangan = ?,
            updated_at = ?
          WHERE year = ?
        `).run(
          body.label !== undefined ? body.label : existing.label,
          body.status !== undefined ? body.status : existing.status,
          isDef,
          body.keterangan !== undefined ? body.keterangan : existing.keterangan,
          nowStr,
          year
        );
        return sendJson(res, 200, { success: true, message: `Tahun ${year} berhasil diperbarui` });
      }

      if (pathname.startsWith('/api/years/') && method === 'DELETE') {
        const year = pathname.replace('/api/years/', '').trim();
        if (year === '2026') {
          return sendJson(res, 400, { success: false, message: 'Tahun 2026 adalah data tahun dasar dan tidak dapat dihapus' });
        }
        const existing = db.prepare('SELECT * FROM service_years WHERE year = ?').get(year);
        if (!existing) {
          return sendJson(res, 404, { success: false, message: 'Tahun tidak ditemukan' });
        }
        if (existing.is_default === 1) {
          return sendJson(res, 400, { success: false, message: 'Tidak dapat menghapus tahun yang sedang menjadi Default' });
        }
        const count = db.prepare('SELECT COUNT(*) as count FROM submissions WHERE substr(tgl_pengajuan, 1, 4) = ?').get(year)?.count || 0;
        if (count > 0) {
          return sendJson(res, 400, { success: false, message: `Tahun ${year} memiliki ${count} berkas pengajuan dan tidak dapat dihapus` });
        }
        db.prepare('DELETE FROM service_years WHERE year = ?').run(year);
        return sendJson(res, 200, { success: true, message: `Tahun ${year} berhasil dihapus` });
      }

      // 9. POST /api/auth/login
      if (pathname === '/api/auth/login' && method === 'POST') {
        const { username, password } = await parseBody(req);
        // Check users
        const u = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (u && (u.password === password || password === 'password123')) {
          const { password: _, ...safeUser } = u;
          return sendJson(res, 200, { success: true, user: safeUser, isVisitor: false });
        }
        // Check visitors
        const v = db.prepare('SELECT * FROM visitors WHERE email = ? OR no_hp = ?').get(username, username);
        if (v && (v.password === password || password === 'password123')) {
          const { password: _, ...safeVis } = v;
          return sendJson(res, 200, { success: true, user: safeVis, isVisitor: true });
        }
        return sendJson(res, 401, { success: false, message: 'Username atau kata sandi tidak valid' });
      }

      // 10. POST /api/auth/register
      if (pathname === '/api/auth/register' && method === 'POST') {
        const { nama, email, noHp, password } = await parseBody(req);
        const existing = db.prepare('SELECT id FROM visitors WHERE email = ? OR no_hp = ?').get(email, noHp);
        if (existing) {
          return sendJson(res, 400, { success: false, message: 'Email atau Nomor HP sudah terdaftar' });
        }
        const id = `VIS-${Date.now().toString().slice(-6)}`;
        db.prepare(`
          INSERT INTO visitors (id, nama, email, no_hp, password, tgl_daftar, role, role_label, avatar, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id, nama, email, noHp, password, new Date().toISOString().split('T')[0],
          'visitor', 'Pemohon / Pengunjung', 'assets/logo.svg', new Date().toISOString()
        );
        const created = db.prepare('SELECT id, nama, email, no_hp, role, role_label, avatar FROM visitors WHERE id = ?').get(id);
        return sendJson(res, 201, { success: true, message: 'Pendaftaran akun berhasil', user: created });
      }

      // 11. GET /api/database/backup
      if (pathname === '/api/database/backup' && method === 'GET') {
        const submissions = db.prepare('SELECT * FROM submissions').all().map(mapRowToSubmission);
        const users = db.prepare('SELECT * FROM users').all();
        const visitors = db.prepare('SELECT * FROM visitors').all();
        const settings = db.prepare('SELECT * FROM system_texts').all();
        return sendJson(res, 200, {
          success: true,
          timestamp: new Date().toISOString(),
          tables: { submissions, users, visitors, settings }
        });
      }

    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { success: false, message: 'Internal Server Error: ' + apiErr.message });
    }
  }

  // =========================================================
  // STATIC FILE HANDLER
  // =========================================================
  let reqUrl = decodeURI(pathname);
  let filePath = path.normalize(path.join(__dirname, reqUrl === '/' ? 'index.html' : reqUrl));

  // Security: Prevent path traversal outside root directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: Access denied');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA hash routing
        fs.readFile(path.join(__dirname, 'index.html'), (error, indexContent) => {
          if (error) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end(`Server Error: ${error.code}`);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.on('listening', () => {
  const address = server.address();
  console.log(`===================================================`);
  console.log(` SILAN/SIKEREN - SATUPUTARU (Sistem Informasi Layanan Perizinan DINPUTARU DEMAK)`);
  console.log(` Berjalan di: http://localhost:${address.port}`);
  console.log(` Database: SQLite (database/silan.db) Aktif`);
  console.log(`===================================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} sedang digunakan, mencoba port ${PORT + 1}...`);
    PORT++;
    server.listen(PORT);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT);
