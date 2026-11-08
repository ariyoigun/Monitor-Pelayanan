<?php
/**
 * SILAN/SIKEREN - SATUPUTARU DINPUTARU DEMAK
 * API Stats - Aggregated Real-time Statistics
 * Endpoint: /api/stats.php (atau /api/stats)
 */

require_once __DIR__ . '/config.php';

$db = getDb();

try {
    $reqYear = $_GET['year'] ?? '2026';
    $where = [];
    $params = [];

    if ($reqYear !== 'ALL') {
        $where[] = "SUBSTRING(`tgl_pengajuan`, 1, 4) = ?";
        $params[] = $reqYear;
    }

    $sql = "SELECT `id`, `layanan`, `status`, `tgl_pengajuan` FROM `submissions`";
    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $allSubs = $stmt->fetchAll();

    $services = ['KTTR', 'OSS', 'PBG', 'SLF'];
    $stats = [
        'year'    => $reqYear,
        'summary' => [
            'total'               => 0,
            'sudahDilayani'       => 0,
            'onProgress'          => 0,
            'berkasDikembalikan'  => 0,
            'tingkatPenyelesaian' => 0,
            'selesai'             => 0,
            'belum'               => 0,
            'persenSelesai'       => 0
        ],
        'services' => []
    ];

    foreach ($services as $s) {
        $stats['services'][$s] = [
            'total'               => 0,
            'sudahDilayani'       => 0,
            'onProgress'          => 0,
            'berkasDikembalikan'  => 0,
            'tingkatPenyelesaian' => 0,
            'selesai'             => 0,
            'belum'               => 0,
            'persenSelesai'       => 0,
            'monthly'             => []
        ];
        for ($m = 1; $m <= 12; $m++) {
            $stats['services'][$s]['monthly'][(string)$m] = [
                'total'               => 0,
                'sudahDilayani'       => 0,
                'onProgress'          => 0,
                'berkasDikembalikan'  => 0,
                'tingkatPenyelesaian' => 0,
                'selesai'             => 0,
                'belum'               => 0
            ];
        }
    }

    foreach ($allSubs as $sub) {
        $s = $sub['layanan'];
        if (!isset($stats['services'][$s])) continue;

        $isSelesai = $sub['status'] === 'SELESAI';
        $isDikembalikan = $sub['status'] === 'BERKAS_DIKEMBALIKAN';
        $isOnProgress = $sub['status'] === 'PROSES' || (!$isSelesai && !$isDikembalikan);

        $stats['services'][$s]['total']++;
        $stats['summary']['total']++;

        if ($isSelesai) {
            $stats['services'][$s]['sudahDilayani']++;
            $stats['summary']['sudahDilayani']++;
        } elseif ($isDikembalikan) {
            $stats['services'][$s]['berkasDikembalikan']++;
            $stats['summary']['berkasDikembalikan']++;
        } else {
            $stats['services'][$s]['onProgress']++;
            $stats['summary']['onProgress']++;
        }

        if (!empty($sub['tgl_pengajuan'])) {
            $parts = explode('-', $sub['tgl_pengajuan']);
            if (isset($parts[1])) {
                $m = (int)$parts[1];
                if ($m >= 1 && $m <= 12) {
                    $mStr = (string)$m;
                    $stats['services'][$s]['monthly'][$mStr]['total']++;
                    if ($isSelesai) {
                        $stats['services'][$s]['monthly'][$mStr]['sudahDilayani']++;
                    } elseif ($isDikembalikan) {
                        $stats['services'][$s]['monthly'][$mStr]['berkasDikembalikan']++;
                    } else {
                        $stats['services'][$s]['monthly'][$mStr]['onProgress']++;
                    }
                }
            }
        }
    }

    foreach ($services as $s) {
        $itm = &$stats['services'][$s];
        $itm['selesai'] = $itm['sudahDilayani'];
        $itm['belum'] = $itm['onProgress'];
        $itm['tingkatPenyelesaian'] = $itm['total'] > 0
            ? (int)round((($itm['sudahDilayani'] + $itm['berkasDikembalikan']) / $itm['total']) * 100)
            : 0;
        $itm['persenSelesai'] = $itm['tingkatPenyelesaian'];

        for ($m = 1; $m <= 12; $m++) {
            $mStr = (string)$m;
            $mObj = &$itm['monthly'][$mStr];
            $mObj['selesai'] = $mObj['sudahDilayani'];
            $mObj['belum'] = $mObj['onProgress'];
            $mObj['tingkatPenyelesaian'] = $mObj['total'] > 0
                ? (int)round((($mObj['sudahDilayani'] + $mObj['berkasDikembalikan']) / $mObj['total']) * 100)
                : 0;
        }
    }

    $stats['summary']['selesai'] = $stats['summary']['sudahDilayani'];
    $stats['summary']['belum'] = $stats['summary']['onProgress'];
    $stats['summary']['tingkatPenyelesaian'] = $stats['summary']['total'] > 0
        ? (int)round((($stats['summary']['sudahDilayani'] + $stats['summary']['berkasDikembalikan']) / $stats['summary']['total']) * 100)
        : 0;
    $stats['summary']['persenSelesai'] = $stats['summary']['tingkatPenyelesaian'];

    sendJson(['success' => true, 'data' => $stats]);
} catch (Exception $e) {
    sendJson(['success' => false, 'message' => $e->getMessage()], 500);
}
