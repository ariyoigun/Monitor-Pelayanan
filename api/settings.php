<?php
/**
 * SIKEREN DINPUTARU DEMAK - API System Settings (Text Customization)
 * Endpoint: /api/settings.php (atau /api/settings)
 */

require_once __DIR__ . '/config.php';

$db = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// 1. GET: Fetch all settings
if ($method === 'GET') {
    $stmt = $db->query("SELECT `setting_key`, `setting_val` FROM `system_texts`");
    $rows = $stmt->fetchAll();

    $settings = [];
    foreach ($rows as $r) {
        $settings[$r['setting_key']] = $r['setting_val'];
    }

    sendJson(['success' => true, 'data' => $settings]);
}

// 2. POST: Save/Update settings
if ($method === 'POST') {
    $input = getJsonInput();
    if (empty($input) || !is_array($input)) {
        sendJson(['success' => false, 'message' => 'Data pengaturan kosong'], 400);
    }

    $stmt = $db->prepare("INSERT INTO `system_texts` (`setting_key`, `setting_val`, `updated_at`) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE `setting_val` = VALUES(`setting_val`), `updated_at` = NOW()");

    foreach ($input as $k => $v) {
        $stmt->execute([$k, (string)$v]);
    }

    sendJson(['success' => true, 'message' => 'Pengaturan teks berhasil disimpan ke database']);
}

sendJson(['success' => false, 'message' => 'Metode HTTP tidak didukung'], 405);
