<?php
/**
 * SIKEREN DINPUTARU DEMAK - API Stats
 * Endpoint: /api/stats.php (atau /api/stats)
 */

require_once __DIR__ . '/config.php';

$db = getDb();

try {
    $totalRow = $db->query("SELECT COUNT(*) as total FROM `submissions`")->fetch();
    $selesaiRow = $db->query("SELECT COUNT(*) as selesai FROM `submissions` WHERE `status` = 'SELESAI'")->fetch();
    $prosesRow = $db->query("SELECT COUNT(*) as proses FROM `submissions` WHERE `status` = 'PROSES'")->fetch();
    $kembaliRow = $db->query("SELECT COUNT(*) as kembali FROM `submissions` WHERE `status` = 'BERKAS_DIKEMBALIKAN'")->fetch();

    $total = (int)$totalRow['total'];
    $selesai = (int)$selesaiRow['selesai'];
    $onProgress = (int)$prosesRow['proses'];
    $kembali = (int)$kembaliRow['kembali'];
    $tingkatPenyelesaian = $total > 0 ? round((($selesai + $kembali) / $total) * 100) : 0;

    // By Service
    $bySrvStmt = $db->query("SELECT `layanan`, COUNT(*) as cnt FROM `submissions` GROUP BY `layanan`");
    $byLayanan = [];
    while ($r = $bySrvStmt->fetch()) {
        $byLayanan[$r['layanan']] = (int)$r['cnt'];
    }

    sendJson([
        'success' => true,
        'summary' => [
            'total'               => $total,
            'sudahDilayani'       => $selesai,
            'onProgress'          => $onProgress,
            'berkasDikembalikan'  => $kembali,
            'tingkatPenyelesaian' => $tingkatPenyelesaian
        ],
        'byLayanan' => $byLayanan
    ]);
} catch (Exception $e) {
    sendJson(['success' => false, 'message' => $e->getMessage()], 500);
}
