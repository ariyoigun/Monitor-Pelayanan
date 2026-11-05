const assert = require('assert');
const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./database/db');

console.log('=== RUNNING COMPREHENSIVE VERIFICATION FOR SIKEREN DINPUTARU ===\n');

// 1. Verify Database Submissions
const countRow = db.prepare('SELECT COUNT(*) as count FROM submissions').get();
console.log(`1. Total Submissions in SQLite: ${countRow.count}`);
assert.strictEqual(countRow.count, 3319, 'Total submissions must be 3319');

// 2. Verify Categories Distribution
const categories = db.prepare('SELECT layanan, COUNT(*) as cnt FROM submissions GROUP BY layanan').all();
const catMap = {};
categories.forEach(c => catMap[c.layanan] = c.cnt);
console.log('2. Submissions by Service Category:', catMap);
assert.strictEqual(catMap.KTTR, 241, 'KTTR count must be 241');
assert.strictEqual(catMap.OSS, 259, 'OSS count must be 259');
assert.strictEqual(catMap.PBG, 164, 'PBG count must be 164');
assert.strictEqual(catMap.SLF, 2655, 'SLF count must be 2655');

// 3. Verify Monthly Statuses against Formula
const monthlyRows = db.prepare(`
  SELECT 
    CAST(SUBSTR(tgl_pengajuan, 6, 2) AS INTEGER) as month,
    status,
    COUNT(*) as cnt
  FROM submissions
  GROUP BY month, status
  ORDER BY month
`).all();

const monthlyStats = {};
for (let m = 1; m <= 11; m++) {
  monthlyStats[m] = { total: 0, PROSES: 0, SELESAI: 0, BERKAS_DIKEMBALIKAN: 0 };
}
monthlyRows.forEach(r => {
  if (monthlyStats[r.month]) {
    monthlyStats[r.month][r.status] = r.cnt;
    monthlyStats[r.month].total += r.cnt;
  }
});

console.log('\n3. Monthly Progress Rates:');
for (let m = 1; m <= 11; m++) {
  const s = monthlyStats[m];
  const onProgPct = s.total > 0 ? (s.PROSES / s.total * 100).toFixed(1) : '0';
  const selesaiPct = s.total > 0 ? (((s.SELESAI + s.BERKAS_DIKEMBALIKAN) / s.total) * 100).toFixed(1) : '0';
  console.log(`   Bulan ${m}: Total=${s.total}, OnProgress=${s.PROSES} (${onProgPct}%), Selesai/Kembali=${s.SELESAI + s.BERKAS_DIKEMBALIKAN} (${selesaiPct}%)`);
}
// Validate August - November is 100% On Progress
for (let m = 8; m <= 11; m++) {
  assert.strictEqual(monthlyStats[m].SELESAI, 0, `Month ${m} must have 0 selesai`);
  assert.strictEqual(monthlyStats[m].BERKAS_DIKEMBALIKAN, 0, `Month ${m} must have 0 berkas dikembalikan`);
  assert.strictEqual(monthlyStats[m].PROSES, monthlyStats[m].total, `Month ${m} must be 100% on progress`);
}

// 4. Verify Users from Akun dan Role Silan
const users = db.prepare('SELECT username, role, nama, password FROM users').all();
console.log(`\n4. Verified ${users.length} Users in SQLite:`);
users.forEach(u => console.log(`   - ${u.username} (${u.role}): ${u.nama}`));
assert.strictEqual(users.length, 7, 'Must have 7 authentic users');
const superadmin = users.find(u => u.username === 'superadmin');
assert(superadmin, 'superadmin must exist');
assert.strictEqual(superadmin.role, 'superadmin');
assert.strictEqual(superadmin.password, '*Dinput4ru_07');

const kadin = users.find(u => u.username === 'kadin.dinputaru');
assert(kadin, 'kadin must exist');
assert.strictEqual(kadin.password, '*Dinput4ru_01');

const koorTrp = users.find(u => u.username === 'koor.trp');
assert(koorTrp, 'koor.trp must exist');
assert.strictEqual(koorTrp.role, 'koordinator_bidang');

// 5. Verify HTML File Content Requirements
console.log('\n5. Verifying index.html Requirements:');
const html = fs.readFileSync('index.html', 'utf8');

// Check 5 KPI metrics in public and internal
assert(html.includes('id="pub-kpi-total"'), 'Missing pub-kpi-total');
assert(html.includes('id="pub-kpi-selesai"'), 'Missing pub-kpi-selesai');
assert(html.includes('id="pub-kpi-onprogress"'), 'Missing pub-kpi-onprogress');
assert(html.includes('id="pub-kpi-dikembalikan"'), 'Missing pub-kpi-dikembalikan');
assert(html.includes('id="pub-kpi-persen"'), 'Missing pub-kpi-persen');

assert(html.includes('id="kpi-total-pengajuan"'), 'Missing kpi-total-pengajuan');
assert(html.includes('id="kpi-selesai"'), 'Missing kpi-selesai');
assert(html.includes('id="kpi-onprogress"'), 'Missing kpi-onprogress');
assert(html.includes('id="kpi-dikembalikan"'), 'Missing kpi-dikembalikan');
assert(html.includes('id="kpi-persen-selesai"'), 'Missing kpi-persen-selesai');
console.log('   [OK] All 5 information indicators present in both public & internal dashboard');

// Check 4 Category cards container and filter tabs
assert(html.includes('id="dash-category-cards"'), 'Missing dash-category-cards');
assert(html.includes('id="dash-category-tabs"'), 'Missing dash-category-tabs');
console.log('   [OK] 4 Category cards and category filter tabs present in dashboard');

// Check no visitor registration or quick demo buttons
assert(!html.includes('id="view-portal"'), 'view-portal should be removed');
assert(!html.includes('form-register-visitor'), 'form-register-visitor should be removed');
assert(!html.includes('Akses Cepat Pengujian Role'), 'Quick demo test buttons should be removed');
console.log('   [OK] Visitor registration and simulation buttons cleanly removed');

// Check direct external destination links
assert(html.includes('https://bit.ly/pendaftaranKTTRDemak'), 'Direct KTTR link must be present');
assert(html.includes('https://bit.ly/validasioss'), 'Direct OSS link must be present');
assert(html.includes('https://simbg.pu.go.id'), 'Direct SIMBG link must be present');
console.log('   [OK] Direct external links present for KTTR, OSS, PBG, and SLF');

// 6. Verify SIKEREN Branding & GISTARU Feature Card
console.log('\n6. Verifying SIKEREN Branding & GISTARU Spatial Check Box:');
assert(html.includes('SIKEREN'), 'SIKEREN name must be in index.html');
assert(html.includes('Sistem Informasi Keterangan Pelayanan Perizinan'), 'Full title must be in index.html');
assert(html.includes('Cek Pola Ruang Tanah / Bidang / Lokasi') || html.includes('Cek Pola Ruang Tanah/Bidang/Lokasi'), 'GISTARU feature card title must be in index.html');
assert(html.includes('https://gistaru.atrbpn.go.id'), 'GISTARU URL link must be in index.html');
assert(html.includes('gistaru-feature-card'), 'GISTARU card wrapper class must be present');
console.log('   [OK] SIKEREN branding verified throughout public landing page');
console.log('   [OK] Cek Pola Ruang Tanah/Bidang/Lokasi (GISTARU) card & links verified');

console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY! ===');
