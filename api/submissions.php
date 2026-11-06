<?php
/**
 * SIKEREN DINPUTARU DEMAK - API Submissions (CRUD & Search)
 * Endpoint: /api/submissions.php (atau /api/submissions)
 */

require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

function mapRowToSubmission($r) {
    if (!$r) return null;
    $meta = [];
    $timeline = [];
    if (!empty($r['meta_excel'])) {
        $meta = json_decode($r['meta_excel'], true) ?: [];
    }
    if (!empty($r['timeline'])) {
        $timeline = json_decode($r['timeline'], true) ?: [];
    }

    return [
        'id'                => $r['id'],
        'noRegistrasi'      => $r['no_registrasi'],
        'layanan'           => $r['layanan'],
        'kategori'          => $r['kategori'] ?? $r['layanan'],
        'bidang'            => $r['bidang'],
        'namaPemohon'       => $r['nama_pemohon'],
        'jenisPemohon'      => $r['jenis_pemohon'],
        'nikNib'            => $r['nik_nib'],
        'noHp'              => $r['no_hp'],
        'email'             => $r['email'],
        'namaKegiatan'      => $r['nama_kegiatan'],
        'lokasiProyek'      => $r['lokasi_proyek'],
        'kecamatan'         => $r['kecamatan'],
        'luasLahan'         => $r['luas_lahan'],
        'luasBangunan'      => $r['luas_bangunan'],
        'tglPengajuan'      => $r['tgl_pengajuan'],
        'estimasiSelesai'   => $r['estimasi_selesai'],
        'tglSelesai'        => $r['tgl_selesai'],
        'status'            => $r['status'],
        'slaStatus'         => $r['sla_status'],
        'tahapSaatIni'      => $r['tahap_saat_ini'],
        'tahapIndex'        => (int)($r['tahap_index'] ?? 0),
        'posisiMeja'        => $r['posisi_meja'],
        'penanggungJawab'   => $r['penanggung_jawab'],
        'noSuratKeputusan'  => $r['no_surat_keputusan'],
        'keteranganKendala' => $r['keterangan_kendala'],
        'catatanPimpinan'   => $r['catatan_pimpinan'],
        'metaExcel'         => $meta,
        'timeline'          => $timeline,
        'createdAt'         => $r['created_at'],
        'updatedAt'         => $r['updated_at']
    ];
}

// -------------------------------------------------------------
// 1. GET: List Submissions or Single Submission
// -------------------------------------------------------------
if ($method === 'GET') {
    // If ID requested (e.g. ?id=SUB-...)
    if (!empty($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM `submissions` WHERE `id` = ? LIMIT 1");
        $stmt->execute([$_GET['id']]);
        $row = $stmt->fetch();
        if (!$row) {
            sendJson(['success' => false, 'message' => 'Data pengajuan tidak ditemukan'], 404);
        }
        sendJson(['success' => true, 'data' => mapRowToSubmission($row)]);
    }

    $bidang  = $_GET['bidang'] ?? 'ALL';
    $layanan = $_GET['layanan'] ?? 'ALL';
    $status  = $_GET['status'] ?? 'ALL';
    $search  = trim($_GET['search'] ?? '');
    $limit   = isset($_GET['limit']) ? (int)$_GET['limit'] : 5000;

    $where = ["1=1"];
    $params = [];

    if ($bidang !== 'ALL') {
        $where[] = "`bidang` = ?";
        $params[] = $bidang;
    }
    if ($layanan !== 'ALL') {
        $where[] = "`layanan` = ?";
        $params[] = $layanan;
    }
    if ($status === 'BELUM_SELESAI') {
        $where[] = "`status` NOT IN ('SELESAI', 'DITOLAK')";
    } elseif ($status === 'OVERDUE') {
        $where[] = "`sla_status` = 'OVERDUE' AND `status` != 'SELESAI'";
    } elseif ($status !== 'ALL') {
        $where[] = "`status` = ?";
        $params[] = $status;
    }

    if ($search !== '') {
        $where[] = "(`nama_pemohon` LIKE ? OR `no_registrasi` LIKE ? OR `nama_kegiatan` LIKE ? OR `lokasi_proyek` LIKE ? OR `keterangan_kendala` LIKE ?)";
        $q = "%{$search}%";
        $params = array_merge($params, [$q, $q, $q, $q, $q]);
    }

    $sql = "SELECT * FROM `submissions` WHERE " . implode(' AND ', $where) . " ORDER BY `id` DESC";
    if ($limit > 0) {
        $sql .= " LIMIT " . $limit;
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    sendJson([
        'success' => true,
        'count'   => count($rows),
        'data'    => array_map('mapRowToSubmission', $rows)
    ]);
}

// -------------------------------------------------------------
// 2. POST: Create Submission
// -------------------------------------------------------------
if ($method === 'POST') {
    $input = getJsonInput();
    
    // Auto-generate ID & No Reg if not supplied
    $cntStmt = $db->query("SELECT COUNT(*) as cnt FROM `submissions`");
    $cnt = ((int)$cntStmt->fetch()['cnt']) + 1;

    $id = !empty($input['id']) ? $input['id'] : 'SUB-2026-' . str_pad($cnt, 4, '0', STR_PAD_LEFT);
    $bidang = $input['bidang'] ?? 'TRP';
    $noReg = !empty($input['noRegistrasi']) ? $input['noRegistrasi'] : "REG/{$bidang}/2026/" . str_pad($cnt, 4, '0', STR_PAD_LEFT);
    $today = date('Y-m-d');
    $now = date('Y-m-d H:i:s');

    $metaStr = !empty($input['metaExcel']) ? json_encode($input['metaExcel'], JSON_UNESCAPED_UNICODE) : '{}';
    $timelineStr = !empty($input['timeline']) ? json_encode($input['timeline'], JSON_UNESCAPED_UNICODE) : '[]';

    $sql = "INSERT INTO `submissions` (
        `id`, `no_registrasi`, `layanan`, `kategori`, `bidang`, `nama_pemohon`, `jenis_pemohon`,
        `nik_nib`, `no_hp`, `email`, `nama_kegiatan`, `lokasi_proyek`, `kecamatan`, `luas_lahan`,
        `luas_bangunan`, `tgl_pengajuan`, `estimasi_selesai`, `tgl_selesai`, `status`, `sla_status`,
        `tahap_saat_ini`, `tahap_index`, `posisi_meja`, `penanggung_jawab`, `no_surat_keputusan`,
        `keterangan_kendala`, `catatan_pimpinan`, `meta_excel`, `timeline`, `created_at`, `updated_at`
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )";

    $stmt = $db->prepare($sql);
    $stmt->execute([
        $id,
        $noReg,
        $input['layanan'] ?? 'KTTR',
        $input['kategori'] ?? ($input['layanan'] ?? 'KTTR'),
        $bidang,
        $input['namaPemohon'] ?? '-',
        $input['jenisPemohon'] ?? 'Perorangan',
        $input['nikNib'] ?? '-',
        $input['noHp'] ?? '-',
        $input['email'] ?? '-',
        $input['namaKegiatan'] ?? '-',
        $input['lokasiProyek'] ?? '-',
        $input['kecamatan'] ?? 'Demak',
        $input['luasLahan'] ?? '-',
        $input['luasBangunan'] ?? '-',
        $input['tglPengajuan'] ?? $today,
        $input['estimasiSelesai'] ?? ($input['tglPengajuan'] ?? $today),
        $input['tglSelesai'] ?? null,
        $input['status'] ?? 'PROSES',
        $input['slaStatus'] ?? 'ON_TRACK',
        $input['tahapSaatIni'] ?? 'Verifikasi Administrasi Berkas',
        (int)($input['tahapIndex'] ?? 0),
        $input['posisiMeja'] ?? 'Loket Pelayanan Terpadu DINPUTARU',
        $input['penanggungJawab'] ?? 'Petugas Teknis',
        $input['noSuratKeputusan'] ?? '-',
        $input['keteranganKendala'] ?? 'Pendaftaran berkas baru.',
        $input['catatanPimpinan'] ?? '',
        $metaStr,
        $timelineStr,
        $now,
        $now
    ]);

    sendJson([
        'success' => true,
        'message' => 'Pengajuan berhasil ditambahkan ke database',
        'id'      => $id,
        'noReg'   => $noReg
    ], 201);
}

// -------------------------------------------------------------
// 3. PUT: Update Submission
// -------------------------------------------------------------
if ($method === 'PUT') {
    $input = getJsonInput();
    $id = $_GET['id'] ?? ($input['id'] ?? null);

    if (empty($id)) {
        sendJson(['success' => false, 'message' => 'ID pengajuan harus disertakan'], 400);
    }

    $fields = [];
    $params = [];

    $map = [
        'status'            => 'status',
        'slaStatus'         => 'sla_status',
        'tahapSaatIni'      => 'tahap_saat_ini',
        'tahapIndex'        => 'tahap_index',
        'posisiMeja'        => 'posisi_meja',
        'penanggungJawab'   => 'penanggung_jawab',
        'noSuratKeputusan'  => 'no_surat_keputusan',
        'keteranganKendala' => 'keterangan_kendala',
        'catatanPimpinan'   => 'catatan_pimpinan',
        'namaPemohon'       => 'nama_pemohon',
        'namaKegiatan'      => 'nama_kegiatan',
        'lokasiProyek'      => 'lokasi_proyek',
        'kecamatan'         => 'kecamatan',
        'luasLahan'         => 'luas_lahan',
        'luasBangunan'      => 'luas_bangunan',
        'tglSelesai'        => 'tgl_selesai'
    ];

    foreach ($map as $keyInput => $dbCol) {
        if (isset($input[$keyInput])) {
            $fields[] = "`{$dbCol}` = ?";
            $params[] = $input[$keyInput];
        }
    }

    if (isset($input['timeline'])) {
        $fields[] = "`timeline` = ?";
        $params[] = is_string($input['timeline']) ? $input['timeline'] : json_encode($input['timeline'], JSON_UNESCAPED_UNICODE);
    }

    if (isset($input['metaExcel'])) {
        $fields[] = "`meta_excel` = ?";
        $params[] = is_string($input['metaExcel']) ? $input['metaExcel'] : json_encode($input['metaExcel'], JSON_UNESCAPED_UNICODE);
    }

    if (empty($fields)) {
        sendJson(['success' => false, 'message' => 'Tidak ada kolom yang diubah'], 400);
    }

    $fields[] = "`updated_at` = NOW()";
    $params[] = $id;

    $sql = "UPDATE `submissions` SET " . implode(', ', $fields) . " WHERE `id` = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    sendJson([
        'success' => true,
        'message' => 'Pengajuan berhasil diperbarui di database',
        'id'      => $id
    ]);
}

// -------------------------------------------------------------
// 4. DELETE: Delete Submission
// -------------------------------------------------------------
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (empty($id)) {
        $input = getJsonInput();
        $id = $input['id'] ?? null;
    }

    if (empty($id)) {
        sendJson(['success' => false, 'message' => 'ID pengajuan harus disertakan'], 400);
    }

    $stmt = $db->prepare("DELETE FROM `submissions` WHERE `id` = ?");
    $stmt->execute([$id]);

    sendJson([
        'success' => true,
        'message' => 'Pengajuan berhasil dihapus dari database',
        'id'      => $id
    ]);
}

sendJson(['success' => false, 'message' => 'Metode HTTP tidak didukung'], 405);
