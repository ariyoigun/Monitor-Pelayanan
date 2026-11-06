<?php
/**
 * SIKEREN DINPUTARU DEMAK - Cek Koneksi Database
 * Endpoint: /api/check-db.php (atau /api/check-db)
 */

require_once __DIR__ . '/config.php';

$startTime = microtime(true);

try {
    $db = getDb();
    
    // Check tables & counts
    $tables = ['submissions', 'users', 'system_texts'];
    $counts = [];
    $tableStatus = [];

    foreach ($tables as $tbl) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as total FROM `{$tbl}`");
            $row = $stmt->fetch();
            $cnt = (int)$row['total'];
            $counts[$tbl] = $cnt;
            $tableStatus[$tbl] = 'Tersedia (' . number_format($cnt, 0, ',', '.') . ' data)';
        } catch (Exception $e) {
            $counts[$tbl] = 0;
            $tableStatus[$tbl] = 'Tabel belum ada / belum diimpor';
        }
    }

    // Get database version
    $verStmt = $db->query("SELECT VERSION() as ver, NOW() as server_now, DATABASE() as current_db");
    $dbInfo = $verStmt->fetch();

    $durationMs = round((microtime(true) - $startTime) * 1000, 2);

    sendJson([
        'success'      => true,
        'message'      => 'Koneksi ke database MySQL Hostinger BERHASIL terhubung dan aktif!',
        'database'     => DB_NAME,
        'user'         => DB_USER,
        'host'         => DB_HOST,
        'driver'       => 'MySQL (PDO via PHP)',
        'db_version'   => $dbInfo['ver'] ?? 'Unknown',
        'server_time'  => $dbInfo['server_now'] ?? date('Y-m-d H:i:s'),
        'latency_ms'   => $durationMs,
        'counts'       => $counts,
        'table_status' => $tableStatus,
        'web_domain'   => 'sikeren.satuputarudemak.id',
        'status_code'  => 'CONNECTED_OK'
    ]);

} catch (Exception $e) {
    $durationMs = round((microtime(true) - $startTime) * 1000, 2);
    sendJson([
        'success'      => false,
        'message'      => 'Gagal terhubung ke database: ' . $e->getMessage(),
        'database'     => DB_NAME,
        'user'         => DB_USER,
        'host'         => DB_HOST,
        'latency_ms'   => $durationMs,
        'error'        => $e->getMessage(),
        'status_code'  => 'CONNECTION_ERROR'
    ], 500);
}
