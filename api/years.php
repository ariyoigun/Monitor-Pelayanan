<?php
/**
 * SILAN/SIKEREN - SATU PUTARU DINPUTARU DEMAK
 * API Years Management (CRUD)
 * Endpoint: /api/years.php (atau /api/years)
 */

require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// Ensure table exists
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS `service_years` (
            `year` VARCHAR(10) PRIMARY KEY,
            `label` VARCHAR(100) NOT NULL,
            `status` VARCHAR(20) DEFAULT 'AKTIF',
            `is_default` TINYINT(1) DEFAULT 0,
            `keterangan` TEXT,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Seed 2026 if empty
    $check = $db->query("SELECT COUNT(*) as cnt FROM `service_years`")->fetch();
    if (!$check || (int)$check['cnt'] === 0) {
        $db->exec("INSERT IGNORE INTO `service_years` (`year`, `label`, `status`, `is_default`, `keterangan`) VALUES ('2026', 'Tahun 2026', 'AKTIF', 1, 'Tahun Berjalan 2026 (Data Otentik DINPUTARU Demak)')");
    }
} catch (Exception $e) {}

// 1. GET /api/years
if ($method === 'GET') {
    try {
        $stmt = $db->query("SELECT * FROM `service_years` ORDER BY CAST(`year` AS UNSIGNED) DESC");
        $rows = $stmt->fetchAll();

        // Get submission count per year
        $cntStmt = $db->query("SELECT SUBSTRING(`tgl_pengajuan`, 1, 4) as y, COUNT(*) as cnt FROM `submissions` GROUP BY y");
        $counts = [];
        while ($r = $cntStmt->fetch()) {
            if (!empty($r['y'])) $counts[$r['y']] = (int)$r['cnt'];
        }

        $years = array_map(function($r) use ($counts) {
            $yr = (string)$r['year'];
            return [
                'year'             => $yr,
                'label'            => $r['label'] ?: 'Tahun ' . $yr,
                'status'           => $r['status'] ?: 'AKTIF',
                'isDefault'        => (bool)$r['is_default'],
                'keterangan'       => $r['keterangan'] ?: '',
                'totalSubmissions' => $counts[$yr] ?? 0,
                'createdAt'        => $r['created_at'],
                'updatedAt'        => $r['updated_at']
            ];
        }, $rows);

        sendJson(['success' => true, 'data' => $years]);
    } catch (Exception $e) {
        sendJson(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

// 2. POST /api/years (Add)
if ($method === 'POST') {
    $input = getJsonInput();
    $year = trim($input['year'] ?? '');
    if (!preg_match('/^\d{4}$/', $year)) {
        sendJson(['success' => false, 'message' => 'Format tahun tidak valid (harus 4 digit)'], 400);
    }

    $label = trim($input['label'] ?? "Tahun $year");
    $status = trim($input['status'] ?? 'AKTIF');
    $isDefault = !empty($input['isDefault']) ? 1 : 0;
    $keterangan = trim($input['keterangan'] ?? "Tahun Pelayanan $year");

    try {
        if ($isDefault) {
            $db->exec("UPDATE `service_years` SET `is_default` = 0");
        }
        $stmt = $db->prepare("
            INSERT INTO `service_years` (`year`, `label`, `status`, `is_default`, `keterangan`)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE `label` = VALUES(`label`), `status` = VALUES(`status`), `is_default` = VALUES(`is_default`), `keterangan` = VALUES(`keterangan`)
        ");
        $stmt->execute([$year, $label, $status, $isDefault, $keterangan]);
        sendJson(['success' => true, 'message' => "Tahun $year berhasil disimpan"]);
    } catch (Exception $e) {
        sendJson(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

// 3. PUT /api/years/:year (Update)
if ($method === 'PUT') {
    $input = getJsonInput();
    $year = trim($_GET['year'] ?? $input['year'] ?? '');
    if (!$year) {
        sendJson(['success' => false, 'message' => 'Parameter tahun tidak ditemukan'], 400);
    }

    try {
        if (!empty($input['isDefault'])) {
            $db->exec("UPDATE `service_years` SET `is_default` = 0");
            $db->prepare("UPDATE `service_years` SET `is_default` = 1, `status` = 'AKTIF' WHERE `year` = ?")->execute([$year]);
        }
        if (isset($input['label']) || isset($input['status']) || isset($input['keterangan'])) {
            $stmt = $db->prepare("
                UPDATE `service_years` SET 
                    `label` = COALESCE(?, `label`),
                    `status` = COALESCE(?, `status`),
                    `keterangan` = COALESCE(?, `keterangan`)
                WHERE `year` = ?
            ");
            $stmt->execute([$input['label'] ?? null, $input['status'] ?? null, $input['keterangan'] ?? null, $year]);
        }
        sendJson(['success' => true, 'message' => "Tahun $year berhasil diperbarui"]);
    } catch (Exception $e) {
        sendJson(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

// 4. DELETE /api/years/:year (Delete)
if ($method === 'DELETE') {
    $year = trim($_GET['year'] ?? '');
    if ($year === '2026') {
        sendJson(['success' => false, 'message' => 'Tahun 2026 adalah data dasar dan tidak dapat dihapus'], 400);
    }
    try {
        $stmt = $db->prepare("DELETE FROM `service_years` WHERE `year` = ? AND `is_default` = 0");
        $stmt->execute([$year]);
        sendJson(['success' => true, 'message' => "Tahun $year berhasil dihapus"]);
    } catch (Exception $e) {
        sendJson(['success' => false, 'message' => $e->getMessage()], 500);
    }
}

sendJson(['success' => false, 'message' => 'Metode HTTP tidak didukung'], 405);

